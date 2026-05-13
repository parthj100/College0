// College0 — fake data
window.COLLEGE_DATA = {
  currentSemester: "Spring 2026",
  phases: [
    { num: 1, name: "Class Set-up", dates: "Jan 5 — Jan 18", state: "done" },
    { num: 2, name: "Course Registration", dates: "Jan 19 — Feb 2", state: "done" },
    { num: 3, name: "Class Running", dates: "Feb 3 — Apr 20", state: "active" },
    { num: 4, name: "Grading", dates: "Apr 21 — May 5", state: "upcoming" },
  ],
  counts: {
    students: 47,
    instructors: 12,
    classes: 18,
    applications: 6,
  },
  topClasses: [
    { code: "PHIL-612", title: "Ethics of Machine Reasoning", instructor: "M. Arkwright", rating: 4.9, reviews: 14, enrolled: 12, cap: 14 },
    { code: "LIT-540",  title: "The Long Form Essay",         instructor: "C. Okonkwo",   rating: 4.8, reviews: 11, enrolled: 10, cap: 12 },
    { code: "CS-710",   title: "Distributed Systems Theory",  instructor: "H. Sato",      rating: 4.7, reviews: 9,  enrolled: 14, cap: 14 },
    { code: "HIST-605", title: "Cold War Archives",           instructor: "B. Lindqvist", rating: 4.6, reviews: 8,  enrolled: 9,  cap: 12 },
    { code: "MATH-701", title: "Measure Theory",              instructor: "R. Duval",     rating: 4.5, reviews: 7,  enrolled: 6,  cap: 10 },
  ],
  bottomClasses: [
    { code: "ECON-599", title: "Behavioral Microfoundations", instructor: "P. Lambert", rating: 1.8, reviews: 9 },
    { code: "SOC-508",  title: "Urban Field Methods",         instructor: "T. Moreau",  rating: 2.1, reviews: 7 },
    { code: "ART-621",  title: "Curatorial Practice",         instructor: "N. Devi",    rating: 2.4, reviews: 6 },
  ],
  topStudents: [
    { id: "s-00042", name: "Imogen Halvorsen",  gpa: 3.97, major: "Philosophy",  year: "Y2", honors: 3 },
    { id: "s-00018", name: "Dara Okafor",       gpa: 3.93, major: "Mathematics", year: "Y3", honors: 4 },
    { id: "s-00029", name: "Wren Atsumi",       gpa: 3.88, major: "Literature",  year: "Y2", honors: 2 },
    { id: "s-00051", name: "Milo Vukovic",      gpa: 3.84, major: "CompSci",     year: "Y1", honors: 1 },
    { id: "s-00007", name: "Aisha El-Hashimi",  gpa: 3.81, major: "History",     year: "Y3", honors: 3 },
  ],
  // ===== Warning ledger — first-class records, keyed by target =====
  // target format: "s-NNNNN" for students, "i-Lastname" for instructors
  warnings: [
    { id: "w-001", target: "s-00029", targetName: "Wren Atsumi",      type: "student",    reason: "Review of ECON-599 contained a taboo word",   date: "Mar 4",  active: true },
    { id: "w-002", target: "s-00093", targetName: "Jonas Brautigan",  type: "student",    reason: "Fewer than 2 active courses",                   date: "Feb 5",  active: true },
    { id: "w-003", target: "s-00093", targetName: "Jonas Brautigan",  type: "student",    reason: "Missed 5 of 8 sessions in LIT-540",              date: "Mar 22", active: true },
    { id: "w-004", target: "i-Lambert",  targetName: "P. Lambert",    type: "instructor", reason: "Class avg rating below 2.0 (ECON-599)",          date: "Feb 28", active: true },
    { id: "w-005", target: "i-Lambert",  targetName: "P. Lambert",    type: "instructor", reason: "Grade distribution outside 2.5–3.5 band",        date: "Mar 18", active: true },
    { id: "w-006", target: "i-Moreau",   targetName: "T. Moreau",     type: "instructor", reason: "Course underenrolled — issued at phase 2 → 3",   date: "Feb 3",  active: true },
  ],
  honorRoll: [
    { id: "h-001", target: "s-00029", targetName: "Wren Atsumi",      reason: "Sem GPA 3.92 (Fall '25)",  date: "Dec 18", redeemed: false },
    { id: "h-002", target: "s-00029", targetName: "Wren Atsumi",      reason: "Cum GPA 3.88",             date: "Dec 18", redeemed: false },
    { id: "h-003", target: "s-00042", targetName: "Imogen Halvorsen", reason: "Sem GPA 4.00 (Fall '25)",  date: "Dec 18", redeemed: false },
    { id: "h-004", target: "s-00042", targetName: "Imogen Halvorsen", reason: "Sem GPA 3.94 (Spr '25)",   date: "May 21", redeemed: false },
    { id: "h-005", target: "s-00042", targetName: "Imogen Halvorsen", reason: "Cum GPA 3.97",             date: "Dec 18", redeemed: false },
  ],
  // Graduation applications — student → registrar
  gradApps: [
    // sample existing
  ],
  // Required courses per major — for graduation verification
  requiredCourses: {
    Literature:  ["LIT-501", "LIT-540", "LIT-488", "PHIL-520", "Capstone"],
    Philosophy:  ["PHIL-520", "PHIL-612", "LOGIC-401", "Capstone"],
    Mathematics: ["MATH-701", "MATH-610", "MATH-620", "Capstone"],
    CompSci:     ["CS-710", "CS-702", "CS-650", "Capstone"],
    History:     ["HIST-410", "HIST-605", "HIST-501", "Capstone"],
  },
  // The "current student" viewed in the student dashboard
  me: {
    id: "s-00029",
    name: "Wren Atsumi",
    major: "Literature",
    year: "Y2, Semester 3",
    gpa: 3.88,
    semesterGpa: 3.92,
    honors: 2,
    warnings: 1,
    completedClasses: 5,
    graduationTarget: 8,
    firstLogin: true,
    // courses I've already passed (cannot re-enroll) and previously failed (CAN re-enroll = retake)
    passedCourses: ["LIT-501", "LIT-488", "PHIL-520", "LING-611", "HIST-410"],
    failedCourses: ["MATH-701"],  // failed previously — eligible for retake
  },
  myClasses: [
    { code: "PHIL-612", title: "Ethics of Machine Reasoning", instructor: "M. Arkwright", time: "Mon / Wed  10:00—11:30", room: "Humanities 204", myRating: 5, progress: 0.62 },
    { code: "LIT-540",  title: "The Long Form Essay",         instructor: "C. Okonkwo",   time: "Tue / Thu  13:00—14:30", room: "Humanities 112", myRating: null, progress: 0.58 },
    { code: "HIST-605", title: "Cold War Archives",           instructor: "B. Lindqvist", time: "Fri        09:00—12:00", room: "Sterling 8B",    myRating: 4, progress: 0.60 },
  ],
  // Registration catalog (for the registration flow)
  catalog: [
    { code: "PHIL-612", title: "Ethics of Machine Reasoning", instructor: "M. Arkwright", time: "MW 10:00—11:30", day: [1,3], start: 10, end: 11.5, seats: 2, cap: 14, dept: "Philosophy" },
    { code: "LIT-540",  title: "The Long Form Essay",         instructor: "C. Okonkwo",   time: "TR 13:00—14:30", day: [2,4], start: 13, end: 14.5, seats: 2, cap: 12, dept: "Literature" },
    { code: "CS-710",   title: "Distributed Systems Theory",  instructor: "H. Sato",      time: "MW 13:00—14:30", day: [1,3], start: 13, end: 14.5, seats: 0, cap: 14, dept: "CompSci" },
    { code: "HIST-605", title: "Cold War Archives",           instructor: "B. Lindqvist", time: "F  09:00—12:00", day: [5],   start: 9,  end: 12,   seats: 3, cap: 12, dept: "History" },
    { code: "MATH-701", title: "Measure Theory",              instructor: "R. Duval",     time: "TR 10:00—11:30", day: [2,4], start: 10, end: 11.5, seats: 4, cap: 10, dept: "Math" },
    { code: "ECON-599", title: "Behavioral Microfoundations", instructor: "P. Lambert",   time: "MW 15:00—16:30", day: [1,3], start: 15, end: 16.5, seats: 6, cap: 14, dept: "Economics" },
    { code: "SOC-508",  title: "Urban Field Methods",         instructor: "T. Moreau",    time: "T  09:00—12:00", day: [2],   start: 9,  end: 12,   seats: 5, cap: 12, dept: "Sociology" },
    { code: "ART-621",  title: "Curatorial Practice",         instructor: "N. Devi",      time: "W  13:00—16:00", day: [3],   start: 13, end: 16,   seats: 7, cap: 12, dept: "Art" },
    { code: "CS-702",   title: "Probabilistic Programming",   instructor: "H. Sato",      time: "TR 15:00—16:30", day: [2,4], start: 15, end: 16.5, seats: 1, cap: 12, dept: "CompSci" },
    { code: "LING-611", title: "Computational Semantics",     instructor: "E. Abiola",    time: "F  13:00—16:00", day: [5],   start: 13, end: 16,   seats: 4, cap: 10, dept: "Linguistics" },
  ],
  // Class detail (reviews) for PHIL-612
  classDetail: {
    code: "PHIL-612",
    title: "Ethics of Machine Reasoning",
    instructor: "Dr. Miriam Arkwright",
    instructorBio: "Associate registrar emerita. Nine years at College0. Published in Mind and Ethica.",
    description: "A seminar on the moral status of inferential systems. We read Parfit, Korsgaard, and a suspicious amount of Borges. Weekly 1500-word responses; final paper in lieu of exam.",
    meta: { credits: 3, cap: 14, enrolled: 12, avgRating: 4.9, reviews: 14, room: "Humanities 204", time: "Mon / Wed  10:00—11:30" },
    ratingHistogram: [0, 0, 1, 2, 11], // 1★ -> 5★
    reviews: [
      { id: 1, semester: "Fall 2025", rating: 5, body: "The best seminar I've taken. Arkwright runs discussion like a string quartet — everyone gets a bar." },
      { id: 2, semester: "Fall 2025", rating: 5, body: "Rigorous but humane. Response prompts alone were worth the tuition." },
      { id: 3, semester: "Spring 2025", rating: 4, body: "Heavy reading load. The Parfit week nearly destroyed me. Worth it." },
      { id: 4, semester: "Spring 2025", rating: 5, body: "Best class at College0. Fight me.", tabooCount: 0 },
      { id: 5, semester: "Spring 2025", rating: 3, body: "Good lectures, but the grading was a total [****]. Expected clearer rubrics.", tabooCount: 1 },
    ],
  },
  // Multiple instructor classes (C. Okonkwo teaches 2)
  instructorClasses: [
    {
      code: "LIT-540", title: "The Long Form Essay", semester: "Spring 2026", avgRating: 4.8,
      roster: [
        { id: "s-00029", name: "Wren Atsumi", current: 3.88, submissions: "8 / 8", midterm: 94, grade: null },
        { id: "s-00042", name: "Imogen Halvorsen", current: 3.97, submissions: "8 / 8", midterm: 97, grade: null },
        { id: "s-00018", name: "Dara Okafor", current: 3.93, submissions: "8 / 8", midterm: 91, grade: null },
        { id: "s-00066", name: "Temir Baikov", current: 3.22, submissions: "6 / 8", midterm: 72, grade: null },
        { id: "s-00093", name: "Jonas Brautigan", current: 2.68, submissions: "5 / 8", midterm: 64, grade: null },
      ],
    },
    {
      code: "LIT-488", title: "Modernist Prose Workshop", semester: "Spring 2026", avgRating: 4.4,
      roster: [
        { id: "s-00051", name: "Milo Vukovic", current: 3.84, submissions: "7 / 8", midterm: 88, grade: null },
        { id: "s-00007", name: "Aisha El-Hashimi", current: 3.81, submissions: "8 / 8", midterm: 90, grade: null },
        { id: "s-00081", name: "Noor Haddad", current: 3.55, submissions: "8 / 8", midterm: 85, grade: null },
        { id: "s-00104", name: "Kiri Wynter", current: 3.40, submissions: "8 / 8", midterm: 82, grade: null },
      ],
    },
  ],
  // Instructor roster (for grading view) — legacy single
  instructorClass: {
    code: "LIT-540",
    title: "The Long Form Essay",
    semester: "Spring 2026",
    avgRating: 4.8,
    roster: [
      { id: "s-00029", name: "Wren Atsumi",      current: 3.88, submissions: "8 / 8", midterm: 94, grade: null },
      { id: "s-00042", name: "Imogen Halvorsen", current: 3.97, submissions: "8 / 8", midterm: 97, grade: null },
      { id: "s-00018", name: "Dara Okafor",      current: 3.93, submissions: "8 / 8", midterm: 91, grade: null },
      { id: "s-00051", name: "Milo Vukovic",     current: 3.84, submissions: "7 / 8", midterm: 88, grade: null },
      { id: "s-00007", name: "Aisha El-Hashimi", current: 3.81, submissions: "8 / 8", midterm: 90, grade: null },
      { id: "s-00066", name: "Temir Baikov",     current: 3.22, submissions: "6 / 8", midterm: 72, grade: null },
      { id: "s-00070", name: "Priya Kandasamy",  current: 2.95, submissions: "7 / 8", midterm: 78, grade: null },
      { id: "s-00081", name: "Noor Haddad",      current: 3.55, submissions: "8 / 8", midterm: 85, grade: null },
      { id: "s-00093", name: "Jonas Brautigan",  current: 2.68, submissions: "5 / 8", midterm: 64, grade: null },
      { id: "s-00104", name: "Kiri Wynter",      current: 3.40, submissions: "8 / 8", midterm: 82, grade: null },
    ],
  },
  // AI suggestions
  aiSuggestions: {
    visitor: [
      "What GPA do I need to apply?",
      "How many courses can a student register for?",
      "What's the review / rating policy?",
      "When does course registration open?",
    ],
    student: [
      "Am I on track to graduate?",
      "Can I drop PHIL-612 this week?",
      "Why was my review flagged?",
      "What counts as a taboo word?",
    ],
    instructor: [
      "Who's at risk of failing in LIT-540?",
      "Show students with >2 absences",
      "When is the grading deadline?",
      "Which of my students are on honor roll?",
    ],
  },
  // ===== Per-instructor course assignments (for phase 3 cancellation logic) =====
  classEnrollments: [
    // code -> registered student count (for phase 3)
    { code: "PHIL-612", instructor: "i-Arkwright", instructorName: "M. Arkwright", enrolled: 12, cap: 14 },
    { code: "LIT-540",  instructor: "i-Okonkwo",   instructorName: "C. Okonkwo",   enrolled: 10, cap: 12 },
    { code: "CS-710",   instructor: "i-Sato",      instructorName: "H. Sato",      enrolled: 14, cap: 14 },
    { code: "CS-702",   instructor: "i-Sato",      instructorName: "H. Sato",      enrolled: 11, cap: 12 },
    { code: "HIST-605", instructor: "i-Lindqvist", instructorName: "B. Lindqvist", enrolled:  9, cap: 12 },
    { code: "MATH-701", instructor: "i-Duval",     instructorName: "R. Duval",     enrolled:  6, cap: 10 },
    { code: "ECON-599", instructor: "i-Lambert",   instructorName: "P. Lambert",   enrolled:  4, cap: 14 },
    { code: "SOC-508",  instructor: "i-Moreau",    instructorName: "T. Moreau",    enrolled:  2, cap: 12, willCancel: true },  // <3 ⇒ cancel
    { code: "ART-621",  instructor: "i-Devi",      instructorName: "N. Devi",      enrolled:  1, cap: 12, willCancel: true },  // <3 ⇒ cancel; only course
    { code: "LING-611", instructor: "i-Abiola",    instructorName: "E. Abiola",    enrolled:  6, cap: 10 },
  ],
  // Students' active loads (for under-2 detection and grade simulation in phase 4)
  studentLoads: [
    { id: "s-00029", name: "Wren Atsumi",      major: "Literature",  courses: ["PHIL-612","LIT-540","HIST-605"], semGpa: 3.92, cumGpa: 3.88, prior: "honor" },
    { id: "s-00042", name: "Imogen Halvorsen", major: "Philosophy",  courses: ["PHIL-612","LIT-540","SOC-508"],  semGpa: 4.00, cumGpa: 3.97, prior: "honor" },
    { id: "s-00018", name: "Dara Okafor",      major: "Mathematics", courses: ["MATH-701","CS-710","LIT-540"],   semGpa: 3.94, cumGpa: 3.93, prior: "honor" },
    { id: "s-00051", name: "Milo Vukovic",     major: "CompSci",     courses: ["CS-710","CS-702","HIST-605"],    semGpa: 3.82, cumGpa: 3.84, prior: "honor" },
    { id: "s-00007", name: "Aisha El-Hashimi", major: "History",     courses: ["HIST-605","SOC-508","ART-621"],  semGpa: 3.75, cumGpa: 3.81, prior: "honor" },
    { id: "s-00066", name: "Temir Baikov",     major: "Literature",  courses: ["LIT-540","ECON-599"],            semGpa: 3.05, cumGpa: 3.22, prior: "" },
    { id: "s-00070", name: "Priya Kandasamy",  major: "CompSci",     courses: ["CS-710"],                         semGpa: 2.40, cumGpa: 2.95, prior: "" },     // 1 course → warn
    { id: "s-00081", name: "Noor Haddad",      major: "History",     courses: ["HIST-605","LIT-540"],            semGpa: 3.50, cumGpa: 3.55, prior: "" },
    { id: "s-00093", name: "Jonas Brautigan",  major: "Philosophy",  courses: ["LIT-540","ECON-599"],            semGpa: 1.85, cumGpa: 2.10, prior: "" },     // <2.0 ⇒ terminated, also failed twice possibility
    { id: "s-00104", name: "Kiri Wynter",      major: "Mathematics", courses: ["MATH-701","CS-702","ART-621"],   semGpa: 3.40, cumGpa: 3.40, prior: "" },     // ART-621 will cancel
    { id: "s-00115", name: "Hanan Aziz",       major: "Literature",  courses: ["LIT-540","SOC-508"],             semGpa: 3.62, cumGpa: 3.62, prior: "" },     // SOC-508 cancels
    { id: "s-00121", name: "Rowan Castile",    major: "CompSci",     courses: ["CS-702","SOC-508","ART-621"],    semGpa: 2.20, cumGpa: 2.15, prior: "retake" }, // 2.0–2.25 ⇒ warn+interview
  ],
};
