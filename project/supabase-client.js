// Supabase client + backend-backed data layer for College0.
//
// Surface: window.SB is the supabase-js client; window.Backend wraps RPC calls
// the rest of the app uses instead of touching tables directly. The pre-existing
// `CollegeStore` in shared.jsx will hydrate from these calls on app boot.
//
// Configuration: window.SB_CONFIG must be set before this script loads. Copy
// `supabase-config.example.js` to `supabase-config.js` and fill in your project
// URL + publishable anon key. The example file has setup details.

if (!window.SB_CONFIG || !window.SB_CONFIG.url || !window.SB_CONFIG.anonKey) {
  throw new Error(
    "Missing window.SB_CONFIG. Copy project/supabase-config.example.js to " +
    "project/supabase-config.js and set your Supabase URL + anon key."
  );
}

window.SB = window.supabase.createClient(
  window.SB_CONFIG.url,
  window.SB_CONFIG.anonKey,
  { auth: { persistSession: true, storageKey: "c0-supabase-auth" } }
);

// The long-lived `SB` client occasionally deadlocks under realtime + auth
// refresh interactions, especially on the second mutating call after sitting
// idle. `freshSB()` returns a one-shot client (no persistence, no realtime,
// no auto-refresh) that adopts the current access token from localStorage.
// Use it for write operations to sidestep that deadlock.
window.freshSB = () => {
  const sess = JSON.parse(localStorage.getItem("c0-supabase-auth") || "{}");
  const headers = {};
  if (sess && sess.access_token) headers.Authorization = "Bearer " + sess.access_token;
  return window.supabase.createClient(window.SB_CONFIG.url, window.SB_CONFIG.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers },
  });
};

// Convenience for components: map a display_id like "s-00029" to a real auth email
// (we provisioned them all under @college0.demo).
window.SB_EMAIL_FOR = (displayId) =>
  displayId === "registrar-001"
    ? "registrar@college0.demo"
    : `${displayId.toLowerCase()}@college0.demo`;

