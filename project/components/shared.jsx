// Shared UI primitives

const { useState, useEffect, useRef, useMemo } = React;

const Stars = ({ value, max = 5, showVal = true }) => {
  const full = Math.round(value);
  return (
    <span className="stars">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < full ? "" : "dim"}>★</span>
      ))}
      {showVal && <span className="val">{value.toFixed(1)}</span>}
    </span>
  );
};

const Avatar = ({ name, size }) => {
  const initials = name.split(/[\s-]/).map(p => p[0]).slice(0,2).join("").toUpperCase();
  return <span className={"avatar" + (size === "lg" ? " lg" : "")}>{initials}</span>;
};

const Chip = ({ children, tone }) => <span className={"chip" + (tone ? " " + tone : "")}>{children}</span>;

const Eyebrow = ({ children }) => <div className="eyebrow">{children}</div>;

const Phases = ({ phases, compact }) => (
  <div className="phases" style={compact ? { marginBottom: 0 } : {}}>
    {phases.map(p => (
      <div key={p.num} className={"phase " + (p.state === "done" ? "done" : p.state === "active" ? "active" : "")}>
        <div className="phase-num">Period {String(p.num).padStart(2, "0")}</div>
        <div className="phase-name">{p.name}</div>
        <div className="phase-dates">{p.dates}</div>
      </div>
    ))}
  </div>
);

const Crest = ({ size = 44 }) => (
  <span className="crest" aria-hidden="true">
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="21" stroke="currentColor" strokeWidth="1"/>
      <circle cx="22" cy="22" r="15" stroke="currentColor" strokeWidth="0.5"/>
      <path d="M22 7 L22 37 M7 22 L37 22" stroke="currentColor" strokeWidth="0.5"/>
      <text x="22" y="26" textAnchor="middle" fontFamily="serif" fontStyle="italic" fontSize="14" fill="currentColor">C0</text>
    </svg>
  </span>
);

// Placeholder image
const Placeholder = ({ label, h = 120 }) => (
  <div className="placeholder" style={{ height: h }}>{label}</div>
);

// ============= Ledger store: warnings + honors + complaints + grad apps =============
// Lives on window so all components share state through CollegeStore.
window.CollegeStore = window.CollegeStore || {
  // Current semester phase: 1=Set-up, 2=Registration, 3=Class running, 4=Grading
  phase: 3,
  warnings: [...(window.COLLEGE_DATA.warnings || [])],
  honors:   [...(window.COLLEGE_DATA.honorRoll || [])],
  // Pending visitor applications (added by ApplyPage, read by RegistrarDash)
  applications: [
    { id: "app-001", name: "Tariq Osei",     type: "student",    gpa: 3.7,  dept: "Philosophy",  status: "pending", stmt: "I want to study the ethics of machine cognition…" },
    { id: "app-002", name: "Luisa Ferreira", type: "student",    gpa: 2.8,  dept: "Mathematics", status: "pending", stmt: "Despite a challenging year, my research output…" },
    { id: "app-003", name: "Dr. Ben Okafor", type: "instructor", gpa: null, dept: "History",     status: "pending", stmt: "Twenty years of archival research…" },
    { id: "app-004", name: "Zoe Lindberg",   type: "student",    gpa: 3.4,  dept: "Literature",  status: "pending", stmt: "Literature is the only reliable map of experience…" },
  ],
  // Issued credentials, keyed by application id (visible on accept)
  credentials: {},
  // Per-student records: written when grades are posted; used to recompute GPA
  studentRecords: {},
  complaints: [
    { id: "c-001", from: "C. Okonkwo (Instructor)", fromId: "i-Okonkwo", target: "Jonas Brautigan (s-00093)", targetId: "s-00093", desc: "Student has missed 5 of 8 classes with no communication.", status: "pending", date: "Mar 24" },
    { id: "c-002", from: "Wren Atsumi (s-00029)",   fromId: "s-00029",   target: "Temir Baikov (s-00066)",   targetId: "s-00066", desc: "Academic misconduct — submitted near-identical responses on three weekly papers.", status: "pending", date: "Mar 30" },
  ],
  gradApps: [],
  // Taboo words — managed by registrar, read by review validator
  tabooWords: ["damn","hell","stupid","idiot","hate"],
  // Classes where grades have been posted — locks reviews
  gradedClasses: new Set(),
  // Fines: targetId -> { amount, paid }
  fines: {},
  // Programs with quotas
  programQuotas: { Literature:8, Philosophy:6, Mathematics:6, "Computer Science":8, History:6, Sociology:5, Economics:5, Art:4, Linguistics:5 },
  programEnrollment: { Literature:7, Philosophy:5, Mathematics:6, "Computer Science":7, History:5, Sociology:4, Economics:4, Art:3, Linguistics:4 },
  // Wait-list state per class
  waitlist: {
    "LIT-540": [
      { id: "s-00115", name: "Hanan Aziz", gpa: 3.62, note: "Needs LIT credit for graduation.", status: "pending" },
      { id: "s-00121", name: "Rowan Castile", gpa: 3.15, note: "Retaking after F in Fall '25.", status: "pending" },
    ],
  },
  listeners: new Set(),
};
const cs = window.CollegeStore;
cs.subscribe = (fn) => { cs.listeners.add(fn); return () => cs.listeners.delete(fn); };
cs.emit = () => cs.listeners.forEach(fn => fn());

