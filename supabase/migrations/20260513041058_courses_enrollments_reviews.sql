create table courses (
  id            bigserial primary key,
  code          text not null,
  title         text not null,
  instructor_id uuid not null references instructors(user_id),
  department    text not null,
  semester      text not null,
  time_label    text not null,
  day_mask      int[] not null default '{}',  -- 1=Mon..5=Fri
  start_hour    numeric(4,2) not null default 9,
  end_hour      numeric(4,2) not null default 10,
  room          text default '',
  cap           int not null,
  required      boolean not null default false,
  credits       int not null default 3,
  status        course_status not null default 'active',
  avg_rating    numeric(3,2),
  unique(code, semester)
);
create index courses_instructor_idx on courses(instructor_id);
create index courses_semester_status_idx on courses(semester, status);

create table enrollments (
  id            bigserial primary key,
  student_id    uuid not null references students(user_id) on delete cascade,
  course_id     bigint not null references courses(id) on delete cascade,
  status        enrollment_status not null default 'enrolled',
  grade         text default '',                -- A, A-, B+, B, B-, C+, C, F
  grade_points  numeric(4,2),
  term          text not null,
  enrolled_at   timestamptz not null default now(),
  unique(student_id, course_id)
);
create index enrollments_student_idx on enrollments(student_id);
create index enrollments_course_idx on enrollments(course_id);

create table reviews (
  id            bigserial primary key,
  course_id     bigint not null references courses(id) on delete cascade,
  author_id     uuid not null references students(user_id),
  rating        int not null check (rating between 1 and 5),
  body          text not null,
  taboo_count   int not null default 0,
  hidden        boolean not null default false,
  created_at    timestamptz not null default now()
);
create index reviews_course_idx on reviews(course_id);
create index reviews_author_idx on reviews(author_id);
