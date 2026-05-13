// SVG diagram definitions for College0 Design Report

window.DIAGRAMS = {};

/* ─── 1. COLLABORATION CLASS DIAGRAM ─── */
DIAGRAMS.collaboration = `
<svg viewBox="0 0 1100 720" xmlns="http://www.w3.org/2000/svg" font-family="'JetBrains Mono', monospace" font-size="11">
  <defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6 Z" fill="#555"/>
    </marker>
    <marker id="arr-inh" markerWidth="10" markerHeight="10" refX="9" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="none" stroke="#555" stroke-width="1.2"/>
    </marker>
    <marker id="arr-agg" markerWidth="10" markerHeight="10" refX="1" refY="4" orient="auto">
      <path d="M5,0 L9,4 L5,8 L1,4 Z" fill="none" stroke="#555" stroke-width="1"/>
    </marker>
  </defs>

  <!-- Background -->
  <rect width="1100" height="720" fill="#fbf7ee"/>

  <!-- Legend -->
  <rect x="20" y="20" width="180" height="100" rx="2" fill="none" stroke="#ccc" stroke-width="1"/>
  <text x="30" y="38" fill="#888" font-size="9" letter-spacing="1">LEGEND</text>
  <line x1="30" y1="50" x2="60" y2="50" stroke="#555" stroke-width="1.5" marker-end="url(#arr)"/>
  <text x="68" y="54" fill="#444" font-size="10">Association</text>
  <line x1="30" y1="68" x2="60" y2="68" stroke="#555" stroke-width="1.5" stroke-dasharray="4,3"/>
  <text x="68" y="72" fill="#444" font-size="10">Dependency</text>
  <line x1="30" y1="86" x2="60" y2="86" stroke="#555" stroke-width="1.5" marker-end="url(#arr-inh)"/>
  <text x="68" y="90" fill="#444" font-size="10">Inheritance</text>
  <line x1="30" y1="104" x2="60" y2="104" stroke="#555" stroke-width="1.5" marker-end="url(#arr-agg)"/>
  <text x="68" y="108" fill="#444" font-size="10">Aggregation</text>

  <!-- ── CLASS BOXES ── -->
  <!-- User (abstract) -->
  <rect x="450" y="20" width="170" height="80" rx="2" fill="#1a1613" stroke="#1a1613"/>
  <text x="535" y="38" fill="#f2ede2" text-anchor="middle" font-size="11" letter-spacing="1">«abstract»</text>
  <text x="535" y="55" fill="#f2ede2" text-anchor="middle" font-size="13" font-weight="bold">USER</text>
  <line x1="450" y1="62" x2="620" y2="62" stroke="#555" stroke-width="0.5"/>
  <text x="458" y="74" fill="#bbb" font-size="9.5">userID, username, role</text>
  <text x="458" y="86" fill="#bbb" font-size="9.5">passwordHash, isActive</text>

  <!-- Registrar -->
  <rect x="50" y="180" width="150" height="90" rx="2" fill="#fff" stroke="#555" stroke-width="1.5"/>
  <rect x="50" y="180" width="150" height="20" rx="2" fill="#555"/>
  <text x="125" y="194" fill="#fff" text-anchor="middle" font-weight="bold" font-size="11">REGISTRAR</text>
  <line x1="50" y1="200" x2="200" y2="200" stroke="#555" stroke-width="0.5"/>
  <text x="58" y="218" fill="#333" font-size="9.5">registrarID «PK»</text>
  <text x="58" y="232" fill="#333" font-size="9.5">canViewAll: bool</text>
  <text x="58" y="246" fill="#555" font-size="9" font-style="italic">+ processApplication()</text>
  <text x="58" y="259" fill="#555" font-size="9" font-style="italic">+ issueWarning()</text>

  <!-- Instructor -->
  <rect x="430" y="180" width="165" height="110" rx="2" fill="#fff" stroke="#555" stroke-width="1.5"/>
  <rect x="430" y="180" width="165" height="20" rx="2" fill="#555"/>
  <text x="512" y="194" fill="#fff" text-anchor="middle" font-weight="bold" font-size="11">INSTRUCTOR</text>
  <line x1="430" y1="200" x2="595" y2="200" stroke="#555" stroke-width="0.5"/>
  <text x="438" y="218" fill="#333" font-size="9.5">instructorID «PK»</text>
  <text x="438" y="231" fill="#333" font-size="9.5">department: string</text>
  <text x="438" y="244" fill="#333" font-size="9.5">warningCount: int</text>
  <text x="438" y="257" fill="#333" font-size="9.5">isSuspended: bool</text>
  <text x="438" y="270" fill="#555" font-size="9" font-style="italic">+ assignGrade()</text>
  <text x="438" y="281" fill="#555" font-size="9" font-style="italic">+ manageWaitList()</text>

  <!-- Student -->
  <rect x="790" y="180" width="180" height="140" rx="2" fill="#fff" stroke="#555" stroke-width="1.5"/>
  <rect x="790" y="180" width="180" height="20" rx="2" fill="#555"/>
  <text x="880" y="194" fill="#fff" text-anchor="middle" font-weight="bold" font-size="11">STUDENT</text>
  <line x1="790" y1="200" x2="970" y2="200" stroke="#555" stroke-width="0.5"/>
  <text x="798" y="218" fill="#333" font-size="9.5">studentID «PK»</text>
  <text x="798" y="231" fill="#333" font-size="9.5">gpa: decimal</text>
  <text x="798" y="244" fill="#333" font-size="9.5">semesterGpa: decimal</text>
  <text x="798" y="257" fill="#333" font-size="9.5">completedClasses: int</text>
  <text x="798" y="270" fill="#333" font-size="9.5">honorCount: int</text>
  <text x="798" y="283" fill="#333" font-size="9.5">isTerminated: bool</text>
  <text x="798" y="296" fill="#555" font-size="9" font-style="italic">+ registerCourses()</text>
  <text x="798" y="308" fill="#555" font-size="9" font-style="italic">+ writeReview()</text>

  <!-- Visitor -->
  <rect x="220" y="180" width="150" height="80" rx="2" fill="#fff" stroke="#555" stroke-width="1.5"/>
  <rect x="220" y="180" width="150" height="20" rx="2" fill="#555"/>
  <text x="295" y="194" fill="#fff" text-anchor="middle" font-weight="bold" font-size="11">VISITOR</text>
  <line x1="220" y1="200" x2="370" y2="200" stroke="#555" stroke-width="0.5"/>
  <text x="228" y="218" fill="#333" font-size="9.5">sessionID</text>
  <text x="228" y="231" fill="#333" font-size="9.5">ipAddress</text>
  <text x="228" y="248" fill="#555" font-size="9" font-style="italic">+ applyForAdmission()</text>
  <text x="228" y="259" fill="#555" font-size="9" font-style="italic">+ browsePublic()</text>

  <!-- Course -->
  <rect x="210" y="420" width="185" height="130" rx="2" fill="#fff" stroke="#8b2e2e" stroke-width="1.5"/>
  <rect x="210" y="420" width="185" height="20" rx="2" fill="#8b2e2e"/>
  <text x="302" y="434" fill="#fff" text-anchor="middle" font-weight="bold" font-size="11">COURSE</text>
  <line x1="210" y1="440" x2="395" y2="440" stroke="#8b2e2e" stroke-width="0.5"/>
  <text x="218" y="456" fill="#333" font-size="9.5">courseID «PK»</text>
  <text x="218" y="469" fill="#333" font-size="9.5">code, title, credits</text>
  <text x="218" y="482" fill="#333" font-size="9.5">capacity, enrolled</text>
  <text x="218" y="495" fill="#333" font-size="9.5">semesterID «FK»</text>
  <text x="218" y="508" fill="#333" font-size="9.5">instructorID «FK»</text>
  <text x="218" y="521" fill="#333" font-size="9.5">status: enum</text>
  <text x="218" y="540" fill="#555" font-size="9" font-style="italic">+ computeAvgRating()</text>

  <!-- Enrollment -->
  <rect x="560" y="420" width="160" height="100" rx="2" fill="#fff" stroke="#555" stroke-width="1.5"/>
  <rect x="560" y="420" width="160" height="20" rx="2" fill="#555"/>
  <text x="640" y="434" fill="#fff" text-anchor="middle" font-weight="bold" font-size="11">ENROLLMENT</text>
  <line x1="560" y1="440" x2="720" y2="440" stroke="#555" stroke-width="0.5"/>
  <text x="568" y="456" fill="#333" font-size="9.5">enrollmentID «PK»</text>
  <text x="568" y="469" fill="#333" font-size="9.5">studentID «FK»</text>
  <text x="568" y="482" fill="#333" font-size="9.5">courseID «FK»</text>
  <text x="568" y="495" fill="#333" font-size="9.5">status: enum</text>
  <text x="568" y="508" fill="#333" font-size="9.5">registeredAt: date</text>

  <!-- Grade -->
  <rect x="800" y="420" width="155" height="100" rx="2" fill="#fff" stroke="#555" stroke-width="1.5"/>
  <rect x="800" y="420" width="155" height="20" rx="2" fill="#555"/>
  <text x="877" y="434" fill="#fff" text-anchor="middle" font-weight="bold" font-size="11">GRADE</text>
  <line x1="800" y1="440" x2="955" y2="440" stroke="#555" stroke-width="0.5"/>
  <text x="808" y="456" fill="#333" font-size="9.5">gradeID «PK»</text>
  <text x="808" y="469" fill="#333" font-size="9.5">enrollmentID «FK»</text>
  <text x="808" y="482" fill="#333" font-size="9.5">letterGrade: string</text>
  <text x="808" y="495" fill="#333" font-size="9.5">gradePoints: decimal</text>
  <text x="808" y="508" fill="#333" font-size="9.5">postedAt: datetime</text>

  <!-- Review -->
  <rect x="50" y="570" width="160" height="120" rx="2" fill="#fff" stroke="#555" stroke-width="1.5"/>
  <rect x="50" y="570" width="160" height="20" rx="2" fill="#555"/>
  <text x="130" y="584" fill="#fff" text-anchor="middle" font-weight="bold" font-size="11">REVIEW</text>
  <line x1="50" y1="590" x2="210" y2="590" stroke="#555" stroke-width="0.5"/>
  <text x="58" y="606" fill="#333" font-size="9.5">reviewID «PK»</text>
  <text x="58" y="619" fill="#333" font-size="9.5">studentID «FK»</text>
  <text x="58" y="632" fill="#333" font-size="9.5">courseID «FK»</text>
  <text x="58" y="645" fill="#333" font-size="9.5">stars: int (1–5)</text>
  <text x="58" y="658" fill="#333" font-size="9.5">tabooCount, isVisible</text>
  <text x="58" y="672" fill="#333" font-size="9.5">body, filteredBody</text>

  <!-- Warning -->
  <rect x="430" y="600" width="155" height="90" rx="2" fill="#fff" stroke="#a56a00" stroke-width="1.5"/>
  <rect x="430" y="600" width="155" height="20" rx="2" fill="#a56a00"/>
  <text x="507" y="614" fill="#fff" text-anchor="middle" font-weight="bold" font-size="11">WARNING</text>
  <line x1="430" y1="620" x2="585" y2="620" stroke="#a56a00" stroke-width="0.5"/>
  <text x="438" y="636" fill="#333" font-size="9.5">warningID «PK»</text>
  <text x="438" y="649" fill="#333" font-size="9.5">targetID «FK»</text>
  <text x="438" y="662" fill="#333" font-size="9.5">targetType: enum</text>
  <text x="438" y="675" fill="#333" font-size="9.5">reason, isRetired</text>

  <!-- Honor -->
  <rect x="620" y="600" width="155" height="90" rx="2" fill="#fff" stroke="#2f6b3d" stroke-width="1.5"/>
  <rect x="620" y="600" width="155" height="20" rx="2" fill="#2f6b3d"/>
  <text x="697" y="614" fill="#fff" text-anchor="middle" font-weight="bold" font-size="11">HONOR</text>
  <line x1="620" y1="620" x2="775" y2="620" stroke="#2f6b3d" stroke-width="0.5"/>
  <text x="628" y="636" fill="#333" font-size="9.5">honorID «PK»</text>
  <text x="628" y="649" fill="#333" font-size="9.5">studentID «FK»</text>
  <text x="628" y="662" fill="#333" font-size="9.5">type: sem/cumulative</text>
  <text x="628" y="675" fill="#333" font-size="9.5">usedToRetire «FK»?</text>

  <!-- Application -->
  <rect x="800" y="580" width="175" height="120" rx="2" fill="#fff" stroke="#555" stroke-width="1.5"/>
  <rect x="800" y="580" width="175" height="20" rx="2" fill="#555"/>
  <text x="887" y="594" fill="#fff" text-anchor="middle" font-weight="bold" font-size="11">APPLICATION</text>
  <line x1="800" y1="600" x2="975" y2="600" stroke="#555" stroke-width="0.5"/>
  <text x="808" y="616" fill="#333" font-size="9.5">applicationID «PK»</text>
  <text x="808" y="629" fill="#333" font-size="9.5">type: student/instr</text>
  <text x="808" y="642" fill="#333" font-size="9.5">priorGpa, statement</text>
  <text x="808" y="655" fill="#333" font-size="9.5">status: enum</text>
  <text x="808" y="668" fill="#333" font-size="9.5">justification: text</text>
  <text x="808" y="681" fill="#333" font-size="9.5">processedBy «FK»</text>

  <!-- Semester -->
  <rect x="50" y="420" width="145" height="90" rx="2" fill="#fff" stroke="#3b4cca" stroke-width="1.5"/>
  <rect x="50" y="420" width="145" height="20" rx="2" fill="#3b4cca"/>
  <text x="122" y="434" fill="#fff" text-anchor="middle" font-weight="bold" font-size="11">SEMESTER</text>
  <line x1="50" y1="440" x2="195" y2="440" stroke="#3b4cca" stroke-width="0.5"/>
  <text x="58" y="456" fill="#333" font-size="9.5">semesterID «PK»</text>
  <text x="58" y="469" fill="#333" font-size="9.5">name, year</text>
  <text x="58" y="482" fill="#333" font-size="9.5">currentPhase: int</text>
  <text x="58" y="495" fill="#333" font-size="9.5">isActive: bool</text>

  <!-- WaitList -->
  <rect x="380" y="570" width="140" height="80" rx="2" fill="#fff" stroke="#555" stroke-width="1.5"/>
  <rect x="380" y="570" width="140" height="20" rx="2" fill="#555"/>
  <text x="450" y="584" fill="#fff" text-anchor="middle" font-weight="bold" font-size="11">WAITLIST</text>
  <line x1="380" y1="590" x2="520" y2="590" stroke="#555" stroke-width="0.5"/>
  <text x="388" y="606" fill="#333" font-size="9.5">waitlistID «PK»</text>
  <text x="388" y="619" fill="#333" font-size="9.5">studentID, courseID</text>
  <text x="388" y="632" fill="#333" font-size="9.5">position, addedAt</text>

  <!-- ── INHERITANCE ARCS (User → subtypes) ── -->
  <!-- User → Registrar -->
  <line x1="450" y1="60" x2="125" y2="180" stroke="#555" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr-inh)"/>
  <!-- User → Visitor -->
  <line x1="460" y1="65" x2="295" y2="180" stroke="#555" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr-inh)"/>
  <!-- User → Instructor -->
  <line x1="510" y1="100" x2="512" y2="180" stroke="#555" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr-inh)"/>
  <!-- User → Student -->
  <line x1="590" y1="65" x2="880" y2="180" stroke="#555" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr-inh)"/>

  <!-- ── ASSOCIATIONS ── -->
  <!-- Instructor → Course (teaches 1-N) -->
  <line x1="430" y1="260" x2="360" y2="420" stroke="#555" stroke-width="1.2" marker-end="url(#arr)"/>
  <text x="375" y="355" fill="#666" font-size="9">1</text>
  <text x="342" y="415" fill="#666" font-size="9">N</text>
  <text x="398" y="370" fill="#8b2e2e" font-size="9">teaches</text>

  <!-- Student → Enrollment (registers 1-N) -->
  <line x1="850" y1="320" x2="700" y2="420" stroke="#555" stroke-width="1.2" marker-end="url(#arr)"/>
  <text x="795" y="390" fill="#8b2e2e" font-size="9">registers</text>
  <text x="840" y="335" fill="#666" font-size="9">1</text>
  <text x="705" y="418" fill="#666" font-size="9">N</text>

  <!-- Course → Enrollment (has 1-N) -->
  <line x1="395" y1="470" x2="560" y2="470" stroke="#555" stroke-width="1.2" marker-end="url(#arr)"/>
  <text x="440" y="462" fill="#8b2e2e" font-size="9">includes</text>
  <text x="400" y="480" fill="#666" font-size="9">1</text>
  <text x="545" y="480" fill="#666" font-size="9">N</text>

  <!-- Enrollment → Grade (yields 1-1) -->
  <line x1="720" y1="470" x2="800" y2="470" stroke="#555" stroke-width="1.2" marker-end="url(#arr)"/>
  <text x="730" y="462" fill="#8b2e2e" font-size="9">yields</text>
  <text x="725" y="480" fill="#666" font-size="9">1</text>
  <text x="793" y="480" fill="#666" font-size="9">0..1</text>

  <!-- Course → Review (has 1-N) -->
  <line x1="270" y1="550" x2="180" y2="570" stroke="#555" stroke-width="1.2" marker-end="url(#arr)"/>
  <text x="200" y="556" fill="#8b2e2e" font-size="9">has</text>
  <text x="275" y="556" fill="#666" font-size="9">1</text>
  <text x="186" y="568" fill="#666" font-size="9">N</text>

  <!-- Student → Warning (receives 1-N) -->
  <line x1="880" y1="320" x2="507" y2="600" stroke="#a56a00" stroke-width="1.2" stroke-dasharray="3,2" marker-end="url(#arr)"/>

  <!-- Student → Honor (earns 1-N) -->
  <line x1="920" y1="320" x2="697" y2="600" stroke="#2f6b3d" stroke-width="1.2" stroke-dasharray="3,2" marker-end="url(#arr)"/>

  <!-- Course → WaitList -->
  <line x1="320" y1="550" x2="400" y2="570" stroke="#555" stroke-width="1.2" marker-end="url(#arr)"/>
  <text x="330" y="564" fill="#666" font-size="9">waitlists</text>

  <!-- Registrar → Application -->
  <line x1="175" y1="270" x2="850" y2="580" stroke="#555" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#arr)"/>
  <text x="480" y="400" fill="#555" font-size="9">processes</text>

  <!-- Semester → Course -->
  <line x1="150" y1="465" x2="210" y2="465" stroke="#3b4cca" stroke-width="1.2" marker-end="url(#arr)"/>
  <text x="155" y="458" fill="#3b4cca" font-size="9">hosts</text>
</svg>`;