// ============= Live data: hydrate the in-memory store from Supabase =============
// `me` is set once the user signs in; everything else is loaded eagerly.
cs.me = null;            // { id, displayId, email, role, fullName, mustChangePassword }
cs.hydrated = false;
cs.coursesByCode = {};   // code -> { id, code, title, instructorName, ... }
cs.studentsById = {};    // user_id -> { displayId, fullName, major, gpa, ... }
cs.profilesByDisplayId = {}; // display_id -> { id, role, fullName }
cs.profilesById = {};
cs.instructorsByDisplayId = {};

// Debounce: realtime + auth events can fire in bursts; collapse them into a single fetch.
cs._refreshTimer = null;
cs._refreshInFlight = false;
cs._refreshPending = false;
cs.refreshFromBackend = async () => {
  if (cs._refreshInFlight) { cs._refreshPending = true; return; }
  if (cs._refreshTimer) clearTimeout(cs._refreshTimer);
  await new Promise(r => { cs._refreshTimer = setTimeout(r, 120); });
  cs._refreshInFlight = true;
  try {
    await cs._refreshFromBackendInner();
  } finally {
    cs._refreshInFlight = false;
    if (cs._refreshPending) {
      cs._refreshPending = false;
      setTimeout(() => cs.refreshFromBackend(), 60);
    }
  }
};
cs._refreshFromBackendInner = async () => {
  if (!window.Backend) return;
  try {
    const d = await Backend.loadAll();
    // System state
    if (d.state) {
      cs.phase = d.state.phase;
      cs.currentSemester = d.state.current_semester;
      cs.specialReg = d.state.special_registration_open ? { open: true } : null;
      window.__specialReg = !!cs.specialReg;
    }
    // Profile maps
    cs.profilesByDisplayId = {};
    cs.profilesById = {};
    (d.students || []).forEach(s => {
      const p = s.profile;
      if (!p) return;
      cs.studentsById[p.id] = { ...s, displayId: p.display_id, fullName: p.full_name };
      cs.profilesByDisplayId[p.display_id] = { id: p.id, role: p.role, fullName: p.full_name };
      cs.profilesById[p.id] = { displayId: p.display_id, role: p.role, fullName: p.full_name };
    });
    (d.instructors || []).forEach(i => {
      const p = i.profile;
      if (!p) return;
      cs.instructorsByDisplayId[p.display_id] = { id: p.id, department: i.department, status: i.status, fullName: p.full_name };
      cs.profilesByDisplayId[p.display_id] = { id: p.id, role: p.role, fullName: p.full_name };
      cs.profilesById[p.id] = { displayId: p.display_id, role: p.role, fullName: p.full_name };
    });
    // Warnings + honors — normalize to the legacy shape (target = display_id)
    cs.warnings = (d.warnings || []).map(w => ({
      id: w.id,
      target: w.target?.display_id || w.target_id,
      targetId: w.target_id,
      targetName: w.target?.full_name || "",
      type: w.target_type,
      reason: w.reason,
      active: w.active,
      date: new Date(w.issued_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));
    cs.honors = (d.honors || []).map(h => ({
      id: h.id,
      target: h.target?.display_id || h.target_id,
      targetId: h.target_id,
      targetName: h.target?.full_name || "",
      reason: h.reason,
      redeemed: h.redeemed,
      date: new Date(h.awarded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));
    cs.applications = (d.applications || []).map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      gpa: a.prior_gpa ? parseFloat(a.prior_gpa) : null,
      dept: a.department,
      stmt: a.statement,
      status: a.status,
      justification: a.justification,
      filedAt: a.filed_at,
    }));
    cs.complaints = (d.complaints || []).map(c => ({
      id: c.id,
      from: c.from_user ? `${c.from_user.full_name} (${c.from_user.display_id})` : "",
      fromId: c.from_user?.display_id || c.from_user_id,
      target: c.target ? `${c.target.full_name} (${c.target.display_id})` : "",
      targetId: c.target?.display_id || c.target_id,
      desc: c.body,
      status: c.status,
      date: new Date(c.filed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));
    cs.gradApps = (d.gradApps || []).map(g => ({
      id: g.id,
      studentId: g.student?.profile?.display_id || g.student_id,
      studentName: g.student?.profile?.full_name || "",
      major: g.student?.major || "",
      completedCodes: g.completed_codes,
      required: g.required_codes,
      missing: g.missing_codes,
      status: g.status,
      date: new Date(g.filed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));
    cs.tabooWords = (d.tabooWords || []).map(t => t.word);
    cs.fines = {};
    (d.fines || []).forEach(f => {
      const p = cs.profilesById[f.student_id];
      if (p) cs.fines[p.displayId] = { amount: parseFloat(f.amount), paid: f.paid, reason: f.reason };
    });
    // Courses (keep code -> id map for RPC calls)
    cs.coursesByCode = {};
    (d.courses || []).forEach(c => {
      cs.coursesByCode[c.code] = {
        id: c.id, code: c.code, title: c.title,
        instructorName: c.instructor?.profile?.full_name || "",
        instructorDisplayId: c.instructor?.profile?.display_id || "",
        cap: c.cap, avgRating: c.avg_rating, status: c.status,
        time: c.time_label, room: c.room,
      };
    });
    // Locks: classes graded if any enrollment has a grade
    cs.gradedClasses = new Set();
    (d.enrollments || []).forEach(e => {
      if (e.grade) cs.gradedClasses.add(e.course?.code);
    });
    cs.hydrated = true;
    cs.emit();
  } catch (err) {
    console.warn("Hydrate failed", err);
  }
};

// Boot: hydrate immediately, refresh on auth change, and subscribe to live updates.
if (window.SB) {
  cs.refreshFromBackend();
  SB.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const { data: prof } = await SB.from("profiles").select("*").eq("id", session.user.id).single();
      cs.me = prof ? {
        id: prof.id, displayId: prof.display_id, email: session.user.email,
        role: prof.role, fullName: prof.full_name, mustChangePassword: prof.must_change_password,
      } : null;
    } else {
      cs.me = null;
    }
    await cs.refreshFromBackend();
  });
  // Live channel: any change → refresh
  Backend.startRealtime?.(() => cs.refreshFromBackend());
}

// All mutating methods go through Supabase; the live channel + auth callback
// will refresh the in-memory cache. We return immediately with optimistic objects
// where useful so components stay snappy.

cs.issueWarning = async (targetDisplayIdOrId, targetName, type, reason) => {
  const targetUserId =
    cs.profilesByDisplayId[targetDisplayIdOrId]?.id || targetDisplayIdOrId;
  const { data } = await Backend.issueWarning(targetUserId, type, reason);
  return data;
};
cs.retireWarning = async (id) => {
  await Backend.retireWarning(id);
};
cs.redeemHonor = async (honorId, warningId) => {
  await Backend.redeemHonor(honorId, warningId);
};
cs.fileComplaint = async (_fromDisplayId, _fromLabel, targetDisplayId, _targetLabel, desc) => {
  const targetUserId = cs.profilesByDisplayId[targetDisplayId]?.id || targetDisplayId;
  const { data } = await Backend.fileComplaint(targetUserId, desc);
  return data;
};
cs.resolveComplaint = async (id, action) => {
  await Backend.resolveComplaint(id, action);
};
cs.fileGradApp = async (studentId, studentName, major, completedCodes) => {
  const required = window.COLLEGE_DATA.requiredCourses[major] || [];
  const missing = required.filter(r => !completedCodes.includes(r));
  const userId = cs.profilesByDisplayId[studentId]?.id || studentId;
  const { data } = await Backend.fileGradApp(userId, completedCodes, required, missing);
  return data;
};
cs.decideGradApp = async (id, decision) => {
  await Backend.decideGradApp(id, decision);
  if (decision === "reject-reckless") {
    const a = cs.gradApps.find(x => x.id === id);
    if (a) await cs.issueWarning(a.studentId, a.studentName, "student",
      "Reckless graduation application — required courses missing");
  }
};

// ============= Phase engine =============
// Returns the EFFECTS that will fire on transition without applying them yet,
// so the registrar can review before confirming.
cs.previewPhaseTransition = (fromPhase) => {
  const D = window.COLLEGE_DATA;
  const effects = { from: fromPhase, to: fromPhase + 1, cancelClasses: [], underloadStudents: [], warnedInstructors: [], suspendedInstructors: [], displacedStudents: [], honorRoll: [], terminated: [], gpaWarn: [], questionableInstructors: [], missingGrades: [] };

  if (fromPhase === 2) {
    // → Class running. Cancel <3-student courses, warn instructors, find displaced students.
    effects.cancelClasses = D.classEnrollments.filter(c => c.willCancel || c.enrolled < 3);
    const cancelledCodes = new Set(effects.cancelClasses.map(c => c.code));
    const cancelledByInstructor = {};
    effects.cancelClasses.forEach(c => {
      cancelledByInstructor[c.instructor] = (cancelledByInstructor[c.instructor] || 0) + 1;
    });
    // Warn each instructor whose course was cancelled
    Object.entries(cancelledByInstructor).forEach(([instId, n]) => {
      const all = D.classEnrollments.filter(c => c.instructor === instId);
      const allCancelled = all.every(c => cancelledCodes.has(c.code));
      const c = D.classEnrollments.find(c => c.instructor === instId);
      if (allCancelled) {
        effects.suspendedInstructors.push({ id: instId, name: c.instructorName, n });
      } else {
        effects.warnedInstructors.push({ id: instId, name: c.instructorName, n });
      }
    });
    // Displaced students
    D.studentLoads.forEach(s => {
      const remaining = s.courses.filter(c => !cancelledCodes.has(c));
      if (remaining.length < s.courses.length) {
        effects.displacedStudents.push({ ...s, lost: s.courses.filter(c => cancelledCodes.has(c)), remaining });
      }
      // Underload (<2)
      if (remaining.length < 2) {
        effects.underloadStudents.push({ ...s, remaining });
      }
    });
  }

  if (fromPhase === 3) {
    // Phase 3 → 4: nothing major, just open grading
  }

  if (fromPhase === 4) {
    // End of grading: instructors with missing grades, GPA outliers, student standing
    // Pretend each instructor "submitted" all but one for one class
    effects.missingGrades.push({ id: "i-Lambert", name: "P. Lambert", missing: 2, course: "ECON-599" });

    D.studentLoads.forEach(s => {
      if (s.cumGpa < 2.0) effects.terminated.push({ ...s, reason: `Cumulative GPA ${s.cumGpa.toFixed(2)} < 2.0` });
      else if (s.cumGpa >= 2.0 && s.cumGpa <= 2.25) effects.gpaWarn.push({ ...s, reason: `GPA ${s.cumGpa.toFixed(2)} — interview required` });
      if (s.semGpa >= 3.75 || s.cumGpa >= 3.50) effects.honorRoll.push({ ...s, reason: s.semGpa >= 3.75 ? `Sem GPA ${s.semGpa.toFixed(2)}` : `Cum GPA ${s.cumGpa.toFixed(2)}` });
    });

    // Instructor questioning (out-of-band class GPA)
    effects.questionableInstructors.push({ id: "i-Lambert", name: "P. Lambert", course: "ECON-599", classGpa: 1.95, reason: "Class GPA 1.95 < 2.5" });
    effects.questionableInstructors.push({ id: "i-Sato",    name: "H. Sato",    course: "CS-710",   classGpa: 3.78, reason: "Class GPA 3.78 > 3.5" });
  }

  return effects;
};

cs.applyPhaseTransition = (effects) => {
  // Issue warnings / suspensions / honors / terminations.
  effects.warnedInstructors.forEach(i => cs.issueWarning(i.id, i.name, "instructor", `Course${i.n>1?"s":""} cancelled — fewer than 3 students enrolled`));
  effects.suspendedInstructors.forEach(i => {
    cs.issueWarning(i.id, i.name, "instructor", `All assigned courses cancelled — suspended; cannot teach next semester`);
    cs.issueWarning(i.id, i.name, "instructor", `Suspension marker (auto-issued)`);
    cs.issueWarning(i.id, i.name, "instructor", `Suspension marker (auto-issued)`);
  });
  effects.underloadStudents.forEach(s => cs.issueWarning(s.id, s.name, "student", `Active courseload below 2 (${s.remaining.length})`));
  effects.missingGrades.forEach(i => cs.issueWarning(i.id, i.name, "instructor", `Missing grades for ${i.missing} student${i.missing>1?"s":""} in ${i.course}`));
  effects.questionableInstructors.forEach(i => cs.issueWarning(i.id, i.name, "instructor", i.reason + ` (${i.course})`));
  effects.gpaWarn.forEach(s => cs.issueWarning(s.id, s.name, "student", s.reason));
  effects.terminated.forEach(s => {
    cs.issueWarning(s.id, s.name, "student", `Terminated — ${s.reason}`);
    cs.issueWarning(s.id, s.name, "student", `Terminated — ${s.reason}`);
    cs.issueWarning(s.id, s.name, "student", `Terminated — ${s.reason}`);
  });
  // Honor roll: append new honors
  effects.honorRoll.forEach(s => {
    cs.honors.push({ id: "h-" + Date.now() + "-" + s.id, target: s.id, targetName: s.name, reason: s.reason, date: "End of term", redeemed: false });
  });
  cs.emit();
};

// Taboo (write-through to taboo_words table)
cs.setTaboo = async (list) => { await Backend.setTaboo(list); };
cs.scanReview = (text) => {
  const lower = text.toLowerCase();
  const hits = cs.tabooWords.filter(w => w && new RegExp("\\b" + w.toLowerCase() + "\\b").test(lower));
  return hits;
};
cs.maskReview = (text) => {
  let masked = text;
  cs.tabooWords.forEach(w => { if (w) masked = masked.replace(new RegExp("\\b" + w + "\\b","gi"), "[" + "*".repeat(Math.max(3,w.length)) + "]"); });
  return masked;
};

// Grade posting locks reviews on a class
cs.postGrades = (classCode) => { cs.gradedClasses.add(classCode); cs.emit(); };
cs.isClassGraded = (classCode) => cs.gradedClasses.has(classCode);

// Fines — the database trigger auto-assesses; pay goes through the table directly.
cs.assessFine = (targetId, amount, reason) => {
  // Server-side trigger creates fines automatically on 3 active warnings; keep this
  // as a no-op stub so calling components don't break.
  cs.fines[targetId] = { amount, paid: false, reason };
  cs.emit();
};
cs.payFine = async (targetDisplayId) => {
  const userId = cs.profilesByDisplayId[targetDisplayId]?.id || targetDisplayId;
  await Backend.payFine(userId);
};

// Wait-list admit / decline
cs.admitFromWaitlist = (classCode, studentId) => {
  const list = cs.waitlist[classCode] || [];
  const s = list.find(x => x.id === studentId);
  if (s) s.status = "admitted";
  cs.emit();
};
cs.declineFromWaitlist = (classCode, studentId) => {
  const list = cs.waitlist[classCode] || [];
  const s = list.find(x => x.id === studentId);
  if (s) s.status = "declined";
  cs.emit();
};

// Fire instructor
cs.fireInstructor = (id, name, reason) => {
  cs.issueWarning(id, name, "instructor", `TERMINATED — ${reason}`);
  cs.issueWarning(id, name, "instructor", `TERMINATED — ${reason}`);
  cs.issueWarning(id, name, "instructor", `TERMINATED — ${reason}`);
};

// Phase control — write through to system_state
cs.setPhase = async (p) => {
  await Backend.setPhase(p);
};
cs.advancePhase = async () => {
  const { data } = await Backend.advancePhase();
  return data;
};
cs.canRegister = () => cs.phase === 2 || !!cs.specialReg;
cs.canReview = (classCode) => cs.phase >= 3 && cs.phase <= 4 && !cs.isClassGraded(classCode);
cs.canGrade = () => cs.phase === 4;

// Applications: add (from ApplyPage) and decide (from RegistrarDash)
cs.addApplication = async (app) => {
  const { data } = await Backend.submitApplication({
    name: app.name, email: app.email, type: app.type,
    prior_gpa: app.gpa, department: app.dept, statement: app.stmt,
  });
  return data;
};
cs.decideApplication = async (id, decision, justification) => {
  await Backend.decideApplication(id, decision, justification || "");
};
// Legacy local-only path retained for cases the components still expect synchronous behavior:
cs._decideApplicationLocal = (id, decision, justification) => {
  const a = cs.applications.find(x => x.id === id);
  if (!a) return null;
  a.status = decision;
  a.justification = justification || null;
  if (decision === "accept") {
    if (a.type === "student") {
      const sid = "s-" + String(50 + Math.floor(Math.random()*900)).padStart(5, "0");
      const tempPass = "c0-" + Math.random().toString(36).slice(2, 8);
      cs.credentials[a.id] = { studentId: sid, tempPassword: tempPass, mustChange: true, name: a.name };
      cs.programEnrollment[a.dept] = (cs.programEnrollment[a.dept] || 0) + 1;
    } else {
      cs.credentials[a.id] = { instructorId: "i-" + a.name.split(/\s+/).pop(), tempPassword: "c0-" + Math.random().toString(36).slice(2,8), mustChange: true, name: a.name };
    }
  }
  cs.emit();
  return a;
};

// Grade posting now records each student's grade and recomputes standing
const GPA_MAP = { "A":4.0, "A-":3.67, "B+":3.33, "B":3.0, "B-":2.67, "C+":2.33, "C":2.0, "F":0 };
// Record grades through the RPC (recompute, honors, terminations all happen server-side)
cs.recordGrades = async (classCode, instructorId, instructorName, grades) => {
  const c = cs.coursesByCode[classCode];
  if (!c) return;
  await Backend.recordGrades(c.id, grades);
};
// Local-only stub kept for any code path still calling the old signature:
cs._recordGradesLocal = (classCode, instructorId, instructorName, grades) => {
  const records = cs.studentRecords;
  Object.entries(grades).forEach(([sid, letter]) => {
    if (!records[sid]) records[sid] = [];
    records[sid].push({ classCode, letter, gpa: GPA_MAP[letter] ?? 0, term: window.COLLEGE_DATA.currentSemester });
  });

  // Class-GPA outlier check (spec §6: <2.5 or >3.5 → instructor questioned)
  const vals = Object.values(grades).map(l => GPA_MAP[l] ?? 0);
  if (vals.length) {
    const avg = vals.reduce((a,b) => a+b, 0) / vals.length;
    if (avg < 2.5) cs.issueWarning(instructorId, instructorName, "instructor", `Class GPA ${avg.toFixed(2)} below 2.5 in ${classCode} — registrar review required`);
    else if (avg > 3.5) cs.issueWarning(instructorId, instructorName, "instructor", `Class GPA ${avg.toFixed(2)} above 3.5 in ${classCode} — registrar review required`);
  }

  // Per-student standing: recompute from full record + auto-honor / auto-warn / auto-terminate
  Object.keys(grades).forEach(sid => {
    const rec = records[sid];
    const cum = rec.reduce((a,r) => a + r.gpa, 0) / rec.length;
    const semGrades = rec.filter(r => r.term === window.COLLEGE_DATA.currentSemester);
    const sem = semGrades.length ? semGrades.reduce((a,r) => a + r.gpa, 0) / semGrades.length : cum;
    const name = (window.COLLEGE_DATA.studentLoads.find(s => s.id === sid) || {}).name || sid;

    // Two F's same course → terminate (spec §6)
    const failsByCourse = {};
    rec.forEach(r => { if (r.letter === "F") failsByCourse[r.classCode] = (failsByCourse[r.classCode]||0) + 1; });
    const repeatedF = Object.values(failsByCourse).some(n => n >= 2);

    if (cum < 2.0 || repeatedF) {
      cs.issueWarning(sid, name, "student", `Auto-terminated — ${repeatedF ? "failed same course twice" : `cum GPA ${cum.toFixed(2)} < 2.0`}`);
      cs.issueWarning(sid, name, "student", `Termination marker (auto)`);
      cs.issueWarning(sid, name, "student", `Termination marker (auto)`);
    } else if (cum >= 2.0 && cum <= 2.25) {
      cs.issueWarning(sid, name, "student", `Cum GPA ${cum.toFixed(2)} — registrar interview required`);
    }
    if (sem >= 3.75 || (rec.length > semGrades.length && cum >= 3.50)) {
      cs.honors.push({ id: "h-" + Date.now() + "-" + sid, target: sid, targetName: name, reason: sem >= 3.75 ? `Sem GPA ${sem.toFixed(2)}` : `Cum GPA ${cum.toFixed(2)}`, date: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}), redeemed: false });
    }
  });
  cs.gradedClasses.add(classCode);
  cs.emit();
};

