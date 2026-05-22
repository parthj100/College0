// Login + first-time password change

const Login = ({ setPage, me, setMe }) => {
  const [mode, setMode] = useState("login"); // login | firstTime | apply
  const [step, setStep] = useState(0);

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
          ——— 47 students<br/>
          ——— 12 instructors<br/>
          ——— 1 registrar<br/>
          ——— 1 model (hallucinates rarely)
        </div>
      </div>

      <div className="form-wrap">
        <div className="form">
          <Eyebrow>{mode === "firstTime" ? "First login · change password" : mode === "apply" ? "Apply to the program" : "Sign in"}</Eyebrow>
          <h2 className="display" style={{ fontSize: 34, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            {mode === "firstTime" ? "Welcome, Milo. Pick a new password." :
             mode === "apply" ? "Tell us why you'd like to attend." :
             "Return to your records."}
          </h2>

          {mode === "login" && (
            <>
              <div>
                <div className="footnote mb-1">STUDENT ID OR USERNAME</div>
                <input className="input" defaultValue="s-00029" />
              </div>
              <div>
                <div className="footnote mb-1">PASSWORD</div>
                <input className="input" type="password" defaultValue="••••••••••" />
              </div>
              <button className="btn primary" onClick={() => setPage("student-dashboard")}>Sign in →</button>
              <div className="sb" style={{ fontSize: 12 }}>
                <a href="#" className="muted" onClick={(e) => { e.preventDefault(); setMode("firstTime"); }}>First login?</a>
                <a href="#" className="muted" onClick={(e) => { e.preventDefault(); setMode("apply"); }}>Apply to the program →</a>
              </div>
              <div className="hairline" style={{ marginTop: 12, paddingTop: 16 }}>
                <div className="footnote mb-1">QUICK DEMO · IMPERSONATE</div>
                <div className="row">
                  <button className="btn sm" onClick={() => setPage("student-dashboard")}>Student</button>
                  <button className="btn sm" onClick={() => setPage("instructor-roster")}>Instructor</button>
                  <button className="btn sm" onClick={() => setPage("landing")}>Visitor</button>
                </div>
              </div>
            </>
          )}

          {mode === "firstTime" && (
            <>
              <div className="warn-banner"><span className="bar"/><span>For security, new students must replace the password emailed by the registrar.</span></div>
              <div>
                <div className="footnote mb-1">TEMPORARY PASSWORD</div>
                <input className="input" type="password" defaultValue="•••••••" />
              </div>
              <div>
                <div className="footnote mb-1">NEW PASSWORD</div>
                <input className="input" type="password" placeholder="12+ characters" />
              </div>
              <div>
                <div className="footnote mb-1">CONFIRM</div>
                <input className="input" type="password" placeholder="again" />
              </div>
              <button className="btn primary" onClick={() => setPage("student-dashboard")}>Set password & continue →</button>
              <a href="#" className="muted" style={{ fontSize: 12 }} onClick={(e)=>{e.preventDefault(); setMode("login");}}>← back</a>
            </>
          )}

          {mode === "apply" && (
            <>
              <div>
                <div className="footnote mb-1">FULL NAME</div>
                <input className="input" placeholder="First Last" />
              </div>
              <div>
                <div className="footnote mb-1">PRIOR GPA (UNDERGRAD)</div>
                <input className="input" placeholder="e.g. 3.4" />
                <div className="footnote" style={{ marginTop: 4 }}>GPA &gt; 3.0 is auto-accepted, pending program quota.</div>
              </div>
              <div>
                <div className="footnote mb-1">INTENDED PROGRAM</div>
                <select className="select">
                  <option>Literature</option>
                  <option>Philosophy</option>
                  <option>Mathematics</option>
                  <option>Computer Science</option>
                  <option>History</option>
                </select>
              </div>
              <div>
                <div className="footnote mb-1">200 WORDS — WHY COLLEGE0?</div>
                <textarea className="textarea" placeholder="We read every one. Make it count." />
              </div>
              <button className="btn primary" onClick={() => setMode("login")}>Submit application →</button>
              <a href="#" className="muted" style={{ fontSize: 12 }} onClick={(e)=>{e.preventDefault(); setMode("login");}}>← back to sign in</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

window.Login = Login;
