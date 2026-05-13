// Student-private view of a class: grades, assignments, attendance, announcements.
// This is NOT the public class detail (reviews/overview/syllabus) — it's what
// the enrolled student sees about THEIR record in this class.

const StudentClassDetail = ({ setPage }) => {
  const D = window.COLLEGE_DATA;
  const me = D.me;
  const code = window.__openClassCode || "PHIL-612";
  const c = D.myClasses.find(x => x.code === code) || D.myClasses[0];

  // Fake per-student record. In a real backend this is the gradebook for {me.id, code}.
  const records = {
    "PHIL-612": {
      progress: 0.62,
      currentGrade: { letter: "A−", pct: 91.4 },
      gradeBreakdown: [
        { label: "Weekly responses", weight: 0.30, pct: 93 },
        { label: "Midterm paper",    weight: 0.25, pct: 88 },
        { label: "Participation",    weight: 0.15, pct: 95 },
        { label: "Final paper",      weight: 0.30, pct: null },
      ],
      assignments: [
        { id: 1, title: "Response 01 · Parfit on persons",      due: "Feb 09", status: "graded",   score: "9.5/10", note: "Sharp opening; final paragraph rushed." },
        { id: 2, title: "Response 02 · Korsgaard on agency",    due: "Feb 16", status: "graded",   score: "9/10",   note: "Good handling of constitutivism." },
        { id: 3, title: "Response 03 · Borges detour",          due: "Feb 23", status: "graded",   score: "10/10",  note: "Loved the Aleph framing." },
        { id: 4, title: "Midterm paper · 2500 words",           due: "Mar 09", status: "graded",   score: "88/100", note: "Strong thesis. Citations spotty." },
        { id: 5, title: "Response 04 · short responses week",   due: "Mar 23", status: "submitted",score: null,     note: "—" },
        { id: 6, title: "Response 05 · Hursthouse",             due: "Apr 06", status: "upcoming", score: null,     note: "—" },
        { id: 7, title: "Final paper · 5000 words",             due: "May 02", status: "upcoming", score: null,     note: "Topic proposal due Apr 14." },
      ],
      attendance: { attended: 11, total: 14, missed: ["Feb 19 (Wed)", "Mar 11 (Wed)", "Apr 01 (Mon)"] },
      announcements: [
        { date: "Apr 02", from: "M. Arkwright", body: "Reminder: final paper topic proposal is due Apr 14. One page, single-spaced." },
        { date: "Mar 18", from: "M. Arkwright", body: "Midterms returned. Office hours extended this week — sign up via the form." },
        { date: "Feb 28", from: "Registrar",    body: "Reviews remain open until grading begins (Apr 21)." },
      ],
    },
    "LIT-540": {
      progress: 0.58,
      currentGrade: { letter: "B+", pct: 87.2 },
      gradeBreakdown: [
        { label: "Workshops",      weight: 0.25, pct: 90 },
        { label: "Short essays",   weight: 0.35, pct: 85 },
        { label: "Peer reviews",   weight: 0.15, pct: 92 },
        { label: "Final essay",    weight: 0.25, pct: null },
      ],
      assignments: [
        { id: 1, title: "Essay 01 · personal voice",        due: "Feb 12", status: "graded",   score: "84/100", note: "Voice is there. Pacing needs work." },
        { id: 2, title: "Workshop 01",                      due: "Feb 19", status: "graded",   score: "Pass",   note: "Engaged participant." },
        { id: 3, title: "Essay 02 · research-driven",       due: "Mar 05", status: "graded",   score: "87/100", note: "Better structure than Essay 01." },
        { id: 4, title: "Peer review × 2",                  due: "Mar 12", status: "graded",   score: "Pass",   note: "Thoughtful, on time." },
        { id: 5, title: "Essay 03 · hybrid form",           due: "Mar 26", status: "submitted",score: null,     note: "—" },
        { id: 6, title: "Final essay · 4000 words",         due: "Apr 30", status: "upcoming", score: null,     note: "Outline due Apr 09." },
      ],
      attendance: { attended: 12, total: 13, missed: ["Mar 03 (Tue)"] },
      announcements: [
        { date: "Mar 28", from: "C. Okonkwo", body: "Workshop schedule updated — see syllabus. Bring 3 printed copies of your draft." },
        { date: "Feb 14", from: "C. Okonkwo", body: "Essay 01 returned with margin notes. Read mine before reading peers'." },
      ],
    },
    "HIST-605": {
      progress: 0.60,
      currentGrade: { letter: "A", pct: 93.0 },
      gradeBreakdown: [
        { label: "Archive visits",  weight: 0.20, pct: 100 },
        { label: "Source analyses", weight: 0.35, pct: 92 },
        { label: "Midterm exam",    weight: 0.20, pct: 91 },
        { label: "Final paper",     weight: 0.25, pct: null },
      ],
      assignments: [
        { id: 1, title: "Archive visit 01 · Sterling B",          due: "Feb 07", status: "graded",   score: "Pass",   note: "Excellent field notes." },
        { id: 2, title: "Source analysis 01 · CIA brief, 1947",   due: "Feb 21", status: "graded",   score: "92/100", note: "Crisp. Watch passive voice." },
        { id: 3, title: "Source analysis 02 · Stasi files",       due: "Mar 14", status: "graded",   score: "91/100", note: "Nice triangulation." },
        { id: 4, title: "Midterm exam",                           due: "Mar 21", status: "graded",   score: "91/100", note: "—" },
        { id: 5, title: "Source analysis 03",                     due: "Apr 04", status: "submitted",score: null,     note: "—" },
        { id: 6, title: "Final paper · 6000 words",               due: "May 03", status: "upcoming", score: null,     note: "Topic approved: Berlin airlift logistics." },
      ],
      attendance: { attended: 8, total: 9, missed: [] },
      announcements: [
        { date: "Apr 01", from: "B. Lindqvist", body: "Final paper topics approved for all but two students. Check your inbox." },
      ],
    },
  };

  const r = records[c.code] || records["PHIL-612"];
  const [tab, setTab] = useState("overview");

  const statusChip = (s) => {
    if (s === "graded")    return <Chip tone="ok">Graded</Chip>;
    if (s === "submitted") return <Chip tone="accent">Submitted</Chip>;
    if (s === "upcoming")  return <Chip>Upcoming</Chip>;
    if (s === "late")      return <Chip tone="warn">Late</Chip>;
    return <Chip>{s}</Chip>;
  };

  const attendancePct = Math.round(r.attendance.attended / r.attendance.total * 100);

  return (
    <div className="page">
      <div className="row" style={{ gap: 8, marginBottom: 8 }}>
        <a href="#" className="footnote" onClick={(e) => { e.preventDefault(); setPage("student-dashboard"); }}>← Back to dashboard</a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "end", borderBottom: "1px solid var(--line)", paddingBottom: 24, marginBottom: 24 }}>
        <div>
          <Eyebrow>My class · {me.id} · {D.currentSemester}</Eyebrow>
          <div className="mono" style={{ fontSize: 13, color: "var(--accent)", letterSpacing: "0.08em", marginTop: 4 }}>{c.code}</div>
          <h1 className="page-title" style={{ marginTop: 4 }}>{c.title}</h1>
          <div className="row" style={{ gap: 16, color: "var(--ink-2)" }}>
            <div className="row" style={{ gap: 8 }}><Avatar name={c.instructor}/><span>{c.instructor}</span></div>
            <span className="muted">·</span>
            <span className="mono" style={{ fontSize: 12 }}>{c.time}</span>
            <span className="muted">·</span>
            <span className="mono" style={{ fontSize: 12 }}>{c.room}</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="footnote">Current grade</div>
          <div className="display" style={{ fontSize: 56, letterSpacing: "-0.03em", lineHeight: 1, color: "var(--accent)" }}>{r.currentGrade.letter}</div>
          <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>{r.currentGrade.pct.toFixed(1)}% · provisional</div>
        </div>
      </div>

      <div className="warn-banner info mb-3" style={{ padding: "8px 14px" }}>
        <span className="bar"/>
        <span style={{ fontSize: 12.5 }}>
          This is your <b>private record</b> in {c.code}. The instructor sees the same data on their roster; the registrar can audit it. To see public reviews or roster, <a href="#" onClick={(e)=>{e.preventDefault(); setPage("class-detail");}}>open the class page →</a>
        </span>
      </div>

      {/* Three at-a-glance stats */}
      <div className="stat-row" style={{ marginBottom: 24 }}>
        <div className="stat-tile">
          <div className="k">Through term</div>
          <div className="v">{Math.round(r.progress * 100)}%</div>
          <div className="d">
            <div className="bar-track" style={{ marginTop: 6, maxWidth: 140 }}>
              <div className="fill" style={{ width: (r.progress * 100) + "%" }}/>
            </div>
          </div>
        </div>
        <div className="stat-tile">
          <div className="k">Attendance</div>
          <div className="v">{r.attendance.attended}<span className="muted" style={{ fontSize: 16 }}> / {r.attendance.total}</span></div>
          <div className="d">{attendancePct}% present</div>
        </div>
        <div className="stat-tile">
          <div className="k">Assignments</div>
          <div className="v">{r.assignments.filter(a => a.status === "graded").length}<span className="muted" style={{ fontSize: 16 }}> / {r.assignments.length}</span></div>
          <div className="d">{r.assignments.filter(a => a.status === "upcoming").length} upcoming</div>
        </div>
        <div className="stat-tile">
          <div className="k">Review status</div>
          <div className="v" style={{ fontSize: 22, fontFamily: "var(--font-display)" }}>
            {c.myRating ? <>{c.myRating}★ <span className="muted" style={{ fontSize: 14 }}>submitted</span></> : <span className="muted">Not rated</span>}
          </div>
          <div className="d">
            <a href="#" onClick={(e)=>{e.preventDefault(); setPage("class-detail");}}>
              {c.myRating ? "Edit review →" : "Write review →"}
            </a>
          </div>
        </div>
      </div>

      <div className="tabs">
        {["overview", "assignments", "grade", "attendance", "announcements"].map(t => (
          <div key={t} className={"tab " + (tab === t ? "on" : "")} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
            {t === "assignments" && <span className="mono muted" style={{ marginLeft: 6, fontSize: 10.5 }}>{r.assignments.length}</span>}
            {t === "announcements" && <span className="mono muted" style={{ marginLeft: 6, fontSize: 10.5 }}>{r.announcements.length}</span>}
          </div>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 40 }}>
          <div>
            <div className="section-title"><h2>Up next</h2><span className="count">{r.assignments.filter(a=>a.status!=="graded").length} open</span></div>
            <div className="card" style={{ overflow: "hidden" }}>
              {r.assignments.filter(a => a.status !== "graded").slice(0, 5).map(a => (
                <div key={a.id} style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14 }}>{a.title}</div>
                    {a.note !== "—" && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{a.note}</div>}
                  </div>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", letterSpacing: "0.04em" }}>Due {a.due}</span>
                  {statusChip(a.status)}
                </div>
              ))}
            </div>

            <div className="section-title" style={{ marginTop: 28 }}><h2>Latest feedback</h2><span className="count">From the instructor</span></div>
            <div className="card" style={{ padding: 0 }}>
              {r.assignments.filter(a => a.status === "graded" && a.note !== "—").slice(-3).reverse().map(a => (
                <div key={a.id} style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>
                  <div className="row sb" style={{ alignItems: "baseline" }}>
                    <div style={{ fontSize: 13.5 }}><b>{a.title}</b></div>
                    <span className="mono" style={{ fontSize: 11.5, color: "var(--accent)" }}>{a.score}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 13, marginTop: 6, fontStyle: "italic", lineHeight: 1.55 }}>"{a.note}"</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="section-title"><h2>Grade so far</h2></div>
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span className="display" style={{ fontSize: 64, lineHeight: 1, fontFamily: "var(--font-display)", color: "var(--accent)" }}>{r.currentGrade.letter}</span>
                <span className="mono" style={{ fontSize: 14, color: "var(--ink-3)" }}>{r.currentGrade.pct.toFixed(1)}%</span>
              </div>
              <div className="footnote" style={{ marginTop: 6 }}>Provisional — final grade posts at end of phase 4.</div>
              <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
                {r.gradeBreakdown.map(g => (
                  <div key={g.label}>
                    <div className="row sb" style={{ fontSize: 12.5 }}>
                      <span>{g.label} <span className="muted">· {Math.round(g.weight * 100)}%</span></span>
                      <span className="mono" style={{ color: g.pct == null ? "var(--ink-3)" : "var(--ink)" }}>{g.pct == null ? "—" : g.pct + "%"}</span>
                    </div>
                    <div className="bar-track" style={{ marginTop: 4 }}>
                      <div className="fill" style={{ width: (g.pct || 0) + "%", background: g.pct == null ? "var(--line-2)" : "var(--ink)" }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "assignments" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 110px 130px", gap: 12, padding: "10px 18px", background: "var(--bg-2)", borderBottom: "1px solid var(--line-2)" }}>
            <div className="footnote">ASSIGNMENT</div>
            <div className="footnote">DUE</div>
            <div className="footnote">STATUS</div>
            <div className="footnote" style={{ textAlign: "right" }}>SCORE</div>
          </div>
          {r.assignments.map(a => (
            <div key={a.id} style={{ display: "grid", gridTemplateColumns: "1fr 110px 110px 130px", gap: 12, padding: "14px 18px", borderBottom: "1px solid var(--line)", alignItems: "center" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14 }}>{a.title}</div>
                {a.note !== "—" && <div className="muted" style={{ fontSize: 12, marginTop: 4, fontStyle: a.status === "graded" ? "italic" : "normal" }}>{a.status === "graded" ? `"${a.note}"` : a.note}</div>}
              </div>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", letterSpacing: "0.04em" }}>{a.due}</span>
              <div>{statusChip(a.status)}</div>
              <span className="mono" style={{ fontSize: 12.5, textAlign: "right", color: a.score ? "var(--accent)" : "var(--ink-3)" }}>{a.score || "—"}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "grade" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div>
            <div className="section-title"><h2>Weighted breakdown</h2></div>
            <div className="card" style={{ padding: 22 }}>
              <div style={{ display: "grid", gap: 18 }}>
                {r.gradeBreakdown.map(g => (
                  <div key={g.label}>
                    <div className="row sb" style={{ fontSize: 13.5 }}>
                      <span>{g.label}</span>
                      <span className="mono" style={{ color: g.pct == null ? "var(--ink-3)" : "var(--ink)" }}>
                        {g.pct == null ? "—" : g.pct + "%"} <span className="muted">· {Math.round(g.weight * 100)}% of grade</span>
                      </span>
                    </div>
                    <div className="bar-track" style={{ marginTop: 6, height: 8 }}>
                      <div className="fill" style={{ width: (g.pct || 0) + "%", background: g.pct == null ? "var(--line-2)" : "var(--ink)" }}/>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dot-div"/>
              <div className="row sb" style={{ alignItems: "baseline" }}>
                <div>
                  <div className="footnote">Provisional total</div>
                  <div className="display" style={{ fontSize: 44, lineHeight: 1, fontFamily: "var(--font-display)" }}>{r.currentGrade.letter} <span className="mono" style={{ fontSize: 16, color: "var(--ink-3)" }}>· {r.currentGrade.pct.toFixed(1)}%</span></div>
                </div>
                <Chip tone="warn">Not final</Chip>
              </div>
            </div>
          </div>

          <div>
            <div className="section-title"><h2>How letters map</h2></div>
            <div className="card" style={{ padding: 0 }}>
              <table className="data">
                <thead><tr><th>Letter</th><th className="num">Min %</th><th className="num">Points</th></tr></thead>
                <tbody>
                  {[
                    ["A",  93, 4.00], ["A−", 90, 3.67], ["B+", 87, 3.33], ["B",  83, 3.00],
                    ["B−", 80, 2.67], ["C+", 77, 2.33], ["C",  73, 2.00], ["C−", 70, 1.67],
                    ["D",  60, 1.00], ["F",   0, 0.00],
                  ].map(([letter, pct, pts]) => {
                    const here = r.currentGrade.letter === letter;
                    return (
                      <tr key={letter} style={here ? { background: "var(--bg-2)" } : null}>
                        <td className="id" style={here ? { color: "var(--accent)", fontWeight: 600 } : null}>{letter}{here && " ←"}</td>
                        <td className="num">{pct}</td>
                        <td className="num">{pts.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="footnote" style={{ marginTop: 10 }}>Grade locks when the instructor posts at end of phase 4. Reviews close at that point.</div>
          </div>
        </div>
      )}

      {tab === "attendance" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div>
            <div className="section-title"><h2>Attendance</h2><span className="count">{r.attendance.attended} of {r.attendance.total} sessions</span></div>
            <div className="card" style={{ padding: 22 }}>
              <div className="display" style={{ fontSize: 64, lineHeight: 1, fontFamily: "var(--font-display)", color: attendancePct >= 90 ? "var(--ok)" : attendancePct >= 75 ? "var(--warn)" : "var(--bad)" }}>{attendancePct}%</div>
              <div className="footnote" style={{ marginTop: 6 }}>Present rate · 5 unexcused absences trigger a registrar warning.</div>
              <div className="bar-track" style={{ marginTop: 16, height: 10 }}>
                <div className="fill" style={{ width: attendancePct + "%", background: attendancePct >= 90 ? "var(--ok)" : attendancePct >= 75 ? "var(--warn)" : "var(--bad)" }}/>
              </div>
            </div>
          </div>
          <div>
            <div className="section-title"><h2>Missed sessions</h2></div>
            <div className="card">
              {r.attendance.missed.length === 0 ? (
                <div style={{ padding: 22, fontSize: 13.5, color: "var(--ink-2)" }}>No misses on record. Keep it up.</div>
              ) : r.attendance.missed.map((m, i) => (
                <div key={i} style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="mono" style={{ fontSize: 12.5 }}>{m}</span>
                  <Chip tone="warn">Unexcused</Chip>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "announcements" && (
        <div className="card" style={{ padding: 0, maxWidth: 760 }}>
          {r.announcements.map((a, i) => (
            <div key={i} style={{ padding: "18px 22px", borderBottom: "1px solid var(--line)" }}>
              <div className="row" style={{ gap: 12, alignItems: "center", marginBottom: 8 }}>
                <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", letterSpacing: "0.04em" }}>{a.date}</span>
                <span className="muted">·</span>
                <span style={{ fontSize: 13 }}><b>{a.from}</b></span>
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--ink)" }}>{a.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

window.StudentClassDetail = StudentClassDetail;
