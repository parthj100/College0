// Complaint composer + Graduation application + Honor redemption modals

const ComplaintComposer = ({ open, onClose, fromId, fromLabel, role }) => {
  const [targetType, setTargetType] = useState(role === "instructor" ? "student" : "student");
  const [targetId, setTargetId] = useState("");
  const [targetLabel, setTargetLabel] = useState("");
  const [desc, setDesc] = useState("");
  const [posted, setPosted] = useState(false);
  const D = window.COLLEGE_DATA;

  // Available targets
  const studentTargets = [
    ...D.topStudents.map(s => ({ id: s.id, label: `${s.name} (${s.id})` })),
    { id: "s-00066", label: "Temir Baikov (s-00066)" },
    { id: "s-00093", label: "Jonas Brautigan (s-00093)" },
    { id: "s-00070", label: "Priya Kandasamy (s-00070)" },
  ].filter(s => s.id !== fromId);
  const instructorTargets = [
    { id: "i-Arkwright", label: "M. Arkwright (Philosophy)" },
    { id: "i-Okonkwo",   label: "C. Okonkwo (Literature)" },
    { id: "i-Sato",      label: "H. Sato (CompSci)" },
    { id: "i-Lambert",   label: "P. Lambert (Economics)" },
    { id: "i-Moreau",    label: "T. Moreau (Sociology)" },
  ].filter(i => i.id !== fromId);
  const targets = targetType === "student" ? studentTargets : instructorTargets;

  const submit = () => {
    if (!targetId || !desc.trim()) return;
    window.CollegeStore.fileComplaint(fromId, fromLabel, targetId, targetLabel, desc.trim());
    setPosted(true);
  };

  const close = () => {
    setPosted(false); setTargetId(""); setTargetLabel(""); setDesc("");
    onClose();
  };

  return (
    <Modal open={open} onClose={close} title="File a complaint" eyebrow="To the registrar · confidential" width={580}>
      {posted ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div className="mono" style={{ fontSize: 36, marginBottom: 10, color: "var(--ok)" }}>✓</div>
          <div className="display" style={{ fontSize: 22, marginBottom: 8 }}>Complaint filed.</div>
          <p className="muted" style={{ maxWidth: "44ch", margin: "0 auto 18px", fontSize: 13 }}>
            The registrar must take action on every complaint — they'll either warn the target, or warn you for a frivolous filing.
          </p>
          <button className="btn" onClick={close}>Close</button>
        </div>
      ) : (
        <div className="col" style={{ gap: 14 }}>
          <div>
            <div className="footnote mb-1">COMPLAINT IS AGAINST</div>
            <div className="role-switcher" style={{ gridTemplateColumns: role === "instructor" ? "1fr" : "1fr 1fr", marginBottom: 0 }}>
              {role !== "instructor" && (
                <button className={targetType === "student" ? "active" : ""} onClick={() => { setTargetType("student"); setTargetId(""); }}>Another student</button>
              )}
              <button className={targetType === "instructor" ? "active" : ""} onClick={() => { setTargetType("instructor"); setTargetId(""); }}>{role === "instructor" ? "A student in your class" : "An instructor"}</button>
            </div>
          </div>
          {role === "instructor" && (
            // override: instructors can only file against students
            (() => { if (targetType !== "student") setTargetType("student"); return null; })()
          )}
          <div>
            <div className="footnote mb-1">{targetType === "student" ? "STUDENT" : "INSTRUCTOR"}</div>
            <select className="select" value={targetId} onChange={e => {
              setTargetId(e.target.value);
              const t = (targetType === "student" ? studentTargets : instructorTargets).find(x => x.id === e.target.value);
              setTargetLabel(t?.label || "");
            }}>
              <option value="">— select —</option>
              {targets.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <div className="footnote mb-1">DESCRIPTION</div>
            <textarea className="textarea" style={{ minHeight: 110 }} placeholder={role === "instructor" ? "What did the student do? Be specific. The registrar may warn or de-register them." : "Describe what happened. Be specific. The registrar reviews every complaint."} value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          {role === "instructor" && (
            <div className="warn-banner" style={{ padding: "8px 12px" }}>
              <span className="bar" />
              <span style={{ fontSize: 12 }}>The registrar <b>must</b> take action: warn the student, de-register them, or warn you for a baseless complaint.</span>
            </div>
          )}
          {role === "student" && (
            <div className="footnote">Frivolous complaints may result in a warning to <b>you</b>.</div>
          )}
          <div className="row" style={{ gap: 8, marginTop: 4 }}>
            <button className="btn primary" disabled={!targetId || !desc.trim() || desc.trim().length < 15} onClick={submit}>File with registrar →</button>
            <button className="btn ghost" onClick={close}>Cancel</button>
          </div>
        </div>
      )}
    </Modal>
  );
};

