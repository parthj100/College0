// Student dashboard

const StudentDash = ({ setPage }) => {
  const D = window.COLLEGE_DATA;
  const me = D.me;
  const store = useStore();
  const [honorOpen, setHonorOpen] = useState(false);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [gradOpen, setGradOpen] = useState(false);
  const myWarnings = store.warnings.filter(w => w.target === me.id && w.active);
  const myHonors = store.honors.filter(h => h.target === me.id && !h.redeemed);
  const myFine = store.fines[me.id];
  const [showTutorial, setShowTutorial] = useState(() => localStorage.getItem("c0-tutorial-seen") !== "1" && me.firstLogin);
  const dismissTutorial = () => { localStorage.setItem("c0-tutorial-seen","1"); setShowTutorial(false); };
  // Auto-assess fine on suspension
  useEffect(() => {
    if (myWarnings.length >= 3 && !myFine) {
      store.assessFine(me.id, 250, "Suspension reinstatement fee");
    }
  }, [myWarnings.length]);
  return (
    <div className="page">
      <Eyebrow>Student · {me.id}</Eyebrow>
      <div className="row sb" style={{ alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Good afternoon, <span className="slash">Wren.</span></h1>
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <button className="btn" onClick={() => setComplaintOpen(true)}>File a complaint</button>
          <button className="btn primary" disabled={me.completedClasses < 8 || myWarnings.length >= 3} onClick={() => setGradOpen(true)} title={me.completedClasses < 8 ? `Available at ${me.graduationTarget} completed classes` : ""}>
            Apply for graduation {me.completedClasses < 8 && <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}> · {me.completedClasses}/{me.graduationTarget}</span>}
          </button>
        </div>
      </div>

      {myWarnings.length >= 3 && (
        <div className="warn-banner bad mb-3">
          <span className="bar" style={{background:"var(--bad)"}}/>
          <div style={{ flex: 1 }}>
            <div><b>SUSPENDED</b> — three active warnings. You may not register for next term until you pay the reinstatement fine and meet with the registrar.</div>
            {myFine && (
              <div className="row mt-2" style={{ gap: 8, alignItems: "center" }}>
                <span className="mono" style={{ fontSize: 13 }}>Fine due: <b>${myFine.amount}</b></span>
                {myFine.paid ? <Chip tone="ok">✓ Paid — awaiting registrar review</Chip> : (
                  <button className="btn sm primary" onClick={() => store.payFine(me.id)}>Pay reinstatement fine →</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {window.__displacedFrom && window.__displacedFrom.length > 0 && (
        <div className="warn-banner mb-3">
          <span className="bar"/>
          <span><b>Special registration open.</b> Your course {window.__displacedFrom.join(", ")} was cancelled — pick a replacement before <b>Feb 5, 23:59</b>. <a href="#" className="accent-ink" onClick={e=>{e.preventDefault(); window.__specialReg=true; setPage("registration");}}>Open replacement window →</a></span>
        </div>
      )}

      {myWarnings.length > 0 && myWarnings.length < 3 && (
        <div className="warn-banner mb-3">
          <span className="bar" />
          <span><b>{myWarnings.length} active warning{myWarnings.length===1?"":"s"}</b> — {myWarnings[0].reason}. {3 - myWarnings.length > 0 ? `${3 - myWarnings.length} more = suspension.` : "One more = suspension."}
            {myHonors.length > 0 && <> You have {myHonors.length} honor credit{myHonors.length===1?"":"s"}; <a href="#" className="accent-ink" onClick={e=>{e.preventDefault(); setHonorOpen(true);}}>redeem one</a> to clear it.</>}</span>
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
          <div className="v">{myWarnings.length} <span className="muted">·</span> {myHonors.length}</div>
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
          <div key={c.code} className="class-card" onClick={() => { window.__openClassCode = c.code; setPage("my-class"); }}>
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
              {myWarnings.map(w => (
                <div key={w.id} className="row" style={{ alignItems: "flex-start", gap: 12 }}>
                  <Chip tone="warn">Warning</Chip>
                  <div style={{ fontSize: 13 }}>{w.reason}. <span className="muted">Issued {w.date}.</span> {myHonors.length > 0 && <a href="#" className="accent-ink" onClick={e=>{e.preventDefault(); setHonorOpen(true);}}>Redeem honor →</a>}</div>
                </div>
              ))}
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
      <HonorRedeemModal open={honorOpen} onClose={() => setHonorOpen(false)} studentId={me.id}/>
      <ComplaintComposer open={complaintOpen} onClose={() => setComplaintOpen(false)} fromId={me.id} fromLabel={`${me.name} (${me.id})`} role="student"/>
      <GradAppModal open={gradOpen} onClose={() => setGradOpen(false)} student={me}/>

      {/* New-student tutorial */}
      <Modal open={showTutorial} onClose={dismissTutorial} title="Welcome to College0" eyebrow={`First login · ${me.id}`} width={620}>
        <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 0 }}>A short tour. You can skip it — none of these are tests.</p>
        <ol style={{ paddingLeft: 20, fontSize: 13.5, lineHeight: 1.8 }}>
          <li><b>Register for 2–4 classes</b> from the catalog. Fewer than 2 triggers a warning; 4 is the cap.</li>
          <li><b>Review your classes</b> anonymously, 1–5 stars. The registrar — and only the registrar — can see the author.</li>
          <li><b>Watch your standing.</b> 3 warnings ⇒ suspension + fine. 1 honor retires 1 warning.</li>
          <li><b>Apply for graduation</b> once you've completed 8 classes with all required courses.</li>
          <li><b>Ask College0</b> (⌘K) about your record, the handbook, or your classes.</li>
        </ol>
        <div className="row mt-2" style={{ gap: 8 }}>
          <button className="btn primary" onClick={dismissTutorial}>Got it →</button>
          <button className="btn ghost" onClick={dismissTutorial}>Skip tour</button>
        </div>
      </Modal>
    </div>
  );
};

window.StudentDash = StudentDash;
