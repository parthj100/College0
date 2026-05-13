create table warnings (
  id            bigserial primary key,
  target_id     uuid not null references profiles(id) on delete cascade,
  target_type   text not null check (target_type in ('student','instructor')),
  reason        text not null,
  active        boolean not null default true,
  issued_at     timestamptz not null default now()
);
create index warnings_target_active_idx on warnings(target_id, active);

create table honors (
  id            bigserial primary key,
  target_id     uuid not null references profiles(id) on delete cascade,
  reason        text not null,
  redeemed      boolean not null default false,
  redeemed_warning_id bigint references warnings(id) on delete set null,
  awarded_at    timestamptz not null default now()
);
create index honors_target_idx on honors(target_id);

create table complaints (
  id            bigserial primary key,
  from_user_id  uuid not null references profiles(id) on delete cascade,
  target_id     uuid not null references profiles(id) on delete cascade,
  body          text not null,
  status        complaint_status not null default 'pending',
  filed_at      timestamptz not null default now(),
  resolved_at   timestamptz,
  resolution_note text default ''
);
create index complaints_status_idx on complaints(status);

create table graduation_applications (
  id            bigserial primary key,
  student_id    uuid not null references students(user_id) on delete cascade,
  completed_codes text[] not null default '{}',
  required_codes  text[] not null default '{}',
  missing_codes   text[] not null default '{}',
  status        grad_app_status not null default 'pending',
  filed_at      timestamptz not null default now(),
  decided_at    timestamptz
);

create table fines (
  student_id    uuid primary key references students(user_id) on delete cascade,
  amount        numeric(8,2) not null,
  paid          boolean not null default false,
  reason        text not null,
  assessed_at   timestamptz not null default now()
);
