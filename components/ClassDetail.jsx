// Class detail + reviews

const ClassDetail = ({ setPage }) => {
  const D = window.COLLEGE_DATA;
  const c = D.classDetail;
  const [tab, setTab] = useState("overview");
  const [newStars, setNewStars] = useState(0);
  const [newText, setNewText] = useState("");

  const hist = c.ratingHistogram;
  const total = hist.reduce((a,b)=>a+b, 0);

  return (
    <div className="page">
      <div className="row" style={{ gap: 8, marginBottom: 8 }}>
        <a href="#" className="footnote" onClick={(e)=>{e.preventDefault(); setPage("student-dashboard");}}>← Back to dashboard</a>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "end", borderBottom: "1px solid var(--line)", paddingBottom: 24, marginBottom: 24 }}>
        <div>
          <Eyebrow>Spring 2026 · {c.meta.credits} credits</Eyebrow>
          <div className="mono" style={{ fontSize: 13, color: "var(--accent)", letterSpacing: "0.08em", marginTop: 4 }}>{c.code}</div>
          <h1 className="page-title" style={{ marginTop: 4 }}>{c.title}</h1>
          <div className="row" style={{ gap: 16, color: "var(--ink-2)" }}>
            <div className="row"><Avatar name={c.instructor}/><span>{c.instructor}</span></div>
            <span className="muted">·</span>
            <span className="mono" style={{ fontSize: 12 }}>{c.meta.time}</span>
            <span className="muted">·</span>
            <span className="mono" style={{ fontSize: 12 }}>{c.meta.room}</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="display" style={{ fontSize: 56, letterSpacing: "-0.03em", lineHeight: 1 }}>{c.meta.avgRating.toFixed(1)}</div>
          <Stars value={c.meta.avgRating} showVal={false}/>
          <div className="footnote" style={{ marginTop: 4 }}>{c.meta.reviews} reviews · {c.meta.enrolled}/{c.meta.cap} seats</div>
        </div>
      </div>

      <div className="tabs">
        {["overview", "reviews", "syllabus", "roster"].map(t => (
          <div key={t} className={"tab " + (tab === t ? "on" : "")} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
            {t === "reviews" && <span className="mono muted" style={{ marginLeft: 6, fontSize: 10.5 }}>{c.reviews.length}</span>}
          </div>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 40 }}>
          <div>
            <Eyebrow>Description</Eyebrow>
            <p style={{ fontSize: 16, lineHeight: 1.65, marginTop: 10, color: "var(--ink)" }}>{c.description}</p>
            <div className="dot-div"/>
            <Eyebrow>The instructor</Eyebrow>
            <div className="row" style={{ marginTop: 10, gap: 12, alignItems: "flex-start" }}>
              <Avatar name={c.instructor} size="lg"/>
              <div>
                <div style={{ fontSize: 15 }}>{c.instructor}</div>
                <div className="muted" style={{ fontSize: 13, maxWidth: 480, marginTop: 4 }}>{c.instructorBio}</div>
              </div>
            </div>
          </div>
          <div>
            <div className="card" style={{ padding: 18 }}>
              <Eyebrow>Rating distribution</Eyebrow>
              <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
                {[5,4,3,2,1].map(s => {
                  const n = hist[s-1];
                  const pct = total ? (n/total*100) : 0;
                  return (
                    <div key={s} className="row" style={{ gap: 10 }}>
                      <span className="mono" style={{ width: 16, color: "var(--ink-3)", fontSize: 11 }}>{s}★</span>
                      <div style={{ flex: 1, height: 8, background: "var(--bg-2)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ width: pct + "%", height: "100%", background: s >= 4 ? "var(--accent)" : "var(--ink-3)" }}/>
                      </div>
                      <span className="mono" style={{ width: 24, textAlign: "right", fontSize: 11, color: "var(--ink-3)" }}>{n}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "reviews" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 40 }}>
          <div>
            {c.reviews.map(r => (
              <div key={r.id} className="review">
                <div className="r-head">
                  <Stars value={r.rating} showVal={false}/>
                  <span>{r.semester}</span>
                  <span className="muted">·</span>
                  <span>anonymous student</span>
                  {r.tabooCount === 1 && <Chip tone="warn">1 taboo word · author warned</Chip>}
                </div>
                <div className="r-body">
                  {r.body.includes("[****]") ? (
                    <span>{r.body.split("[****]")[0]}<span className="taboo">[****]</span>{r.body.split("[****]")[1]}</span>
                  ) : r.body}
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="card" style={{ padding: 18 }}>
              <Eyebrow>Write a review</Eyebrow>
              <p className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
                You're anonymous to everyone except the registrars. Reviews close when your instructor posts a grade.
              </p>
              <div className="row" style={{ gap: 6, marginTop: 14, fontSize: 22 }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} onClick={()=>setNewStars(s)} style={{ cursor: "pointer", color: s <= newStars ? "var(--accent)" : "var(--line-2)" }}>★</span>
                ))}
                <span className="mono muted" style={{ fontSize: 12, marginLeft: 8 }}>{newStars ? `${newStars}.0` : "rate"}</span>
              </div>
              <textarea className="textarea mt-2" value={newText} onChange={e => setNewText(e.target.value)} placeholder="What was it really like?" />
              {newText.toLowerCase().split(/\W+/).filter(w => ["damn","hell"].includes(w)).length >= 1 && (
                <div className="warn-banner mt-2" style={{ padding: "8px 12px" }}>
                  <span className="bar"/>
                  <span style={{ fontSize: 12 }}>Your review contains {newText.toLowerCase().split(/\W+/).filter(w => ["damn","hell"].includes(w)).length} taboo word(s). They'll be masked. You may receive a warning.</span>
                </div>
              )}
              <button className="btn primary mt-2" disabled={!newStars || newText.length < 10}>Post anonymously →</button>
              <div className="footnote mt-2">Taboo word list is maintained by the registrars.</div>
            </div>
          </div>
        </div>
      )}

      {tab === "syllabus" && (
        <div className="card" style={{ padding: 28, maxWidth: 720 }}>
          <Eyebrow>Weekly plan</Eyebrow>
          <ol style={{ paddingLeft: 20, fontSize: 14.5, lineHeight: 1.8, marginTop: 10 }}>
            <li>Introductions · the question of inference</li>
            <li>Parfit, Reasons and Persons (Part III)</li>
            <li>Korsgaard on agency</li>
            <li>Borges detour: the Aleph as decision procedure</li>
            <li>Week of short responses — no new reading</li>
            <li>Midterm paper workshop</li>
            <li>Hursthouse · virtue & simulators</li>
            <li>Guest lecture: registrar on AI policy</li>
          </ol>
        </div>
      )}

      {tab === "roster" && (
        <div className="card">
          <table className="data">
            <thead><tr><th>ID</th><th>Name</th><th>Program</th><th className="num">GPA</th></tr></thead>
            <tbody>
              {D.topStudents.concat(D.topStudents.slice(0,3)).slice(0,8).map((s, i) => (
                <tr key={i}><td className="id">{s.id}</td><td>{s.name}</td><td className="muted">{s.major}</td><td className="num">{s.gpa.toFixed(2)}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="footnote" style={{ padding: 12 }}>Roster visible to instructor and registrar only.</div>
        </div>
      )}
    </div>
  );
};

window.ClassDetail = ClassDetail;
