// Public landing

const Landing = ({ setPage, setRole }) => {
  const D = window.COLLEGE_DATA;
  return (
    <div className="page">
      <section className="hero">
        <div>
          <div className="kicker"><Eyebrow>College0 · Est. 2019</Eyebrow></div>
          <h1>
            College<span className="slash">0</span>.<br/>
            <em>A small graduate program.</em>
          </h1>
          <p className="lede">
            Eleven seminars a term, twelve full-time faculty, four-month semesters
            organized around long-form work. We publish what's working and what
            isn't — every term, in plain view.
          </p>
          <div className="row">
            <button className="btn primary" onClick={() => { setRole("visitor"); setPage("apply"); }}>
              Apply to the program →
            </button>
            <button className="btn ghost" onClick={() => setPage("login")}>I already have a login</button>
          </div>
        </div>
        <aside className="hero-aside">
          <div className="stat"><span>Matriculated</span><b>47</b></div>
          <div className="stat"><span>Instructors</span><b>12</b></div>
          <div className="stat"><span>Classes this term</span><b>18</b></div>
          <div className="stat"><span>Avg. cohort GPA</span><b>3.31</b></div>
          <div className="footnote">Figures for Spring 2026, as of 17 Apr.</div>
        </aside>
      </section>

      <section style={{ marginTop: 40 }}>
        <Phases phases={D.phases} />
      </section>

      {/* Top classes */}
      <section style={{ marginTop: 40 }}>
        <div className="section-title">
          <h2>Best-rated seminars</h2>
          <span className="count">Top 5 · by student reviews</span>
          <a className="more" href="#">All classes →</a>
        </div>
        <div className="grid-3">
          {D.topClasses.slice(0, 3).map(c => (
            <div key={c.code} className="class-card" onClick={() => setPage("class-detail")}>
              <div className="code">{c.code}</div>
              <div className="title">{c.title}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>{c.instructor}</div>
              <div className="meta">
                <Stars value={c.rating} />
                <span>{c.reviews} reviews</span>
              </div>
            </div>
          ))}
        </div>
        <div className="grid-2" style={{ marginTop: 1 }}>
          {D.topClasses.slice(3).map(c => (
            <div key={c.code} className="class-card" onClick={() => setPage("class-detail")}>
              <div className="code">{c.code}</div>
              <div className="title">{c.title}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>{c.instructor}</div>
              <div className="meta">
                <Stars value={c.rating} />
                <span>{c.reviews} reviews</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom classes + top students split */}
      <section style={{ marginTop: 56, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <div>
          <div className="section-title">
            <h2>Lowest-rated, this term</h2>
            <span className="count">Shown for transparency</span>
          </div>
          <div className="card">
            <table className="data">
              <thead>
                <tr><th>Code</th><th>Title</th><th>Instructor</th><th className="num">Rating</th></tr>
              </thead>
              <tbody>
                {D.bottomClasses.map(c => (
                  <tr key={c.code}>
                    <td className="id">{c.code}</td>
                    <td>{c.title}</td>
                    <td className="muted">{c.instructor}</td>
                    <td className="num"><Stars value={c.rating} showVal={false}/> <span className="mono" style={{fontSize:11}}>{c.rating.toFixed(1)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="footnote mt-2">
            Any instructor receiving an average below 2.0 is issued a warning.
            Three warnings ⇒ suspension.
          </div>
        </div>

        <div>
          <div className="section-title">
            <h2>Honor roll</h2>
            <span className="count">Highest GPAs</span>
          </div>
          <div className="card">
            <table className="data">
              <thead>
                <tr><th>#</th><th>Student</th><th>Program</th><th className="num">GPA</th><th className="num">Honors</th></tr>
              </thead>
              <tbody>
                {D.topStudents.map((s, i) => (
                  <tr key={s.id}>
                    <td className="id">{String(i+1).padStart(2,"0")}</td>
                    <td><div className="row"><Avatar name={s.name}/><span>{s.name}</span></div></td>
                    <td className="muted">{s.major} · {s.year}</td>
                    <td className="num">{s.gpa.toFixed(2)}</td>
                    <td className="num">{s.honors}×</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="footnote mt-2">
            One honor is worth one warning, redeemable via the registrar.
            Semester GPA above 3.75, or cumulative above 3.50, qualifies automatically.
          </p>
        </div>
      </section>

      {/* Handbook callout */}
      <section style={{ marginTop: 56 }}>
        <div className="card" style={{ padding: 28, display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center" }}>
          <div>
            <Eyebrow>The handbook</Eyebrow>
            <div className="display" style={{ fontSize: 28, marginTop: 6, letterSpacing: "-0.01em" }}>
              Admissions, registration, grading, graduation — all documented in one place.
            </div>
            <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
              Search the handbook, the class catalog, or any registrar memo since 2021.
              Press <span className="mono">⌘K</span>.
            </p>
          </div>
          <button className="btn primary" onClick={() => window.dispatchEvent(new CustomEvent("open-cmdk"))}>Search · ⌘K</button>
        </div>
      </section>
    </div>
  );
};

window.Landing = Landing;