/* ─── PETRI NET 1: Course Registration ─── */
DIAGRAMS.petriRegistration = `
<svg viewBox="0 0 900 480" xmlns="http://www.w3.org/2000/svg" font-family="'JetBrains Mono',monospace" font-size="10.5">
  <defs>
    <marker id="pa" markerWidth="7" markerHeight="7" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <rect width="900" height="480" fill="#fbf7ee"/>

  <!-- Places (circles) -->
  <!-- P1 Authenticated -->
  <circle cx="60" cy="80" r="26" fill="none" stroke="#333" stroke-width="1.5"/>
  <circle cx="60" cy="80" r="6" fill="#8b2e2e"/>
  <text x="60" y="118" text-anchor="middle" fill="#333">P1</text>
  <text x="60" y="130" text-anchor="middle" fill="#555" font-size="9">Authenticated</text>

  <!-- P2 Reg. Period Open -->
  <circle cx="60" cy="230" r="26" fill="none" stroke="#333" stroke-width="1.5"/>
  <circle cx="60" cy="230" r="6" fill="#8b2e2e"/>
  <text x="60" y="268" text-anchor="middle" fill="#333">P2</text>
  <text x="60" y="280" text-anchor="middle" fill="#555" font-size="9">Reg. Period</text>
  <text x="60" y="291" text-anchor="middle" fill="#555" font-size="9">Open</text>

  <!-- T1 Select Course -->
  <rect x="155" y="142" width="80" height="30" rx="0" fill="#333"/>
  <text x="195" y="161" text-anchor="middle" fill="#fff">T1 · Select</text>

  <!-- P3 Course Selected -->
  <circle cx="320" cy="157" r="26" fill="none" stroke="#333" stroke-width="1.5"/>
  <text x="320" y="195" text-anchor="middle" fill="#333">P3</text>
  <text x="320" y="207" text-anchor="middle" fill="#555" font-size="9">Course</text>
  <text x="320" y="218" text-anchor="middle" fill="#555" font-size="9">Selected</text>

  <!-- T2 Check Conflict -->
  <rect x="415" y="120" width="80" height="30" rx="0" fill="#333"/>
  <text x="455" y="139" text-anchor="middle" fill="#fff">T2 · Check</text>
  <text x="455" y="151" text-anchor="middle" fill="#fff" font-size="9">Conflict</text>

  <!-- P4 No Conflict -->
  <circle cx="570" cy="100" r="26" fill="none" stroke="#2f6b3d" stroke-width="1.5"/>
  <text x="570" y="138" text-anchor="middle" fill="#2f6b3d">P4</text>
  <text x="570" y="150" text-anchor="middle" fill="#2f6b3d" font-size="9">No Conflict</text>

  <!-- P_conflict Conflict Detected -->
  <circle cx="570" cy="200" r="26" fill="none" stroke="#8b2e2e" stroke-width="1.5"/>
  <text x="570" y="238" text-anchor="middle" fill="#8b2e2e">P5</text>
  <text x="570" y="250" text-anchor="middle" fill="#8b2e2e" font-size="9">Conflict</text>
  <text x="570" y="261" text-anchor="middle" fill="#8b2e2e" font-size="9">Detected</text>

  <!-- T_reject Reject -->
  <rect x="680" y="185" width="70" height="30" rx="0" fill="#8b2e2e"/>
  <text x="715" y="204" text-anchor="middle" fill="#fff">T3 · Reject</text>

  <!-- P_rejected Rejected -->
  <circle cx="820" cy="200" r="26" fill="none" stroke="#8b2e2e" stroke-width="1.5"/>
  <text x="820" y="238" text-anchor="middle" fill="#8b2e2e">P6</text>
  <text x="820" y="250" text-anchor="middle" fill="#8b2e2e" font-size="9">Rejected</text>
  <text x="820" y="261" text-anchor="middle" fill="#8b2e2e" font-size="9">(notify)</text>

  <!-- T4 Check Capacity -->
  <rect x="650" y="70" width="80" height="30" rx="0" fill="#333"/>
  <text x="690" y="89" text-anchor="middle" fill="#fff">T4 · Check</text>
  <text x="690" y="101" text-anchor="middle" fill="#fff" font-size="9">Capacity</text>

  <!-- P_cap OK -->
  <circle cx="820" cy="60" r="26" fill="none" stroke="#2f6b3d" stroke-width="1.5"/>
  <text x="820" y="98" text-anchor="middle" fill="#2f6b3d">P7</text>
  <text x="820" y="110" text-anchor="middle" fill="#2f6b3d" font-size="9">Capacity</text>
  <text x="820" y="121" text-anchor="middle" fill="#2f6b3d" font-size="9">OK</text>

  <!-- P_full Full -->
  <circle cx="820" cy="360" r="26" fill="none" stroke="#a56a00" stroke-width="1.5"/>
  <text x="820" y="398" text-anchor="middle" fill="#a56a00">P8</text>
  <text x="820" y="410" text-anchor="middle" fill="#a56a00" font-size="9">Course Full</text>

  <!-- T5 Enroll -->
  <rect x="730" y="295" width="70" height="30" rx="0" fill="#2f6b3d"/>
  <text x="765" y="314" text-anchor="middle" fill="#fff">T5 · Enroll</text>

  <!-- T6 Wait-list -->
  <rect x="620" y="345" width="80" height="30" rx="0" fill="#a56a00"/>
  <text x="660" y="364" text-anchor="middle" fill="#fff">T6 · Wait-list</text>

  <!-- P_enrolled Enrolled -->
  <circle cx="820" cy="310" r="26" fill="none" stroke="#2f6b3d" stroke-width="1.5"/>
  <text x="820" y="348" text-anchor="middle" fill="#2f6b3d">P9</text>
  <text x="820" y="360" text-anchor="middle" fill="#2f6b3d" font-size="9">Enrolled</text>

  <!-- P_waitlisted Waitlisted -->
  <circle cx="500" cy="400" r="26" fill="none" stroke="#a56a00" stroke-width="1.5"/>
  <text x="500" y="438" text-anchor="middle" fill="#a56a00">P10</text>
  <text x="500" y="450" text-anchor="middle" fill="#a56a00" font-size="9">Wait-listed</text>

  <!-- ARCS -->
  <line x1="60" y1="106" x2="155" y2="155" stroke="#333" stroke-width="1.2" marker-end="url(#pa)"/>
  <line x1="60" y1="204" x2="155" y2="162" stroke="#333" stroke-width="1.2" marker-end="url(#pa)"/>
  <line x1="235" y1="157" x2="294" y2="157" stroke="#333" stroke-width="1.2" marker-end="url(#pa)"/>
  <line x1="346" y1="157" x2="415" y2="140" stroke="#333" stroke-width="1.2" marker-end="url(#pa)"/>
  <line x1="495" y1="128" x2="544" y2="108" stroke="#333" stroke-width="1.2" marker-end="url(#pa)"/>
  <line x1="495" y1="142" x2="544" y2="190" stroke="#333" stroke-width="1.2" marker-end="url(#pa)"/>
  <line x1="596" y1="200" x2="680" y2="200" stroke="#333" stroke-width="1.2" marker-end="url(#pa)"/>
  <line x1="750" y1="200" x2="794" y2="200" stroke="#333" stroke-width="1.2" marker-end="url(#pa)"/>
  <line x1="596" y1="100" x2="650" y2="86" stroke="#333" stroke-width="1.2" marker-end="url(#pa)"/>
  <line x1="730" y1="80" x2="794" y2="70" stroke="#333" stroke-width="1.2" marker-end="url(#pa)"/>
  <!-- Cap OK → Enroll -->
  <line x1="820" y1="86" x2="820" y2="284" stroke="#2f6b3d" stroke-width="1.2" marker-end="url(#pa)"/>
  <line x1="800" y1="310" x2="730" y2="310" stroke="#333" stroke-width="1.2"/>
  <line x1="730" y1="310" x2="730" y2="308" stroke="#333" stroke-width="1.2" marker-end="url(#pa)"/>
  <line x1="765" y1="325" x2="820" y2="325" stroke="#333" stroke-width="1.2" marker-end="url(#pa)"/>
  <!-- Full → Waitlist -->
  <line x1="820" y1="334" x2="820" y2="360" stroke="#a56a00" stroke-width="1.2" marker-end="url(#pa)"/>
  <line x1="794" y1="360" x2="700" y2="360" stroke="#a56a00" stroke-width="1.2" marker-end="url(#pa)"/>
  <line x1="620" y1="360" x2="526" y2="400" stroke="#a56a00" stroke-width="1.2" marker-end="url(#pa)"/>

  <!-- Title -->
  <text x="450" y="22" text-anchor="middle" fill="#1a1613" font-size="13" letter-spacing="1" font-weight="bold">PETRI NET 1 · COURSE REGISTRATION FLOW</text>
</svg>`;

