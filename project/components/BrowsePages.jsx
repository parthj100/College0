// Visitor-facing browse pages

const BrowseClasses = ({ setPage }) => {
  const D = window.COLLEGE_DATA;
  const store = useStore();
  const [q, setQ] = React.useState("");
  const [dept, setDept] = React.useState("All");

  // Prefer live data when hydrated; fall back to the static catalog so the page
  // still renders before the first hydrate completes.
  const live = Object.values(store.coursesByCode || {});
  const source = live.length
    ? live.map(c => ({
        code: c.code,
        title: c.title,
        instructor: c.instructorName,
        dept: c.code.split("-")[0] === "LIT" ? "Literature"
            : c.code.split("-")[0] === "PHIL" ? "Philosophy"
            : c.code.split("-")[0] === "CS" ? "CompSci"
            : c.code.split("-")[0] === "HIST" ? "History"
            : c.code.split("-")[0] === "MATH" ? "Math"
            : c.code.split("-")[0] === "ECON" ? "Economics"
            : c.code.split("-")[0] === "SOC" ? "Sociology"
            : c.code.split("-")[0] === "ART" ? "Art"
            : c.code.split("-")[0] === "LING" ? "Linguistics"
            : "Other",
        time: c.time,
        seats: c.cap,
        cap: c.cap,
      }))
    : D.catalog;
  const depts = ["All", ...new Set(source.map(c => c.dept))];
  const all = source.filter(c => (dept === "All" || c.dept === dept) && (!q || (c.code + " " + c.title + " " + (c.instructor || "")).toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="page">
      <Eyebrow>Public catalog · Spring 2026</Eyebrow>
      <h1 className="page-title">Browse <span className="slash">classes.</span></h1>
      <p className="muted" style={{ maxWidth: "60ch", marginBottom: 18 }}>All courses offered this term. Enrolment is restricted to matriculated students — visitors may browse only.</p>
      <div className="row" style={{ gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input className="input" style={{ flex: 1, minWidth: 220 }} placeholder="Search by code, title, or instructor…" value={q} onChange={e => setQ(e.target.value)}/>
        <select className="select" value={dept} onChange={e => setDept(e.target.value)} style={{ maxWidth: 220 }}>
          {depts.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data">
          <thead><tr><th>Code</th><th>Title</th><th>Instructor</th><th>Dept</th><th>Time</th><th className="num">Seats</th></tr></thead>
          <tbody>
            {all.map(c => (
              <tr key={c.code} style={{ cursor: "pointer" }} onClick={() => setPage("class-detail")}>
                <td className="id"><b>{c.code}</b></td>
                <td>{c.title}</td>
                <td className="muted">{c.instructor}</td>
                <td className="muted">{c.dept}</td>
                <td className="mono" style={{ fontSize: 12 }}>{c.time}</td>
                <td className="num">{c.seats}/{c.cap}</td>
              </tr>
            ))}
            {all.length === 0 && <tr><td colSpan={6} className="muted" style={{textAlign:"center",padding:20}}>No matching courses.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="footnote mt-2">Want to enroll? <a href="#" onClick={e=>{e.preventDefault(); setPage("apply");}}>Apply to College0 →</a></div>
    </div>
  );
};

const BrowseStudents = ({ setPage }) => {
  const D = window.COLLEGE_DATA;
  return (
    <div className="page">
      <Eyebrow>Public · Honor roll</Eyebrow>
      <h1 className="page-title">Top <span className="slash">students.</span></h1>
      <p className="muted" style={{ maxWidth: "60ch", marginBottom: 18 }}>Published per § 5.4 of the handbook. Other student records are private to the registrar.</p>
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="data">
          <thead><tr><th>#</th><th>Student</th><th>Program</th><th>Year</th><th className="num">GPA</th><th className="num">Honors</th></tr></thead>
          <tbody>
            {D.topStudents.map((s, i) => (
              <tr key={s.id}>
                <td className="id">{String(i+1).padStart(2,"0")}</td>
                <td><div className="row"><Avatar name={s.name}/><span>{s.name}</span></div></td>
                <td className="muted">{s.major}</td>
                <td className="id">{s.year}</td>
                <td className="num">{s.gpa.toFixed(2)}</td>
                <td className="num">{s.honors}×</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

Object.assign(window, { BrowseClasses, BrowseStudents });
