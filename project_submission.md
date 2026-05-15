# College0 — Project Submission

**Repository:** https://github.com/parthj100/College0

---

## 1. Introduction

College0 is a small graduate-program Student Information System. It demonstrates the full lifecycle of an academic term — applications, semester phase control, course registration, grading, reviews, complaints, and graduation — through four role-scoped surfaces (Visitor, Student, Instructor, Registrar). On top of the operational system, it includes an AI assistant that answers role-scoped questions from a local knowledge base first and falls back to an Ollama LLM when the local store can't help.

The frontend is a single-page React 18 application loaded straight from `College0.html` — the React UMD build, in-browser Babel for JSX, and the Supabase JS client are all pulled from the unpkg CDN, so there is no build step. The backend is Supabase: Postgres 15 with Row Level Security, ~25 SQL migrations, ~10 SECURITY DEFINER RPC functions, and 5 Deno edge functions (provisioning, password reset, AI query, KB embedding, demo-user bootstrap). The optional LLM fallback uses Ollama (Cloud Turbo or self-hosted). A small Python wrapper script (`dev-server.py`) serves the static frontend with `Cache-Control: no-store` for local development.

### Packages and platforms required to install and run from scratch

| Layer | Dependency | Version | Notes |
|---|---|---|---|
| Runtime | Python 3 | 3.9+ | Only used by `dev-server.py` (stdlib `http.server` wrapper) |
| Browser | Modern Chromium / Firefox / Safari | — | React 18 UMD + Babel-standalone load from CDN at runtime |
| Backend | Supabase project | free tier OK | URL + publishable anon key go in `project/supabase-config.js` |
| CLI | Supabase CLI | latest | Only needed if you want to fork to your own Supabase: `supabase db push` for migrations + `supabase functions deploy` for edge functions |
| LLM (optional) | Ollama Cloud (Turbo) or self-hosted Ollama | — | Set `OLLAMA_API_KEY` (Cloud) or `OLLAMA_URL` (self-host) as a Supabase function secret; the function falls back gracefully if neither is set |

**To run against the existing demo backend** (already provisioned, all keys already in `project/supabase-config.js`):

```sh
git clone https://github.com/parthj100/College0.git
cd College0
python3 dev-server.py
# open http://localhost:8421/College0.html
```

Demo logins are surfaced as one-click buttons on the sign-in page (Student / Instructor / Registrar / Visitor). The full self-host setup (CLI, migrations, edge functions, secrets) is documented in the repository README.

---

## 2. Spec Compliance — feature-by-feature

