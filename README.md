# Orovelia

A recruiter-led job marketplace for local, hourly and skilled work — React + Vite + React Router.

## Getting started

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Pages

| Route           | Page                                                                 |
| --------------- | -------------------------------------------------------------------- |
| `/`             | Landing: job search, latest jobs, industries, how it works, stories  |
| `/jobs`         | Job search with keyword/location, industry, type, pay and remote filters |
| `/jobs/:id`     | Job detail, “I’m interested”, recruiter card, similar jobs           |
| `/industries`   | All industries and occupations                                       |
| `/how-it-works` | Candidate steps, application stages, trust & safety                  |
| `/employers`    | Become a hiring partner (form), partners, how we recruit             |
| `/about`        | Story, values, timeline, leadership, offices                         |
| `/help`         | Searchable FAQ, safety, team directory, support channels             |
| `/contact`      | Contact form                                                          |
| `/signup`       | 4-step profile builder                                               |
| `/login`        | Log in; forgot password                                              |
| `/dashboard`    | Candidate: overview, applications (stage tracker), saved jobs, messages, profile, settings |
| `/admin`        | Admin: overview, jobs (post / edit / close / delete), applicant pipeline, candidates, messages |

Search filters live in the URL, e.g. `/jobs?q=cook&loc=nashville&type=Full-time`.
Team profiles can be linked directly: `/help?member=lucia-romero`.

## Supabase

Accounts, profiles, jobs, applications, saved jobs and messages all live in Supabase.

1. **Create the tables.** In the Supabase dashboard open **SQL Editor** and run,
   in order:
   - [0001_profiles.sql](supabase/migrations/0001_profiles.sql) — profiles, sign-up trigger, `delete_my_account()`
   - [0002_marketplace.sql](supabase/migrations/0002_marketplace.sql) — admin role + allowlist, `jobs`,
     `applications`, `saved_jobs`, `messages`, row level security, Realtime
   - [0003_seed_jobs.sql](supabase/migrations/0003_seed_jobs.sql) — the 28 starter listings
     (regenerate with `node scripts/generate-job-seed.mjs`)

   All three are safe to re-run.
2. **Add your keys.** Copy `.env.example` to `.env.local` and set
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
   (Project Settings → API Keys). Use the **publishable** key only — the
   secret key must never be put in front-end code. Restart `npm run dev`.
3. **Allow the redirect URLs.** In Authentication → URL Configuration, set the
   Site URL to your production domain and add `http://localhost:5173/**`
   (plus your production domain with `/**`) to Redirect URLs, so confirmation
   and password-reset links can return to the app.

Flows: sign up (4-step profile + password) → confirmation email → dashboard;
log in with email and password; forgot password → email link →
`/reset-password`; profile edits save to `profiles`; Settings → Delete account
removes the user.

## Admin

Admins are the Orovelia team. Emails in `public.admin_allowlist` become admins
automatically when their account is created; everyone else is a candidate, and
nobody can change their own role from the app. The first admin is
**support@orovelia.com (Austin Parker)**.

**Create the admin account:** Supabase → Authentication → Users → *Add user* →
*Create new user* with `support@orovelia.com`, a password, and *Auto Confirm
User* ticked. Then log in on the site — you land on `/admin`.

**Add another admin:**

```sql
insert into public.admin_allowlist (email, full_name, phone)
values ('name@orovelia.com', 'Full Name', '+1 …');
-- If that person already has an account, also run:
update public.profiles set role = 'admin' where email = 'name@orovelia.com';
```

What admins can do:

- **Jobs** — post, edit, close/reopen and delete listings (live on the site immediately)
- **Pipeline** — per job, drag candidates between Interested → Shortlisted →
  Interview → Offer → Hired / Not selected; candidates see each change live
- **Candidates** — search all job seekers, view full profiles and applications
- **Messages** — one conversation per candidate, with job tags and read receipts;
  candidates' “I'm interested” posts an intro message automatically

Without Supabase configured the public site still works using the starter jobs in
`src/data/jobs.js`; accounts and the admin area need Supabase. The employer and
contact forms don't send anywhere yet.

## Editing content

All copy lives in `src/data/`:

- `jobs.js` — industries, occupations and the starter job listings
- `team.js` — recruiters and staff (set `photo` to an image URL to replace initials)
- `help.js` — FAQs, safety tips, support channels
- `company.js` — steps, values, stories, partners, offices

## Structure

```
src/
  App.jsx          routes
  lib/supabase.js  Supabase client, row mapping, public jobs fetch
  store/           JobsStore (public jobs) + AppStore (auth, candidate activity, realtime)
  admin/           AdminStore (all jobs, applicants, candidates, messages) + admin.css
  pages/admin/     admin screens
  pages/           one file per route
  components/      shared UI (JobCard, SearchBar, StageTracker, ProfileFields, …)
  data/            editable content
  utils/format.js  pay / date helpers
  index.css        design tokens, home page styles
  pages.css        inner page styles and shared effects
  market.css       marketplace UI (jobs, filters, auth, dashboard)
```

## Deploying

The site uses client-side routing, so the host must serve `index.html` for
unknown paths (Netlify `_redirects`, Vercel rewrites, etc.).
