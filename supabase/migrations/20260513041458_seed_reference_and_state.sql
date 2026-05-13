-- Singleton state
insert into system_state(id, current_semester, phase) values (1, 'Spring 2026', 3)
  on conflict (id) do update set current_semester = excluded.current_semester, phase = excluded.phase;

-- Taboo
insert into taboo_words(word) values ('damn'),('hell'),('stupid'),('idiot'),('hate')
  on conflict do nothing;

-- Required courses per major
insert into required_courses(major, codes) values
  ('Literature',  array['LIT-501','LIT-540','LIT-488','PHIL-520','Capstone']),
  ('Philosophy',  array['PHIL-520','PHIL-612','LOGIC-401','Capstone']),
  ('Mathematics', array['MATH-701','MATH-610','MATH-620','Capstone']),
  ('CompSci',     array['CS-710','CS-702','CS-650','Capstone']),
  ('History',     array['HIST-410','HIST-605','HIST-501','Capstone'])
  on conflict (major) do update set codes = excluded.codes;

-- Quotas
insert into program_quotas(department, quota, enrolled) values
  ('Literature',8,7),('Philosophy',6,5),('Mathematics',6,6),
  ('Computer Science',8,7),('History',6,5),('Sociology',5,4),
  ('Economics',5,4),('Art',4,3),('Linguistics',5,4)
  on conflict (department) do update set quota=excluded.quota, enrolled=excluded.enrolled;

-- Pending applications (from data.js)
insert into applications(name, email, type, prior_gpa, department, statement) values
  ('Tariq Osei',     'tariq@example.com',   'student',    3.70, 'Philosophy',  'I want to study the ethics of machine cognition…'),
  ('Luisa Ferreira', 'luisa@example.com',   'student',    2.80, 'Mathematics', 'Despite a challenging year, my research output…'),
  ('Dr. Ben Okafor', 'ben@example.com',     'instructor', null, 'History',     'Twenty years of archival research…'),
  ('Zoe Lindberg',   'zoe@example.com',     'student',    3.40, 'Literature',  'Literature is the only reliable map of experience…');
