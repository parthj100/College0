// Instructor class roster + grading

const InstructorRoster = ({ setPage }) => {
  const D = window.COLLEGE_DATA;
  const c = D.instructorClass;
  const [grades, setGrades] = useState({});
  const gradeOptions = ["A", "A-", "B+", "B", "B-", "C+", "C", "F"];

  const assigned = Object.keys(grades).length;
  const gpaMap = { "A":4.0,"A-":3.67,"B+":3.33,"B":3.0,"B-":2.67,"C+":2.33,"C":2.0,"F":0 };
  const avg = assigned ? Object.values(grades).reduce((a,g) => a + gpaMap[g], 0) / assigned : null;

  return (
    <div className="page">
      <Eyebrow>Instructor · Grading period opens Apr 21</Eyebrow>
      <div className="sb" style={{ alignItems: "flex-end", borderBottom: "1px solid var(--line)", paddingBottom: 18, marginBottom: 24 }}>
        <div>
          <div className="mono" style={{ fontSize: 13, color: "var(--accent)" }}>{c.code} · {c.semester}</div>
          <h1 className="page-title" style={{ marginTop: 4 }}>{c.title}</h1>
          <div className="row" style={{ gap: 16 }}>
            <Chip tone="ok">{c.roster.length} enrolled</Chip>
            <Chip><Stars value={c.avgRating}/></Chip>
            <Chip>8 weeks into term</Chip>
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn">Export CSV</button>
          <button className="btn">Message class</button>
          <button className="btn primary">Post grades →</button>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-tile"><div className="k">Grades assigned</div><div className="v">{assigned} <span className="muted" style={{ fontSize: 16 }}>/ {c.roster.length}</span></div><div className="d">{c.roster.length - assigned} remaining</div></div>
        <div className="stat-tile"><div className="k">Class GPA (so far)</div><div className="v">{avg ? avg.toFixed(2) : "—"}</div><div className="d">{avg && (avg > 3.5 || avg < 2.5) ? <span className="down">Will be questioned by registrar</span> : "Within normal band (2.5–3.5)"}</div></div>
        <div className="stat-tile"><div className="k">Avg. rating</div><div className="v">{c.avgRating.toFixed(1)}</div><div className="d"><span className="up">▲ 0.2</span> vs last term</div></div>
        <div className="stat-tile"><div className="k">At-risk students</div><div className="v">2</div><div className="d">GPA &lt; 2.25, missing work</div></div>
      </div>

      <div className="section-title">
        <h2>Roster</h2>
        <span className="count">{c.roster.length} students · click to assign grade</span>
        <a className="more" href="#">Complaint → registrar</a>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data">
          <thead>
            <tr>
              <th>ID</th><th>Student</th><th className="num">Current GPA</th>
              <th className="num">Submissions</th><th className="num">Midterm</th>
              <th>Grade</th><th></th>
            </tr>
          </thead>
          <tbody>
            {c.roster.map(s => {
              const atRisk = s.current < 3.0 || parseInt(s.submissions) < 7;
              return (
                <tr key={s.id}>
                  <td className="id">{s.id}</td>
                  <td>
                    <div className="row"><Avatar name={s.name}/><span>{s.name}</span>
                      {atRisk && <Chip tone="warn">at risk</Chip>}
                    </div>
                  </td>
                  <td className="num">{s.current.toFixed(2)}</td>
                  <td className="num">{s.submissions}</td>
                  <td className="num">{s.midterm}</td>
                  <td>
                    <div className="grade-picker">
                      {gradeOptions.map(g => (
                        <span key={g}
                          className={"grade-pill " + (grades[s.id] === g ? "sel " : "") + (g === "A" ? "A" : g === "F" ? "F" : "")}
                          onClick={() => setGrades({...grades, [s.id]: g})}>
                          {g}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td><button className="btn ghost sm">Note</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          <div className="section-title"><h2>Wait-list</h2><span className="count">2 requests</span></div>
          <div className="card">
            {[
              { id: "s-00115", name: "Hanan Aziz", gpa: 3.62, note: "Needs LIT credit for graduation." },
              { id: "s-00121", name: "Rowan Castile", gpa: 3.15, note: "Retaking after F in Fall '25." },
            ].map(w => (
              <div key={w.id} style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center" }}>
                <Avatar name={w.name}/>
                <div>
                  <div>{w.name} <span className="id" style={{ fontSize: 11 }}>· {w.id} · GPA {w.gpa}</span></div>
                  <div className="muted" style={{ fontSize: 12.5 }}>{w.note}</div>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <button className="btn sm primary">Let in</button>
                  <button className="btn sm ghost">Skip</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="section-title"><h2>AI: who should I worry about?</h2><span className="count">Context-aware</span></div>
          <div className="card" style={{ padding: 18 }}>
            <p style={{ fontSize: 14, lineHeight: 1.65, marginTop: 0 }}>
              Based on submissions and midterm scores, <b>Jonas Brautigan</b> (s-00093) has missed 3 of 8 responses and scored 64 on the midterm.
              If he earns below C on the final paper, his cumulative GPA will cross the 2.0 auto-termination line.
              I'd suggest an interview before the grading period closes.
            </p>
            <div className="row" style={{ marginTop: 12, gap: 8 }}>
              <button className="btn sm">Draft message</button>
              <button className="btn sm">Flag to registrar</button>
            </div>
            <div className="footnote mt-2">Generated from local registrar memos and your gradebook. Not sent outside College0.</div>
          </div>
        </div>
      </section>
    </div>
  );
};

window.InstructorRoster = InstructorRoster;
