// Class detail + reviews

const ClassDetail = ({ setPage, role = "student" }) => {
  const D = window.COLLEGE_DATA;
  const store = useStore();
  const c = D.classDetail;
  const [tab, setTab] = useState("overview");
  const [newStars, setNewStars] = useState(0);
  const [newText, setNewText] = useState("");
  const [reviews, setReviews] = useState(c.reviews.map(r => ({ ...r, authorId: r.authorId || ("s-000" + (10 + r.id)) })));
  const [reviewPosted, setReviewPosted] = useState(false);

  // Pull live reviews from Supabase for this course (replaces the seeded list once available).
  useEffect(() => {
    const courseRow = store.coursesByCode?.[c.code];
    if (!courseRow || !window.SB) return;
    let cancelled = false;
    (async () => {
      // Use the view (which exposes author_id) only when the viewer is registrar;
      // otherwise pull from `reviews` and skip the author embed (anonymity).
      const isReg = window.CollegeStore.me?.role === "registrar";
      const sel = isReg
        ? "id, rating, body, taboo_count, hidden, created_at, author:students(profile:profiles(display_id))"
        : "id, rating, body, taboo_count, hidden, created_at";
      const { data, error } = await window.SB
        .from(isReg ? "reviews_with_authors" : "reviews")
        .select(sel)
        .eq("course_id", courseRow.id)
        .order("created_at", { ascending: true });
      if (cancelled || error || !data) return;
      // Append live reviews to the seeded ones; merge keys to avoid id collisions
      const live = data.map(r => ({
        id: "live-" + r.id,
        semester: c.meta?.time?.includes("Spring 2026") ? "Spring 2026" : "Spring 2026",
        rating: r.rating,
        body: r.body,
        tabooCount: r.taboo_count,
        hidden: r.hidden,
        authorId: r.author?.profile?.display_id,
      }));
      if (live.length) setReviews(prev => [...prev, ...live]);
    })();
    return () => { cancelled = true; };
  }, [c.code, store.coursesByCode]);
  // Spec §5: only currently enrolled students may review; reviews close once a grade is posted; only valid during phase 3+
  const me = D.me;
  const isEnrolled = role === "student" && D.myClasses.some(mc => mc.code === c.code);
  const reviewsLocked = store.isClassGraded(c.code);
  const phaseAllowsReviews = store.phase >= 3;
  const canWriteReview = role === "student" && isEnrolled && !reviewsLocked && phaseAllowsReviews;
  const liveTabooHits = store.scanReview(newText);

  const hist = c.ratingHistogram;
  const total = hist.reduce((a,b)=>a+b, 0);

  return (
    <div className="page">
      <div className="row" style={{ gap: 8, marginBottom: 8 }}>
        <a href="#" className="footnote" onClick={(e)=>{e.preventDefault(); setPage("student-dashboard");}}>← Back to dashboard</a>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "end", borderBottom: "1px solid var(--line)", paddingBottom: 24, marginBottom: 24 }}>
        <div>
          <Eyebrow>Spring 2026 · {c.meta.credits} credits</Eyebrow>
          <div className="mono" style={{ fontSize: 13, color: "var(--accent)", letterSpacing: "0.08em", marginTop: 4 }}>{c.code}</div>
          <h1 className="page-title" style={{ marginTop: 4 }}>{c.title}</h1>
          <div className="row" style={{ gap: 16, color: "var(--ink-2)" }}>
            <div className="row"><Avatar name={c.instructor}/><span>{c.instructor}</span></div>
            <span className="muted">·</span>
            <span className="mono" style={{ fontSize: 12 }}>{c.meta.time}</span>
            <span className="muted">·</span>
            <span className="mono" style={{ fontSize: 12 }}>{c.meta.room}</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="display" style={{ fontSize: 56, letterSpacing: "-0.03em", lineHeight: 1 }}>{c.meta.avgRating.toFixed(1)}</div>
          <Stars value={c.meta.avgRating} showVal={false}/>
          <div className="footnote" style={{ marginTop: 4 }}>{c.meta.reviews} reviews · {c.meta.enrolled}/{c.meta.cap} seats</div>
        </div>
      </div>

      <div className="tabs">
        {["overview", "reviews", "syllabus", "roster"]
          .filter(t => t !== "roster" || role === "instructor" || role === "registrar")
          .map(t => (
            <div key={t} className={"tab " + (tab === t ? "on" : "")} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
              {t === "reviews" && <span className="mono muted" style={{ marginLeft: 6, fontSize: 10.5 }}>{c.reviews.length}</span>}
            </div>
          ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 40 }}>
          <div>
            <Eyebrow>Description</Eyebrow>
            <p style={{ fontSize: 16, lineHeight: 1.65, marginTop: 10, color: "var(--ink)" }}>{c.description}</p>
            <div className="dot-div"/>
            <Eyebrow>The instructor</Eyebrow>
            <div className="row" style={{ marginTop: 10, gap: 12, alignItems: "flex-start" }}>
              <Avatar name={c.instructor} size="lg"/>
              <div>
                <div style={{ fontSize: 15 }}>{c.instructor}</div>
                <div className="muted" style={{ fontSize: 13, maxWidth: 480, marginTop: 4 }}>{c.instructorBio}</div>
              </div>
            </div>
          </div>
          <div>
            <div className="card" style={{ padding: 18 }}>
              <Eyebrow>Rating distribution</Eyebrow>
              <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
                {[5,4,3,2,1].map(s => {
                  const n = hist[s-1];
                  const pct = total ? (n/total*100) : 0;
                  return (
                    <div key={s} className="row" style={{ gap: 10 }}>
                      <span className="mono" style={{ width: 16, color: "var(--ink-3)", fontSize: 11 }}>{s}★</span>
                      <div style={{ flex: 1, height: 8, background: "var(--bg-2)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ width: pct + "%", height: "100%", background: s >= 4 ? "var(--accent)" : "var(--ink-3)" }}/>
                      </div>
                      <span className="mono" style={{ width: 24, textAlign: "right", fontSize: 11, color: "var(--ink-3)" }}>{n}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "reviews" && (
        <div style={{ display: "grid", gridTemplateColumns: role === "visitor" ? "1fr" : "1fr 360px", gap: 40 }}>
          <div>
            {reviews.filter(r => !r.hidden || role === "registrar").map(r => (
              <div key={r.id} className="review">
                <div className="r-head">
                  <Stars value={r.rating} showVal={false}/>
                  <span>{r.semester}</span>
                  <span className="muted">·</span>
                  <span>anonymous student</span>
                  {r.tabooCount === 1 && <Chip tone="warn">1 taboo word · author warned</Chip>}
                  {r.tabooCount >= 3 && <Chip tone="bad">3+ taboo words · hidden · author warned ×2</Chip>}
                  {role === "registrar" && r.authorId && <Chip tone="info">author: {r.authorId}</Chip>}
                </div>
                <div className="r-body">
                  {r.hidden && role === "registrar" ? (
                    <span style={{opacity: 0.7, fontStyle:"italic"}}>[hidden from public — registrar view] {r.body}</span>
                  ) : r.body.includes("[****]") ? (
                    <span>{r.body.split("[****]")[0]}<span className="taboo">[****]</span>{r.body.split("[****]")[1]}</span>
                  ) : r.body}
                </div>
              </div>
            ))}
          </div>
          {role !== "visitor" && <div>
            <div className="card" style={{ padding: 18 }}>
              <Eyebrow>Write a review</Eyebrow>
              <p className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
                You're anonymous to everyone except the registrars. Reviews close when your instructor posts a grade.
              </p>
              {reviewsLocked && (
                <div className="warn-banner mt-2" style={{ padding: "8px 12px" }}><span className="bar"/><span style={{ fontSize: 12 }}>Reviews are <b>closed</b> for this class — grades have been posted.</span></div>
              )}
              {!reviewsLocked && role === "student" && !isEnrolled && (
                <div className="warn-banner mt-2" style={{ padding: "8px 12px" }}><span className="bar"/><span style={{ fontSize: 12 }}>Only students <b>currently enrolled</b> in this class may post a review.</span></div>
              )}
              {!reviewsLocked && role === "student" && isEnrolled && !phaseAllowsReviews && (
                <div className="warn-banner mt-2" style={{ padding: "8px 12px" }}><span className="bar"/><span style={{ fontSize: 12 }}>Reviews open during the class-running period (phase 3).</span></div>
              )}
              {role !== "student" && (
                <div className="warn-banner mt-2 info" style={{ padding: "8px 12px" }}><span className="bar"/><span style={{ fontSize: 12 }}>Only students may post reviews. {role === "registrar" && "As registrar you can see authors via the chip on each review."}</span></div>
              )}
              <div className="row" style={{ gap: 6, marginTop: 14, fontSize: 22 }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} onClick={()=>setNewStars(s)} style={{ cursor: "pointer", color: s <= newStars ? "var(--accent)" : "var(--line-2)" }}>★</span>
                ))}
                <span className="mono muted" style={{ fontSize: 12, marginLeft: 8 }}>{newStars ? `${newStars}.0` : "rate"}</span>
              </div>
              <textarea className="textarea mt-2" value={newText} onChange={e => setNewText(e.target.value)} placeholder="What was it really like?" />
              {liveTabooHits.length >= 1 && (
                <div className="warn-banner mt-2" style={{ padding: "8px 12px" }}>
                  <span className="bar"/>
                  <span style={{ fontSize: 12 }}>Your review contains <b>{liveTabooHits.length}</b> taboo word{liveTabooHits.length>1?"s":""} ({liveTabooHits.join(", ")}). {liveTabooHits.length >= 3 ? "It will be hidden entirely + 2 warnings." : "They'll be masked + 1 warning."}</span>
                </div>
              )}
              {reviewPosted ? (
                <div className="mt-2" style={{ padding: "14px", background: "color-mix(in oklab,var(--ok) 12%,var(--surface))", border: "1px solid color-mix(in oklab,var(--ok) 30%,var(--line))", borderRadius: "var(--radius)", color: "var(--ok)", fontSize: 13 }}>
                  ✓ Review posted anonymously.
                </div>
              ) : (
                <button className="btn primary mt-2" disabled={!canWriteReview || !newStars || newText.length < 10}
                  onClick={async () => {
                    const courseRow = store.coursesByCode?.[c.code];
                    if (courseRow && window.Backend) {
                      const { data, error } = await window.Backend.submitReview(courseRow.id, newStars, newText);
                      if (error) { alert(error.message); return; }
                      setReviews([...reviews, {
                        id: data?.id || Date.now(),
                        semester: "Spring 2026",
                        rating: data?.rating ?? newStars,
                        body: data?.body || newText,
                        tabooCount: data?.taboo_count ?? 0,
                        hidden: data?.hidden ?? false,
                        authorId: me.id,
                      }]);
                    } else {
                      // Fallback (no backend) — original local-only path
                      const hits = store.scanReview(newText);
                      const masked = store.maskReview(newText);
                      const hidden = hits.length >= 3;
                      const newReview = { id: Date.now(), semester:"Spring 2026", rating: newStars, body: hidden ? "[Review hidden by registrar — 3+ taboo words]" : masked, tabooCount: hits.length, hidden, authorId: me.id };
                      setReviews([...reviews, newReview]);
                    }
                    setReviewPosted(true);
                    setNewStars(0); setNewText("");
                  }}>Post anonymously →</button>
              )}
              <div className="footnote mt-2">Taboo word list is maintained by the registrars.</div>
            </div>
          </div>}
        </div>
      )}

      {tab === "syllabus" && (
        <div className="card" style={{ padding: 28, maxWidth: 720 }}>
          <Eyebrow>Weekly plan</Eyebrow>
          <ol style={{ paddingLeft: 20, fontSize: 14.5, lineHeight: 1.8, marginTop: 10 }}>
            <li>Introductions · the question of inference</li>
            <li>Parfit, Reasons and Persons (Part III)</li>
            <li>Korsgaard on agency</li>
            <li>Borges detour: the Aleph as decision procedure</li>
            <li>Week of short responses — no new reading</li>
            <li>Midterm paper workshop</li>
            <li>Hursthouse · virtue & simulators</li>
            <li>Guest lecture: registrar on AI policy</li>
          </ol>
        </div>
      )}

      {tab === "roster" && (role === "instructor" || role === "registrar") && (
        <ClassRoster code={c.code} />
      )}
    </div>
  );
};

// Roster pulled from the live enrollments table when the course is known.
const ClassRoster = ({ code }) => {
  const store = useStore();
  const courseRow = store.coursesByCode?.[code];
  const [roster, setRoster] = useState([]);

  useEffect(() => {
    if (!courseRow || !window.SB) return;
    let cancelled = false;
    (async () => {
      const { data } = await window.SB
        .from("enrollments")
        .select("student:students(major, cached_cum_gpa, profile:profiles(display_id, full_name))")
        .eq("course_id", courseRow.id)
        .in("status", ["enrolled", "completed"]);
      if (cancelled || !data) return;
      const rows = data
        .map(e => e.student)
        .filter(Boolean)
        .map(s => ({
          id: s.profile?.display_id,
          name: s.profile?.full_name,
          major: s.major,
          gpa: s.cached_cum_gpa ? parseFloat(s.cached_cum_gpa) : null,
        }));
      setRoster(rows);
    })();
    return () => { cancelled = true; };
  }, [code, courseRow]);

  return (
    <div className="card">
      <table className="data">
        <thead><tr><th>ID</th><th>Name</th><th>Program</th><th className="num">GPA</th></tr></thead>
        <tbody>
          {roster.map((s) => (
            <tr key={s.id}>
              <td className="id">{s.id}</td>
              <td>{s.name}</td>
              <td className="muted">{s.major}</td>
              <td className="num">{s.gpa != null ? s.gpa.toFixed(2) : "—"}</td>
            </tr>
          ))}
          {roster.length === 0 && (
            <tr><td colSpan={4} className="muted" style={{ textAlign: "center", padding: 18 }}>
              No students enrolled, or roster unavailable.
            </td></tr>
          )}
        </tbody>
      </table>
      <div className="footnote" style={{ padding: 12 }}>Roster visible to instructor and registrar only.</div>
    </div>
  );
};
window.ClassRoster = ClassRoster;
window.ClassDetail = ClassDetail;