| # | Spec requirement (abridged) | Status | Where it lives / notes |
|---|---|---|---|
| **1** | Public GUI with program intro, **highest-rated classes**, **lowest-rated classes**, **top-GPA students**, available to everyone | Done | `Landing.jsx` shows the program intro + best-rated seminars + lowest-rated table inline. `BrowsePages.jsx` adds the dedicated "Browse classes" and "Honor roll" pages. Public reads via `public_top_students` view + RLS-allowed reads on `courses` / `reviews`. |
| **2** | Visitor → student application; **GPA > 3.0 + quota → auto-accept**; override with justification; new students get a unique ID + temp password (changed on first login); visitor → instructor application (no justification required) | Done (one deliberate deviation) | `ApplyPage.jsx` for both applicant types. Auto-accept badge is computed from `prior_gpa` and the `program_quotas` table. Registrar UI in `RegistrarDash.jsx` enforces the justification field when overriding the auto-rule. `decide_application` RPC + `provision-applicant` edge function issue the canonical `s-XXXXX@college0.demo` email + temp password (`123456` by default, configurable via `DEMO_TEMP_PASSWORD` secret). **Deviation:** the "must change on first login" enforcement was removed at the team's request to make demos faster — `must_change_password` defaults to `false` but the column and code path are still there. |
| **3** | Four semester phases (set-up / registration / running / grading) controlled by registrar; class set-up populates classes/instructors/cap; students register **2–4 courses** with **no time conflict** and **cap-aware waitlist**; **retake on F** allowed | Done | `system_state.phase` (1–4) + RegistrarDash "Phases" tab with both Apply-and-advance (runs policy) and Jump-to (just sets the phase) controls. `Registration.jsx` builds the live catalog from Supabase, enforces cart bounds, runs the time-conflict check on `day_mask` + `start_hour`/`end_hour`, and routes overflow to the waitlist. `register_for_course_v2` RPC enforces the same rules server-side. The `passedCourses` / `failedCourses` arrays gate retake eligibility. |
| **4** | Class running: no new registration; **<2 courses → student warned**; **<3 students → course cancelled**; **special re-registration window** for displaced students; instructors of cancelled courses warned, all-cancelled instructors suspended (no teaching next semester) | Done | `advance_phase` RPC fires the cancellation + warning batch on the 2→3 transition. Special-registration window is opened by setting `cs.specialReg = true` and `window.__displacedFrom`, which `Registration.jsx` reads to relabel the page. Instructor suspension is tracked via the `instructors.status` column. |
| **5** | Reviews 1–5 stars, anonymous to everyone except registrars; **avg < 2 → instructor warned**; **3 warnings → suspended**; **reviews close once grades are posted**; **1–2 taboo words → masked + 1 warning**; **≥3 → hidden + 2 warnings** | Done | `submit_review` RPC handles taboo masking (whole-word, case-insensitive), warning issuance, recomputes `courses.avg_rating`, and auto-flags the instructor if `avg_rating < 2.0`. Author anonymity enforced at the column level — `author_id` is revoked from `authenticated`/`anon`; the registrar reads through the `reviews_with_authors` view, gated by `is_registrar()`. The trigger that suspends an instructor at 3 warnings is in the warning-signup migration. |
| **6** | Grading phase: instructors assign grades; **missing grades → warned**; **class GPA outside 2.5–3.5 → questioned**; **GPA < 2 or 2× F → auto-terminated**; **GPA 2–2.25 → warning + interview**; **sem GPA ≥ 3.75 or cum ≥ 3.5 → honor roll**; honor cancels one warning; **8 classes + required courses → graduation**; reckless application → warning | Done | `record_grades` RPC posts grades, computes class GPA, and issues both the missing-grades warning and the GPA-outlier warning. End-of-phase batch in `advance_phase` runs the auto-termination + interview-warning + honor-roll labels. `redeem_honor` RPC retires one warning. Graduation: a `BEFORE INSERT` trigger on `graduation_applications` auto-rejects with the reckless warning when `missing_codes` is non-empty; clean filings remain pending for registrar review and `decide_grad_app` flips the student to `graduated`. |
| **7** | Complaints student↔student, student↔instructor, instructor↔student; registrar must take action; **3 warnings → suspended + fine** | Done | `complaints` table with `from_user_id` / `target_id`. `Modals.jsx` exposes the file-complaint dialog from any page; instructor's "De-reg" button on the roster files a complaint pre-formatted as a de-registration request. `resolve_complaint` RPC takes one of `warn-target`/`warn-author`/`dismiss`. Suspension + fine: when active warning count hits 3, `StudentDash.jsx` calls `assessFine` to insert a $250 reinstatement-fine row. |
| **8** | Each role has its own page; new students get a tutorial; registrar sees everything | Done | `App.jsx` routes by role; sidebar nav is role-gated. `StudentDash.jsx` shows an in-page tutorial overlay on first login (gated by `c0-tutorial-seen` localStorage). Registrar gets six tabs in the admin console (Overview, Applications, Class set-up, Graduations, Phases, Complaints, Taboo, Warnings). |
| **9** | AI assistant text area; vector-DB-first local lookup; **LLM fallback with hallucination warning**; role-scoped (visitor: general; student: own classes; instructor: own students) | Done | `ai-query` edge function pipeline: role gate → user-context fast paths (`my GPA`, `my classes`, `at risk students`) → lexical KB search (stopword filter + ≥2 meaningful hits) → Ollama LLM fallback (Cloud Turbo or self-hosted, model `gpt-oss:20b` by default). The LLM system prompt always appends *"Please verify with the registrar."* for the hallucination warning. UI surface is the ⌘K panel from `CmdK.jsx`. |
| **10** | Creative feature of the team's choice | Done | Three creative additions: **(a)** Study-buddy matches on the student dashboard — overlap-aware roommate suggestions with confidence scores; **(b)** ⌘K command palette with natural-language navigation and the AI assistant; **(c)** *"Who should I worry about?"* AI panel on the instructor roster that flags at-risk students and drafts an outreach message the instructor can send to the registrar. |

