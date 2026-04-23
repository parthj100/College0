// Student dashboard

const StudentDash = ({ setPage }) => {
  const D = window.COLLEGE_DATA;
  const me = D.me;
  return (
    <div className="page">
      <Eyebrow>Student · {me.id}</Eyebrow>
      <h1 className="page-title">Good afternoon, <span className="slash">Wren.</span></h1>

      {me.warnings > 0 && (
        <div className="warn-banner mb-3">
          <span className="bar" />
          <span><b>1 active warning</b> — a review you posted contained a flagged term. 2 more warnings = suspension.
            You have 2 honor credits; <a href="#" className="accent-ink">redeem one</a> to clear it.</span>
        </div>
      )}

      <div className="stat-row">
        <div className="stat-tile">
          <div className="k">Cumulative GPA</div>
          <div className="v">{me.gpa.toFixed(2)}</div>
          <div className="d"><span className="up">▲ 0.06</span> since last semester</div>
        </div>
        <div className="stat-tile">
          <div className="k">This semester</div>
          <div className="v">{me.semesterGpa.toFixed(2)}</div>
          <div className="d">Honor-roll track ≥ 3.75</div>
        </div>
        <div className="stat-tile">
          <div className="k">Toward graduation</div>
          <div className="v">{me.completedClasses}<span className="muted" style={{ fontSize: 16 }}> / {me.graduationTarget}</span></div>
          <div className="d">
            <div className="bar-track" style={{ marginTop: 6, maxWidth: 140 }}>
              <div className="fill" style={{ width: (me.completedClasses/me.graduationTarget*100) + "%" }}/>
            </div>
          </div>
        </div>
        <div className="stat-tile">
          <div className="k">Warnings · Honors</div>
          <div className="v">{me.warnings} <span className="muted">·</span> {me.honors}</div>
          <div className="d">1 honor redeems 1 warning</div>
        </div>
      </div>

      <div className="section-title">
        <h2>This semester's classes</h2>
        <span className="count">{D.myClasses.length} registered · min. 2 required</span>
        <a className="more" href="#" onClick={(e)=>{e.preventDefault(); setPage("registration");}}>Course catalog →</a>
      </div>

      <div className="grid-3 mb-4">
        {D.myClasses.map(c => (
          <div key={c.code} className="class-card" onClick={() => setPage("class-detail")}>
            <div className="row sb">
              <div className="code">{c.code}</div>
              {c.myRating ? <Chip tone="accent">{c.myRating}★ reviewed</Chip> : <Chip>Not rated</Chip>}
            </div>
            <div className="title">{c.title}</div>
            <div className="muted" style={{ fontSize: 12.5 }}>{c.instructor} · {c.room}</div>
            <div className="footnote">{c.time}</div>
            <div className="bar-track" style={{ marginTop: 6 }}><div className="fill" style={{ width: (c.progress*100) + "%" }}/></div>
            <div className="footnote" style={{ textAlign: "right" }}>{Math.round(c.progress*100)}% through term</div>
          </div>
        ))}
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32 }}>
        <div>
          <div className="section-title">
            <h2>Academic record</h2>
            <span className="count">5 completed · 3 in progress</span>
          </div>
          <div className="card">
            <table className="data">
              <thead>
                <tr><th>Term</th><th>Code</th><th>Class</th><th className="num">Grade</th><th className="num">GPA</th></tr>
              </thead>
              <tbody>
                <tr><td className="id">Spring '26</td><td className="id">PHIL-612</td><td>Ethics of Machine Reasoning</td><td className="num muted">—</td><td className="num muted">—</td></tr>
                <tr><td className="id">Spring '26</td><td className="id">LIT-540</td><td>The Long Form Essay</td><td className="num muted">—</td><td className="num muted">—</td></tr>
                <tr><td className="id">Spring '26</td><td className="id">HIST-605</td><td>Cold War Archives</td><td className="num muted">—</td><td className="num muted">—</td></tr>
                <tr><td className="id">Fall '25</td><td className="id">LIT-501</td><td>Contemporary Fiction</td><td className="num">A</td><td className="num">4.00</td></tr>
                <tr><td className="id">Fall '25</td><td className="id">LING-611</td><td>Computational Semantics</td><td className="num">A-</td><td className="num">3.67</td></tr>
                <tr><td className="id">Spring '25</td><td className="id">PHIL-520</td><td>Modal Logic</td><td className="num">B+</td><td className="num">3.33</td></tr>
                <tr><td className="id">Spring '25</td><td className="id">LIT-488</td><td>Essay Forms</td><td className="num">A</td><td className="num">4.00</td></tr>
                <tr><td className="id">Fall '24</td><td className="id">HIST-410</td><td>Archive Reading</td><td className="num">A</td><td className="num">4.00</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="section-title">
            <h2>Advising</h2>
            <span className="count">Signals from the system</span>
          </div>
          <div className="card" style={{ padding: 18 }}>
            <div className="col" style={{ gap: 14 }}>
              <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
                <Chip tone="ok">On track</Chip>
                <div style={{ fontSize: 13 }}>At your current pace you'll apply for graduation in <b>Spring 2027</b>. 3 more classes required.</div>
              </div>
              <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
                <Chip tone="accent">Honor roll</Chip>
                <div style={{ fontSize: 13 }}>Semester GPA 3.92 ⇒ honor roll if sustained.</div>
              </div>
              <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
                <Chip tone="warn">Review flagged</Chip>
                <div style={{ fontSize: 13 }}>Your review of ECON-599 contained a taboo word; 1 warning issued. <a href="#" className="accent-ink">Appeal</a></div>
              </div>
              <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
                <Chip>Reminder</Chip>
                <div style={{ fontSize: 13 }}>Reviews close when the instructor posts a grade — the grading period opens Apr 21.</div>
              </div>
            </div>
          </div>

          <div className="section-title" style={{ marginTop: 28 }}>
            <h2>Creative: Study-buddy matches</h2>
            <span className="count">Our pick</span>
          </div>
          <div className="card">
            {[
              { name: "Dara Okafor", class: "PHIL-612", match: 92, note: "Reads ahead. Takes good notes." },
              { name: "Imogen Halvorsen", class: "LIT-540", match: 88, note: "Overlap on 3 essays last term." },
              { name: "Milo Vukovic", class: "HIST-605", match: 81, note: "Same archive visit schedule." },
            ].map(m => (
              <div key={m.name} style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center" }}>
                <Avatar name={m.name} />
                <div>
                  <div style={{ fontSize: 13.5 }}>{m.name} <span className="mono muted" style={{ fontSize: 11 }}>· {m.class}</span></div>
                  <div className="muted" style={{ fontSize: 12 }}>{m.note}</div>
                </div>
                <div className="mono" style={{ fontSize: 12, color: "var(--accent)" }}>{m.match}%</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

window.StudentDash = StudentDash;