// ===== Graduation application =====
const GradAppModal = ({ open, onClose, student }) => {
  const D = window.COLLEGE_DATA;
  const required = D.requiredCourses[student.major] || [];
  // Pretend completed codes — drawn from student dash record
  const completed = ["LIT-501", "LIT-488", "PHIL-520", "LING-611", "HIST-410"];
  const missing = required.filter(r => !completed.includes(r));
  const eligible = student.completedClasses >= 8;
  const willPass = missing.length === 0 && eligible;

  const [confirmed, setConfirmed] = useState(false);
  const [posted, setPosted] = useState(null);
  const [submitErr, setSubmitErr] = useState("");

  const submit = async () => {
    setSubmitErr("");
    try {
      // fileGradApp is async — await the row before using `.missing` etc.
      const row = await window.CollegeStore.fileGradApp(
        student.id, student.name, student.major, completed,
      );
      // Server may auto-flip to 'reject-reckless' when missing_codes is non-empty.
      // Normalize the field names so the success view's posted.missing keeps working.
      setPosted({
        ...row,
        missing: row?.missing_codes || missing,
        autoRejected: row?.status === 'reject-reckless',
      });
      // Realtime should pick up the new warning, but pull explicitly so the
      // dashboard updates the moment we close the modal.
      window.CollegeStore.refreshFromBackend?.();
    } catch (e) {
      setSubmitErr(e?.message || String(e));
    }
  };

  const close = () => { setConfirmed(false); setPosted(null); onClose(); };

  return (
    <Modal open={open} onClose={close} title="Apply for graduation" eyebrow={`Bachelor's · ${student.major}`} width={620}>
      {posted ? (
        <div>
          <div className="mono" style={{ fontSize: 28, marginBottom: 8, color: (posted.missing || []).length === 0 ? "var(--ok)" : "var(--bad)" }}>
            {(posted.missing || []).length === 0 ? "✓" : "⚠"}
          </div>
          <div className="display" style={{ fontSize: 22, marginBottom: 6 }}>
            {(posted.missing || []).length === 0
              ? "Submitted to the registrar."
              : posted.autoRejected
                ? "Auto-rejected — reckless application."
                : "Filed — but flagged."}
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-2)" }}>
            {(posted.missing || []).length === 0
              ? "All required courses appear in your record. The registrar will verify and confer your Bachelor's degree shortly."
              : <>You're missing required courses (<span className="mono" style={{fontSize:12}}>{(posted.missing || []).join(", ")}</span>). A <b>warning has been added to your record</b> for filing a reckless application.</>}
          </p>
          <div className="row mt-2"><button className="btn" onClick={close}>Close</button></div>
        </div>
      ) : (
        <div>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 0 }}>
            You've completed <b>{student.completedClasses}</b> of {student.graduationTarget} classes required for graduation. The registrar will check that all <b>required courses</b> for your major are covered.
          </p>
          <div className="card" style={{ padding: 16, marginBottom: 14 }}>
            <Eyebrow>Required for {student.major}</Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
              {required.map(code => {
                const done = completed.includes(code);
                return (
                  <div key={code} className="row" style={{ gap: 8, fontSize: 13 }}>
                    <span style={{ color: done ? "var(--ok)" : "var(--bad)", fontFamily: "var(--font-mono)", fontSize: 12, width: 14 }}>{done ? "✓" : "✕"}</span>
                    <span className="mono" style={{ fontSize: 12 }}>{code}</span>
                    {!done && <span className="muted" style={{ fontSize: 11, marginLeft: 4 }}>not yet completed</span>}
                  </div>
                );
              })}
            </div>
          </div>
          {!eligible && (
            <div className="warn-banner mb-2"><span className="bar"/><span>You need <b>8 completed classes</b> to apply. You have {student.completedClasses}.</span></div>
          )}
          {missing.length > 0 && (
            <div className="warn-banner bad mb-2">
              <span className="bar"/>
              <span><b>This application will likely be rejected</b> with a warning for <i>reckless filing</i>. Missing: {missing.join(", ")}.</span>
            </div>
          )}
          {missing.length === 0 && eligible && (
            <div className="warn-banner ok mb-2">
              <span className="bar"/>
              <span>All required courses covered. Application should be approved.</span>
            </div>
          )}
          <div className="row" style={{ gap: 8 }}>
            {/* No eligibility gate — the server will auto-issue the reckless
                warning if the application is incomplete. Letting the student
                submit and immediately see the warning is more honest UX than
                silently disabling the button. */}
            <button className="btn primary" onClick={submit}>
              {willPass ? "Submit application →" : "Submit anyway →"}
            </button>
            <button className="btn ghost" onClick={close}>Cancel</button>
          </div>
          {submitErr && (
            <div className="warn-banner bad mt-2"><span className="bar"/><span style={{fontSize:12.5}}>{submitErr}</span></div>
          )}
        </div>
      )}
    </Modal>
  );
};

