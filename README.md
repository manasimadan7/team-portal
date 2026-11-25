# Placement Portal

A clickable prototype of a **team-facing placement management app**: the workspace a college placement team uses to run company outreach, verify student resumes and coordinate with each other.

**▶ Live demo:** https://manasimadan7.github.io/team-portal/

> All data is dummy data. Nothing is saved to a server, so refreshing resets the demo.

## What you can try

| Page | What it does |
| --- | --- |
| **Home** | Your profile, an interactive outreach funnel (hover or tap a bar), ring stats, notes and *My Companies*. Expand a company to see its contact history; tap its status pill to change it. |
| **Resume** | Review students' resume points: approve, write feedback, and open the proof (attachment) with zoom. |
| **Companies** | *All*, *Assigned* and *Self Allot* tabs. Search, filter by status, tag teammates, claim open companies, and draft an email with the AI mail assistant. |
| **Kanban** | The outreach pipeline at a glance. Drag companies between stages (or use *Move* on phones), and open a company to see its remarks. |
| **Company page** | Hiring history chart by year and editable key notes. |
| **Team** | The placement team, filterable by role. Open anyone's dashboard, or message them in the built-in chat. |

There's also a **Desktop / Phone** toggle at the bottom of the screen that previews the phone layout inside a phone frame. Add `?splash` to the URL to replay the splash screen.

## Run it locally

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173).

```bash
npm run build     # production build into dist/
```

## How it's built

- **React 18 + TypeScript + Vite**, with no UI library: every component is hand-built to match the Figma designs.
- **Desktop:** pages are laid out at the exact 1728×1117 design coordinates, then scaled to fit the window.
- **Phones (≤ 899px):** each page switches to its own fluid one-column layout, with a bottom tab bar.
- [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) documents the tokens, typography, components, interaction states and phone rules.

```
src/
  pages/        Home, Resume, Companies, Kanban, CompanyDetail, Team
  components/   Sidebar, Frame (scaling), Chat, MailComposer, Splash, DevicePreview, …
  data/         dummy data
  state/        shared app state (navigation, history, mail, toasts)
  styles/       design tokens, global and interaction-state styles
```

## Deploying

Every push to `main` builds the app and publishes it to GitHub Pages through [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Feedback

Found something confusing or broken? [Open an issue](../../issues). Screenshots and the device you were on help a lot.
