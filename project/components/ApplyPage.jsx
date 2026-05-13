// Apply page — standalone for visitors

const ApplyPage = ({ setPage }) => {
  const [type, setType] = React.useState("student");
  const [submitted, setSubmitted] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [gpa, setGpa] = React.useState("");
  const [dept, setDept] = React.useState("Literature");
  const [stmt, setStmt] = React.useState("");

  if (submitted) {
    return (
      <div className="page narrow" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 480, textAlign: "center" }}>
        <div className="mono" style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
        <h2 className="display" style={{ fontSize: 32, marginBottom: 12 }}>Application received.</h2>
        <p className="muted" style={{ maxWidth: "44ch", margin: "0 auto 24px" }}>
          {type === "student"
            ? gpa >= 3.0
              ? "Your GPA qualifies for automatic review. Expect credentials within 1 business day."
              : "Your application will be reviewed by the registrar. You'll hear back within 5 business days."
            : "Instructor applications are reviewed manually. The registrar will be in touch."}
        </p>
        <button className="btn" onClick={() => setPage("landing")}>← Back to College0</button>
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
            onClick={() => {
              window.CollegeStore.addApplication({
                name, email,
                type,
                gpa: type === "student" ? parseFloat(gpa) : null,
                dept,
                stmt,
              });
              setSubmitted(true);
            }}
          >
            Submit application →
          </button>
          <div className="footnote">Already have an account? <a href="#" onClick={e => { e.preventDefault(); setPage("login"); }}>Sign in →</a></div>
        </div>
      </div>
    </div>
  );
};

window.ApplyPage = ApplyPage;
