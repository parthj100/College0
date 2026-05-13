// ER Diagram SVG

window.DIAGRAMS = window.DIAGRAMS || {};

DIAGRAMS.er = `
<svg viewBox="0 0 1300 900" xmlns="http://www.w3.org/2000/svg" font-family="'JetBrains Mono',monospace" font-size="10">
  <defs>
    <marker id="er-arr" markerWidth="7" markerHeight="7" refX="7" refY="3.5" orient="auto">
      <path d="M0,0 L7,3.5 L0,7" fill="none" stroke="#555" stroke-width="1"/>
    </marker>
    <marker id="er-many" markerWidth="10" markerHeight="10" refX="2" refY="5" orient="auto">
      <path d="M9,0 L1,5 L9,10 M3,0 L3,10" fill="none" stroke="#555" stroke-width="1"/>
    </marker>
    <marker id="er-one" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
      <path d="M8,0 L8,10 M5,0 L5,10" fill="none" stroke="#555" stroke-width="1"/>
    </marker>
  </defs>
  <rect width="1300" height="900" fill="#fbf7ee"/>
  <text x="650" y="24" text-anchor="middle" fill="#1a1613" font-size="14" letter-spacing="1" font-weight="bold">COLLEGE0 · ENTITY-RELATIONSHIP DIAGRAM</text>

  <!-- ══ ENTITIES ══ -->

  <!-- USER (supertype) -->
  <rect x="530" y="45" width="200" height="130" rx="2" fill="#1a1613" stroke="#1a1613"/>
  <text x="630" y="64" text-anchor="middle" fill="#ccc" font-size="9" letter-spacing="1">«supertype»</text>
  <text x="630" y="80" text-anchor="middle" fill="#fff" font-weight="bold" font-size="12">USER</text>
  <line x1="530" y1="86" x2="730" y2="86" stroke="#555" stroke-width="0.5"/>
  <text x="538" y="100" fill="#d9a441" font-size="9.5">userID</text><text x="630" y="100" fill="#aaa" font-size="9">PK · UUID</text>
  <text x="538" y="113" fill="#aaa" font-size="9.5">username, email</text>
  <text x="538" y="126" fill="#aaa" font-size="9.5">passwordHash</text>
  <text x="538" y="139" fill="#aaa" font-size="9.5">role: ENUM(student,instr,reg,visitor)</text>
  <text x="538" y="152" fill="#aaa" font-size="9.5">isActive: BOOL</text>
  <text x="538" y="165" fill="#aaa" font-size="9.5">warningCount: INT DEFAULT 0</text>

  <!-- STUDENT -->
  <rect x="40" y="230" width="210" height="155" rx="2" fill="#fff" stroke="#555" stroke-width="1.5"/>
  <rect x="40" y="230" width="210" height="22" rx="2" fill="#555"/>
  <text x="145" y="246" text-anchor="middle" fill="#fff" font-weight="bold" font-size="11">STUDENT</text>
  <line x1="40" y1="252" x2="250" y2="252" stroke="#555" stroke-width="0.5"/>
  <text x="48" y="267" fill="#d9a441" font-size="9.5">studentID</text><text x="120" y="267" fill="#888" font-size="9">PK · FK → USER</text>
  <text x="48" y="280" fill="#333" font-size="9.5">gpa: DECIMAL(3,2)</text>
  <text x="48" y="293" fill="#333" font-size="9.5">semesterGpa: DECIMAL(3,2)</text>
  <text x="48" y="306" fill="#333" font-size="9.5">completedClasses: INT</text>
  <text x="48" y="319" fill="#333" font-size="9.5">honorCount: INT DEFAULT 0</text>
  <text x="48" y="332" fill="#333" font-size="9.5">major: VARCHAR(80)</text>
  <text x="48" y="345" fill="#333" font-size="9.5">year: ENUM(Y1..Y4)</text>
  <text x="48" y="358" fill="#333" font-size="9.5">isTerminated: BOOL</text>
  <text x="48" y="371" fill="#333" font-size="9.5">suspendedUntil: DATE NULL</text>

  <!-- INSTRUCTOR -->
  <rect x="300" y="230" width="200" height="120" rx="2" fill="#fff" stroke="#555" stroke-width="1.5"/>
  <rect x="300" y="230" width="200" height="22" rx="2" fill="#555"/>
  <text x="400" y="246" text-anchor="middle" fill="#fff" font-weight="bold" font-size="11">INSTRUCTOR</text>
  <line x1="300" y1="252" x2="500" y2="252" stroke="#555" stroke-width="0.5"/>
  <text x="308" y="267" fill="#d9a441" font-size="9.5">instructorID</text><text x="390" y="267" fill="#888" font-size="9">PK · FK → USER</text>
  <text x="308" y="280" fill="#333" font-size="9.5">department: VARCHAR(60)</text>
  <text x="308" y="293" fill="#333" font-size="9.5">isSuspended: BOOL</text>
  <text x="308" y="306" fill="#333" font-size="9.5">warningCount: INT</text>
  <text x="308" y="319" fill="#333" font-size="9.5">nextSemesterBanned: BOOL</text>
  <text x="308" y="332" fill="#333" font-size="9.5">bio: TEXT</text>

  <!-- REGISTRAR -->
  <rect x="760" y="230" width="190" height="80" rx="2" fill="#fff" stroke="#555" stroke-width="1.5"/>
  <rect x="760" y="230" width="190" height="22" rx="2" fill="#555"/>
  <text x="855" y="246" text-anchor="middle" fill="#fff" font-weight="bold" font-size="11">REGISTRAR</text>
  <line x1="760" y1="252" x2="950" y2="252" stroke="#555" stroke-width="0.5"/>
  <text x="768" y="267" fill="#d9a441" font-size="9.5">registrarID</text><text x="840" y="267" fill="#888" font-size="9">PK · FK → USER</text>
  <text x="768" y="280" fill="#333" font-size="9.5">canViewAll: BOOL DEFAULT TRUE</text>

  <!-- COURSE -->
  <rect x="530" y="280" width="210" height="165" rx="2" fill="#fff" stroke="#8b2e2e" stroke-width="1.5"/>
  <rect x="530" y="280" width="210" height="22" rx="2" fill="#8b2e2e"/>
  <text x="635" y="296" text-anchor="middle" fill="#fff" font-weight="bold" font-size="11">COURSE</text>
  <line x1="530" y1="302" x2="740" y2="302" stroke="#8b2e2e" stroke-width="0.5"/>
  <text x="538" y="317" fill="#d9a441" font-size="9.5">courseID</text><text x="596" y="317" fill="#888" font-size="9">PK · UUID</text>
  <text x="538" y="330" fill="#333" font-size="9.5">code: VARCHAR(12)</text>
  <text x="538" y="343" fill="#333" font-size="9.5">title: VARCHAR(120)</text>
  <text x="538" y="356" fill="#333" font-size="9.5">credits: INT</text>
  <text x="538" y="369" fill="#333" font-size="9.5">capacity: INT</text>
  <text x="538" y="382" fill="#333" font-size="9.5">enrolled: INT DEFAULT 0</text>
  <text x="538" y="395" fill="#d9a441" font-size="9.5">semesterID</text><text x="608" y="395" fill="#888" font-size="9">FK → SEMESTER</text>
  <text x="538" y="408" fill="#d9a441" font-size="9.5">instructorID</text><text x="614" y="408" fill="#888" font-size="9">FK → INSTRUCTOR</text>
  <text x="538" y="421" fill="#333" font-size="9.5">status: ENUM(active,cancelled)</text>
  <text x="538" y="434" fill="#333" font-size="9.5">avgRating: DECIMAL(2,1)</text>

  <!-- ENROLLMENT -->
  <rect x="290" y="490" width="195" height="115" rx="2" fill="#fff" stroke="#555" stroke-width="1.5"/>
  <rect x="290" y="490" width="195" height="22" rx="2" fill="#555"/>
  <text x="387" y="506" text-anchor="middle" fill="#fff" font-weight="bold" font-size="11">ENROLLMENT</text>
  <line x1="290" y1="512" x2="485" y2="512" stroke="#555" stroke-width="0.5"/>
  <text x="298" y="527" fill="#d9a441" font-size="9.5">enrollmentID</text><text x="382" y="527" fill="#888" font-size="9">PK · UUID</text>
  <text x="298" y="540" fill="#d9a441" font-size="9.5">studentID</text><text x="358" y="540" fill="#888" font-size="9">FK → STUDENT</text>
  <text x="298" y="553" fill="#d9a441" font-size="9.5">courseID</text><text x="354" y="553" fill="#888" font-size="9">FK → COURSE</text>
  <text x="298" y="566" fill="#333" font-size="9.5">status: ENUM(enrolled,waitlist,dropped)</text>
  <text x="298" y="579" fill="#333" font-size="9.5">registeredAt: TIMESTAMP</text>
  <text x="298" y="592" fill="#333" font-size="9.5">isRetake: BOOL DEFAULT FALSE</text>

  <!-- GRADE -->
  <rect x="530" y="490" width="195" height="115" rx="2" fill="#fff" stroke="#555" stroke-width="1.5"/>
  <rect x="530" y="490" width="195" height="22" rx="2" fill="#555"/>
  <text x="627" y="506" text-anchor="middle" fill="#fff" font-weight="bold" font-size="11">GRADE</text>
  <line x1="530" y1="512" x2="725" y2="512" stroke="#555" stroke-width="0.5"/>
  <text x="538" y="527" fill="#d9a441" font-size="9.5">gradeID</text><text x="590" y="527" fill="#888" font-size="9">PK · UUID</text>
  <text x="538" y="540" fill="#d9a441" font-size="9.5">enrollmentID</text><text x="622" y="540" fill="#888" font-size="9">FK → ENROLLMENT</text>
  <text x="538" y="553" fill="#333" font-size="9.5">letterGrade: CHAR(2)</text>
  <text x="538" y="566" fill="#333" font-size="9.5">gradePoints: DECIMAL(3,2)</text>
  <text x="538" y="579" fill="#d9a441" font-size="9.5">postedBy</text><text x="596" y="579" fill="#888" font-size="9">FK → INSTRUCTOR</text>
  <text x="538" y="592" fill="#333" font-size="9.5">postedAt: TIMESTAMP</text>

  <!-- REVIEW -->
  <rect x="40" y="470" width="210" height="145" rx="2" fill="#fff" stroke="#555" stroke-width="1.5"/>
  <rect x="40" y="470" width="210" height="22" rx="2" fill="#555"/>
  <text x="145" y="486" text-anchor="middle" fill="#fff" font-weight="bold" font-size="11">REVIEW</text>
  <line x1="40" y1="492" x2="250" y2="492" stroke="#555" stroke-width="0.5"/>
  <text x="48" y="507" fill="#d9a441" font-size="9.5">reviewID</text><text x="104" y="507" fill="#888" font-size="9">PK</text>
  <text x="48" y="520" fill="#d9a441" font-size="9.5">studentID</text><text x="108" y="520" fill="#888" font-size="9">FK → STUDENT</text>
  <text x="48" y="533" fill="#d9a441" font-size="9.5">courseID</text><text x="104" y="533" fill="#888" font-size="9">FK → COURSE</text>
  <text x="48" y="546" fill="#333" font-size="9.5">stars: INT CHECK(1..5)</text>
  <text x="48" y="559" fill="#333" font-size="9.5">body: TEXT</text>
  <text x="48" y="572" fill="#333" font-size="9.5">filteredBody: TEXT</text>
  <text x="48" y="585" fill="#333" font-size="9.5">tabooCount: INT</text>
  <text x="48" y="598" fill="#333" font-size="9.5">isVisible: BOOL DEFAULT TRUE</text>
  <text x="48" y="611" fill="#333" font-size="9.5">createdAt: TIMESTAMP</text>

  <!-- WARNING -->
  <rect x="40" y="660" width="200" height="120" rx="2" fill="#fff" stroke="#a56a00" stroke-width="1.5"/>
  <rect x="40" y="660" width="200" height="22" rx="2" fill="#a56a00"/>
  <text x="140" y="676" text-anchor="middle" fill="#fff" font-weight="bold" font-size="11">WARNING</text>
  <line x1="40" y1="682" x2="240" y2="682" stroke="#a56a00" stroke-width="0.5"/>
  <text x="48" y="697" fill="#d9a441" font-size="9.5">warningID</text><text x="114" y="697" fill="#888" font-size="9">PK</text>
  <text x="48" y="710" fill="#d9a441" font-size="9.5">targetID</text><text x="100" y="710" fill="#888" font-size="9">FK (student or instr)</text>
  <text x="48" y="723" fill="#333" font-size="9.5">targetType: ENUM</text>
  <text x="48" y="736" fill="#333" font-size="9.5">reason: TEXT</text>
  <text x="48" y="749" fill="#d9a441" font-size="9.5">issuedBy</text><text x="106" y="749" fill="#888" font-size="9">FK → REGISTRAR</text>
  <text x="48" y="762" fill="#333" font-size="9.5">isRetired: BOOL DEFAULT FALSE</text>
  <text x="48" y="775" fill="#d9a441" font-size="9.5">retiredByHonor</text><text x="148" y="775" fill="#888" font-size="9">FK NULL</text>

  <!-- HONOR -->
  <rect x="290" y="660" width="195" height="110" rx="2" fill="#fff" stroke="#2f6b3d" stroke-width="1.5"/>
  <rect x="290" y="660" width="195" height="22" rx="2" fill="#2f6b3d"/>
  <text x="387" y="676" text-anchor="middle" fill="#fff" font-weight="bold" font-size="11">HONOR</text>
  <line x1="290" y1="682" x2="485" y2="682" stroke="#2f6b3d" stroke-width="0.5"/>
  <text x="298" y="697" fill="#d9a441" font-size="9.5">honorID</text><text x="348" y="697" fill="#888" font-size="9">PK</text>
  <text x="298" y="710" fill="#d9a441" font-size="9.5">studentID</text><text x="358" y="710" fill="#888" font-size="9">FK → STUDENT</text>
  <text x="298" y="723" fill="#333" font-size="9.5">type: ENUM(semester,cumulative)</text>
  <text x="298" y="736" fill="#d9a441" font-size="9.5">semesterID</text><text x="368" y="736" fill="#888" font-size="9">FK → SEMESTER</text>
  <text x="298" y="749" fill="#d9a441" font-size="9.5">usedToRetire</text><text x="388" y="749" fill="#888" font-size="9">FK → WARNING NULL</text>
  <text x="298" y="762" fill="#333" font-size="9.5">awardedAt: TIMESTAMP</text>

  <!-- COMPLAINT -->
  <rect x="530" y="650" width="200" height="130" rx="2" fill="#fff" stroke="#555" stroke-width="1.5"/>
  <rect x="530" y="650" width="200" height="22" rx="2" fill="#555"/>
  <text x="630" y="666" text-anchor="middle" fill="#fff" font-weight="bold" font-size="11">COMPLAINT</text>
  <line x1="530" y1="672" x2="730" y2="672" stroke="#555" stroke-width="0.5"/>
  <text x="538" y="687" fill="#d9a441" font-size="9.5">complaintID</text><text x="612" y="687" fill="#888" font-size="9">PK</text>
  <text x="538" y="700" fill="#d9a441" font-size="9.5">fromID</text><text x="578" y="700" fill="#888" font-size="9">FK → USER</text>
  <text x="538" y="713" fill="#333" font-size="9.5">fromType: ENUM(student,instr)</text>
  <text x="538" y="726" fill="#d9a441" font-size="9.5">targetID</text><text x="588" y="726" fill="#888" font-size="9">FK → USER</text>
  <text x="538" y="739" fill="#333" font-size="9.5">description: TEXT</text>
  <text x="538" y="752" fill="#333" font-size="9.5">status: ENUM(pending,resolved)</text>
  <text x="538" y="765" fill="#d9a441" font-size="9.5">resolvedBy</text><text x="604" y="765" fill="#888" font-size="9">FK → REGISTRAR</text>
  <text x="538" y="778" fill="#333" font-size="9.5">resolvedAt: TIMESTAMP</text>

  <!-- APPLICATION -->
  <rect x="760" y="350" width="210" height="150" rx="2" fill="#fff" stroke="#555" stroke-width="1.5"/>
  <rect x="760" y="350" width="210" height="22" rx="2" fill="#555"/>
  <text x="865" y="366" text-anchor="middle" fill="#fff" font-weight="bold" font-size="11">APPLICATION</text>
  <line x1="760" y1="372" x2="970" y2="372" stroke="#555" stroke-width="0.5"/>
  <text x="768" y="387" fill="#d9a441" font-size="9.5">applicationID</text><text x="852" y="387" fill="#888" font-size="9">PK</text>
  <text x="768" y="400" fill="#333" font-size="9.5">type: ENUM(student,instructor)</text>
  <text x="768" y="413" fill="#333" font-size="9.5">fullName, email</text>
  <text x="768" y="426" fill="#333" font-size="9.5">priorGpa: DECIMAL(3,2)</text>
  <text x="768" y="439" fill="#333" font-size="9.5">statement: TEXT</text>
  <text x="768" y="452" fill="#333" font-size="9.5">status: ENUM(pending,accepted,rejected)</text>
  <text x="768" y="465" fill="#333" font-size="9.5">justification: TEXT NULL</text>
  <text x="768" y="478" fill="#d9a441" font-size="9.5">processedBy</text><text x="858" y="478" fill="#888" font-size="9">FK → REGISTRAR</text>
  <text x="768" y="491" fill="#333" font-size="9.5">processedAt: TIMESTAMP</text>

  <!-- SEMESTER -->
  <rect x="760" y="545" width="195" height="100" rx="2" fill="#fff" stroke="#3b4cca" stroke-width="1.5"/>
  <rect x="760" y="545" width="195" height="22" rx="2" fill="#3b4cca"/>
  <text x="857" y="561" text-anchor="middle" fill="#fff" font-weight="bold" font-size="11">SEMESTER</text>
  <line x1="760" y1="567" x2="955" y2="567" stroke="#3b4cca" stroke-width="0.5"/>
  <text x="768" y="582" fill="#d9a441" font-size="9.5">semesterID</text><text x="840" y="582" fill="#888" font-size="9">PK</text>
  <text x="768" y="595" fill="#333" font-size="9.5">name: VARCHAR(40)</text>
  <text x="768" y="608" fill="#333" font-size="9.5">year: INT</text>
  <text x="768" y="621" fill="#333" font-size="9.5">currentPhase: INT(1..4)</text>
  <text x="768" y="634" fill="#333" font-size="9.5">isActive: BOOL</text>

  <!-- WAITLIST -->
  <rect x="760" y="670" width="195" height="100" rx="2" fill="#fff" stroke="#555" stroke-width="1.5"/>
  <rect x="760" y="670" width="195" height="22" rx="2" fill="#555"/>
  <text x="857" y="686" text-anchor="middle" fill="#fff" font-weight="bold" font-size="11">WAITLIST</text>
  <line x1="760" y1="692" x2="955" y2="692" stroke="#555" stroke-width="0.5"/>
  <text x="768" y="707" fill="#d9a441" font-size="9.5">waitlistID</text><text x="828" y="707" fill="#888" font-size="9">PK</text>
  <text x="768" y="720" fill="#d9a441" font-size="9.5">studentID</text><text x="828" y="720" fill="#888" font-size="9">FK → STUDENT</text>
  <text x="768" y="733" fill="#d9a441" font-size="9.5">courseID</text><text x="822" y="733" fill="#888" font-size="9">FK → COURSE</text>
  <text x="768" y="746" fill="#333" font-size="9.5">position: INT</text>
  <text x="768" y="759" fill="#333" font-size="9.5">addedAt: TIMESTAMP</text>

  <!-- TABOO_WORD -->
  <rect x="1050" y="45" width="200" height="95" rx="2" fill="#fff" stroke="#8b2e2e" stroke-width="1.5"/>
  <rect x="1050" y="45" width="200" height="22" rx="2" fill="#8b2e2e"/>
  <text x="1150" y="61" text-anchor="middle" fill="#fff" font-weight="bold" font-size="11">TABOO_WORD</text>
  <line x1="1050" y1="67" x2="1250" y2="67" stroke="#8b2e2e" stroke-width="0.5"/>
  <text x="1058" y="82" fill="#d9a441" font-size="9.5">wordID</text><text x="1100" y="82" fill="#888" font-size="9">PK</text>
  <text x="1058" y="95" fill="#333" font-size="9.5">word: VARCHAR(60)</text>
  <text x="1058" y="108" fill="#d9a441" font-size="9.5">addedBy</text><text x="1102" y="108" fill="#888" font-size="9">FK → REGISTRAR</text>
  <text x="1058" y="121" fill="#333" font-size="9.5">addedAt: TIMESTAMP</text>

  <!-- AI_QUERY -->
  <rect x="1050" y="170" width="200" height="115" rx="2" fill="#fff" stroke="#555" stroke-width="1.5"/>
  <rect x="1050" y="170" width="200" height="22" rx="2" fill="#555"/>
  <text x="1150" y="186" text-anchor="middle" fill="#fff" font-weight="bold" font-size="11">AI_QUERY</text>
  <line x1="1050" y1="192" x2="1250" y2="192" stroke="#555" stroke-width="0.5"/>
  <text x="1058" y="207" fill="#d9a441" font-size="9.5">queryID</text><text x="1104" y="207" fill="#888" font-size="9">PK</text>
  <text x="1058" y="220" fill="#d9a441" font-size="9.5">userID</text><text x="1096" y="220" fill="#888" font-size="9">FK → USER NULL</text>
  <text x="1058" y="233" fill="#333" font-size="9.5">question: TEXT</text>
  <text x="1058" y="246" fill="#333" font-size="9.5">answer: TEXT</text>
  <text x="1058" y="259" fill="#333" font-size="9.5">sourceType: ENUM(local,llm)</text>
  <text x="1058" y="272" fill="#333" font-size="9.5">createdAt: TIMESTAMP</text>

  <!-- GRADUATION_APP -->
  <rect x="1050" y="320" width="200" height="115" rx="2" fill="#fff" stroke="#2f6b3d" stroke-width="1.5"/>
  <rect x="1050" y="320" width="200" height="22" rx="2" fill="#2f6b3d"/>
  <text x="1150" y="336" text-anchor="middle" fill="#fff" font-weight="bold" font-size="11">GRADUATION_APP</text>
  <line x1="1050" y1="342" x2="1250" y2="342" stroke="#2f6b3d" stroke-width="0.5"/>
  <text x="1058" y="357" fill="#d9a441" font-size="9.5">appID</text><text x="1088" y="357" fill="#888" font-size="9">PK</text>
  <text x="1058" y="370" fill="#d9a441" font-size="9.5">studentID</text><text x="1118" y="370" fill="#888" font-size="9">FK → STUDENT</text>
  <text x="1058" y="383" fill="#333" font-size="9.5">status: ENUM(pending,approved,rejected)</text>
  <text x="1058" y="396" fill="#333" font-size="9.5">registrarNote: TEXT</text>
  <text x="1058" y="409" fill="#d9a441" font-size="9.5">processedBy</text><text x="1138" y="409" fill="#888" font-size="9">FK → REGISTRAR</text>
  <text x="1058" y="422" fill="#333" font-size="9.5">appliedAt: TIMESTAMP</text>
  <text x="1058" y="435" fill="#333" font-size="9.5">processedAt: TIMESTAMP</text>

  <!-- ══ RELATIONSHIPS (crow's foot) ══ -->
  <!-- USER → STUDENT (1:1) -->
  <line x1="250" y1="307" x2="530" y2="110" stroke="#555" stroke-width="1" stroke-dasharray="5,3"/>
  <text x="360" y="220" fill="#888" font-size="9" transform="rotate(-25,360,220)">IS-A</text>

  <!-- USER → INSTRUCTOR -->
  <line x1="500" y1="290" x2="535" y2="180" stroke="#555" stroke-width="1" stroke-dasharray="5,3"/>
  <text x="510" y="240" fill="#888" font-size="9">IS-A</text>

  <!-- USER → REGISTRAR -->
  <line x1="760" y1="268" x2="730" y2="175" stroke="#555" stroke-width="1" stroke-dasharray="5,3"/>
  <text x="748" y="225" fill="#888" font-size="9">IS-A</text>

  <!-- STUDENT → ENROLLMENT (1:N) -->
  <line x1="250" y1="385" x2="290" y2="548" stroke="#555" stroke-width="1.2" marker-end="url(#er-arr)"/>
  <text x="238" y="480" fill="#555" font-size="9">1</text>
  <text x="270" y="545" fill="#555" font-size="9">N</text>

  <!-- COURSE → ENROLLMENT (1:N) -->
  <line x1="535" y1="445" x2="490" y2="490" stroke="#8b2e2e" stroke-width="1.2" marker-end="url(#er-arr)"/>
  <text x="520" y="460" fill="#8b2e2e" font-size="9">1</text>
  <text x="476" y="490" fill="#8b2e2e" font-size="9">N</text>

  <!-- ENROLLMENT → GRADE (1:1) -->
  <line x1="485" y1="548" x2="530" y2="548" stroke="#555" stroke-width="1.2" marker-end="url(#er-arr)"/>
  <text x="488" y="542" fill="#555" font-size="9">1</text>
  <text x="512" y="542" fill="#555" font-size="9">0..1</text>

  <!-- STUDENT → REVIEW (1:N) -->
  <line x1="100" y1="470" x2="100" y2="615" stroke="#555" stroke-width="1.2" marker-end="url(#er-arr)"/>
  <text x="106" y="510" fill="#555" font-size="9">1</text>
  <text x="106" y="615" fill="#555" font-size="9">N</text>

  <!-- COURSE → REVIEW (1:N) -->
  <line x1="530" y1="400" x2="250" y2="530" stroke="#8b2e2e" stroke-width="1.2" marker-end="url(#er-arr)"/>
  <text x="382" y="455" fill="#8b2e2e" font-size="9">1:N</text>

  <!-- STUDENT → WARNING -->
  <line x1="145" y1="620" x2="140" y2="660" stroke="#a56a00" stroke-width="1.2" marker-end="url(#er-arr)"/>
  <text x="112" y="650" fill="#a56a00" font-size="9">1:N</text>

  <!-- STUDENT → HONOR -->
  <line x1="220" y1="620" x2="340" y2="660" stroke="#2f6b3d" stroke-width="1.2" marker-end="url(#er-arr)"/>
  <text x="285" y="648" fill="#2f6b3d" font-size="9">1:N</text>

  <!-- REGISTRAR → APPLICATION -->
  <line x1="855" y1="310" x2="865" y2="350" stroke="#555" stroke-width="1.2" marker-end="url(#er-arr)"/>
  <text x="870" y="335" fill="#555" font-size="9">1:N</text>

  <!-- SEMESTER → COURSE -->
  <line x1="858" y1="545" x2="680" y2="445" stroke="#3b4cca" stroke-width="1.2" marker-end="url(#er-arr)"/>
  <text x="775" y="490" fill="#3b4cca" font-size="9">1:N</text>

  <!-- REGISTRAR → TABOO_WORD -->
  <line x1="950" y1="260" x2="1050" y2="88" stroke="#8b2e2e" stroke-width="1.2" marker-end="url(#er-arr)"/>
  <text x="990" y="165" fill="#8b2e2e" font-size="9">manages 1:N</text>

  <!-- USER → AI_QUERY -->
  <line x1="730" y1="110" x2="1050" y2="225" stroke="#555" stroke-width="1.2" stroke-dasharray="3,2" marker-end="url(#er-arr)"/>
  <text x="870" y="160" fill="#555" font-size="9">asks 1:N</text>

  <!-- STUDENT → GRADUATION_APP -->
  <line x1="230" y1="385" x2="1050" y2="380" stroke="#2f6b3d" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#er-arr)"/>
  <text x="600" y="371" fill="#2f6b3d" font-size="9">applies 1:N</text>

  <!-- INSTRUCTOR → COURSE -->
  <line x1="500" y1="290" x2="535" y2="330" stroke="#555" stroke-width="1.2" marker-end="url(#er-arr)"/>
  <text x="513" y="318" fill="#555" font-size="9">1:N</text>

  <!-- COURSE → WAITLIST -->
  <line x1="680" y1="400" x2="800" y2="700" stroke="#555" stroke-width="1.2" stroke-dasharray="3,2" marker-end="url(#er-arr)"/>
  <text x="750" y="540" fill="#555" font-size="9">1:N</text>
</svg>`;