/* ─── PETRI NET 2: Application & Admissions ─── */
DIAGRAMS.petriAdmissions = `
<svg viewBox="0 0 900 420" xmlns="http://www.w3.org/2000/svg" font-family="'JetBrains Mono',monospace" font-size="10.5">
  <defs>
    <marker id="pa2" markerWidth="7" markerHeight="7" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <rect width="900" height="420" fill="#fbf7ee"/>
  <text x="450" y="22" text-anchor="middle" fill="#1a1613" font-size="13" letter-spacing="1" font-weight="bold">PETRI NET 2 · APPLICATION &amp; ADMISSIONS FLOW</text>

  <!-- P1: Form Ready -->
  <circle cx="60" cy="180" r="26" fill="none" stroke="#333" stroke-width="1.5"/>
  <circle cx="60" cy="180" r="6" fill="#8b2e2e"/>
  <text x="60" y="218" text-anchor="middle" fill="#333">P1</text>
  <text x="60" y="230" text-anchor="middle" fill="#555" font-size="9">Form Ready</text>

  <!-- T1: Submit -->
  <rect x="120" y="165" width="70" height="30" rx="0" fill="#333"/>
  <text x="155" y="184" text-anchor="middle" fill="#fff">T1 · Submit</text>

  <!-- P2: Pending -->
  <circle cx="255" cy="180" r="26" fill="none" stroke="#333" stroke-width="1.5"/>
  <text x="255" y="218" text-anchor="middle" fill="#333">P2</text>
  <text x="255" y="230" text-anchor="middle" fill="#555" font-size="9">Pending</text>

  <!-- T2: Auto-screen -->
  <rect x="315" y="165" width="80" height="30" rx="0" fill="#333"/>
  <text x="355" y="184" text-anchor="middle" fill="#fff">T2 · Auto-screen</text>

  <!-- P3: GPA Pass -->
  <circle cx="460" cy="100" r="26" fill="none" stroke="#2f6b3d" stroke-width="1.5"/>
  <text x="460" y="138" text-anchor="middle" fill="#2f6b3d">P3</text>
  <text x="460" y="150" text-anchor="middle" fill="#2f6b3d" font-size="9">GPA ≥ 3.0</text>
  <text x="460" y="161" text-anchor="middle" fill="#2f6b3d" font-size="9">+ Quota OK</text>

  <!-- P4: GPA Fail -->
  <circle cx="460" cy="260" r="26" fill="none" stroke="#a56a00" stroke-width="1.5"/>
  <text x="460" y="298" text-anchor="middle" fill="#a56a00">P4</text>
  <text x="460" y="310" text-anchor="middle" fill="#a56a00" font-size="9">Below 3.0</text>
  <text x="460" y="321" text-anchor="middle" fill="#a56a00" font-size="9">or Quota Full</text>

  <!-- T3: Auto-accept -->
  <rect x="535" y="70" width="80" height="30" rx="0" fill="#2f6b3d"/>
  <text x="575" y="89" text-anchor="middle" fill="#fff">T3 · Auto-accept</text>

  <!-- T4: Registrar decides -->
  <rect x="535" y="240" width="80" height="30" rx="0" fill="#555"/>
  <text x="575" y="259" text-anchor="middle" fill="#fff">T4 · Registrar</text>
  <text x="575" y="271" text-anchor="middle" fill="#fff" font-size="9">decides</text>

  <!-- P5: Accepted -->
  <circle cx="690" cy="100" r="26" fill="none" stroke="#2f6b3d" stroke-width="1.5"/>
  <text x="690" y="138" text-anchor="middle" fill="#2f6b3d">P5</text>
  <text x="690" y="150" text-anchor="middle" fill="#2f6b3d" font-size="9">Accepted</text>

  <!-- P6: Accepted (manual) -->
  <circle cx="690" cy="200" r="26" fill="none" stroke="#2f6b3d" stroke-width="1.5"/>
  <text x="690" y="238" text-anchor="middle" fill="#2f6b3d">P6</text>
  <text x="690" y="250" text-anchor="middle" fill="#2f6b3d" font-size="9">Accepted</text>
  <text x="690" y="261" text-anchor="middle" fill="#2f6b3d" font-size="9">(manual)</text>

  <!-- P7: Rejected (needs justification) -->
  <circle cx="690" cy="310" r="26" fill="none" stroke="#8b2e2e" stroke-width="1.5"/>
  <text x="690" y="348" text-anchor="middle" fill="#8b2e2e">P7</text>
  <text x="690" y="360" text-anchor="middle" fill="#8b2e2e" font-size="9">Rejected</text>
  <text x="690" y="371" text-anchor="middle" fill="#8b2e2e" font-size="9">+justify reqd</text>

  <!-- T5: Create account -->
  <rect x="775" y="130" width="80" height="30" rx="0" fill="#2f6b3d"/>
  <text x="815" y="149" text-anchor="middle" fill="#fff">T5 · Create</text>
  <text x="815" y="161" text-anchor="middle" fill="#fff" font-size="9">account</text>

  <!-- P8: Credentials sent -->
  <circle cx="835" cy="80" r="26" fill="none" stroke="#333" stroke-width="1.5"/>
  <text x="835" y="118" text-anchor="middle" fill="#333">P8</text>
  <text x="835" y="130" text-anchor="middle" fill="#555" font-size="9">Creds Sent</text>
  <text x="835" y="141" text-anchor="middle" fill="#555" font-size="9">(first login)</text>

  <!-- ARCS -->
  <line x1="86" y1="180" x2="120" y2="180" stroke="#333" stroke-width="1.2" marker-end="url(#pa2)"/>
  <line x1="190" y1="180" x2="255" y2="180" stroke="#333" stroke-width="1.2" marker-end="url(#pa2)"/>
  <line x1="281" y1="180" x2="315" y2="180" stroke="#333" stroke-width="1.2" marker-end="url(#pa2)"/>
  <line x1="395" y1="173" x2="434" y2="114" stroke="#2f6b3d" stroke-width="1.2" marker-end="url(#pa2)"/>
  <line x1="395" y1="190" x2="434" y2="248" stroke="#a56a00" stroke-width="1.2" marker-end="url(#pa2)"/>
  <line x1="486" y1="100" x2="535" y2="90" stroke="#2f6b3d" stroke-width="1.2" marker-end="url(#pa2)"/>
  <line x1="615" y1="85" x2="664" y2="100" stroke="#2f6b3d" stroke-width="1.2" marker-end="url(#pa2)"/>
  <line x1="486" y1="260" x2="535" y2="255" stroke="#555" stroke-width="1.2" marker-end="url(#pa2)"/>
  <line x1="615" y1="245" x2="664" y2="215" stroke="#2f6b3d" stroke-width="1.2" marker-end="url(#pa2)"/>
  <line x1="615" y1="265" x2="664" y2="300" stroke="#8b2e2e" stroke-width="1.2" marker-end="url(#pa2)"/>
  <line x1="716" y1="100" x2="775" y2="138" stroke="#2f6b3d" stroke-width="1.2" marker-end="url(#pa2)"/>
  <line x1="716" y1="200" x2="775" y2="152" stroke="#2f6b3d" stroke-width="1.2" marker-end="url(#pa2)"/>
  <line x1="815" y1="130" x2="825" y2="106" stroke="#2f6b3d" stroke-width="1.2" marker-end="url(#pa2)"/>
</svg>`;