// ===== Honor redemption =====
const HonorRedeemModal = ({ open, onClose, studentId }) => {
  const store = useStore();
  const myWarnings = store.warnings.filter(w => w.target === studentId && w.active);
  const myHonors = store.honors.filter(h => h.target === studentId && !h.redeemed);
  const [picked, setPicked] = useState(null);

  const redeem = () => {
    if (!picked || myHonors.length === 0) return;
    store.redeemHonor(myHonors[0].id, picked);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Redeem an honor" eyebrow={`${myHonors.length} honor credit${myHonors.length===1?"":"s"} available`} width={520}>
      <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
        One honor retires one active warning. Pick which warning to clear.
      </p>
      {myWarnings.length === 0 ? (
        <div className="muted" style={{ padding: 20, textAlign: "center" }}>No active warnings to clear. ✓</div>
      ) : (
        <div className="col" style={{ gap: 8 }}>
          {myWarnings.map(w => (
            <div key={w.id} className="card" style={{ padding: 12, cursor: "pointer", borderColor: picked === w.id ? "var(--accent)" : "var(--line)", background: picked === w.id ? "color-mix(in oklab, var(--accent) 6%, var(--surface))" : "var(--surface)" }} onClick={() => setPicked(w.id)}>
              <div className="row" style={{ gap: 10 }}>
                <span className="mono" style={{ width: 14 }}>{picked === w.id ? "●" : "○"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5 }}>{w.reason}</div>
                  <div className="footnote">Issued {w.date}</div>
                </div>
              </div>
            </div>
          ))}
          <div className="row" style={{ gap: 8, marginTop: 8 }}>
            <button className="btn primary" disabled={!picked || myHonors.length === 0} onClick={redeem}>Redeem honor →</button>
            <button className="btn ghost" onClick={onClose}>Cancel</button>
          </div>
        </div>
      )}
    </Modal>
  );
};

Object.assign(window, { ComplaintComposer, GradAppModal, HonorRedeemModal });
