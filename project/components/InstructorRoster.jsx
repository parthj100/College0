// Instructor class roster + grading

const InstructorRoster = ({ setPage }) => {
  const D = window.COLLEGE_DATA;
  const store = useStore();
  // Live classes: pull every active course this instructor teaches in the
  // current semester from the DB and build rosters from enrollments. Merge
  // with the demo seed (D.instructorClasses) so any new course the registrar
  // adds during a session shows up alongside the seeded demo classes.
  const [liveClasses, setLiveClasses] = useState([]);
  useEffect(() => {
    if (!window.SB || !store.me) { setLiveClasses([]); return; }
    (async () => {
      const sb = window.freshSB ? window.freshSB() : window.SB;
      // courses.instructor_id is just profiles.id (the user_id), no extra lookup
      const sem = store.currentSemester || "Spring 2026";
      const { data: myCourses } = await sb.from("courses")
        .select("id, code, title, semester, cap")
        .eq("instructor_id", store.me.id)
        .eq("semester", sem)
        .eq("status", "active");
      if (!myCourses?.length) { setLiveClasses([]); return; }
      const courseIds = myCourses.map(c => c.id);
      const { data: enrolls } = await sb.from("enrollments")
        .select("course_id, status, student:students(profile:profiles(display_id, full_name))")
        .in("course_id", courseIds)
        .eq("status", "enrolled")
        .eq("term", sem);
      const byCourse = {};
      (enrolls || []).forEach(e => {
        const did = e.student?.profile?.display_id;
        const fname = e.student?.profile?.full_name || did;
        if (!did) return;
        (byCourse[e.course_id] ||= []).push({
          id: did, name: fname,
          current: 3.0, submissions: "0 / 0", midterm: 0,
        });
      });
      setLiveClasses(myCourses.map(c => ({
        code: c.code, title: c.title, semester: c.semester,
        cap: c.cap || 12,
        avgRating: 0,
        roster: byCourse[c.id] || [],
      })));
    })();
  }, [store.me?.id, store.currentSemester, store.coursesByCode]);

  // Merge: prefer the live entry when codes overlap (live has the up-to-date
  // roster); otherwise fall back to the seeded demo class with its hand-built
  // metrics so the demo views still show GPA / submissions / midterm.
  const seed = (D.instructorClasses || [D.instructorClass]).filter(Boolean);
  const liveCodes = new Set(liveClasses.map(c => c.code));
  // Normalize seed shape to the same fields live classes expose (so c.* never
  // throws). Seed already has these in the demo, but be defensive.
  const normalize = (cl) => ({
    avgRating: 0, semester: 'Spring 2026', cap: 12, roster: [], ...cl,
  });
  const classes = [
    ...liveClasses.map(normalize),
    ...seed.filter(s => !liveCodes.has(s.code)).map(normalize),
  ];
  const [activeIdx, setActiveIdx] = useState(0);
  // Guard rendering until at least one class is available
  const c = classes[activeIdx] || classes[0] || null;
  const [gradesByClass, setGradesByClass] = useState({});
  const [postedByClass, setPostedByClass] = useState({});
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [deregOpen, setDeregOpen] = useState(null);
  const [deregReason, setDeregReason] = useState("");
  const [deregFiled, setDeregFiled] = useState({});
  const [waitlistFeedback, setWaitlistFeedback] = useState("");
  const [showStanding, setShowStanding] = useState(false);

  // If we don't have any class info yet (still loading) render an empty state
  // instead of crashing on c.code below.
  if (!c) {
    return (
      <div className="page">
        <Eyebrow>Instructor</Eyebrow>
        <p className="muted">Loading classes…</p>
      </div>
    );
  }

  const grades = gradesByClass[c.code] || {};
  const posted = !!postedByClass[c.code];
  const setGrades = (g) => setGradesByClass({ ...gradesByClass, [c.code]: g });
  const gradeOptions = ["A","A-","B+","B","B-","C+","C","F"];

  const submitDereg = (s) => {
    if (!deregReason.trim()) return;
    store.fileComplaint("i-Okonkwo", "C. Okonkwo (Instructor)", s.id, s.name, `[DE-REGISTRATION REQUEST] ${deregReason.trim()}`);
    setDeregFiled({ ...deregFiled, [s.id]: true });
    setDeregOpen(null); setDeregReason("");
  };

  const assigned = Object.keys(grades).length;
  const gpaMap = { "A":4.0,"A-":3.67,"B+":3.33,"B":3.0,"B-":2.67,"C+":2.33,"C":2.0,"F":0 };
  const avg = assigned ? Object.values(grades).reduce((a,g) => a + gpaMap[g], 0) / assigned : null;

  const doPostGrades = () => {
    // Spec §6: instructors who didn't grade all students will be warned.
    // Surface this BEFORE posting so the registrar / instructor sees the consequence.
    if (assigned < c.roster.length) {
      const missing = c.roster.filter(s => !grades[s.id]).map(s => s.name).slice(0, 8).join(", ");
      const more = c.roster.length - assigned > 8 ? ` (+${c.roster.length - assigned - 8} more)` : "";
      const ok = window.confirm(
        `You haven't graded ${c.roster.length - assigned} of ${c.roster.length} students:\n\n${missing}${more}\n\n` +
        `Posting now will issue you a warning per spec §6 ("instructors who didn't assign grades for all students will be warned"). ` +
        `Continue?`
      );
      if (!ok) return;
    }
    setPostedByClass({ ...postedByClass, [c.code]: true });
    // Records each student's grade and triggers GPA/standing recompute, honor roll, auto-termination, class-GPA outlier check.
    // The RPC also issues the missing-grades warning server-side, so we don't double-issue here.
    store.recordGrades(c.code, "i-Okonkwo", "C. Okonkwo", grades);
  };

  const myWarnings = store.warnings.filter(w => w.target === "i-Okonkwo" && w.active);
  const wlist = store.waitlist[c.code] || [];
  const admitWL = (sid) => { store.admitFromWaitlist(c.code, sid); setWaitlistFeedback(`Admitted ${sid} — registrar notified, seat reserved.`); };
  const declineWL = (sid) => { store.declineFromWaitlist(c.code, sid); setWaitlistFeedback(`Declined ${sid}.`); };

  return (
    <div className="page">
      <Eyebrow>Instructor · Phase {store.phase} · {store.canGrade() ? "Grading open" : "Grading locked"}</Eyebrow>
      {!store.canGrade() && (
        <div className="warn-banner mb-3"><span className="bar"/><span style={{fontSize:13}}>Grading is locked — registrar must advance to <b>Phase 4</b> before grades can be posted.</span></div>
      )}

      {/* Class switcher */}
      {classes.length > 1 && (
        <div className="role-switcher" style={{ maxWidth: 460, gridTemplateColumns: `repeat(${classes.length}, 1fr)`, marginBottom: 16 }}>
          {classes.map((cl, i) => (
            <button key={cl.code} className={activeIdx === i ? "active" : ""} onClick={() => setActiveIdx(i)}>
              {cl.code} <span className="muted" style={{ fontSize: 11, marginLeft: 6 }}>{cl.roster.length}</span>
            </button>
          ))}
        </div>
      )}

      <div className="sb" style={{ alignItems: "flex-end", borderBottom: "1px solid var(--line)", paddingBottom: 18, marginBottom: 24 }}>
        <div>
          <div className="mono" style={{ fontSize: 13, color: "var(--accent)" }}>{c.code} · {c.semester}</div>
          <h1 className="page-title" style={{ marginTop: 4 }}>{c.title}</h1>
          <div className="row" style={{ gap: 16 }}>
            <Chip tone="ok">{c.roster.length} enrolled</Chip>
            <Chip><Stars value={c.avgRating}/></Chip>
            <Chip>8 weeks into term</Chip>
            {myWarnings.length > 0 && <Chip tone="warn" onClick={() => setShowStanding(true)} style={{cursor:"pointer"}}>⚠ {myWarnings.length} active warning{myWarnings.length>1?"s":""}</Chip>}
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn" onClick={() => setShowStanding(true)}>My standing</button>
          <button className="btn" onClick={() => setComplaintOpen(true)}>Complaint → registrar</button>
          <button className="btn">Export CSV</button>
          <button
            className="btn primary"
            disabled={assigned === 0 || posted || !store.canGrade()}
            onClick={doPostGrades}
            style={posted ? { background: "var(--ok)", borderColor: "var(--ok)" } : {}}
            title={!store.canGrade() ? "Grading opens in Phase 4" : ""}
          >
            {posted
              ? "✓ Grades posted"
              : !store.canGrade()
                ? `Locked — Phase 4`
                : assigned === c.roster.length
                  ? "Post grades →"
                  : `Post grades (${assigned}/${c.roster.length})`}
          </button>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-tile"><div className="k">Grades assigned</div><div className="v">{assigned} <span className="muted" style={{ fontSize: 16 }}>/ {c.roster.length}</span></div><div className="d">{c.roster.length - assigned} remaining</div></div>
        <div className="stat-tile"><div className="k">Class GPA (so far)</div><div className="v">{avg ? avg.toFixed(2) : "—"}</div><div className="d">{avg && (avg > 3.5 || avg < 2.5) ? <span className="down">Will be questioned by registrar</span> : "Within normal band (2.5–3.5)"}</div></div>
        <div className="stat-tile"><div className="k">Avg. rating</div><div className="v">{c.avgRating.toFixed(1)}</div><div className="d"><span className="up">▲ 0.2</span> vs last term</div></div>
        <div className="stat-tile"><div className="k">At-risk students</div><div className="v">{c.roster.filter(s => s.current < 3.0 || parseInt(s.submissions) < 7).length}</div><div className="d">GPA &lt; 2.25, missing work</div></div>
      </div>

      <div className="section-title">
        <h2>Roster</h2>
        <span className="count">{c.roster.length} students · click to assign grade</span>
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
                          onClick={() => !posted && setGrades({...grades, [s.id]: g})}>
                          {g}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {deregFiled[s.id] ? (
                      <Chip tone="warn">De-reg filed</Chip>
                    ) : (
                      <button className="btn ghost sm" onClick={() => setDeregOpen(s)} style={{color:"var(--bad)", whiteSpace:"nowrap"}}>De-reg</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          <div className="section-title"><h2>Wait-list</h2><span className="count">{wlist.filter(w=>w.status==="pending").length} pending</span></div>
          <div className="card">
            {wlist.length === 0 && <div className="muted" style={{padding:16, fontSize:13}}>No wait-list requests for this class.</div>}
            {wlist.map(w => (
              <div key={w.id} style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center", opacity: w.status === "pending" ? 1 : 0.6 }}>
                <Avatar name={w.name}/>
                <div>
                  <div>{w.name} <span className="id" style={{ fontSize: 11 }}>· {w.id} · GPA {w.gpa}</span></div>
                  <div className="muted" style={{ fontSize: 12.5 }}>{w.note}</div>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  {w.status === "pending" && <>
                    <button className="btn sm primary" onClick={() => admitWL(w.id)}>Let in</button>
                    <button className="btn sm ghost" onClick={() => declineWL(w.id)}>Skip</button>
                  </>}
                  {w.status === "admitted" && <Chip tone="ok">Admitted</Chip>}
                  {w.status === "declined" && <Chip>Declined</Chip>}
                </div>
              </div>
            ))}
            {waitlistFeedback && <div className="footnote" style={{padding:"10px 16px", color:"var(--ok)"}}>✓ {waitlistFeedback}</div>}
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

      <ComplaintComposer open={complaintOpen} onClose={() => setComplaintOpen(false)} fromId="i-Okonkwo" fromLabel="C. Okonkwo (Instructor)" role="instructor"/>

      <Modal open={!!deregOpen} onClose={() => { setDeregOpen(null); setDeregReason(""); }} title="Request de-registration" eyebrow={deregOpen ? `${deregOpen.name} · ${deregOpen.id}` : ""} width={540}>
        <p className="muted" style={{fontSize:13, marginTop:0}}>The registrar will review your request and either de-register the student (with a warning) or warn <b>you</b> for a baseless filing. Document specifics — repeated absences, plagiarism, conduct.</p>
        <div className="footnote mb-1">REASON</div>
        <textarea className="textarea" style={{minHeight:110}} placeholder="Be specific: what happened, when, how often." value={deregReason} onChange={e => setDeregReason(e.target.value)}/>
        <div className="warn-banner mt-2 info" style={{padding:"8px 12px"}}><span className="bar"/><span style={{fontSize:12}}>Filing routes through the standard complaint queue and is tagged <b>[DE-REGISTRATION REQUEST]</b>.</span></div>
        <div className="row mt-2" style={{gap:8}}>
          <button className="btn primary" disabled={!deregOpen || deregReason.trim().length < 15} onClick={() => submitDereg(deregOpen)}>File request →</button>
          <button className="btn ghost" onClick={() => { setDeregOpen(null); setDeregReason(""); }}>Cancel</button>
        </div>
      </Modal>

      <Modal open={showStanding} onClose={() => setShowStanding(false)} title="My standing" eyebrow="C. Okonkwo · Instructor" width={560}>
        <div className="row" style={{ gap: 12, marginBottom: 16 }}>
          <div className="stat-tile" style={{ flex: 1 }}><div className="k">Active warnings</div><div className="v" style={{color: myWarnings.length >= 2 ? "var(--bad)" : "var(--ink)"}}>{myWarnings.length}</div><div className="d">{myWarnings.length >= 3 ? "Suspended next term" : myWarnings.length >= 2 ? "One more = suspended" : "In good standing"}</div></div>
          <div className="stat-tile" style={{ flex: 1 }}><div className="k">Classes</div><div className="v">{classes.length}</div><div className="d">{classes.reduce((a,c)=>a+c.roster.length,0)} students total</div></div>
        </div>
        {myWarnings.length === 0 ? (
          <div className="muted" style={{ textAlign: "center", padding: 18 }}>No active warnings. ✓</div>
        ) : (
          <div className="col" style={{ gap: 8 }}>
            {myWarnings.map(w => (
              <div key={w.id} className="card" style={{ padding: 12 }}>
                <div style={{ fontSize: 13.5 }}>{w.reason}</div>
                <div className="footnote">Issued {w.date}</div>
              </div>
            ))}
          </div>
        )}
        <div className="footnote mt-2">Instructors at 3 active warnings are suspended for the following semester. Honors do not apply to instructors.</div>
      </Modal>
    </div>
  );
};

window.InstructorRoster = InstructorRoster;
