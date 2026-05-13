# College0

> AI-Enabled College Program Management System

College0 is a full-stack academic management platform that supports the complete lifecycle of a college program. From student and instructor admissions through course registration, grading, academic standing, complaints, and graduation. An integrated AI assistant answers role-scoped questions using a local knowledge store first, with a general LLM as fallback.

---

## Table of Contents

- [Overview](#overview)
- [Actors](#actors)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Data Model](#data-model)
- [Use Cases](#use-cases)
- [AI Assistant](#ai-assistant)
- [Academic Rules](#academic-rules)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)

---

## Overview

College0 manages four actor groups across a semester-driven workflow. The registrar controls all phase transitions; students and instructors operate within those phases. Every policy-sensitive decision (application review, grade posting, standing evaluation, graduation audit) is enforced at the service layer and is fully auditable.

---

## Actors

| Actor | Description |
|---|---|
| **Visitor** | Browses the public dashboard, submits student or instructor applications, asks general AI questions |
| **Student** | Registers courses, joins wait-lists, submits reviews, files complaints, applies for graduation, views own academic record |
| **Instructor** | Manages assigned course rosters, admits wait-listed students, posts grades, files complaints |
| **Registrar** | Full system access; approves applications, advances semester phases, resolves complaints, audits graduation, oversees warnings and suspensions |

---

## Features

- **Admissions** — Separate application flows for students and instructors; registrar approval with GPA-based rule recommendations and mandatory justification for overrides
- **Semester phase control** — Registrar advances phases (Registration → Class Running → Grading → Post-Grading Review); phase gates enforce which actions are available
- **Course registration** — Students select 2–4 courses per semester; system enforces time conflicts, credit bounds, and passed-course exclusions; full seats trigger automatic wait-list enrollment
- **Wait-list management** — Ordered queue per offering; instructors admit students seat-by-seat; conflict re-check on admission
- **Class reviews** — Anonymous star ratings with text; taboo-word detection masks or hides reviews and issues warnings; ratings feed public course rankings
- **Grading** — Instructors assign letter grades during the grading phase; class GPA is computed and flagged if outside the normal band (2.5–3.5)
- **Academic standing** — Semester-end batch process computes GPA, issues warnings, terminates students below 2.0 or with repeated course failures, awards honor-roll status, and suspends underperforming instructors
- **Complaints** — Students and instructors file complaints against each other; registrar resolves with configurable outcomes (warn, de-register, no action)
- **Graduation** — Students with 8+ completed classes apply; registrar audits degree requirements; approved students receive Bachelor's status
- **AI assistant** — Role-scoped question answering backed by a vector store; falls back to a general LLM with a hallucination warning when local confidence is below 0.80
- **Notifications** — In-app and channel-dispatched notifications for every major lifecycle event
- **Taboo word management** — Registrar maintains the active taboo word list used by the review filter

---

## System Architecture

College0 is organized around service classes that own policy logic. Repositories handle persistence only. The service layer is the trusted enforcement point — role checks and phase checks are applied there regardless of what the UI sends.

**Core services:**

| Service | Responsibility |
|---|---|
| `AuthService` | Login, first-time password change, role authorization |
| `ApplicationService` | Student and instructor application submission and review |
| `SemesterService` | Phase advancement, under-enrolled class cancellation, special registration window |
| `RegistrationService` | Time-conflict detection, registration validation, enrollment creation |
| `WaitlistService` | Queue management, seat-gated admission |
| `ReviewService` | Taboo counting, masking, review storage, course rating update |
| `GradingService` | Grade assignment, class GPA computation, grade posting |
| `StandingService` | Student and instructor standing evaluation, honor redemption |
| `ComplaintService` | Complaint filing and resolution |
| `GraduationService` | Graduation application and degree audit |
| `AIQueryService` | Scope-aware question answering, local retrieval, LLM fallback |
| `NotificationService` | Warning creation, suspension logic, notification dispatch |

---

## Data Model

The system uses 15 entities. Key relationships:

- `USER` is the parent record for `STUDENT`, `INSTRUCTOR`, and `REGISTRAR`
- `COURSE_OFFERING` is the central schedulable unit — all registrations, grades, reviews, and wait-list entries reference it
- A student may hold at most one `ENROLLMENT` or `WAITLIST_ENTRY` per offering
- A student may submit at most one `REVIEW` per offering
- `WARNING.active = true` contributes to suspension logic (3 active warnings → suspension)
- `GRADUATION_APPLICATION.status` is one of `Pending`, `Approved`, `Rejected`

See [`college0_er_diagram.svg`](./college0_er_diagram.svg) for the full Chen-notation ER diagram.

---

## Use Cases

| ID | Name | Primary Actor |
|---|---|---|
| UC-01 | Browse public dashboard | Visitor |
| UC-02 | Submit student application | Visitor |
| UC-03 | Submit instructor application | Visitor |
| UC-04 | Review application | Registrar |
| UC-05 | Login and first-time password change | Student, Instructor, Registrar |
| UC-06 | Register courses | Student |
| UC-07 | Admit student from wait-list | Instructor |
| UC-08 | Submit class review | Student |
| UC-09 | Post grades | Instructor |
| UC-10 | Process semester-end standing | Registrar, System |
| UC-11 | File and resolve complaint | Student, Instructor, Registrar |
| UC-12 | Apply for graduation | Student, Registrar |
| UC-13 | Ask College0 AI assistant | All actors |

---

## AI Assistant

The AI assistant answers questions within each actor's access scope:

| Role | Scope |
|---|---|
| Visitor | Public data only |
| Student | Public data + own records + current enrollments |
| Instructor | Public data + assigned offerings + students in those offerings |
| Registrar | Full system access |

**Query flow:**
1. Scope is built from user role
2. Vector store and structured DB are queried for local context
3. If confidence ≥ 0.80 → return local answer with source citation
4. Otherwise → sanitized prompt is sent to LLM gateway; response is returned with a hallucination warning
5. All queries are logged with source type (`local` or `llm`)

---

## Academic Rules

- Students must register for **2–4 courses** per semester; no time conflicts allowed
- Classes with **fewer than 3 enrolled students** are cancelled when the semester moves to Class Running phase
- A student who fails the **same course twice** is automatically terminated
- Cumulative GPA **below 2.0** → termination; **2.00–2.25** → warning + registrar interview required
- Semester GPA **above 3.75** or cumulative GPA **above 3.5** (after 1+ semesters) → honor-roll credit
- **3 active warnings** → one-semester suspension (students) or suspension (instructors)
- One honor credit can clear one active warning
- Class average rating **below 2.0** → registrar and instructor are notified
- Class GPA **above 3.5 or below 2.5** → registrar is flagged
- Instructors whose **all offerings are cancelled** in a semester are suspended the following semester
- Graduation requires **8+ completed classes** and all degree requirements met; reckless filing issues a warning

---

## Getting Started

College0 is two pieces: a **Supabase backend** (Postgres + Edge Functions) and a **static HTML/React prototype** that talks to it. To run it end-to-end on your own you need both.

### Prerequisites

- A free [Supabase account](https://supabase.com) — provisioning a project takes ~30 seconds
- The [Supabase CLI](https://supabase.com/docs/guides/cli) — `brew install supabase/tap/supabase` (macOS) or [other installers](https://supabase.com/docs/guides/local-development/cli/getting-started)
- Python 3 (any version) for the static dev server, or any other static server you prefer

### 1. Create a Supabase project

1. Go to https://supabase.com/dashboard and click **New project**.
2. Pick a name, region, and database password. Wait for it to finish provisioning.
3. Note the **Project Reference** (the part before `.supabase.co` in your project URL).

### 2. Apply the schema and seed data

```bash
git clone https://github.com/parthj100/College0.git
cd College0

supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
supabase db push                       # applies all 13 migrations in supabase/migrations/
```

This creates every table, RLS policy, RPC function, trigger, and reference seed (taboo words, required courses, quotas, the 4 demo applications, and 10 KB documents for the AI assistant).

### 3. Deploy the edge functions

```bash
supabase functions deploy bootstrap-demo-users --no-verify-jwt
supabase functions deploy ai-query              --no-verify-jwt
supabase functions deploy index-kb-embeddings   --no-verify-jwt
```

### 4. Bootstrap demo users

Migration 010 seeds orphan profiles for the demo personas (12 students, 9 instructors, 1 registrar). The `bootstrap-demo-users` function wipes those, creates real `auth.users` for each, and re-creates all the role rows + courses + enrollments + warnings + honors so sign-in actually works.

```bash
ANON_KEY=$(supabase projects api-keys --project-ref <YOUR_PROJECT_REF> | awk '/anon/ {print $4}')

curl -X POST "https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/bootstrap-demo-users" \
  -H "Authorization: Bearer $ANON_KEY"
```

Expected response:
```json
{ "instructors": 9, "students": 12, "courses": 11, "enrollments": 30,
  "warnings": 6, "honors": 5, "failures": [], "users": { ... } }
```

The demo personas all share a fixed password — by default `college0demo!!` for students/instructors and `college0registrar!!` for the registrar. To override, set Supabase secrets before running bootstrap:
```bash
supabase secrets set DEMO_PASSWORD="..." DEMO_REGISTRAR_PASSWORD="..."
```

### 5. (Optional) Wire the AI assistant's vector branch and LLM fallback

The `ai-query` function tries (in order): role gate → user-context queries → vector similarity → lexical KB → LLM fallback. The vector and LLM tiers are no-ops until you set keys:

```bash
supabase secrets set OPENAI_API_KEY="sk-..."        # for vector embeddings
supabase secrets set ANTHROPIC_API_KEY="sk-ant-..." # for LLM fallback (optional)

# After the OpenAI key is set, populate kb_docs.embedding once:
curl -X POST "https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/index-kb-embeddings" \
  -H "Authorization: Bearer $ANON_KEY"
# → { "indexed": 10, "failures": [] }
```

### 6. Configure the frontend

Copy the example config and fill in your values:

```bash
cp project/supabase-config.example.js project/supabase-config.js
# edit project/supabase-config.js: set url + anonKey from Project Settings → API
```

`project/supabase-config.js` is gitignored — it stays per-clone.

### 7. Run the static frontend

```bash
python3 -m http.server 8421 --directory project
```

Open http://localhost:8421/College0.html. You'll land on the public visitor page. Sign in via the **Sign in →** link in the sidebar with one of the bootstrap-created accounts (the bootstrap response above lists every `display_id`).

> If your browser caches old JS files between edits, bump `window.CACHE_BUST` in `project/College0.html` (and the matching `?cb=` query strings).

---

## Project Structure

```
College0/
├── README.md                      # this file
├── README.handoff.md              # original Claude Design handoff bundle README
├── College0_Phase_II_Design_Report.pdf
├── Diagrams/                      # ER + architecture diagrams
├── project/                       # the static HTML/React prototype
│   ├── College0.html              # entry point — loads everything else
│   ├── supabase-config.example.js # template; copy to supabase-config.js
│   ├── supabase-client.js         # Supabase client init + Backend wrapper
│   ├── data.js                    # in-browser mock seed (used as fallback)
│   ├── styles.css
│   ├── components/                # JSX components (Babel-in-browser)
│   ├── report/                    # design artifacts
│   └── uploads/                   # source materials
└── supabase/
    ├── config.toml                # Supabase CLI config
    ├── migrations/                # 13 SQL migrations applied with `supabase db push`
    │   ├── 20260513041043_extensions_and_profiles.sql
    │   ├── 20260513041058_courses_enrollments_reviews.sql
    │   ├── 20260513041111_ledgers_complaints_graduation.sql
    │   ├── 20260513041135_taboo_quotas_apps_state_kb.sql
    │   ├── 20260513041215_helpers_and_rls.sql
    │   ├── 20260513041316_rpc_review_grades.sql
    │   ├── 20260513041403_rpc_apps_phases_register.sql
    │   ├── 20260513041430_triggers_warning_signup.sql
    │   ├── 20260513041458_seed_reference_and_state.sql
    │   ├── 20260513041554_seed_demo_users_and_courses.sql
    │   ├── 20260513182046_seed_kb_docs.sql
    │   ├── 20260513182815_realtime_publication.sql
    │   └── 20260513183335_kb_vector_match_rpc.sql
    └── functions/                 # 3 Deno edge functions
        ├── bootstrap-demo-users/  # idempotent demo-user creation
        ├── ai-query/              # role-gated KB + LLM fallback
        └── index-kb-embeddings/   # one-shot KB embedding indexer
```

### How the layers fit together

- **Schema** lives in `supabase/migrations/`. Apply with `supabase db push`. Adding a migration: drop a new file with a later timestamp prefix.
- **Server-side rules** live in Postgres: RLS policies enforce who reads what; RPC functions (`submit_review`, `record_grades`, `register_for_course`, `decide_application`, `advance_phase`, `resolve_complaint`, `redeem_honor`) enforce the policy-heavy business logic; triggers auto-suspend on warning thresholds.
- **Edge functions** wrap operations that need the Supabase Auth Admin API or external services (LLM, embeddings).
- **Frontend** runs entirely in the browser — Babel transforms JSX in-page, the supabase-js client manages auth + queries, and a small wrapper in `supabase-client.js` exposes a stable `Backend` API the components call.

---
