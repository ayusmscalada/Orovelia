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
| `/login`        | Log in, or explore with a demo profile                               |
| `/dashboard`    | Overview, applications (stage tracker), saved jobs, messages, profile, settings |

Search filters live in the URL, e.g. `/jobs?q=cook&loc=nashville&type=Full-time`.
Team profiles can be linked directly: `/help?member=lucia-romero`.

## Supabase (sign up & log in)

Accounts and candidate profiles live in Supabase.

1. **Create the table.** In the Supabase dashboard open **SQL Editor**, paste
   [supabase/migrations/0001_profiles.sql](supabase/migrations/0001_profiles.sql)
   and run it. It creates `public.profiles` with row level security, a trigger
   that creates each user's profile from the sign-up form, and a
   `delete_my_account()` function.
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

## Still front-end only

Saved jobs, applications, messages and notifications are kept in the
browser's `localStorage` (per signed-in user) by
[src/store/AppStore.jsx](src/store/AppStore.jsx) until they get their own tables.

To make the demo feel alive, the store **simulates recruiter activity**:
recruiters auto-reply to messages, and new applications move to *Shortlisted*
after ~25s and *Interview* after a further ~45s. Remove `AUTO_ADVANCE` and
`replyFor` once real data arrives. The employer and contact forms don't send
anywhere yet.

## Editing content

All copy lives in `src/data/`:

- `jobs.js` — industries, occupations and job listings
- `team.js` — recruiters and staff (set `photo` to an image URL to replace initials)
- `help.js` — FAQs, safety tips, support channels
- `company.js` — steps, values, stories, partners, offices

## Structure

```
src/
  App.jsx          routes
  lib/supabase.js  Supabase client + profile row mapping
  store/           auth (Supabase) + app state (applications, messages) + simulation
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
