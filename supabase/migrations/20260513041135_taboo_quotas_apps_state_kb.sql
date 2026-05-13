create table taboo_words (
  word text primary key
);

create table required_courses (
  major text primary key,
  codes text[] not null default '{}'
);

create table program_quotas (
  department text primary key,
  quota int not null,
  enrolled int not null default 0
);

-- Visitor applications. issued_user_id and temp_password are set on accept.
create table applications (
  id            bigserial primary key,
  name          text not null,
  email         text not null,
  type          application_type not null,
  prior_gpa     numeric(3,2),
  department    text not null,
  statement     text not null,
  status        application_status not null default 'pending',
  justification text default '',
  filed_at      timestamptz not null default now(),
  decided_at    timestamptz,
  issued_user_id uuid references profiles(id) on delete set null,
  temp_password text default ''
);
create index applications_status_idx on applications(status);

-- Singleton row holding current semester + phase. Seeded with id=1.
create table system_state (
  id            int primary key default 1,
  current_semester text not null default 'Spring 2026',
  phase         int not null default 3 check (phase between 1 and 4),
  special_registration_open boolean not null default false,
  special_registration_deadline date,
  constraint single_row check (id = 1)
);

create table kb_docs (
  id            bigserial primary key,
  title         text not null,
  body          text not null,
  source        text default '',
  role_scope    role[] not null default '{visitor,student,instructor,registrar}'::role[],
  embedding     vector(1536),
  created_at    timestamptz not null default now()
);
-- Vector similarity index (HNSW) — created later when we have data; cosine ops by default
