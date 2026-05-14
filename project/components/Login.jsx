// Login + first-time password change

const Login = ({ setPage, setRole }) => {
  const [mode, setMode] = useState("login"); // login | firstTime
  const [username, setUsername] = useState("s-00029");
  const [password, setPassword] = useState("");
  const [tempPass, setTempPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
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
    const profileRole = window.CollegeStore.profilesByDisplayId[idTrim]?.role
      || resolveRole(idTrim);
    setRole(profileRole);
    // Was this a first-login (server-side flag)?
    const { data: prof } = await window.SB.from("profiles").select("must_change_password").eq("id", data.user.id).single();
    if (prof?.must_change_password) { setMode("firstTime"); return; }
    if (profileRole === "registrar") setPage("registrar-dash");
    else if (profileRole === "instructor") setPage("instructor-roster");
    else setPage("student-dashboard");
  };

  const setNewPassword = async () => {
    setError("");
    if (newPass.length < 12) { setError("Password must be at least 12 characters."); return; }
    if (newPass !== confirmPass) { setError("Passwords don't match."); return; }
    const { error: e } = await window.Backend.changePassword(newPass);
    if (e) { setError(e.message || "Failed to set password."); return; }
    D.me.firstLogin = false;
    localStorage.setItem("c0-pw-set", "1");
    setRole("student");
    setPage("student-dashboard");
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
          <Eyebrow>{mode === "firstTime" ? "First login · change password" : "Sign in"}</Eyebrow>
          <h2 className="display" style={{ fontSize: 34, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            {mode === "firstTime" ? "Welcome. Pick a new password." :
             "Return to your records."}
          </h2>

          {mode === "login" && (
            <>
              <div>
                <div className="footnote mb-1">STUDENT ID, INSTRUCTOR ID, OR USERNAME</div>
                <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="s-00029, i-Okonkwo, or registrar" />
              </div>
              <div>
                <div className="footnote mb-1">PASSWORD</div>
                <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••" />
              </div>
              <button className="btn primary" onClick={signIn}>Sign in →</button>
              <div className="sb" style={{ fontSize: 12 }}>
                <a href="#" className="muted" onClick={(e) => { e.preventDefault(); setMode("firstTime"); }}>First login?</a>
                <a href="#" className="muted" onClick={(e) => { e.preventDefault(); setRole("visitor"); setPage("apply"); }}>Apply to the program →</a>
              </div>
              <div className="hairline" style={{ marginTop: 12, paddingTop: 16 }}>
                <a href="#" className="muted" style={{ fontSize: 12 }} onClick={(e) => { e.preventDefault(); setRole("visitor"); setPage("landing"); }}>← Continue as visitor</a>
              </div>
            </>
          )}

          {mode === "firstTime" && (
            <>
              <div className="warn-banner"><span className="bar"/><span>For security, new students must replace the password emailed by the registrar.</span></div>
              <div>
                <div className="footnote mb-1">TEMPORARY PASSWORD</div>
                <input className="input" type="password" value={tempPass} onChange={e => setTempPass(e.target.value)} placeholder="from your acceptance email" />
              </div>
              <div>
                <div className="footnote mb-1">NEW PASSWORD</div>
                <input className="input" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="12+ characters" />
              </div>
              <div>
                <div className="footnote mb-1">CONFIRM</div>
                <input className="input" type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="again" />
              </div>
              {error && <div className="warn-banner bad"><span className="bar"/><span>{error}</span></div>}
              <button className="btn primary" onClick={setNewPassword}>Set password & continue →</button>
              <a href="#" className="muted" style={{ fontSize: 12 }} onClick={(e)=>{e.preventDefault(); setMode("login");}}>← back</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

window.Login = Login;
