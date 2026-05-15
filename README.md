# College0

A small graduate-program Student Information System. Demo of role-gated
workflows (visitor / student / instructor / registrar), a four-phase semester
(Class Set-up → Registration → Class Running → Grading), and an AI assistant
that answers from a local knowledge base before falling back to a hosted LLM.

The frontend is plain HTML + React 18 (UMD build, in-browser Babel — no build
step). The backend is Supabase: Postgres with Row Level Security, RPC
functions, and edge functions. The AI assistant uses an Ollama LLM as its
external fallback.

## Quick start (uses the existing demo backend)

The shipped `project/supabase-config.js` already points at the public demo
project. The anon key in it is designed to be public — RLS policies on the
server gate everything.

```sh
git clone https://github.com/parthj100/College0.git
cd College0
python3 dev-server.py     # serves project/ on http://localhost:8421
```

Open `http://localhost:8421/College0.html`. Use the **Quick sign-in · demo**
buttons at the bottom of the login page:

| Role       | Credentials                                       |
|------------|---------------------------------------------------|
| Student    | `s-00042@college0.demo` / `college0demo!!`        |
| Instructor | `i-okonkwo@college0.demo` / `college0demo!!`      |
| Registrar  | `registrar@college0.demo` / `college0registrar!!` |
| Visitor    | (no login — public landing only)                  |

Or sign in with any seeded student id like `s-00029` and the same demo
password. Newly-accepted applicants get the temp password `123456`.

`dev-server.py` is a thin wrapper around `http.server` that sends
`Cache-Control: no-store` so edits to the JSX files show up on a normal
browser refresh — no hard reload needed.

---

## Stand up your own Supabase backend

If you want to fork the project (your own Supabase, your own data, your own
LLM keys), follow these steps. You'll need the
[Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) and a
Supabase account.

### 1. Create the project + apply migrations

```sh
supabase login
supabase projects create college0
supabase link --project-ref <YOUR_REF>
supabase db push                            # applies everything in supabase/migrations/
```

The migrations build the schema, RLS policies, RPC functions, realtime
publication, taboo word + program quota seeds, and the demo course catalog.

### 2. Deploy the edge functions

```sh
supabase functions deploy ai-query                  --no-verify-jwt
supabase functions deploy provision-applicant
supabase functions deploy reset-applicant-password
supabase functions deploy bootstrap-demo-users      --no-verify-jwt
supabase functions deploy index-kb-embeddings       --no-verify-jwt
```

| Function                   | What it does                                                                  |
|----------------------------|-------------------------------------------------------------------------------|
| `ai-query`                 | Pipeline: role gate → user-context fast paths → vector KB → lexical KB → LLM |
| `provision-applicant`      | Creates an auth user with canonical `<display_id>@college0.demo` email + role row when an application is accepted |
| `reset-applicant-password` | Registrar-only; resets an applicant's password back to the demo temp password |
| `bootstrap-demo-users`     | Idempotent seeder for the demo student / instructor / registrar accounts      |
| `index-kb-embeddings`      | Re-embeds `kb_docs` rows that don't have an embedding (uses OpenAI)           |

### 3. Set the demo seeds

Create `s-00001…s-00133`, the seeded instructors, the registrar, and the
courses they teach:

```sh
curl -X POST "https://<YOUR_REF>.supabase.co/functions/v1/bootstrap-demo-users" \
     -H "authorization: Bearer <YOUR_ANON_KEY>"
```

### 4. Configure the LLM fallback (optional but recommended)

The AI assistant uses Ollama for non-KB questions. In the Supabase
dashboard → **Functions → Secrets**, set the keys for whichever Ollama
deployment you have.

| Secret               | Purpose                                                                       |
|----------------------|-------------------------------------------------------------------------------|
| `OLLAMA_API_KEY`     | Ollama Cloud / Turbo. Defaults to `gpt-oss:20b`, override with `OLLAMA_MODEL` |
| `OLLAMA_URL`         | Self-hosted Ollama — must be a public URL the edge runtime can reach          |
| `DEMO_TEMP_PASSWORD` | Temp password handed to newly-accepted applicants (default `123456`)          |

Without these, the local KB still answers handbook questions; non-KB
questions return a "Ollama is not configured" message.

### 5. Point the frontend at your project

Edit `project/supabase-config.js`:

```js
window.SB_CONFIG = {
  url: "https://<YOUR_REF>.supabase.co",
  anonKey: "<YOUR_PUBLISHABLE_ANON_KEY>",
};
```

