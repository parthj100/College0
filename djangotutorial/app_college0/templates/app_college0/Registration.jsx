// Course registration flow

const Registration = ({ setPage }) => {
  const D = window.COLLEGE_DATA;
  const [cart, setCart] = useState(["HIST-605", "LIT-540"]);
  const [dept, setDept] = useState("All");
  const [q, setQ] = useState("");

  const depts = ["All", ...new Set(D.catalog.map(c => c.dept))];
  const inCart = (code) => cart.includes(code);
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
    <div className="page">
      <Eyebrow>Spring 2026 · Registration</Eyebrow>
      <h1 className="page-title">Pick your <span className="slash">courses.</span></h1>

      <div className="warn-banner mb-3">
        <span className="bar" />
        <span><b>Register for 2–4 courses</b> this term. Your cart has <b>{cart.length}</b>. Classes with fewer than 3 students will be cancelled on Feb 3.</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32 }}>
        <div>
          <div className="row mb-2" style={{ gap: 8 }}>
            <input className="input" placeholder="Search code, title, instructor…" value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 320 }} />
            <div className="row" style={{ marginLeft: "auto", gap: 4 }}>
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
              return (
                <div key={c.code} className="course-row">
                  <div className="cid">{c.code}</div>
                  <div>
                    <div className="ctitle">{c.title}</div>
                    <div className="cinst">{c.instructor} · {c.dept}</div>
                  </div>
                  <div className="ctime">{c.time}</div>
                  <div className={"cseats " + (full ? "full" : c.seats <= 2 ? "low" : "ok")} style={{ textAlign: "right" }}>
                    {full ? "Wait-list" : `${c.seats} / ${c.cap}`}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    {inCart(c.code) ? <Chip tone="ok">In cart</Chip> :
                     conflict ? <Chip tone="bad">Time conflict</Chip> :
                     full ? <Chip tone="warn">Full</Chip> :
                     <Chip>Open</Chip>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {inCart(c.code) ? (
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
                        <div className="block" style={{ position: "absolute", left: 4, right: 4, top: 4, bottom: 4, height: `${(course.end - course.start) * 44 - 8}px`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
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
            <button className="btn primary" disabled={cart.length < 2}>Submit registration →</button>
            <div className="footnote">Registration closes Feb 2 at 23:59.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Registration = Registration;