// Special registration trigger
cs.openSpecialRegistration = (deadline) => {
  cs.specialReg = { open: true, deadline };
  window.__specialReg = cs.specialReg;
  cs.emit();
};
cs.closeSpecialRegistration = () => { cs.specialReg = null; window.__specialReg = null; cs.emit(); };

const useStore = () => {
  const [, setTick] = React.useState(0);
  React.useEffect(() => cs.subscribe(() => setTick(t => t+1)), []);
  return cs;
};

// Counts helper
const warningCount = (targetId) => cs.warnings.filter(w => w.target === targetId && w.active).length;
const honorCount = (targetId) => cs.honors.filter(h => h.target === targetId && !h.redeemed).length;

// One-time: scan bottomClasses and warn instructors whose avg < 2.0 (spec §5)
if (!cs._ratingScanDone) {
  cs._ratingScanDone = true;
  (window.COLLEGE_DATA.bottomClasses || []).forEach(c => {
    if (c.rating < 2.0) {
      const last = c.instructor.split(/\s+/).pop();
      const id = "i-" + last;
      const already = cs.warnings.some(w => w.target === id && w.active && /rating below 2\.0/i.test(w.reason));
      if (!already) cs.issueWarning(id, c.instructor, "instructor", `Class avg rating below 2.0 (${c.code}) — auto-flagged`);
    }
  });
}

// ============= Reusable Modal =============
const Modal = ({ open, onClose, title, eyebrow, width = 560, children }) => {
  if (!open) return null;
  return (
    <div className="cmdk-backdrop" onClick={onClose}>
      <div className="cmdk" style={{ width: `min(${width}px, 92vw)`, maxHeight: "82vh", overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        <div className="head" style={{ padding: "16px 22px" }}>
          <div style={{ flex: 1 }}>
            {eyebrow && <div className="eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</div>}
            <div className="display" style={{ fontSize: 20, lineHeight: 1.2 }}>{title}</div>
          </div>
          <span className="mono muted" style={{ fontSize: 11, cursor: "pointer", padding: "4px 8px" }} onClick={onClose}>ESC ✕</span>
        </div>
        <div style={{ padding: "20px 22px", overflow: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Stars, Avatar, Chip, Eyebrow, Phases, Crest, Placeholder, Modal, useStore, warningCount, honorCount });
