# Orovelia

Company website — React + Vite + React Router.

## Getting started

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Pages

| Route       | Page                                                          |
| ----------- | ------------------------------------------------------------- |
| `/`         | Landing page                                                  |
| `/products` | Product showcase, deep-dives, integrations, pricing           |
| `/about`    | Story, values, timeline, leadership, offices                  |
| `/careers`  | Perks and open roles                                          |
| `/help`     | Searchable FAQ, system status, team directory, support        |
| `/contact`  | Contact form and offices                                      |

Team profiles can be linked directly: `/help?member=elena-voss`.

## Editing content

All copy lives in `src/data/` — edit these instead of the components:

- `team.js` — team members (set `photo` to an image URL to replace initials)
- `products.js` — products, pricing plans, comparison table
- `help.js` — help categories, FAQs, support channels
- `company.js` — values, milestones, jobs, perks, offices

## Structure

```
src/
  App.jsx          routes
  index.css        design tokens, home page styles
  pages.css        inner page styles and shared effects
  pages/           one file per route
  components/      shared UI (Layout, Navbar, TiltCard, Magnetic, …)
  hooks/           useReveal, useNow
  data/            editable content
```

## Deploying

The site uses client-side routing, so the host must serve `index.html` for
unknown paths (Netlify `_redirects`, Vercel rewrites, etc.).
