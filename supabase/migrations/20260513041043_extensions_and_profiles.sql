create extension if not exists "vector";

-- Role on each user (mirrors prototype's 4 roles)
create type role as enum ('visitor', 'student', 'instructor', 'registrar');

create type student_status   as enum ('active', 'suspended', 'terminated', 'graduated');
create type instructor_status as enum ('active', 'suspended', 'fired');
create type course_status    as enum ('active', 'cancelled');
create type enrollment_status as enum ('enrolled', 'waitlist', 'dropped', 'cancelled', 'completed');
create type application_type as enum ('student', 'instructor');
create type application_status as enum ('pending', 'accept', 'reject');
create type complaint_status as enum ('pending', 'warn-target', 'warn-complainant', 'deregister', 'dismissed');
create type grad_app_status as enum ('pending', 'approved', 'reject-reckless', 'deferred');

-- Profile: 1:1 with auth.users. We extend auth.users via this table.
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_id    text unique not null,           -- s-00029, i-Okonkwo, registrar-001
  full_name     text not null default '',
  role          role not null default 'visitor',
  must_change_password boolean not null default false,
  created_at    timestamptz not null default now()
);
create index profiles_role_idx on profiles(role);

create table students (
  user_id       uuid primary key references profiles(id) on delete cascade,
  major         text not null,
  year          text default '',
  status        student_status not null default 'active',
  cached_cum_gpa numeric(4,2),
  cached_sem_gpa numeric(4,2),
  completed_classes int not null default 0
);

create table instructors (
  user_id       uuid primary key references profiles(id) on delete cascade,
  department    text not null,
  status        instructor_status not null default 'active'
);
