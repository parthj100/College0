// Course registration flow

const Registration = ({ setPage }) => {
  const D = window.COLLEGE_DATA;
  const store = useStore();
  // Use the signed-in user when available; fall back to the static demo user for offline UI work.
  const me = store.me
    ? { id: store.me.displayId, name: store.me.fullName, passedCourses: [], failedCourses: [] }
    : D.me;
  const [cart, setCart] = useState([]);
  const [enrolledCodes, setEnrolledCodes] = useState([]);
  const [dept, setDept] = useState("All");
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  // Special-registration window — passed via global flag
  const isSpecial = window.__specialReg === true;
  const displacedFrom = window.__displacedFrom || [];
  const myActiveWarnings = store.warnings.filter(w => w.target === me.id && w.active).length;
  const suspended = myActiveWarnings >= 3;
  const canRegister = store.canRegister();

  // Load live enrollments for the signed-in student.
  useEffect(() => {
    if (!store.me || !window.SB) return;
    (async () => {
      const { data } = await window.SB
        .from("enrollments")
        .select("course:courses(code, semester)")
        .eq("student_id", store.me.id)
        .in("status", ["enrolled", "waitlist"]);
      const live = (data || [])
        .map(e => e.course?.code)
        .filter(Boolean);
      setEnrolledCodes(live);
      // Pre-populate cart with what's already enrolled so the user sees their state.
      setCart(live);
    })();
  }, [store.me?.id, store.hydrated]);

  const depts = ["All", ...new Set(D.catalog.map(c => c.dept))];
  const inCart = (code) => cart.includes(code);
  const passed = (code) => me.passedCourses?.includes(code);
  const failedBefore = (code) => me.failedCourses?.includes(code);
  const hasTimeConflict = (course) => {
    return cart.some(code => {
      const c = D.catalog.find(x => x.code === code);
      if (!c) return false;
      const daysOverlap = c.day.some(d => course.day.includes(d));
      return daysOverlap && !(course.end <= c.start || course.start >= c.end);
    });
  };
  const toggle = (code) => {
    setCart(cart.includes(code) ? cart.filter(x => x !== code) : [...cart, code]);
  };

  const filtered = D.catalog.filter(c =>
    (dept === "All" || c.dept === dept) &&
    (q === "" || (c.code + " " + c.title + " " + c.instructor).toLowerCase().includes(q.toLowerCase()))
  );

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const hours = Array.from({ length: 9 }, (_, i) => 8 + i); // 8–16

  return (
    <div className="page wide">
      <Eyebrow>{isSpecial ? "Special-registration window" : "Spring 2026 · Registration"}</Eyebrow>
      <h1 className="page-title">{isSpecial ? <>Replace your <span className="slash">cancelled</span> courses.</> : <>Pick your <span className="slash">courses.</span></>}</h1>

      {!canRegister && !suspended && (
        <div className="warn-banner bad mb-3">
          <span className="bar" style={{background:"var(--bad)"}}/>
          <span><b>Registration is closed.</b> The current phase is <b>{store.phase} · {["Class set-up","Registration","Class running","Grading"][store.phase-1]}</b>. Open registration is allowed only during <b>phase 2</b> or a special re-registration window.</span>
        </div>
      )}

      {suspended && (
        <div className="warn-banner bad mb-3">
          <span className="bar" style={{background:"var(--bad)"}}/>
          <span><b>You are suspended</b> — three active warnings. You must clear them and pay the reinstatement fine before you can register for next term.</span>
        </div>
      )}

      {isSpecial && (
        <div className="warn-banner mb-3">
          <span className="bar"/>
          <span><b>Course cancelled:</b> {displacedFrom.join(", ")} fell below the 3-student threshold. You have until <b>Feb 5, 23:59</b> to pick a replacement, otherwise you'll be flagged for under-courseload (&lt; 2 active).</span>
        </div>
      )}

      <div className="warn-banner mb-3">
        <span className="bar" />
        <span><b>Register for 2–4 courses</b> this term. Your cart has <b>{cart.length}</b>. Classes with fewer than 3 students will be cancelled on Feb 3.</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32 }}>
        <div>
          <div className="col mb-2" style={{ gap: 10 }}>
            <input className="input" placeholder="Search code, title, instructor…" value={q} onChange={e => setQ(e.target.value)} />
            <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
              {depts.map(d => (
                <button key={d} className={"btn sm " + (dept === d ? "primary" : "ghost")} onClick={() => setDept(d)}>{d}</button>
              ))}
            </div>
          </div>

          <div className="card" style={{ overflow: "hidden" }}>
            <div className="course-row" style={{ background: "var(--bg-2)", borderBottom: "1px solid var(--line-2)" }}>
              <div className="footnote">CODE</div>
              <div className="footnote">TITLE / INSTRUCTOR</div>
              <div className="footnote">TIME</div>
              <div className="footnote" style={{ textAlign: "right" }}>SEATS</div>
              <div className="footnote" style={{ textAlign: "center" }}>STATUS</div>
              <div />
            </div>
            {filtered.map(c => {
              const conflict = !inCart(c.code) && hasTimeConflict(c);
              const full = c.seats === 0;
              const alreadyPassed = passed(c.code);
              const retake = failedBefore(c.code);
              return (
                <div key={c.code} className="course-row">
                  <div className="cid">
                    {c.code}
                    {retake && <div className="mono" style={{fontSize:9.5,color:"var(--warn)",letterSpacing:"0.1em",marginTop:2,textTransform:"uppercase"}}>Retake</div>}
                    {alreadyPassed && <div className="mono" style={{fontSize:9.5,color:"var(--ink-3)",letterSpacing:"0.1em",marginTop:2,textTransform:"uppercase"}}>Passed</div>}
                  </div>
                  <div>
                    <div className="ctitle">{c.title}</div>
                    <div className="cinst">{c.instructor} · {c.dept}</div>
                    {retake && <div className="mono" style={{fontSize:10.5,color:"var(--warn)",letterSpacing:"0.04em",marginTop:2}}>you failed this previously</div>}
                    {alreadyPassed && <div className="mono" style={{fontSize:10.5,color:"var(--ink-3)",letterSpacing:"0.04em",marginTop:2}}>already passed</div>}
                  </div>
                  <div className="ctime">{c.time}</div>
                  <div className={"cseats " + (full ? "full" : c.seats <= 2 ? "low" : "ok")} style={{ textAlign: "right" }}>
                    {full ? "Wait-list" : `${c.seats} / ${c.cap}`}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    {alreadyPassed ? <Chip tone="bad">Passed — locked</Chip> :
                     retake ? <Chip tone="warn">Retake eligible</Chip> :
                     inCart(c.code) ? <Chip tone="ok">In cart</Chip> :
                     conflict ? <Chip tone="bad">Time conflict</Chip> :
                     full ? <Chip tone="warn">Full</Chip> :
                     <Chip>Open</Chip>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {alreadyPassed ? (
                      <button className="btn sm" disabled style={{opacity:0.4}}>—</button>
                    ) : inCart(c.code) ? (
                      <button className="btn sm" onClick={() => toggle(c.code)}>Remove</button>
                    ) : full ? (
                      <button className="btn sm">Join wait-list</button>
                    ) : (
                      <button className="btn sm primary" disabled={conflict} onClick={() => toggle(c.code)}>{conflict ? "—" : "Add"}</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Schedule grid preview */}
          <div className="section-title" style={{ marginTop: 32 }}>
            <h2>Schedule preview</h2>
            <span className="count">Based on cart</span>
          </div>
          <div className="schedule">
            <div className="sh" />
            {days.map(d => <div key={d} className="sh">{d}</div>)}
            {hours.map(h => (
              <React.Fragment key={h}>
                <div className="sh">{h}:00</div>
                {[1,2,3,4,5].map(dayIdx => {
                  const course = cart.map(code => D.catalog.find(c => c.code === code)).find(c =>
                    c && c.day.includes(dayIdx) && c.start <= h && c.end > h
                  );
                  const isStart = course && course.start === h;
                  return (
                    <div key={dayIdx} className="sc">
                      {isStart && (
                        <div className="block" style={{ position: "absolute", left: 4, right: 4, top: 4, bottom: 4, height: `calc(${course.end - course.start} * var(--schedule-hour) - 8px)`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div>{course.code}</div>
                          <div style={{ opacity: 0.8, fontSize: 9.5 }}>{course.title.slice(0, 24)}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div>
          <div className="cart">
            <div className="sb">
              <div className="display" style={{ fontSize: 22 }}>Your cart</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{cart.length} / 4</div>
            </div>
            {cart.length === 0 && <div className="muted" style={{ fontSize: 13 }}>Nothing added yet.</div>}
            {cart.map(code => {
              const c = D.catalog.find(x => x.code === code);
              return (
                <div key={code} className="item">
                  <div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--accent)" }}>{c.code}</div>
                    <div style={{ fontSize: 13.5 }}>{c.title}</div>
                    <div className="muted" style={{ fontSize: 11.5 }}>{c.time}</div>
                  </div>
                  <span className="rm" onClick={() => toggle(code)}>remove</span>
                </div>
              );
            })}
            <div className="hairline" style={{ marginTop: 8, paddingTop: 12 }}>
              <div className="footnote mb-1">RULES CHECK</div>
              <div style={{ fontSize: 12 }}>
                <div className="row" style={{ gap: 6 }}><span className={cart.length >= 2 ? "accent-ink" : "muted"}>{cart.length >= 2 ? "✓" : "○"}</span> 2+ courses</div>
                <div className="row" style={{ gap: 6 }}><span className={cart.length <= 4 ? "accent-ink" : "muted"}>{cart.length <= 4 ? "✓" : "○"}</span> ≤ 4 courses</div>
                <div className="row" style={{ gap: 6 }}><span className="accent-ink">✓</span> No time conflicts</div>
              </div>
            </div>
            <button className="btn primary" disabled={cart.length < 2 || suspended || !canRegister || submitted} onClick={async () => {
              setSubmitError("");
              const toAdd = cart.filter(c => !enrolledCodes.includes(c));
              const failures = [];
              for (const code of toAdd) {
                const courseRow = store.coursesByCode?.[code];
                if (!courseRow) { failures.push(`${code}: not in catalog`); continue; }
                const { error } = await window.Backend.registerForCourse(courseRow.id);
                if (error) failures.push(`${code}: ${error.message}`);
              }
              if (failures.length) {
                setSubmitError(failures.join(" · "));
              } else {
                setSubmitted(true);
                setEnrolledCodes(cart);
              }
            }}
              style={submitted ? {background:"var(--ok)",borderColor:"var(--ok)"} : {}}
              title={suspended ? "Suspended — cannot register" : !canRegister ? "Registration is not open in the current phase" : ""}>
              {submitted ? "✓ Registered!" : suspended ? "Blocked · suspended" : !canRegister ? "Locked · phase " + store.phase : "Submit registration →"}
            </button>
            {submitError && <div className="warn-banner bad mt-2" style={{padding:"8px 12px"}}><span className="bar" style={{background:"var(--bad)"}}/><span style={{fontSize:12}}>{submitError}</span></div>}
            <div className="footnote" style={{ whiteSpace: "normal", lineHeight: 1.5 }}>Registration closes Feb 2, 23:59.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Registration = Registration;
