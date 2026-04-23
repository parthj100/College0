# College0

> AI-Enabled College Program Management System

College0 is a full-stack academic management platform that supports the complete lifecycle of a college program — from student and instructor admissions through course registration, grading, academic standing, complaints, and graduation. An integrated AI assistant answers role-scoped questions using a local knowledge store first, with a general LLM as fallback.

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
