// Login

const Login = ({ setPage, setRole }) => {
  const [username, setUsername] = useState("s-00029");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const D = window.COLLEGE_DATA;

  // Resolve username → role (very simple: prefix-based)
  const resolveRole = (id) => {
    if (id.startsWith("s-")) return "student";
    if (id.startsWith("i-") || /^[A-Z]\.\s/.test(id)) return "instructor";
    if (id === "registrar" || id === "admin") return "registrar";
    return "student";
  };

  const signIn = async () => {
    setError("");
    const idTrim = username.trim();
    const { data, error: e } = await window.Backend.signIn(idTrim, password);
    if (e) { setError(e.message || "Sign-in failed"); return; }
    // Route from the authoritative profile role. Use a fresh client because
    // the long-lived SB.from() can deadlock right after signInWithPassword.
    let profileRole = resolveRole(idTrim);
    try {
      const { data: prof } = await window.freshSB()
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      if (prof?.role) profileRole = prof.role;
    } catch {}
    // Hard-reload after writing role/page so the SB client rehydrates the
    // session from storage on next boot — skipping the in-memory state that
    // can hang the first RPC right after signInWithPassword.
    const next = profileRole === "registrar" ? "registrar-dash"
      : profileRole === "instructor" ? "instructor-roster"
      : "student-dashboard";
    localStorage.setItem("c0-role", profileRole);
    localStorage.setItem("c0-page", next);
    window.location.href = window.location.pathname;
  };

  return (
    <div className="login">
      <div className="visual">
        <div>
          <Crest size={36} />
          <div style={{ marginTop: 24, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.7 }}>
            A student information system / Spring 2026
          </div>
        </div>
        <div className="big">
          College<span className="slash">/</span>0
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, opacity: 0.7, lineHeight: 1.7 }}>
          ——— established 2019
        </div>
      </div>

      <div className="form-wrap">
        <div className="form">
          <Eyebrow>Sign in</Eyebrow>
          <h2 className="display" style={{ fontSize: 34, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Return to your records.
          </h2>

          <div>
            <div className="footnote mb-1">STUDENT ID, INSTRUCTOR ID, OR EMAIL</div>
            <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="s-00029, i-Okonkwo, or registrar" />
          </div>
          <div>
            <div className="footnote mb-1">PASSWORD</div>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••" onKeyDown={e => { if (e.key === "Enter") signIn(); }}/>
          </div>
          {error && <div className="warn-banner bad"><span className="bar"/><span>{error}</span></div>}
          <button className="btn primary" onClick={signIn}>Sign in →</button>
          <div className="sb" style={{ fontSize: 12 }}>
            <a href="#" className="muted" onClick={(e) => { e.preventDefault(); setRole("visitor"); setPage("apply"); }}>Apply to the program →</a>
          </div>
          <div className="hairline" style={{ marginTop: 12, paddingTop: 16 }}>
            <div className="footnote mb-2">QUICK SIGN-IN · DEMO</div>
            <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
              {/*
                After signIn the in-memory SB client can deadlock the first RPC
                until the session is reloaded from storage. Hard-reloading after
                writing the role/page avoids that — the next page boot rehydrates
                cleanly from localStorage and RPCs work immediately.
              */}
              <button className="btn sm" onClick={async () => { await window.Backend.signIn("s-00042@college0.demo", "college0demo!!"); localStorage.setItem("c0-role","student"); localStorage.setItem("c0-page","student-dashboard"); window.location.href = window.location.pathname; }}>Student</button>
              <button className="btn sm" onClick={async () => { await window.Backend.signIn("i-okonkwo@college0.demo", "college0demo!!"); localStorage.setItem("c0-role","instructor"); localStorage.setItem("c0-page","instructor-roster"); window.location.href = window.location.pathname; }}>Instructor</button>
              <button className="btn sm" onClick={async () => { await window.Backend.signIn("registrar@college0.demo", "college0registrar!!"); localStorage.setItem("c0-role","registrar"); localStorage.setItem("c0-page","registrar-dash"); window.location.href = window.location.pathname; }}>Registrar</button>
              <button className="btn sm" onClick={() => { setRole("visitor"); setPage("landing"); }}>Visitor</button>
            </div>
            <div className="footnote mt-2" style={{ textTransform: "none", letterSpacing: 0 }}>One-click demo logins for each role.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Login = Login;
