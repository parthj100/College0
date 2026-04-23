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

  const ask = (text) => {
    setQ(text);
    setLoading(true);
    setAnswer(null);
    // Fake retrieval
    setTimeout(() => {
      const t = text.toLowerCase();
      let local = null;
      if (t.includes("gpa") && t.includes("apply")) local = { body: "Applicants with a prior GPA above 3.0 are auto-accepted, subject to program quota. Below 3.0, the registrar may still admit you, but must justify the decision in writing.", src: "Handbook § 2.1 · Admissions" };
      else if (t.includes("register") && (t.includes("how many") || t.includes("courses"))) local = { body: "Each matriculated student must register for between 2 and 4 courses per term. Fewer than 2 triggers a warning; the cap of 4 is hard.", src: "Handbook § 4.2 · Registration" };
      else if (t.includes("taboo")) local = { body: "The registrars maintain a list of banned terms. A review with 1–2 taboo words is published with those words masked, and the author receives 1 warning. 3+ taboo words ⇒ review hidden entirely, 2 warnings.", src: "Handbook § 6.3 · Reviews" };
      else if (t.includes("graduate") || t.includes("graduation")) local = { body: "Students who have completed 8 classes may apply for graduation. The registrar verifies all required courses are covered. An incomplete application is penalised with 1 warning for reckless filing.", src: "Handbook § 7 · Graduation" };
      else if (t.includes("review") && t.includes("policy")) local = { body: "Only students currently enrolled in a class may review it, 1 star (worst) to 5 (best). Reviews are anonymous to everyone except the registrars, and close when the instructor posts a grade.", src: "Handbook § 6 · Reviews" };
      else if (t.includes("honor")) local = { body: "Semester GPA ≥ 3.75 or cumulative GPA ≥ 3.50 (after more than one semester) earns honor-roll status automatically. Each honor can retire one active warning.", src: "Handbook § 5.4 · Honors" };
      else if (t.includes("at risk") || t.includes("failing")) local = { body: "In LIT-540 the students below 2.75 cumulative GPA are: Jonas Brautigan (2.68), Priya Kandasamy (2.95 — borderline). Jonas has also missed 3 of 8 weekly submissions.", src: "Local · gradebook + submissions" };
      else if (t.includes("drop")) local = { body: "Dropping is not allowed during the class-running period (Feb 3 – Apr 20) except via the special registration window triggered when a course is cancelled. Contact the registrar for an exception.", src: "Handbook § 4.3" };

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
            <div className="src">Source · {answer.src}</div>
            <div className="row" style={{ marginTop: 14, gap: 8 }}>
              <button className="btn sm" onClick={() => { setAnswer(null); setQ(""); }}>Ask another</button>
              <button className="btn sm ghost">Copy</button>
              <div className="mono muted" style={{ marginLeft: "auto", fontSize: 11 }}>{answer.source === "local" ? "LOCAL · vector db" : "FALLBACK · LLM"}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

window.CmdK = CmdK;