Then `python3 dev-server.py` and open `http://localhost:8421/College0.html`.

---

## Project structure

```
project/
├── College0.html              # entry point — loads React UMD, in-browser Babel, all components
├── styles.css                 # design system: tokens, theme, utility classes
├── data.js                    # COLLEGE_DATA seed: courses, students, transcripts, etc.
├── supabase-config.js         # SB URL + publishable anon key (committed; safe)
├── supabase-config.example.js # template for forks
├── supabase-client.js         # window.SB, window.freshSB, window.Backend (RPC wrapper)
└── components/
    ├── shared.jsx             # CollegeStore (in-memory store + Supabase hydration)
    ├── App.jsx                # routing, sidebar, role-gated nav
    ├── Login.jsx              # sign-in + quick-impersonate buttons
    ├── Landing.jsx            # public marketing page
    ├── ApplyPage.jsx          # visitor application + status check
    ├── Registration.jsx       # student course catalog + cart
    ├── StudentDash.jsx        # student "My dashboard"
    ├── StudentClassDetail.jsx # student private record per class
    ├── ClassDetail.jsx        # public class page (overview/reviews/syllabus/roster)
    ├── InstructorRoster.jsx   # instructor roster + grading
    ├── RegistrarDash.jsx      # admin console (apps, classes, phases, taboo, warnings)
    ├── BrowsePages.jsx        # public class browser, honor roll, lowest-rated, etc.
    ├── CmdK.jsx               # ⌘K command palette + Ask College0
    ├── Modals.jsx             # complaint, graduation, honor-redeem dialogs
    └── Tweaks.jsx             # design-tweak panel (dev-only)

supabase/
├── migrations/                # SQL migrations — schema, RLS, RPCs, seeds
└── functions/                 # 5 Deno edge functions (see table above)

dev-server.py                  # local static server with Cache-Control: no-store
README.handoff.md              # original Claude Design handoff bundle notes
```

---

## How the pieces fit

### Phases

`system_state.phase` is `1`–`4` (Class Set-up → Registration → Class Running →
Grading). The default is **2** so the demo opens in a state where every role
has something to do. The registrar can `setPhase` directly (Jump-to buttons)
or `advance_phase` (runs end-of-phase policy: cancels under-enrolled classes,
warns instructors, opens special re-registration windows, etc.).

### RLS + RPCs

- Every table has RLS on. Anonymous can submit applications and read public
  things (course catalog, top reviews) but nothing personal.
- Mutations that need policy logic (accepting an application, registering for
  a course, posting grades, deciding a graduation app, resolving a complaint)
  go through `SECURITY DEFINER` RPC functions that re-check the caller's role
  before doing the work.
- Reviews are anonymous to students and instructors. The registrar reads them
  through `reviews_with_authors` (a view gated by `is_registrar()`).
- A `before insert` trigger on `graduation_applications` auto-rejects filings
  with non-empty `missing_codes` and issues the reckless-application warning
  immediately, so students get instant feedback without registrar action.

### `freshSB()` workaround

The long-lived `supabase-js` client occasionally deadlocks on writes after a
fresh `signInWithPassword` (in-memory auth state interacts badly with the
realtime channel). `window.freshSB()` returns a one-shot client that adopts
the access token from `localStorage` and disables persistence, auto-refresh,
and realtime. All write paths (`Backend.signIn`, course CRUD, registrations,
grades, taboo updates, etc.) use it. Reads from the long-lived client work
normally for the in-app store hydration.

### AI assistant pipeline

`Backend.aiAsk(question)` POSTs to `/functions/v1/ai-query` with the user's
access token. The function evaluates these in order, returning the first hit:

1. **Role gate** — visitors can't ask about specific students; students can't
   ask roster-wide queries.
2. **User-context fast paths** — "what's my GPA?", "what classes am I in?",
   "who's at risk?" are answered directly from the DB.
3. **Lexical KB search** — token-overlap match against `kb_docs` (stopwords
   filtered, 4-char minimum, ≥2 meaningful hits required).
4. **LLM fallback** — Ollama (Cloud Turbo or self-hosted). The system prompt
   always appends *"Please verify with the registrar."*

Every answer comes back as `{ body, source, kind }` so the UI can show the
attribution chip.

### Realtime

`courses`, `enrollments`, `applications`, `warnings`, `honors`, `complaints`,
and `system_state` are in the `supabase_realtime` publication. The store
subscribes once at boot and triggers a debounced `refreshFromBackend()` on
any change, so registrar adds + student enrolls show up across windows
without a page refresh.

---

## License

MIT.
