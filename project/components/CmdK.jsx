// Command palette / AI Q&A

const CmdK = ({ open, onClose, role }) => {
  const D = window.COLLEGE_DATA;
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("local"); // local | llm

  const suggestions = D.aiSuggestions[role === "registrar" || role === "admin" ? "instructor" : role] || D.aiSuggestions.visitor;

  useEffect(() => {
    if (!open) { setQ(""); setAnswer(null); }
  }, [open]);

  const ask = async (text) => {
    setQ(text);
    setLoading(true);
    setAnswer(null);
    // Live: hit the ai-query edge function if available.
    if (window.Backend?.aiAsk) {
      try {
        const a = await window.Backend.aiAsk(text);
        setAnswer({ body: a.body, src: a.source, source: a.kind });
        setLoading(false);
        return;
      } catch (err) {
        // fall through to legacy in-browser logic
      }
    }
    // Legacy in-browser pattern matching (kept as fallback when offline)
    setTimeout(() => {
      const t = text.toLowerCase();

      // ===== Role gating =====
      // Visitors: only general / handbook info. Students: own classes + handbook. Instructors: own students/classes + handbook. Registrar: everything.
      const mentionsOtherStudent = /\b(s-\d{5})\b/.test(t) || /(jonas|priya|wren|imogen|temir)/i.test(text);
      const asksAboutGrades = /(grade|gpa|transcript|fail|honor)/i.test(t);
      const asksAboutInstructor = /(my instructor|professor|teacher|i-[a-z]+)/i.test(t);
      const asksOpsy = /(roster|enrollment|class.gpa|at risk|submission|cancel)/i.test(t);

      if (role === "visitor" && (mentionsOtherStudent || asksOpsy || /(my |our )/.test(t))) {
        setAnswer({
          body: "I can only help visitors with general, public information about College0 — admissions policy, the handbook, top/lowest-rated classes, top GPA students. For anything personal or operational, please sign in.",
          src: "Role gate · visitor",
          source: "denied",
        });
        setLoading(false);
        return;
      }
      if (role === "student" && asksOpsy) {
        setAnswer({
          body: "Students can only ask about their own classes, grades, and the handbook. Roster-wide queries are restricted to instructors and the registrar.",
          src: "Role gate · student",
          source: "denied",
        });
        setLoading(false);
        return;
      }
      if (role === "student" && mentionsOtherStudent && !/myself|me/.test(t)) {
        setAnswer({
          body: "I can't answer questions about other students. Try asking about your own record, or the handbook.",
          src: "Role gate · student",
          source: "denied",
        });
        setLoading(false);
        return;
      }

      let local = null;
      const me = D.me;
      const store = window.CollegeStore;

      // ===== User-context answers (live data) =====
      if (role === "student" && /(my gpa|my standing|am i on track|graduate)/i.test(text)) {
        const myWarn = store.warnings.filter(w => w.target === me.id && w.active).length;
        const myHonor = store.honors.filter(h => h.target === me.id && !h.redeemed).length;
        local = { body: `Your cumulative GPA is ${me.gpa.toFixed(2)} (semester ${me.semesterGpa.toFixed(2)}). You have ${me.completedClasses}/${me.graduationTarget} classes toward graduation, ${myWarn} active warning${myWarn===1?"":"s"}, and ${myHonor} honor credit${myHonor===1?"":"s"}. ${me.completedClasses >= 8 ? "You're eligible to apply for graduation." : `${me.graduationTarget - me.completedClasses} more class${me.graduationTarget - me.completedClasses===1?"":"es"} to apply.`}`, src: "Local · your record" };
      }
      else if (role === "student" && /(my class|my course|enrolled|registered)/i.test(text)) {
        local = { body: `You're enrolled in ${D.myClasses.length} class${D.myClasses.length===1?"":"es"} this term: ${D.myClasses.map(c=>c.code).join(", ")}.`, src: "Local · your registration" };
      }
      else if (role === "student" && /(my warning|my fine|suspend)/i.test(text)) {
        const myWarns = store.warnings.filter(w => w.target === me.id && w.active);
        const fine = store.fines[me.id];
        local = { body: myWarns.length === 0 ? "No active warnings — you're in good standing." : `You have ${myWarns.length} active warning(s): ${myWarns.map(w=>w.reason).join("; ")}. ${fine ? `Outstanding fine: $${fine.amount} (${fine.paid?"paid":"unpaid"}).` : ""}`, src: "Local · warning ledger" };
      }
      else if (role === "instructor" && /(at risk|failing|worry)/i.test(text)) {
        const cls = D.instructorClasses?.[0] || D.instructorClass;
        const at = cls.roster.filter(s => s.current < 3.0 || parseInt(s.submissions) < 7);
        local = { body: `In ${cls.code}: ${at.length} student${at.length===1?"":"s"} at risk — ${at.map(s => `${s.name} (GPA ${s.current.toFixed(2)}, subs ${s.submissions})`).join("; ")}.`, src: "Local · gradebook + submissions" };
      }
      else if (role === "instructor" && /(my class|my roster|enrolled in)/i.test(text)) {
        const cls = D.instructorClasses || [D.instructorClass];
        local = { body: `You teach ${cls.length} class${cls.length===1?"":"es"} this term: ${cls.map(c => `${c.code} (${c.roster.length} students)`).join(", ")}.`, src: "Local · your assignments" };
      }
      else if (role === "instructor" && /(honor roll|my students.*honor)/i.test(text)) {
        const cls = D.instructorClasses || [D.instructorClass];
        const allStudents = cls.flatMap(c => c.roster);
        const honored = allStudents.filter(s => store.honors.some(h => h.target === s.id && !h.redeemed));
        local = { body: honored.length ? `Honor-roll students in your classes: ${honored.map(s=>s.name).join(", ")}.` : "None of your students are currently on the honor roll.", src: "Local · honors" };
      }

      // ===== Handbook KB (existing) =====
      if (!local) {
        if (t.includes("gpa") && t.includes("apply")) local = { body: "Applicants with a prior GPA above 3.0 are auto-accepted, subject to program quota. Below 3.0, the registrar may still admit you, but must justify the decision in writing.", src: "Handbook § 2.1 · Admissions" };
        else if (t.includes("register") && (t.includes("how many") || t.includes("courses"))) local = { body: "Each matriculated student must register for between 2 and 4 courses per term. Fewer than 2 triggers a warning; the cap of 4 is hard.", src: "Handbook § 4.2 · Registration" };
        else if (t.includes("taboo")) local = { body: "The registrars maintain a list of banned terms. A review with 1–2 taboo words is published with those words masked, and the author receives 1 warning. 3+ taboo words ⇒ review hidden entirely, 2 warnings.", src: "Handbook § 6.3 · Reviews" };
        else if (t.includes("graduate") || t.includes("graduation")) local = { body: "Students who have completed 8 classes may apply for graduation. The registrar verifies all required courses are covered. An incomplete application is penalised with 1 warning for reckless filing.", src: "Handbook § 7 · Graduation" };
        else if (t.includes("review") && t.includes("policy")) local = { body: "Only students currently enrolled in a class may review it, 1 star (worst) to 5 (best). Reviews are anonymous to everyone except the registrars, and close when the instructor posts a grade.", src: "Handbook § 6 · Reviews" };
        else if (t.includes("honor")) local = { body: "Semester GPA ≥ 3.75 or cumulative GPA ≥ 3.50 (after more than one semester) earns honor-roll status automatically. Each honor can retire one active warning.", src: "Handbook § 5.4 · Honors" };
        else if (t.includes("phase") || t.includes("period")) local = { body: `The semester is divided into 4 periods: Class set-up → Registration → Class running → Grading. Right now we're in Phase ${store.phase} (${["Class set-up","Registration","Class running","Grading"][store.phase-1]}).`, src: "Handbook § 3 · Semester structure" };
        else if (t.includes("drop")) local = { body: "Dropping is not allowed during the class-running period (Feb 3 – Apr 20) except via the special registration window triggered when a course is cancelled. Contact the registrar for an exception.", src: "Handbook § 4.3" };
      }

      if (local) {
        setAnswer({ ...local, source: "local" });
      } else {
        setAnswer({
          body: "I don't have this in the College0 knowledge base. A general model suggests: registration periods typically overlap with the first two weeks of term; contact your registrar to confirm.",
          src: "External LLM · claude-haiku",
          source: "llm",
        });
      }
      setLoading(false);
    }, 700);
  };

  if (!open) return null;
  return (
    <div className="cmdk-backdrop" onClick={onClose}>
      <div className="cmdk" onClick={e => e.stopPropagation()}>
        <div className="head">
          <span className="badge">Ask College0</span>
          <input
            autoFocus
            placeholder={role === "instructor" ? "Ask about your class or students…" : role === "student" ? "Ask about your classes or the handbook…" : "Ask about College0…"}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && q.trim()) ask(q); if (e.key === "Escape") onClose(); }}
          />
          <span className="mono muted" style={{ fontSize: 10.5 }}>ESC</span>
        </div>

        {!answer && !loading && (
          <div className="body">
            <div className="footnote" style={{ padding: "6px 18px 4px" }}>SUGGESTED · ROLE: {role.toUpperCase()}</div>
            {suggestions.map(s => (
              <div key={s} className="sug" onClick={() => ask(s)}>
                <span className="mono muted" style={{ width: 18 }}>↳</span>
                <span className="q">{s}</span>
                <span className="tag">ask</span>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="answer">
            <div className="muted" style={{ fontSize: 13 }}>Searching the College0 vector store…</div>
          </div>
        )}

        {answer && (
          <div className="answer">
            <div>{answer.body}</div>
            {answer.source === "llm" && (
              <div className="halluc">⚠ Answered by a general LLM — may hallucinate. Verify with the registrar.</div>
            )}
            {answer.source === "denied" && (
              <div className="halluc" style={{ background: "color-mix(in oklab, var(--bad) 12%, var(--surface))" }}>⊘ Out of scope for your role — the system declined to answer.</div>
            )}
            <div className="src">Source · {answer.src}</div>
            <div className="row" style={{ marginTop: 14, gap: 8 }}>
              <button className="btn sm" onClick={() => { setAnswer(null); setQ(""); }}>Ask another</button>
              <button className="btn sm ghost">Copy</button>
              <div className="mono muted" style={{ marginLeft: "auto", fontSize: 11 }}>{answer.source === "local" ? "LOCAL · vector db" : answer.source === "denied" ? "BLOCKED · role gate" : "FALLBACK · LLM"}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

window.CmdK = CmdK;
