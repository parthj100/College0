// Main app shell

const DEFAULT_TWEAKS = /*EDITMODE-BEGIN*/{
  "theme": "editorial",
  "accent": "crimson",
  "radius": "normal",
  "font": "fraunces"
}/*EDITMODE-END*/;

const ACCENTS = {
  crimson: "#8b2e2e",
  teal: "#0d7a72",
  amber: "#d9a441",
  ink: "#1a1a1a",
  indigo: "#3b4cca",
  olive: "#5c6b2f",
};

const FONTS = {
  fraunces: '"Fraunces", "EB Garamond", "Times New Roman", serif',
  instrument: '"Instrument Serif", "Times New Roman", serif',
  dm: '"DM Serif Display", "Times New Roman", serif',
};

const App = () => {
  const [page, setPage] = useState(() => localStorage.getItem("c0-page") || "landing");
  const [role, setRole] = useState(() => localStorage.getItem("c0-role") || "visitor");
  const [cmdOpen, setCmdOpen] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [theme, setTheme] = useState(DEFAULT_TWEAKS.theme);
  const [accent, setAccent] = useState(DEFAULT_TWEAKS.accent);
  const [radius, setRadius] = useState(DEFAULT_TWEAKS.radius);
  const [font, setFont] = useState(DEFAULT_TWEAKS.font);

  useEffect(() => localStorage.setItem("c0-page", page), [page]);
  useEffect(() => localStorage.setItem("c0-role", role), [role]);

  // Apply theme to body
  useEffect(() => {
    document.body.className = "theme-" + theme + " " + (radius === "sharp" ? "radius-sharp" : radius === "soft" ? "radius-soft" : "");
    document.documentElement.style.setProperty("--accent", ACCENTS[accent]);
    document.documentElement.style.setProperty("--accent-ink", theme === "dark" ? "#111318" : "#fbf7ee");
    document.documentElement.style.setProperty("--font-display", FONTS[font]);
  }, [theme, radius, accent, font]);

  // Persist tweaks
  useEffect(() => {
    const edits = { theme, accent, radius, font };
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits }, "*");
  }, [theme, accent, radius, font]);

  // Tweaks toggle wiring
  useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === "__activate_edit_mode") { setEditMode(true); setTweaksOpen(true); }
      if (e.data?.type === "__deactivate_edit_mode") { setEditMode(false); setTweaksOpen(false); }
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // Keyboard ⌘K
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCmdOpen(o => !o); }
      if (e.key === "Escape") setCmdOpen(false);
    };
    const onOpen = () => setCmdOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-cmdk", onOpen);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("open-cmdk", onOpen); };
  }, []);

  // Login page is full-bleed
  if (page === "login") {
    return (
      <>
        <Login setPage={setPage} setRole={setRole} />
        <CmdK open={cmdOpen} onClose={() => setCmdOpen(false)} role={role}/>
        {tweaksOpen && <TweaksPanel theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent} radius={radius} setRadius={setRadius} font={font} setFont={setFont} onClose={()=>setTweaksOpen(false)}/>}
      </>
    );
  }

  const crumbs = {
    "landing":            ["College0", "Public"],
    "student-dashboard":  ["Student", "Dashboard"],
    "registration":       ["Student", "Course registration"],
    "class-detail":       ["Classes", "PHIL-612"],
    "my-class":           ["Student", "My class"],
    "instructor-roster":  ["Instructor", "LIT-540 · Roster"],
    "apply":              ["Visitor", "Apply"],
    "browse-classes":     ["Public", "Browse classes"],
    "browse-students":    ["Public", "Honor roll"],
    "registrar-dash":     ["Registrar", "Console"],
  };

  const pages = {
    landing:              { label: "Public landing",       icon: "◐", roles: ["visitor","student","instructor","registrar"] },
    "browse-classes":     { label: "Browse classes",       icon: "⊞", roles: ["visitor"] },
    "browse-students":    { label: "Honor roll",           icon: "★", roles: ["visitor"] },
    "apply":              { label: "Apply to College0",    icon: "✎", roles: ["visitor"] },
    "student-dashboard":  { label: "My dashboard",         icon: "◑", roles: ["student"] },
    "registration":       { label: "Course registration",  icon: "⊞", roles: ["student"] },
    "class-detail":       { label: "Class · reviews",      icon: "★", roles: ["student","instructor","visitor","registrar"] },
    "instructor-roster":  { label: "My roster · grading",  icon: "▦", roles: ["instructor"] },
    "registrar-dash":     { label: "Admin console",        icon: "◈", roles: ["registrar"] },
  };

  const navFor = (r) => Object.entries(pages).filter(([_, p]) => p.roles.includes(r));

  return (
    <>
      <div className="app" data-screen-label={`01 ${page}`}>
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-mark">College</span><span className="brand-zero">/0</span>
            <span className="brand-sub">SIS</span>
          </div>

          <div className="col" style={{ gap: 8 }}>
            <div className="nav-label">Role</div>
            <div className="role-switcher">
              <button className={role === "visitor" ? "active" : ""} onClick={async () => {
                // "Visitor" doubles as sign-out: drop any session, go to landing.
                if (window.Backend && window.CollegeStore?.me) await window.Backend.signOut();
                setRole("visitor");
                setPage("landing");
              }}>Visitor</button>
              {["student", "instructor", "registrar"].map(r => {
                const authedRole = window.CollegeStore?.me?.role;
                const canSwitch = authedRole === r;
                return (
                  <button
                    key={r}
                    className={role === r ? "active" : ""}
                    onClick={async () => {
                      if (canSwitch) {
                        // Already signed in as that role — just go home.
                        setRole(r);
                        setPage(r === "registrar" ? "registrar-dash" : r === "instructor" ? "instructor-roster" : "student-dashboard");
                      } else {
                        // Need to (re)authenticate as that role first.
                        if (window.Backend && authedRole && authedRole !== r) await window.Backend.signOut();
                        setRole("visitor");
                        setPage("login");
                      }
                    }}
                    title={canSwitch ? "" : "Sign in as " + r + " to access this view"}
                  >
                    {r[0].toUpperCase() + r.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-label">Navigate</div>
            {navFor(role).map(([k, p]) => (
              <div key={k} className={"nav-item " + (page === k ? "active" : "")} onClick={() => setPage(k)}>
                <span className="mono" style={{ color: "var(--accent)", width: 16 }}>{p.icon}</span>
                <span>{p.label}</span>
              </div>
            ))}
          </div>

          <div className="nav-section">
            <div className="nav-label">Ask</div>
            <div className="nav-item" onClick={() => setCmdOpen(true)}>
              <span className="mono" style={{ color: "var(--accent)", width: 16 }}>⌘</span>
              <span>Ask College0</span>
              <span className="kbd">⌘K</span>
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-label">Session</div>
            {role !== "visitor" ? (
              <div className="nav-item" onClick={async () => {
                if (window.Backend) await window.Backend.signOut();
                setRole("visitor");
                setPage("login");
              }}>
                <span className="mono" style={{ width: 16 }}>↪</span>
                <span>Sign out</span>
              </div>
            ) : (
              <div className="nav-item" onClick={() => setPage("login")}>
                <span className="mono" style={{ width: 16 }}>↪</span>
                <span>Sign in</span>
              </div>
            )}
          </div>

          <div style={{ marginTop: "auto" }}>
            {role === "visitor" && (
              <div className="card" style={{ padding: 10, fontSize: 12 }}>
                <div className="footnote mb-1">VISITOR</div>
                <div style={{ fontSize: 12 }}>Public access only.</div>
                <button className="btn sm primary mt-2" style={{ width: "100%" }} onClick={() => setPage("login")}>Sign in →</button>
              </div>
            )}
          {role === "student" && (
              <div className="card" style={{ padding: 10, fontSize: 12 }}>
                <div className="row" style={{ gap: 8 }}>
                  <Avatar name="Wren Atsumi"/>
                  <div>
                    <div>Wren Atsumi</div>
                    <div className="mono muted" style={{ fontSize: 10.5 }}>s-00029 · Y2</div>
                  </div>
                </div>
              </div>
            )}
            {role === "instructor" && (
              <div className="card" style={{ padding: 10, fontSize: 12 }}>
                <div className="row" style={{ gap: 8 }}>
                  <Avatar name="C. Okonkwo"/>
                  <div>
                    <div>C. Okonkwo</div>
                    <div className="mono muted" style={{ fontSize: 10.5 }}>Literature</div>
                  </div>
                </div>
              </div>
            )}
            <div className="footnote" style={{ marginTop: 10 }}>v0.4 · Spring 2026</div>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <div className="topbar">
            <div className="crumbs">
              {(crumbs[page] || []).map((c, i, arr) => (
                <span key={i}>{i === arr.length - 1 ? <b>{c}</b> : c}{i < arr.length - 1 ? "  /  " : ""}</span>
              ))}
            </div>
            <div className="search" onClick={() => setCmdOpen(true)}>
              <span>⌕</span>
              <span>Ask anything about College0</span>
              <span className="kbd">⌘K</span>
            </div>
          </div>

          {page === "landing" && <Landing setPage={setPage} setRole={setRole}/>}
          {page === "student-dashboard" && <StudentDash setPage={setPage}/>}
          {page === "registration" && <Registration setPage={setPage}/>}
          {page === "class-detail" && <ClassDetail setPage={setPage} role={role}/>}
          {page === "my-class" && <StudentClassDetail setPage={setPage}/>}
          {page === "instructor-roster" && <InstructorRoster setPage={setPage}/>}
          {page === "registrar-dash" && <RegistrarDash setPage={setPage}/>}
          {page === "apply" && <ApplyPage setPage={setPage}/>}
          {page === "browse-classes" && <BrowseClasses setPage={setPage}/>}
          {page === "browse-students" && <BrowseStudents setPage={setPage}/>}
        </main>
      </div>

      <CmdK open={cmdOpen} onClose={() => setCmdOpen(false)} role={role}/>
      {tweaksOpen && <TweaksPanel theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent} radius={radius} setRadius={setRadius} font={font} setFont={setFont} onClose={()=>setTweaksOpen(false)}/>}
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