// ============= Backend: thin promise wrapper around Supabase calls =============
window.Backend = {
  // ---- Auth ----
  async signIn(emailOrDisplayId, password) {
    const email = emailOrDisplayId.includes("@")
      ? emailOrDisplayId
      : window.SB_EMAIL_FOR(emailOrDisplayId);
    // Use a fresh client; the long-lived SB client can deadlock on auth calls.
    // After a successful signIn, mirror the session into the persistent storage
    // key so the next page boot rehydrates the SB client with this session.
    const fresh = window.supabase.createClient(window.SB_CONFIG.url, window.SB_CONFIG.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const r = await fresh.auth.signInWithPassword({ email, password });
    if (!r.error && r.data?.session) {
      try {
        localStorage.setItem("c0-supabase-auth", JSON.stringify(r.data.session));
      } catch {}
    }
    return r;
  },
  async signOut() {
    // 'local' scope avoids a server round-trip and the realtime channel teardown
    // that can stall the demo. The session is cleared locally; the access token
    // becomes the anon key on next request.
    return SB.auth.signOut({ scope: "local" });
  },
  async session() {
    const { data } = await SB.auth.getSession();
    return data.session;
  },
  async changePassword(newPassword) {
    const { data, error } = await SB.auth.updateUser({ password: newPassword });
    if (error) return { error };
    // Also clear must_change_password flag
    if (data?.user?.id) {
      await SB.from("profiles").update({ must_change_password: false }).eq("id", data.user.id);
    }
    return { data };
  },

  // ---- Bootstrap data for the in-memory store ----
  async loadAll() {
    const [
      { data: state },
      { data: courses },
      { data: students },
      { data: instructors },
      { data: warnings },
      { data: honors },
      { data: applications },
      { data: complaints },
      { data: gradApps },
      { data: tabooWords },
      { data: requiredCourses },
      { data: programQuotas },
      { data: enrollments },
      { data: reviews },
      { data: fines },
    ] = await Promise.all([
      SB.from("system_state").select("*").eq("id", 1).single(),
      SB.from("courses").select("*, instructor:instructors(*, profile:profiles(*))"),
      SB.from("students").select("*, profile:profiles(*)"),
      SB.from("instructors").select("*, profile:profiles(*)"),
      SB.from("warnings").select("*, target:profiles(display_id, full_name, role)"),
      SB.from("honors").select("*, target:profiles(display_id, full_name)"),
      SB.from("applications").select("*"),
      SB.from("complaints").select("*, from_user:profiles!from_user_id(display_id, full_name, role), target:profiles!target_id(display_id, full_name, role)"),
      SB.from("graduation_applications").select("*, student:students(profile:profiles(*))"),
      SB.from("taboo_words").select("*"),
      SB.from("required_courses").select("*"),
      SB.from("program_quotas").select("*"),
      SB.from("enrollments").select("*, course:courses(code, title, time_label, room), student:students(profile:profiles(*))"),
      // Reviews list during hydrate: skip author embed for non-registrars
      // (RLS blocks the join). ClassDetail picks the right table per role on demand.
      SB.from("reviews").select("id, course_id, rating, body, taboo_count, hidden, created_at, course:courses(code, title)"),
      SB.from("fines").select("*"),
    ]);
    return {
      state, courses, students, instructors, warnings, honors,
      applications, complaints, gradApps, tabooWords, requiredCourses,
      programQuotas, enrollments, reviews, fines,
    };
  },

  // ---- Applications ----
  async submitApplication(app) {
    // Anon can INSERT but not SELECT (RLS), so don't request representation back.
    // The application appears in the registrar's queue via realtime/refresh.
    const { error } = await freshSB().from("applications").insert(app);
    return { error, data: error ? null : { ...app, status: "pending" } };
  },
  async decideApplication(id, decision, justification = "") {
    const r = await freshSB().rpc("decide_application", {
      p_app_id: id, p_decision: decision, p_justification: justification,
    });
    if (r.error || decision !== "accept") return r;
    // On accept: also provision the auth user + role row so they can actually sign in.
    // Pull the access token straight from storage to avoid the long-lived
    // SB.auth deadlock that can otherwise hang Backend.session().
    const sess = JSON.parse(localStorage.getItem("c0-supabase-auth") || "{}");
    const res = await fetch(`${SB_CONFIG.url}/functions/v1/provision-applicant`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${sess?.access_token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ application_id: id }),
    });
    const provisionResult = await res.json();
    return { ...r, provision: provisionResult };
  },

  // ---- Reset an applicant's password back to the demo temp pw ----
  async resetApplicantPassword(userId) {
    const sess = JSON.parse(localStorage.getItem("c0-supabase-auth") || "{}");
    const res = await fetch(`${SB_CONFIG.url}/functions/v1/reset-applicant-password`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${sess?.access_token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    });
    return res.json();
  },

  // ---- Phases ----
  async advancePhase() {
    return freshSB().rpc("advance_phase");
  },
  async setPhase(p) {
    return freshSB().from("system_state").update({ phase: p }).eq("id", 1);
  },

  // ---- Registration / enrollments ----
  async registerForCourse(courseId) {
    return freshSB().rpc("register_for_course", { p_course_id: courseId });
  },

  // ---- Grading ----
  async recordGrades(courseId, gradesByDisplayId) {
    return freshSB().rpc("record_grades", {
      p_course_id: courseId, p_grades: gradesByDisplayId,
    });
  },

  // ---- Reviews ----
  async submitReview(courseId, rating, body) {
    return freshSB().rpc("submit_review", {
      p_course_id: courseId, p_rating: rating, p_body: body,
    });
  },

  // ---- Complaints ----
  async fileComplaint(targetUserId, body) {
    const { data: u } = await SB.auth.getUser();
    return freshSB().from("complaints").insert({
      from_user_id: u.user.id, target_id: targetUserId, body,
    }).select().single();
  },
  async resolveComplaint(id, action, note = "") {
    return freshSB().rpc("resolve_complaint", { p_id: id, p_action: action, p_note: note });
  },

  // ---- Honors / Warnings ----
  async issueWarning(targetUserId, targetType, reason) {
    return freshSB().from("warnings").insert({
      target_id: targetUserId, target_type: targetType, reason,
    }).select().single();
  },
  async retireWarning(id) {
    return freshSB().from("warnings").update({ active: false }).eq("id", id);
  },
  async redeemHonor(honorId, warningId) {
    return freshSB().rpc("redeem_honor", { p_honor_id: honorId, p_warning_id: warningId });
  },

  // ---- Taboo words ----
  async setTaboo(words) {
    // Delete + reinsert. Small list, simplest correct behavior.
    const sb = freshSB();
    await sb.from("taboo_words").delete().neq("word", "");
    return sb.from("taboo_words").insert(words.map(word => ({ word })));
  },

  // ---- Graduation applications ----
  async fileGradApp(studentId, completedCodes, requiredCodes, missingCodes) {
    return freshSB().from("graduation_applications").insert({
      student_id: studentId,
      completed_codes: completedCodes,
      required_codes: requiredCodes,
      missing_codes: missingCodes,
    }).select().single();
  },
  async decideGradApp(id, decision) {
    // Server RPC: flips status, issues "reckless" warning on reject, marks
    // student "graduated" on approve — all atomic.
    return freshSB().rpc("decide_grad_app", { p_id: id, p_decision: decision });
  },

  // ---- Fines ----
  async payFine(studentId) {
    return freshSB().from("fines").update({ paid: true }).eq("student_id", studentId);
  },

  // ---- AI Q&A (edge function) ----
  async aiAsk(question) {
    // Pull the access token straight from storage so this works even when the
    // long-lived SB.auth client is in its deadlocked state. Fall back to the
    // anon key for visitors.
    const sess = JSON.parse(localStorage.getItem("c0-supabase-auth") || "{}");
    const tok = sess?.access_token || SB_CONFIG.anonKey;
    const res = await fetch(`${SB_CONFIG.url}/functions/v1/ai-query`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${tok}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ question }),
    });
    return res.json();
  },
};

// ============= Realtime subscriptions =============
// Components that need to react to changes can subscribe via store.emit() —
// the live channel just pings the store so subscribers refetch as needed.
window.Backend.startRealtime = (onChange) => {
  const ch = SB.channel("c0-live")
    .on("postgres_changes", { event: "*", schema: "public", table: "warnings" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "honors" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "system_state" }, onChange)
    .subscribe();
  return () => SB.removeChannel(ch);
};
