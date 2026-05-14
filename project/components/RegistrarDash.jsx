// Registrar Dashboard — applications, phases, warnings, taboo words

const RegistrarDash = ({ setPage }) => {
  const D = window.COLLEGE_DATA;
  const store = useStore();
  const [tab, setTab] = React.useState("overview");
  const [grades, setGrades] = React.useState({});
  const phase = store.phase;
  const setPhase = (p) => store.setPhase(p);
  const apps = store.applications;
  const [justification, setJustification] = React.useState({});
  const [showJust, setShowJust] = React.useState(null);
  const [tabooWords, setTabooWords] = React.useState(["damn", "hell", "stupid", "idiot", "hate"]);
  const [newWord, setNewWord] = React.useState("");
  const complaints = store.complaints;


  const phaseNames = ["Class Set-up", "Registration", "Class Running", "Grading"];
  const phaseActions = ["", "Open Registration", "Begin Class Running", "Open Grading"];

  const quotaFor = (dept) => store.programQuotas[dept] || 6;
  const enrolledFor = (dept) => store.programEnrollment[dept] || 0;
  const quotaFull = (dept) => enrolledFor(dept) >= quotaFor(dept);

  const decide = (id, decision) => {
    const app = apps.find(a => a.id === id);
    // Auto-accept requires GPA ≥ 3.0 AND program quota not full
    const needsJust = decision === "reject" && app.type === "student" && app.gpa >= 3.0 && !quotaFull(app.dept);
    if (needsJust && !justification[id]) { setShowJust(id); return; }
    store.decideApplication(id, decision, justification[id]);
    setShowJust(null);
  };

  const resolveComplaint = (id, action) => {
    store.resolveComplaint(id, action);
  };

  const pending = apps.filter(a => a.status === "pending");
  const resolved = apps.filter(a => a.status !== "pending");

  return (
    <div className="page">
      <Eyebrow>Registrar · Full access</Eyebrow>
      <h1 className="page-title">Admin <span className="slash">Console.</span></h1>

      {/* Tabs */}
      <div className="tabs">
        {["overview","applications","setup","graduations","phases","complaints","taboo","warnings"].map(t => (
          <div key={t} className={"tab "+(tab===t?"on":"")} onClick={()=>setTab(t)}>
            {t === "setup" ? "Class set-up" : t[0].toUpperCase()+t.slice(1)}
            {t==="applications" && pending.length > 0 && <span className="mono" style={{marginLeft:6,color:"var(--accent)",fontSize:10}}>{pending.length}</span>}
            {t==="graduations" && store.gradApps.filter(g=>g.status==="pending").length > 0 && <span className="mono" style={{marginLeft:6,color:"var(--accent)",fontSize:10}}>{store.gradApps.filter(g=>g.status==="pending").length}</span>}
            {t==="complaints" && complaints.filter(c=>c.status==="pending").length > 0 && <span className="mono" style={{marginLeft:6,color:"var(--accent)",fontSize:10}}>{complaints.filter(c=>c.status==="pending").length}</span>}
          </div>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32}}>
          <div>
            <div className="section-title"><h2>Semester timeline</h2></div>
            <div className="phases" style={{marginBottom:0}}>
              {D.phases.map((p,i) => (
                <div key={p.num} className={"phase "+(p.state==="done"?"done":p.state==="active"?"active":"")}>
                  <div className="phase-num">Period {String(p.num).padStart(2,"0")}</div>
                  <div className="phase-name">{p.name}</div>
                  <div className="phase-dates">{p.dates}</div>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <button className="btn primary" onClick={()=>setTab("phases")}>Manage phases →</button>
            </div>
          </div>
          <div>
            <div className="section-title"><h2>Pending items</h2></div>
            <div className="card" style={{padding:0}}>
              {pending.slice(0,3).map(a => (
                <div key={a.id} style={{padding:"12px 16px",borderBottom:"1px solid var(--line)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
                  <div>
                    <div style={{fontSize:13}}>{a.name} <span className="mono muted" style={{fontSize:10}}>· {a.type}</span></div>
                    <div className="muted" style={{fontSize:12}}>{a.dept}{a.gpa ? ` · GPA ${a.gpa}` : ""}</div>
                  </div>
                  <button className="btn sm" onClick={()=>setTab("applications")}>Review</button>
                </div>
              ))}
              {complaints.filter(c=>c.status==="pending").map(c=>(
                <div key={c.id} style={{padding:"12px 16px",borderBottom:"1px solid var(--line)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
                  <div>
                    <div style={{fontSize:13}}>Complaint <span className="mono muted" style={{fontSize:10}}>· {c.id}</span></div>
                    <div className="muted" style={{fontSize:12}}>{c.from} → {c.target}</div>
                  </div>
                  <button className="btn sm" onClick={()=>setTab("complaints")}>Review</button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="section-title"><h2>All students</h2></div>
            <div className="card">
              <table className="data">
                <thead><tr><th>ID</th><th>Student</th><th>Major</th><th className="num">GPA</th><th className="num">Warns</th></tr></thead>
                <tbody>
                  {D.topStudents.map(s=>(
                    <tr key={s.id}>
                      <td className="id">{s.id}</td>
                      <td><div className="row"><Avatar name={s.name}/><span>{s.name}</span></div></td>
                      <td className="muted">{s.major}</td>
                      <td className="num">{s.gpa.toFixed(2)}</td>
                      <td className="num">0</td>
                    </tr>
                  ))}
                  <tr><td colSpan={5} className="muted" style={{fontSize:12,textAlign:"center",padding:10}}>42 more students…</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div className="section-title"><h2>All instructors</h2></div>
            <div className="card">
              <table className="data">
                <thead><tr><th>Name</th><th>Dept</th><th>Courses</th><th className="num">Warns</th></tr></thead>
                <tbody>
                  {[
                    {id:"i-Arkwright",name:"M. Arkwright",dept:"Philosophy",courses:1},
                    {id:"i-Okonkwo",name:"C. Okonkwo",dept:"Literature",courses:1},
                    {id:"i-Sato",name:"H. Sato",dept:"CompSci",courses:2},
                    {id:"i-Lambert",name:"P. Lambert",dept:"Economics",courses:1},
                    {id:"i-Moreau",name:"T. Moreau",dept:"Sociology",courses:1},
                  ].map(i=>{
                    const warns = store.warnings.filter(w=>w.target===i.id && w.active).length;
                    return (
                      <tr key={i.name}>
                        <td><div className="row"><Avatar name={i.name}/><span>{i.name}</span>{warns>=2&&<Chip tone={warns>=3?"bad":"warn"}>{warns>=3?"suspended":"at-risk"}</Chip>}</div></td>
                        <td className="muted">{i.dept}</td>
                        <td className="num">{i.courses}</td>
                        <td className="num" style={{color: warns>=3?"var(--bad)":warns>0?"var(--warn)":"inherit"}}>{warns}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* APPLICATIONS */}
      {tab === "applications" && (
        <div>
          <div className="section-title"><h2>Applications</h2><span className="count">{pending.length} pending · {resolved.length} resolved</span></div>
          {pending.map(a => {
            const autoAccept = a.type === "student" && a.gpa >= 3.0;
            const needsJust = showJust === a.id;
            return (
              <div key={a.id} className="card" style={{padding:22,marginBottom:16}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:16,alignItems:"start"}}>
                  <div>
                    <div className="row" style={{gap:10,marginBottom:8}}>
                      <Avatar name={a.name} size="lg"/>
                      <div>
                        <div style={{fontSize:16,fontWeight:500}}>{a.name}</div>
                        <div className="mono muted" style={{fontSize:11}}>{a.type === "student" ? `Student · ${a.dept} · GPA ${a.gpa}` : `Instructor · ${a.dept}`}</div>
                      </div>
                      {autoAccept && !quotaFull(a.dept) && <Chip tone="ok">Auto-pass</Chip>}
                      {autoAccept && quotaFull(a.dept) && <Chip tone="warn">Quota full ({enrolledFor(a.dept)}/{quotaFor(a.dept)})</Chip>}
                      {!autoAccept && a.type==="student" && <Chip tone="warn">GPA below 3.0</Chip>}
                      {a.type==="instructor" && <Chip>Instructor</Chip>}
                      {a.type==="student" && <span className="footnote" style={{marginLeft:6}}>{a.dept}: {enrolledFor(a.dept)}/{quotaFor(a.dept)}</span>}
                    </div>
                    <p style={{fontSize:13.5,color:"var(--ink-2)",fontStyle:"italic",maxWidth:"60ch",lineHeight:1.6}}>"{a.stmt}"</p>
                    {needsJust && (
                      <div style={{marginTop:12}}>
                        <div className="warn-banner mb-1"><span className="bar"/><span>Justification required — this student's GPA qualifies for auto-accept.</span></div>
                        <textarea className="textarea" style={{minHeight:60,marginTop:8}} placeholder="State the reason for rejection…" value={justification[a.id]||""} onChange={e=>setJustification({...justification,[a.id]:e.target.value})}/>
                      </div>
                    )}
                  </div>
                  <div className="col" style={{gap:8,alignItems:"flex-end"}}>
                    <button className="btn accent" onClick={()=>decide(a.id,"accept")}>Accept →</button>
                    <button className="btn" onClick={()=>{ setShowJust(a.id); if(showJust===a.id && justification[a.id]) decide(a.id,"reject"); }}>
                      {needsJust && justification[a.id] ? "Confirm rejection" : "Reject"}
                    </button>
                    {needsJust && <div className="footnote">Must justify override of GPA rule</div>}
                  </div>
                </div>
              </div>
            );
          })}
          {resolved.length > 0 && (
            <div>
              <div className="section-title" style={{marginTop:24}}><h2>Resolved</h2></div>
              <div className="card">
                <table className="data">
                  <thead><tr><th>Name</th><th>Type</th><th>Decision</th><th>Credentials issued</th></tr></thead>
                  <tbody>
                    {resolved.map(a=>{
                      const cred = store.credentials[a.id];
                      return (
                        <tr key={a.id}>
                          <td>{a.name}</td>
                          <td className="muted">{a.type}</td>
                          <td><Chip tone={a.status==="accept"?"ok":"bad"}>{a.status}</Chip>{a.justification && <div className="footnote" style={{marginTop:4}}>Justification: {a.justification}</div>}</td>
                          <td className="mono" style={{fontSize:11.5}}>
                            {cred ? (
                              <>
                                <div>{cred.studentId || cred.instructorId}</div>
                                <div className="muted">temp pw: {cred.tempPassword} {cred.mustChange && <Chip tone="warn">must change on first login</Chip>}</div>
                              </>
                            ) : <span className="muted">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CLASS SETUP */}
      {tab === "setup" && (
        <ClassSetupTab D={D} phase={phase}/>
      )}

      {/* PHASES */}
      {tab === "phases" && (
        <PhasesTab D={D} phase={phase} setPhase={setPhase} store={store} phaseNames={phaseNames}/>
      )}

      {/* COMPLAINTS */}
      {tab === "complaints" && (
        <div>
          <div className="section-title"><h2>Complaints queue</h2><span className="count">{complaints.filter(c=>c.status==="pending").length} pending</span></div>
          {complaints.filter(c=>c.status==="pending").map(c=>(
            <div key={c.id} className="card" style={{padding:22,marginBottom:16}}>
              <div className="row" style={{gap:10,marginBottom:12}}>
                <Chip tone="warn">Pending</Chip>
                <span className="mono muted" style={{fontSize:11}}>{c.id}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:14}}>
                <div><div className="footnote mb-1">FROM</div><div style={{fontSize:13.5}}>{c.from}</div></div>
                <div><div className="footnote mb-1">AGAINST</div><div style={{fontSize:13.5}}>{c.target}</div></div>
              </div>
              <div style={{fontSize:13.5,color:"var(--ink-2)",fontStyle:"italic",marginBottom:16}}>"{c.desc}"</div>
              <div className="row" style={{gap:8}}>
                <button className="btn sm primary" onClick={()=>resolveComplaint(c.id,"warn-target")}>Warn target</button>
                <button className="btn sm" onClick={()=>resolveComplaint(c.id,"warn-complainant")}>Dismiss → warn complainant</button>
                <button className="btn sm" style={{color:"var(--bad)",borderColor:"var(--bad)"}} onClick={()=>resolveComplaint(c.id,"deregister")}>De-register target</button>
              </div>
            </div>
          ))}
          {complaints.filter(c=>c.status!=="pending").map(c=>(
            <div key={c.id} className="card" style={{padding:16,marginBottom:8,opacity:0.65}}>
              <div className="row" style={{gap:10}}>
                <Chip tone="ok">Resolved</Chip>
                <span style={{fontSize:13}}>{c.from} → {c.target}</span>
                <span className="mono muted" style={{fontSize:11,marginLeft:"auto"}}>{c.status}</span>
              </div>
            </div>
          ))}
          {complaints.every(c=>c.status!=="pending") && (
            <div className="muted" style={{fontSize:13,padding:"24px 0"}}>No pending complaints. ✓</div>
          )}
        </div>
      )}

      {/* GRADUATIONS */}
      {tab === "graduations" && (
        <div>
          <div className="section-title"><h2>Graduation applications</h2><span className="count">{store.gradApps.filter(g=>g.status==="pending").length} pending</span></div>
          {store.gradApps.length === 0 && (
            <div className="card" style={{padding:24,textAlign:"center"}}>
              <div className="muted" style={{fontSize:13.5}}>No applications yet. Students who have completed 8 classes can apply from their dashboard.</div>
              <button className="btn mt-2" onClick={()=>{ setPage("student-dashboard"); }}>↪ Open student dashboard</button>
            </div>
          )}
          {store.gradApps.filter(a => a.status === "pending").map(a => {
            const cleared = a.missing.length === 0;
            return (
              <div key={a.id} className="card" style={{padding:22,marginBottom:16}}>
                <div className="row" style={{gap:10,marginBottom:12}}>
                  <Avatar name={a.studentName} size="lg"/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:16}}>{a.studentName} <span className="mono muted" style={{fontSize:11}}>· {a.studentId}</span></div>
                    <div className="muted" style={{fontSize:12}}>Bachelor's, {a.major} · filed {a.date}</div>
                  </div>
                  {cleared ? <Chip tone="ok">All required courses covered</Chip> : <Chip tone="bad">{a.missing.length} required course{a.missing.length===1?"":"s"} missing</Chip>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:14}}>
                  <div>
                    <div className="footnote mb-1">REQUIRED · {a.major}</div>
                    <div style={{display:"grid",gap:4}}>
                      {a.required.map(code => (
                        <div key={code} className="row" style={{gap:8,fontSize:12.5}}>
                          <span style={{color: a.completedCodes.includes(code) ? "var(--ok)" : "var(--bad)", fontFamily: "var(--font-mono)", width: 12}}>{a.completedCodes.includes(code) ? "✓" : "✕"}</span>
                          <span className="mono" style={{fontSize:11.5}}>{code}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="footnote mb-1">COMPLETED ({a.completedCodes.length})</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                      {a.completedCodes.map(c => <span key={c} className="mono" style={{fontSize:11,padding:"2px 6px",background:"var(--bg-2)",border:"1px solid var(--line)",borderRadius:"var(--radius-sm)"}}>{c}</span>)}
                    </div>
                  </div>
                </div>
                <div className="row" style={{gap:8}}>
                  <button className="btn sm primary" disabled={!cleared} onClick={()=>store.decideGradApp(a.id, "approved")}>Confer Bachelor's →</button>
                  <button className="btn sm" onClick={()=>store.decideGradApp(a.id, "reject-reckless")}>Reject (reckless application — warns student)</button>
                  <button className="btn sm ghost" onClick={()=>store.decideGradApp(a.id, "deferred")}>Defer</button>
                </div>
              </div>
            );
          })}
          {store.gradApps.filter(a => a.status !== "pending").length > 0 && (
            <div>
              <div className="section-title" style={{marginTop:24}}><h2>Resolved</h2></div>
              <div className="card">
                <table className="data">
                  <thead><tr><th>Student</th><th>Major</th><th>Decision</th><th>Filed</th></tr></thead>
                  <tbody>
                    {store.gradApps.filter(a => a.status !== "pending").map(a=>(
                      <tr key={a.id}>
                        <td>{a.studentName}</td>
                        <td className="muted">{a.major}</td>
                        <td><Chip tone={a.status==="approved"?"ok":a.status==="reject-reckless"?"bad":"warn"}>{a.status === "approved" ? "Graduated" : a.status === "reject-reckless" ? "Rejected · warning issued" : "Deferred"}</Chip></td>
                        <td className="id">{a.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TABOO WORDS */}
      {tab === "taboo" && (
        <div style={{maxWidth:600}}>
          <div className="section-title"><h2>Taboo word list</h2><span className="count">{tabooWords.length} words</span></div>
          <p className="muted" style={{maxWidth:"56ch"}}>Reviews containing 1–2 taboo words are masked and the author warned once. Reviews with 3+ taboo words are hidden entirely and the author receives 2 warnings.</p>
          <div className="card mt-2" style={{padding:18}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
              {tabooWords.map(w=>(
                <span key={w} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 10px",background:"var(--bg-2)",border:"1px solid var(--line)",borderRadius:"var(--radius-sm)",fontFamily:"var(--font-mono)",fontSize:12}}>
                  {w}
                  <span style={{cursor:"pointer",color:"var(--ink-3)",marginLeft:2}} onClick={()=>setTabooWords(tabooWords.filter(x=>x!==w))}>✕</span>
                </span>
              ))}
            </div>
            <div className="row" style={{gap:8}}>
              <input className="input" style={{maxWidth:220}} placeholder="Add word…" value={newWord} onChange={e=>setNewWord(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newWord.trim()){setTabooWords([...tabooWords,newWord.trim().toLowerCase()]);setNewWord("");}}}/>
              <button className="btn primary" disabled={!newWord.trim()} onClick={()=>{if(newWord.trim()){setTabooWords([...tabooWords,newWord.trim().toLowerCase()]);setNewWord("")}}}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* WARNINGS */}
      {tab === "warnings" && (
        <RegistrarWarningsTab store={store}/>
      )}
    </div>
  );
};

window.RegistrarDash = RegistrarDash;

// ===== Warnings tab — running ledger keyed by target =====
const RegistrarWarningsTab = ({ store }) => {
  const [target, setTarget] = useState("");
  const [reason, setReason] = useState("");
  const [type, setType] = useState("student");
  const [posted, setPosted] = useState(null);

  // Roll up warnings by target
  const byTarget = {};
  store.warnings.filter(w => w.active).forEach(w => {
    if (!byTarget[w.target]) byTarget[w.target] = { name: w.targetName, type: w.type, items: [] };
    byTarget[w.target].items.push(w);
  });
  const targets = Object.entries(byTarget).map(([id, info]) => ({ id, ...info }));
  targets.sort((a, b) => b.items.length - a.items.length);

  const targetOptions = [
    { id: "s-00029", name: "Wren Atsumi (s-00029)", type: "student" },
    { id: "s-00093", name: "Jonas Brautigan (s-00093)", type: "student" },
    { id: "s-00066", name: "Temir Baikov (s-00066)", type: "student" },
    { id: "s-00070", name: "Priya Kandasamy (s-00070)", type: "student" },
    { id: "i-Lambert", name: "P. Lambert (Instructor)", type: "instructor" },
    { id: "i-Moreau",  name: "T. Moreau (Instructor)", type: "instructor" },
    { id: "i-Sato",    name: "H. Sato (Instructor)", type: "instructor" },
    { id: "i-Devi",    name: "N. Devi (Instructor)", type: "instructor" },
  ];

  const issue = () => {
    if (!target || !reason.trim()) return;
    const t = targetOptions.find(o => o.id === target);
    const w = store.issueWarning(t.id, t.name.replace(/\s*\(.+\)/,""), t.type, reason.trim());
    setPosted(w);
    setReason("");
    setTimeout(() => setPosted(null), 2400);
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          <div className="section-title"><h2>Issue manual warning</h2></div>
          <div className="card" style={{padding:18}}>
            <div className="col" style={{gap:12}}>
              <div>
                <div className="footnote mb-1">TARGET</div>
                <select className="select" value={target} onChange={e => setTarget(e.target.value)}>
                  <option value="">— select —</option>
                  {targetOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <div className="footnote mb-1">REASON</div>
                <textarea className="textarea" style={{minHeight:60}} placeholder="Describe the reason for this warning…" value={reason} onChange={e => setReason(e.target.value)}/>
              </div>
              <button className="btn primary" disabled={!target || !reason.trim()} onClick={issue}>Issue warning →</button>
              {posted && <div className="footnote" style={{ color: "var(--ok)" }}>✓ Issued. Target now has {store.warnings.filter(w=>w.target===posted.target&&w.active).length} active warning(s).</div>}
            </div>
          </div>
        </div>
        <div>
          <div className="section-title"><h2>Standing</h2><span className="count">By target · 3 ⇒ suspension</span></div>
          <div className="card" style={{padding:0}}>
            <table className="data">
              <thead><tr><th>Target</th><th>Type</th><th className="num">Active warns</th><th className="num">Honors</th><th>Status</th></tr></thead>
              <tbody>
                {targets.map(t => {
                  const honors = store.honors.filter(h => h.target === t.id && !h.redeemed).length;
                  const suspended = t.items.length >= 3;
                  return (
                    <tr key={t.id}>
                      <td><div className="row"><Avatar name={t.name}/><span>{t.name}</span></div></td>
                      <td><Chip>{t.type}</Chip></td>
                      <td className="num" style={{color: suspended ? "var(--bad)" : t.items.length === 2 ? "var(--warn)" : "inherit", fontWeight: 500}}>{t.items.length}</td>
                      <td className="num">{honors || "—"}</td>
                      <td>
                        {suspended ? <Chip tone="bad">Suspended · fine due</Chip> :
                         t.items.length === 2 ? <Chip tone="warn">One from suspension</Chip> :
                         <Chip>Active</Chip>}
                      </td>
                    </tr>
                  );
                })}
                {targets.length === 0 && <tr><td colSpan={5} className="muted" style={{textAlign:"center",padding:18}}>No active warnings.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="section-title" style={{marginTop:32}}><h2>Active warning ledger</h2><span className="count">{store.warnings.filter(w=>w.active).length} active · {store.warnings.length - store.warnings.filter(w=>w.active).length} retired</span></div>
      <div className="card">
        <table className="data">
          <thead><tr><th>Target</th><th>Type</th><th>Reason</th><th>Issued</th><th></th></tr></thead>
          <tbody>
            {store.warnings.filter(w => w.active).map(w => (
              <tr key={w.id}>
                <td><div className="row"><Avatar name={w.targetName}/><span>{w.targetName}</span></div></td>
                <td><Chip>{w.type}</Chip></td>
                <td className="muted" style={{fontSize:12.5}}>{w.reason}</td>
                <td className="id">{w.date}</td>
                <td><button className="btn sm ghost" onClick={() => store.retireWarning(w.id)}>Retire</button></td>
              </tr>
            ))}
            {store.warnings.filter(w => w.active).length === 0 && (
              <tr><td colSpan={5} className="muted" style={{textAlign:"center",padding:18}}>No active warnings. ✓</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

window.RegistrarWarningsTab = RegistrarWarningsTab;

// ===== Phases tab — preview + apply transition effects =====
const PhasesTab = ({ D, phase, setPhase, store, phaseNames }) => {
  const [preview, setPreview] = useState(null);
  const [applied, setApplied] = useState(null);

  const transitions = {
    1: "Opens course registration for all matriculated students.",
    2: "Closes registration. Cancels courses with <3 students; warns those instructors; suspends instructors whose courses were ALL cancelled. Warns students whose load drops below 2 and opens a special-registration window for them.",
    3: "Opens grading. Instructors may post grades. Review window closes once a grade is posted.",
    4: "End-of-grading sweep: warns instructors with missing grades; questions instructors with class GPA outside 2.5–3.5; auto-terminates students with cum GPA <2; warns 2.0–2.25 + interview; awards honor roll for sem GPA ≥3.75 or cum ≥3.50.",
  };

  const open = () => setPreview(store.previewPhaseTransition(phase));
  const apply = async () => {
    // Real server-side transition: advance_phase RPC fires all side effects atomically.
    if (window.Backend?.advancePhase) {
      const { data, error } = await window.Backend.advancePhase();
      if (error) { alert(error.message); return; }
      setApplied({ ...preview, server: data });
    } else {
      store.applyPhaseTransition(preview);
      setApplied(preview);
    }
    // Local state will sync via realtime → refreshFromBackend, but also bump immediately
    if (window.Backend) await store.refreshFromBackend();
    else setPhase(phase + 1);
    setPreview(null);
  };

  return (
    <div style={{maxWidth:880}}>
      <div className="section-title"><h2>Semester phase control</h2><span className="count">Spring 2026</span></div>
      <div className="warn-banner mb-3"><span className="bar"/><span>Currently in <b>Phase {phase} — {phaseNames[phase-1]}</b>. Advancing fires policy actions and is irreversible.</span></div>

      <div className="card" style={{overflow:"hidden",marginBottom:24}}>
        {phaseNames.map((name,i) => {
          const num = i+1;
          const done = num < phase;
          const active = num === phase;
          return (
            <div key={num} style={{display:"grid",gridTemplateColumns:"48px 1fr auto",alignItems:"center",gap:16,padding:"16px 20px",borderBottom:"1px solid var(--line)",background:active?"var(--ink)":"var(--surface)",color:active?"var(--bg)":"inherit"}}>
              <div className="mono" style={{fontSize:22,opacity:done?.35:active?1:.4,color:active?"var(--bg)":done?"var(--ok)":"inherit"}}>
                {done ? "✓" : active ? "●" : String(num).padStart(2,"0")}
              </div>
              <div>
                <div style={{fontSize:15,fontFamily:"var(--font-display)"}}>{name}</div>
                <div style={{fontSize:11.5,opacity:active?0.7:0.5,fontFamily:"var(--font-mono)"}}>{D.phases[i]?.dates}</div>
              </div>
              {active && num < 4 && (
                <button className="btn sm" style={{background:"rgba(255,255,255,0.18)",border:"1px solid rgba(255,255,255,0.25)",color:"var(--bg)"}} onClick={open}>
                  Preview phase {num+1} effects →
                </button>
              )}
              {active && num === 4 && (
                <button className="btn sm" style={{background:"rgba(255,255,255,0.18)",border:"1px solid rgba(255,255,255,0.25)",color:"var(--bg)"}} onClick={open}>
                  Run end-of-term sweep →
                </button>
              )}
              {done && <Chip tone="ok">Complete</Chip>}
              {!active && !done && <span className="muted" style={{fontSize:12}}>Upcoming</span>}
            </div>
          );
        })}
      </div>

      <div className="section-title"><h2>What each transition does</h2></div>
      <div className="card" style={{padding:18}}>
        <div className="col" style={{gap:12,fontSize:13}}>
          <div className="row" style={{gap:12,alignItems:"flex-start"}}><span style={{flexShrink:0,minWidth:90}}><Chip>Ph. 1 → 2</Chip></span><span>{transitions[1]}</span></div>
          <div className="row" style={{gap:12,alignItems:"flex-start"}}><span style={{flexShrink:0,minWidth:90}}><Chip>Ph. 2 → 3</Chip></span><span>{transitions[2]}</span></div>
          <div className="row" style={{gap:12,alignItems:"flex-start"}}><span style={{flexShrink:0,minWidth:90}}><Chip>Ph. 3 → 4</Chip></span><span>{transitions[3]}</span></div>
          <div className="row" style={{gap:12,alignItems:"flex-start"}}><span style={{flexShrink:0,minWidth:90}}><Chip>End of Ph. 4</Chip></span><span>{transitions[4]}</span></div>
        </div>
      </div>

      {applied && (
        <div className="warn-banner ok mt-3">
          <span className="bar"/>
          <span>✓ Transition applied. {applied.cancelClasses?.length || 0} courses cancelled · {applied.warnedInstructors?.length || 0} instructors warned · {applied.suspendedInstructors?.length || 0} suspended · {applied.underloadStudents?.length || 0} students underloaded · {applied.honorRoll?.length || 0} honor roll · {applied.terminated?.length || 0} terminated.</span>
        </div>
      )}

      <PhasePreviewModal effects={preview} onClose={() => setPreview(null)} onApply={apply}/>
    </div>
  );
};

const PhasePreviewModal = ({ effects, onClose, onApply }) => {
  if (!effects) return null;
  const has = (arr) => arr && arr.length > 0;
  const isFinal = effects.from === 4;
  return (
    <Modal open={!!effects} onClose={onClose} title={isFinal ? "End-of-term sweep" : `Phase ${effects.from} → Phase ${effects.to}`} eyebrow="Preview effects · review before applying" width={760}>
      <div className="col" style={{gap:18}}>
        {has(effects.cancelClasses) && (
          <div>
            <Eyebrow>Courses cancelled (&lt; 3 students)</Eyebrow>
            <div className="card mt-1" style={{padding:0}}>
              <table className="data">
                <thead><tr><th>Code</th><th>Instructor</th><th className="num">Enrolled</th></tr></thead>
                <tbody>
                  {effects.cancelClasses.map(c => (
                    <tr key={c.code}>
                      <td className="id">{c.code}</td>
                      <td>{c.instructorName}</td>
                      <td className="num" style={{color:"var(--bad)"}}>{c.enrolled} / {c.cap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {has(effects.warnedInstructors) && (
          <div>
            <Eyebrow>Instructors warned</Eyebrow>
            <div className="col mt-1" style={{gap:6}}>
              {effects.warnedInstructors.map(i => (
                <div key={i.id} className="row" style={{gap:10,fontSize:13}}>
                  <Chip tone="warn">+1 warning</Chip>
                  <span>{i.name}</span>
                  <span className="muted">— {i.n} of their course{i.n>1?"s":""} cancelled</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {has(effects.suspendedInstructors) && (
          <div>
            <Eyebrow style={{color:"var(--bad)"}}>Instructors suspended (all courses cancelled)</Eyebrow>
            <div className="col mt-1" style={{gap:6}}>
              {effects.suspendedInstructors.map(i => (
                <div key={i.id} className="row" style={{gap:10,fontSize:13}}>
                  <Chip tone="bad">Suspended</Chip>
                  <span>{i.name}</span>
                  <span className="muted">— blocked from teaching next semester</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {has(effects.underloadStudents) && (
          <div>
            <Eyebrow>Students under courseload (&lt; 2) — warned + special registration window</Eyebrow>
            <div className="col mt-1" style={{gap:6}}>
              {effects.underloadStudents.map(s => (
                <div key={s.id} className="row" style={{gap:10,fontSize:13}}>
                  <Chip tone="warn">+1 warning</Chip>
                  <span>{s.name}</span>
                  <span className="muted">— {s.remaining.length} active course{s.remaining.length===1?"":"s"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {has(effects.displacedStudents) && (
          <div>
            <Eyebrow>Displaced students (special-registration window opens)</Eyebrow>
            <div className="col mt-1" style={{gap:6}}>
              {effects.displacedStudents.map(s => (
                <div key={s.id} className="row" style={{gap:10,fontSize:12.5}}>
                  <span className="mono" style={{width:90}}>{s.id}</span>
                  <span>{s.name}</span>
                  <span className="muted">— lost {s.lost.join(", ")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {has(effects.missingGrades) && (
          <div>
            <Eyebrow>Instructors with missing grades</Eyebrow>
            <div className="col mt-1" style={{gap:6}}>
              {effects.missingGrades.map(i => (
                <div key={i.id} className="row" style={{gap:10,fontSize:13}}>
                  <Chip tone="warn">+1 warning</Chip><span>{i.name}</span><span className="muted">— {i.missing} grade{i.missing>1?"s":""} missing in {i.course}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {has(effects.questionableInstructors) && (
          <div>
            <Eyebrow>Instructors questioned (class GPA outside 2.5–3.5)</Eyebrow>
            <div className="col mt-1" style={{gap:6}}>
              {effects.questionableInstructors.map(i => (
                <div key={i.id} className="row" style={{gap:10,fontSize:13,alignItems:"center"}}>
                  <Chip tone="warn">+1 warning</Chip><span>{i.name}</span><span className="muted">— {i.reason}</span>
                  <button className="btn sm" style={{marginLeft:"auto",color:"var(--bad)",borderColor:"var(--bad)"}} onClick={(e)=>{ e.stopPropagation(); window.CollegeStore.fireInstructor(i.id, i.name, i.reason); }}>Fire (no justification) →</button>
                </div>
              ))}
            </div>
            <div className="footnote mt-1">A questioned instructor may either provide a written justification or be fired outright at the registrar's discretion.</div>
          </div>
        )}
        {has(effects.terminated) && (
          <div>
            <Eyebrow style={{color:"var(--bad)"}}>Students terminated (cum GPA &lt; 2.0 or two F's same course)</Eyebrow>
            <div className="col mt-1" style={{gap:6}}>
              {effects.terminated.map(s => (
                <div key={s.id} className="row" style={{gap:10,fontSize:13}}>
                  <Chip tone="bad">Terminated</Chip><span>{s.name}</span><span className="muted">— {s.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {has(effects.gpaWarn) && (
          <div>
            <Eyebrow>Students 2.0–2.25 — warning + registrar interview</Eyebrow>
            <div className="col mt-1" style={{gap:6}}>
              {effects.gpaWarn.map(s => (
                <div key={s.id} className="row" style={{gap:10,fontSize:13}}>
                  <Chip tone="warn">+1 warning</Chip><span>{s.name}</span><span className="muted">— {s.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {has(effects.honorRoll) && (
          <div>
            <Eyebrow style={{color:"var(--ok)"}}>Honor roll (sem ≥ 3.75 or cum ≥ 3.50)</Eyebrow>
            <div className="col mt-1" style={{gap:6}}>
              {effects.honorRoll.map(s => (
                <div key={s.id} className="row" style={{gap:10,fontSize:13}}>
                  <Chip tone="ok">+1 honor</Chip><span>{s.name}</span><span className="muted">— {s.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {!Object.values(effects).some(v => Array.isArray(v) && v.length > 0) && (
          <div className="muted" style={{padding:24, textAlign:"center"}}>No automatic effects fire on this transition. Just open the next phase.</div>
        )}
        <div className="row" style={{gap:8,marginTop:12,paddingTop:14,borderTop:"1px solid var(--line)"}}>
          <button className="btn primary" onClick={onApply}>Apply &amp; advance →</button>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
};

window.PhasesTab = PhasesTab;

// ===== Class set-up tab — registrar assigns instructors, caps, times, required flag =====
const ClassSetupTab = ({ D, phase }) => {
  const seed = D.classEnrollments.map(c => ({
    code: c.code, instructor: c.instructor, instructorName: c.instructorName,
    cap: c.cap, time: ["Mon/Wed 09:00","Tue/Thu 11:00","Mon/Wed 14:00","Tue/Thu 15:30","Fri 10:00"][Math.floor(Math.random()*5)],
    required: ["PHIL-612","LIT-540","CS-710","MATH-701","LING-611"].includes(c.code),
    locked: phase > 1,
  }));
  const [classes, setClasses] = useState(seed);
  const [draftCode, setDraftCode] = useState("");
  const [draftInst, setDraftInst] = useState("");
  const [draftCap, setDraftCap] = useState(12);

  const instructors = [
    { id: "i-Arkwright", name: "M. Arkwright" },
    { id: "i-Okonkwo",   name: "C. Okonkwo" },
    { id: "i-Sato",      name: "H. Sato" },
    { id: "i-Lambert",   name: "P. Lambert" },
    { id: "i-Moreau",    name: "T. Moreau" },
    { id: "i-Lindqvist", name: "B. Lindqvist" },
    { id: "i-Duval",     name: "R. Duval" },
    { id: "i-Devi",      name: "N. Devi" },
    { id: "i-Abiola",    name: "E. Abiola" },
  ];

  const update = (code, patch) => setClasses(classes.map(c => c.code === code ? { ...c, ...patch } : c));
  const remove = (code) => setClasses(classes.filter(c => c.code !== code));
  const add = () => {
    if (!draftCode.trim() || !draftInst) return;
    const inst = instructors.find(i => i.id === draftInst);
    setClasses([...classes, { code: draftCode.toUpperCase(), instructor: draftInst, instructorName: inst.name, cap: draftCap, time: "Mon/Wed 09:00", required: false, locked: false }]);
    setDraftCode(""); setDraftInst(""); setDraftCap(12);
  };

  return (
    <div>
      <div className="section-title"><h2>Class set-up</h2><span className="count">{classes.length} courses · Spring 2026</span></div>
      {phase > 1 && (
        <div className="warn-banner mb-3"><span className="bar"/><span>Phase {phase} is active — class set-up is read-only. Course rosters are locked once registration opens.</span></div>
      )}

      <div className="card" style={{padding:0,marginBottom:24,overflow:"hidden"}}>
        <table className="data">
          <thead>
            <tr>
              <th>Code</th>
              <th>Instructor</th>
              <th className="num">Cap</th>
              <th>Time</th>
              <th style={{textAlign:"center"}}>Required</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {classes.map(c => (
              <tr key={c.code}>
                <td className="id"><b>{c.code}</b></td>
                <td>
                  {c.locked ? c.instructorName : (
                    <select className="select" style={{padding:"4px 8px",fontSize:12.5}} value={c.instructor} onChange={e => {
                      const inst = instructors.find(i => i.id === e.target.value);
                      update(c.code, { instructor: inst.id, instructorName: inst.name });
                    }}>
                      {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                  )}
                </td>
                <td className="num">
                  {c.locked ? c.cap : (
                    <input className="input" style={{padding:"4px 6px",fontSize:12.5,width:60,textAlign:"right"}} type="number" value={c.cap} onChange={e => update(c.code, { cap: +e.target.value || 0 })}/>
                  )}
                </td>
                <td className="mono" style={{fontSize:12}}>
                  {c.locked ? c.time : (
                    <select className="select" style={{padding:"4px 8px",fontSize:12}} value={c.time} onChange={e => update(c.code, { time: e.target.value })}>
                      <option>Mon/Wed 09:00</option>
                      <option>Mon/Wed 14:00</option>
                      <option>Tue/Thu 11:00</option>
                      <option>Tue/Thu 15:30</option>
                      <option>Fri 10:00</option>
                    </select>
                  )}
                </td>
                <td style={{textAlign:"center"}}>
                  {c.locked ? (c.required ? <Chip tone="ok">Required</Chip> : <span className="muted" style={{fontSize:12}}>—</span>) : (
                    <input type="checkbox" checked={c.required} onChange={e => update(c.code, { required: e.target.checked })}/>
                  )}
                </td>
                <td style={{textAlign:"right"}}>
                  {!c.locked && <button className="btn sm ghost" onClick={() => remove(c.code)} style={{color:"var(--bad)"}}>Remove</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {phase === 1 && (
        <>
          <div className="section-title"><h2>Add a course</h2></div>
          <div className="card" style={{padding:18}}>
            <div className="row" style={{gap:12,alignItems:"flex-end",flexWrap:"wrap"}}>
              <div>
                <div className="footnote mb-1">CODE</div>
                <input className="input" style={{width:140}} placeholder="LIT-501" value={draftCode} onChange={e=>setDraftCode(e.target.value)}/>
              </div>
              <div>
                <div className="footnote mb-1">INSTRUCTOR</div>
                <select className="select" style={{minWidth:200}} value={draftInst} onChange={e=>setDraftInst(e.target.value)}>
                  <option value="">— pick —</option>
                  {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div>
                <div className="footnote mb-1">CAP</div>
                <input className="input" type="number" style={{width:80,textAlign:"right"}} value={draftCap} onChange={e=>setDraftCap(+e.target.value || 0)}/>
              </div>
              <button className="btn primary" onClick={add} disabled={!draftCode.trim() || !draftInst}>Add course →</button>
            </div>
            <div className="footnote" style={{marginTop:10}}>Mark required courses with the checkbox in the table above. Required courses are checked at graduation; missing ones earn the student a "reckless application" warning.</div>
          </div>
        </>
      )}
    </div>
  );
};

window.ClassSetupTab = ClassSetupTab;