/* ─── PETRI NET 3: Grading Period & Consequences ─── */
DIAGRAMS.petriGrading = `
<svg viewBox="0 0 980 500" xmlns="http://www.w3.org/2000/svg" font-family="'JetBrains Mono',monospace" font-size="10.5">
  <defs>
    <marker id="pa3" markerWidth="7" markerHeight="7" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <rect width="980" height="500" fill="#fbf7ee"/>
  <text x="490" y="22" text-anchor="middle" fill="#1a1613" font-size="13" letter-spacing="1" font-weight="bold">PETRI NET 3 · GRADING PERIOD &amp; CONSEQUENCES</text>

  <!-- P1: Grading Period Open -->
  <circle cx="60" cy="180" r="26" fill="none" stroke="#333" stroke-width="1.5"/>
  <circle cx="60" cy="180" r="6" fill="#8b2e2e"/>
  <text x="60" y="218" text-anchor="middle" fill="#333">P1</text>
  <text x="60" y="230" text-anchor="middle" fill="#555" font-size="9">Grading</text>
  <text x="60" y="241" text-anchor="middle" fill="#555" font-size="9">Period Open</text>

  <!-- T1: Assign Grade -->
  <rect x="120" y="165" width="80" height="30" rx="0" fill="#333"/>
  <text x="160" y="184" text-anchor="middle" fill="#fff">T1 · Assign</text>
  <text x="160" y="196" text-anchor="middle" fill="#fff" font-size="9">Grade</text>

  <!-- P2: Grade Assigned -->
  <circle cx="270" cy="180" r="26" fill="none" stroke="#333" stroke-width="1.5"/>
  <text x="270" y="218" text-anchor="middle" fill="#333">P2</text>
  <text x="270" y="230" text-anchor="middle" fill="#555" font-size="9">Grade</text>
  <text x="270" y="241" text-anchor="middle" fill="#555" font-size="9">Assigned</text>

  <!-- T2: All graded? -->
  <rect x="330" y="165" width="80" height="30" rx="0" fill="#333"/>
  <text x="370" y="184" text-anchor="middle" fill="#fff">T2 · All</text>
  <text x="370" y="196" text-anchor="middle" fill="#fff" font-size="9">graded?</text>

  <!-- P3: GPA computed -->
  <circle cx="480" cy="180" r="26" fill="none" stroke="#333" stroke-width="1.5"/>
  <text x="480" y="218" text-anchor="middle" fill="#333">P3</text>
  <text x="480" y="230" text-anchor="middle" fill="#555" font-size="9">GPA</text>
  <text x="480" y="241" text-anchor="middle" fill="#555" font-size="9">Computed</text>

  <!-- T3: Check class band -->
  <rect x="545" y="100" width="80" height="30" rx="0" fill="#555"/>
  <text x="585" y="119" text-anchor="middle" fill="#fff">T3 · Check</text>
  <text x="585" y="131" text-anchor="middle" fill="#fff" font-size="9">class GPA band</text>

  <!-- P4: In band -->
  <circle cx="700" cy="80" r="26" fill="none" stroke="#2f6b3d" stroke-width="1.5"/>
  <text x="700" y="118" text-anchor="middle" fill="#2f6b3d">P4</text>
  <text x="700" y="130" text-anchor="middle" fill="#2f6b3d" font-size="9">In Band</text>
  <text x="700" y="141" text-anchor="middle" fill="#2f6b3d" font-size="9">(2.5–3.5)</text>

  <!-- P5: Out of band -->
  <circle cx="700" cy="180" r="26" fill="none" stroke="#a56a00" stroke-width="1.5"/>
  <text x="700" y="218" text-anchor="middle" fill="#a56a00">P5</text>
  <text x="700" y="230" text-anchor="middle" fill="#a56a00" font-size="9">Out of Band</text>

  <!-- T4: Question instructor -->
  <rect x="780" y="165" width="80" height="30" rx="0" fill="#a56a00"/>
  <text x="820" y="184" text-anchor="middle" fill="#fff">T4 · Question</text>
  <text x="820" y="196" text-anchor="middle" fill="#fff" font-size="9">instructor</text>

  <!-- P6: Justified -->
  <circle cx="920" cy="140" r="26" fill="none" stroke="#2f6b3d" stroke-width="1.5"/>
  <text x="920" y="178" text-anchor="middle" fill="#2f6b3d">P6</text>
  <text x="920" y="190" text-anchor="middle" fill="#2f6b3d" font-size="9">Justified</text>
  <text x="920" y="201" text-anchor="middle" fill="#2f6b3d" font-size="9">(no action)</text>

  <!-- P7: Not justified → warn/fire -->
  <circle cx="920" cy="230" r="26" fill="none" stroke="#8b2e2e" stroke-width="1.5"/>
  <text x="920" y="268" text-anchor="middle" fill="#8b2e2e">P7</text>
  <text x="920" y="280" text-anchor="middle" fill="#8b2e2e" font-size="9">Warn/Fire</text>
  <text x="920" y="291" text-anchor="middle" fill="#8b2e2e" font-size="9">instructor</text>

  <!-- ── Student path ── -->
  <!-- T5: Check student standing -->
  <rect x="545" y="260" width="80" height="30" rx="0" fill="#555"/>
  <text x="585" y="279" text-anchor="middle" fill="#fff">T5 · Check</text>
  <text x="585" y="291" text-anchor="middle" fill="#fff" font-size="9">student standing</text>

  <!-- P8: GPA < 2.0 or 2× fail -->
  <circle cx="700" cy="320" r="26" fill="none" stroke="#8b2e2e" stroke-width="1.5"/>
  <text x="700" y="358" text-anchor="middle" fill="#8b2e2e">P8</text>
  <text x="700" y="370" text-anchor="middle" fill="#8b2e2e" font-size="9">GPA &lt; 2.0</text>
  <text x="700" y="381" text-anchor="middle" fill="#8b2e2e" font-size="9">or 2× fail</text>

  <!-- P9: GPA 2.0–2.25 -->
  <circle cx="700" cy="440" r="26" fill="none" stroke="#a56a00" stroke-width="1.5"/>
  <text x="700" y="478" text-anchor="middle" fill="#a56a00">P9</text>
  <text x="700" y="490" text-anchor="middle" fill="#a56a00" font-size="9">GPA 2.0–2.25</text>

  <!-- T6: Terminate -->
  <rect x="780" y="305" width="80" height="30" rx="0" fill="#8b2e2e"/>
  <text x="820" y="324" text-anchor="middle" fill="#fff">T6 · Terminate</text>
  <text x="820" y="336" text-anchor="middle" fill="#fff" font-size="9">student</text>

  <!-- T7: Warn + interview -->
  <rect x="780" y="425" width="80" height="30" rx="0" fill="#a56a00"/>
  <text x="820" y="444" text-anchor="middle" fill="#fff">T7 · Warn +</text>
  <text x="820" y="456" text-anchor="middle" fill="#fff" font-size="9">Interview req.</text>

  <!-- Honor check: GPA ≥ 3.75 -->
  <circle cx="480" cy="380" r="26" fill="none" stroke="#2f6b3d" stroke-width="1.5"/>
  <text x="480" y="418" text-anchor="middle" fill="#2f6b3d">P10</text>
  <text x="480" y="430" text-anchor="middle" fill="#2f6b3d" font-size="9">GPA ≥ 3.75</text>
  <text x="480" y="441" text-anchor="middle" fill="#2f6b3d" font-size="9">Honor roll</text>

  <!-- Deadline missed -->
  <circle cx="270" cy="380" r="26" fill="none" stroke="#8b2e2e" stroke-width="1.5"/>
  <text x="270" y="418" text-anchor="middle" fill="#8b2e2e">P11</text>
  <text x="270" y="430" text-anchor="middle" fill="#8b2e2e" font-size="9">Deadline</text>
  <text x="270" y="441" text-anchor="middle" fill="#8b2e2e" font-size="9">Missed</text>

  <!-- ARCS -->
  <line x1="86" y1="180" x2="120" y2="180" stroke="#333" stroke-width="1.2" marker-end="url(#pa3)"/>
  <line x1="200" y1="180" x2="244" y2="180" stroke="#333" stroke-width="1.2" marker-end="url(#pa3)"/>
  <line x1="296" y1="180" x2="330" y2="180" stroke="#333" stroke-width="1.2" marker-end="url(#pa3)"/>
  <line x1="410" y1="180" x2="454" y2="180" stroke="#333" stroke-width="1.2" marker-end="url(#pa3)"/>
  <!-- GPA → class band check -->
  <line x1="506" y1="167" x2="545" y2="118" stroke="#555" stroke-width="1.2" marker-end="url(#pa3)"/>
  <line x1="625" y1="112" x2="674" y2="96" stroke="#2f6b3d" stroke-width="1.2" marker-end="url(#pa3)"/>
  <line x1="625" y1="120" x2="674" y2="172" stroke="#a56a00" stroke-width="1.2" marker-end="url(#pa3)"/>
  <line x1="726" y1="180" x2="780" y2="180" stroke="#a56a00" stroke-width="1.2" marker-end="url(#pa3)"/>
  <line x1="860" y1="170" x2="900" y2="152" stroke="#2f6b3d" stroke-width="1.2" marker-end="url(#pa3)"/>
  <line x1="860" y1="190" x2="900" y2="222" stroke="#8b2e2e" stroke-width="1.2" marker-end="url(#pa3)"/>
  <!-- GPA → student check -->
  <line x1="506" y1="195" x2="545" y2="268" stroke="#555" stroke-width="1.2" marker-end="url(#pa3)"/>
  <line x1="625" y1="278" x2="674" y2="312" stroke="#8b2e2e" stroke-width="1.2" marker-end="url(#pa3)"/>
  <line x1="625" y1="290" x2="674" y2="432" stroke="#a56a00" stroke-width="1.2" marker-end="url(#pa3)"/>
  <line x1="726" y1="320" x2="780" y2="320" stroke="#8b2e2e" stroke-width="1.2" marker-end="url(#pa3)"/>
  <line x1="726" y1="440" x2="780" y2="440" stroke="#a56a00" stroke-width="1.2" marker-end="url(#pa3)"/>
  <!-- Honor -->
  <line x1="506" y1="200" x2="480" y2="354" stroke="#2f6b3d" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#pa3)"/>
  <!-- Deadline -->
  <line x1="410" y1="195" x2="270" y2="354" stroke="#8b2e2e" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#pa3)"/>
</svg>`;
