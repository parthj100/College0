// Apply page — standalone for visitors

const ApplyPage = ({ setPage }) => {
  const [type, setType] = React.useState("student");
  const [submitted, setSubmitted] = React.useState(false);
  const [name, setName] = React.useState("");
  // Email persists in localStorage so the visitor can come back later and check status.
  const [email, setEmail] = React.useState(() => localStorage.getItem("c0-applicant-email") || "");
  const [gpa, setGpa] = React.useState("");
  const [dept, setDept] = React.useState("Literature");
  const [stmt, setStmt] = React.useState("");

  // Status check state
  const [statusEmail, setStatusEmail] = React.useState("");
  const [statusResult, setStatusResult] = React.useState(null);
  const [statusError, setStatusError] = React.useState("");
  const [checking, setChecking] = React.useState(false);

  // If the visitor has an email in localStorage and lands on the page, auto-check status.
  React.useEffect(() => {
    const saved = localStorage.getItem("c0-applicant-email");
    if (saved) {
      setStatusEmail(saved);
      checkStatus(saved);
    }
  }, []);

  const checkStatus = async (rawEmail) => {
    const e = (rawEmail ?? statusEmail).trim().toLowerCase();
    if (!e) { setStatusError("Enter the email you applied with."); return; }
    setChecking(true); setStatusError(""); setStatusResult(null);
    const { data, error } = await window.SB.rpc("get_application_status", { p_email: e });
    setChecking(false);
    if (error) { setStatusError(error.message); return; }
    if (!data || data.length === 0) { setStatusError("No application found for that email."); return; }
    setStatusResult(data[0]);
  };

  const handleSubmit = async () => {
    const { error } = await window.Backend.submitApplication({
      name, email,
      type,
      prior_gpa: type === "student" ? parseFloat(gpa) : null,
      department: dept,
      statement: stmt,
    });
    if (error) {
      setStatusError(error.message);
      return;
    }
    localStorage.setItem("c0-applicant-email", email.trim().toLowerCase());
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="page narrow">
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div className="mono" style={{ fontSize: 48, marginBottom: 16, color: "var(--ok)" }}>✓</div>
          <h2 className="display" style={{ fontSize: 32, marginBottom: 12 }}>Application received.</h2>
          <p className="muted" style={{ maxWidth: "52ch", margin: "0 auto 24px" }}>
            {type === "student"
              ? parseFloat(gpa) >= 3.0
                ? "Your GPA qualifies for automatic review. Expect a decision within 1 business day."
                : "The registrar will review your application. Decisions are typically returned within 5 business days."
              : "Instructor applications are reviewed manually. The registrar will be in touch shortly."}
          </p>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <Eyebrow>Check your application status</Eyebrow>
          <p style={{ fontSize: 13, lineHeight: 1.6, marginTop: 8 }}>
            Once the registrar makes a decision, your <b>student ID</b> and <b>temporary password</b> will appear below.
            You can come back to this page any time — just enter the email you applied with.
          </p>
          <div className="row mt-2" style={{ gap: 8, alignItems: "stretch", flexWrap: "wrap" }}>
            <input className="input" style={{ flex: 1, minWidth: 240 }} type="email" value={statusEmail} onChange={e => setStatusEmail(e.target.value)} placeholder="you@example.com"/>
            <button className="btn primary" onClick={() => checkStatus()} disabled={checking}>{checking ? "Checking…" : "Check status →"}</button>
          </div>
          {statusError && <div className="warn-banner mt-2"><span className="bar"/><span style={{fontSize:12.5}}>{statusError}</span></div>}
          {statusResult && <StatusPanel result={statusResult} setPage={setPage}/>}
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button className="btn ghost" onClick={() => setPage("landing")}>← Back to College0</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page narrow">
      <a href="#" className="footnote" style={{ display: "block", marginBottom: 16 }} onClick={e => { e.preventDefault(); setPage("landing"); }}>← College0</a>
      <Eyebrow>Application · Spring 2026</Eyebrow>
      <h1 className="page-title">Join <span className="slash">College0.</span></h1>

      {/* Type toggle */}
      <div className="role-switcher" style={{ maxWidth: 300, marginBottom: 28, gridTemplateColumns: "1fr 1fr" }}>
        <button className={type === "student" ? "active" : ""} onClick={() => setType("student")}>Student</button>
        <button className={type === "instructor" ? "active" : ""} onClick={() => setType("instructor")}>Instructor</button>
      </div>

      <div className="card" style={{ padding: 28, maxWidth: 560 }}>
        <div className="col" style={{ gap: 16 }}>
          <div>
            <div className="footnote mb-1">FULL NAME</div>
            <input className="input" placeholder="First Last" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <div className="footnote mb-1">EMAIL</div>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            <div className="footnote mt-1" style={{ textTransform: "none", letterSpacing: 0 }}>We'll use this for your status check + initial sign-in.</div>
          </div>

          {type === "student" && (
            <div>
              <div className="footnote mb-1">PRIOR GPA (UNDERGRADUATE)</div>
              <input className="input" type="number" min="0" max="4" step="0.01" placeholder="e.g. 3.4" value={gpa} onChange={e => setGpa(e.target.value)} />
              {gpa && (
                <div className="footnote mt-2" style={{ color: parseFloat(gpa) >= 3.0 ? "var(--ok)" : "var(--warn)" }}>
                  {parseFloat(gpa) >= 3.0
                    ? "✓ Above 3.0 — eligible for auto-acceptance (subject to quota)."
                    : "⚠ Below 3.0 — will go to the registrar for manual review."}
                </div>
              )}
            </div>
          )}

          <div>
            <div className="footnote mb-1">INTENDED PROGRAMME</div>
            <select className="select" value={dept} onChange={e => setDept(e.target.value)}>
              {["Literature", "Philosophy", "Mathematics", "Computer Science", "History", "Sociology", "Economics", "Art", "Linguistics"].map(d => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="footnote mb-1">PERSONAL STATEMENT <span className="muted" style={{ textTransform: "none", letterSpacing: 0 }}>— up to 300 words</span></div>
            <textarea className="textarea" style={{ minHeight: 120 }} placeholder={type === "student" ? "Why College0? What do you hope to study?" : "Describe your research and teaching interests."} value={stmt} onChange={e => setStmt(e.target.value)} />
          </div>

          {type === "instructor" && (
            <div className="warn-banner" style={{ padding: "10px 14px" }}>
              <span className="bar" />
              <span style={{ fontSize: 12.5 }}>Instructor applications are always reviewed manually by the registrar. No automatic acceptance. Approved instructors will be assigned class(es).</span>
            </div>
          )}

          <button
            className="btn primary"
            disabled={!name || !email || (type === "student" && !gpa) || !stmt}
            onClick={handleSubmit}
          >
            Submit application →
          </button>
          <div className="footnote">Already applied? <a href="#" onClick={e => { e.preventDefault(); setSubmitted(true); }}>Check status →</a></div>
          <div className="footnote">Already have an account? <a href="#" onClick={e => { e.preventDefault(); setPage("login"); }}>Sign in →</a></div>
        </div>
      </div>
    </div>
  );
};

// Sub-component: renders the status RPC result.
const StatusPanel = ({ result, setPage }) => {
  const isAccept = result.status === "accept";
  const isReject = result.status === "reject";
  const isPending = result.status === "pending";
  const hasCreds = isAccept && result.display_id && result.temp_password;

  return (
    <div className="mt-2" style={{ borderTop: "1px solid var(--line)", paddingTop: 14 }}>
      <div className="row" style={{ gap: 8, alignItems: "center" }}>
        <Chip tone={isAccept ? "ok" : isReject ? "bad" : "warn"}>
          {isAccept ? "Accepted" : isReject ? "Rejected" : "Pending review"}
        </Chip>
        {result.decided_at && <span className="footnote">Decided {new Date(result.decided_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
      </div>

      {isPending && (
        <p style={{ fontSize: 13, marginTop: 12, color: "var(--ink-2)" }}>
          The registrar hasn't decided yet. Check back later.
        </p>
      )}

      {isReject && (
        <div className="mt-2">
          <p style={{ fontSize: 13, color: "var(--ink-2)" }}>
            The registrar declined your application{result.justification ? ": " : "."}
          </p>
          {result.justification && (
            <div className="card mt-1" style={{ padding: 12, fontSize: 13, fontStyle: "italic" }}>"{result.justification}"</div>
          )}
        </div>
      )}

      {hasCreds && (
        <div className="mt-2">
          <p style={{ fontSize: 13, color: "var(--ink-2)" }}>
            You're in. Here are your sign-in credentials — <b>change your password on first login</b>.
          </p>
          <div className="card mt-2" style={{ padding: 16, background: "color-mix(in oklab, var(--ok) 6%, var(--surface))" }}>
            <div className="row sb">
              <div>
                <div className="footnote mb-1">YOUR ID</div>
                <div className="mono" style={{ fontSize: 16, fontWeight: 500 }}>{result.display_id}</div>
              </div>
              <div>
                <div className="footnote mb-1">TEMPORARY PASSWORD</div>
                <div className="mono" style={{ fontSize: 16, fontWeight: 500 }}>{result.temp_password}</div>
              </div>
            </div>
            <div className="footnote mt-2" style={{ textTransform: "none", letterSpacing: 0 }}>
              {result.must_change_password
                ? "You'll be asked to set a new password the first time you sign in."
                : "Sign in to continue."}
            </div>
          </div>
          <button className="btn primary mt-2" onClick={() => { localStorage.removeItem("c0-applicant-email"); setPage("login"); }}>
            Sign in →
          </button>
        </div>
      )}

      {isAccept && !hasCreds && (
        <p style={{ fontSize: 13, marginTop: 12, color: "var(--warn)" }}>
          You've been accepted! Credentials are being issued — refresh in a moment.
        </p>
      )}
    </div>
  );
};

window.ApplyPage = ApplyPage;