**Bottom line:** all 10 spec items are implemented. The only conscious deviation is the first-login forced password change in §2, removed at the team's request to streamline the demo flow.

---

## 3. Team Contributions

Five-person team, each contributing 20%. No bonuses or penalties suggested.

| Team member | Area | Specific contributions | % |
|---|---|---|---|
| **Banepali, Gaurav** | Backend (Database & Schema) | Postgres schema design across 19 migrations; tables for `profiles`, `students`, `instructors`, `courses`, `enrollments`, `reviews`, `warnings`, `honors`, `complaints`, `graduation_applications`, `taboo_words`, `program_quotas`, `applications`, `system_state`, `kb_docs`, `fines`. Full RLS policy pass with role helpers (`is_registrar`, `is_enrolled_in`). Wrote the seed migrations (reference data, demo students/instructors, course catalog). | 20% |
| **Joshi, Parthkumar** | Frontend (UI & React) | All 16 React components in `project/components/` — `App.jsx` routing + sidebar, `Login.jsx`, `Landing.jsx`, `ApplyPage.jsx`, `Registration.jsx`, `StudentDash.jsx`, `StudentClassDetail.jsx`, `ClassDetail.jsx`, `InstructorRoster.jsx`, `RegistrarDash.jsx`, `BrowsePages.jsx`, `CmdK.jsx`, `Modals.jsx`, `Tweaks.jsx`, `shared.jsx`. Design system (`styles.css`) — typography scale, colour tokens, role-themed shells, the ★ rating widget, command palette, and toast/banner patterns. End-to-end UI walkthroughs against the 11 spec test cases. | 20% |
| **Mezmaz, Yassin** | Features (Business Logic & RPCs) | Authored the SECURITY DEFINER RPC functions: `submit_review` (taboo masking + auto-warning + course-rating recompute), `record_grades` (class GPA + missing-grade + outlier warnings), `register_for_course_v2` (cap + waitlist + retake gate), `advance_phase` (per-phase batch effects), `decide_application`, `decide_grad_app`, `resolve_complaint`, `redeem_honor`. Wrote the `BEFORE INSERT` trigger that auto-rejects reckless graduation filings. Hardened the freshSB() workaround for the supabase-js write deadlock. | 20% |
| **Santana, Hector** | AI Pipeline & Knowledge Base | `ai-query` edge function — four-step pipeline (role gate → user-context fast paths → lexical KB → Ollama LLM). Authored `kb_docs` table + the seed knowledge corpus (handbook sections, course descriptions, registration rules). Wired the Ollama Cloud / self-hosted LLM fallback with the mandatory hallucination disclaimer. Stopword + whole-word filter on the lexical scorer to stop false positives on short questions. | 20% |
| **Wen, Benny** | Auth, Edge Functions & Deployment | `provision-applicant` edge function (auth user creation with canonical `s-XXXXX@college0.demo` email and role-row insert), `reset-applicant-password` (registrar-only password reset), `bootstrap-demo-users` (idempotent demo-account seeder). Configured the realtime publication for `courses`, `enrollments`, `applications`, `warnings`, `honors`, `complaints`, `system_state`. Set up the Supabase project, deployed all edge functions, configured function secrets, wrote `dev-server.py`. Maintained the README and the cache-bust workflow. | 20% |
| | | **Total** | **100%** |

All five members agreed to the equal split. Signatures (typed):

> Banepali, Gaurav — _Gaurav Banepali_
>
> Joshi, Parthkumar — _Parthkumar Joshi_
>
> Mezmaz, Yassin — _Yassin Mezmaz_
>
> Santana, Hector — _Hector Santana_
>
> Wen, Benny — _Benny Wen_

---

## 4. Repository

**Public GitHub repository (open for clone):**

```
https://github.com/parthj100/College0.git
```

Branch: `main`. All migrations, edge functions, frontend assets, and the local dev server are checked in. The README contains the 60-second clone-and-run path against the demo Supabase backend (already provisioned, anon key in repo) plus the full self-host instructions for forks.
