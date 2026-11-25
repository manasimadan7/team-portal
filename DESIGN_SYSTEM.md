# Placement Portal — Design System Notes

Source: Figma file **P1| PORTAL** (`JX0xyh7Vgm576SWqoAho6E`).
Code tokens live in [app/src/styles/tokens.css](src/styles/tokens.css) — names mirror the Figma variable paths (`text/default/alt-1` → `--text-default-alt-1`).

Pages built so far: **Home** (node `263:1720`), **Resume verification** (nodes `310:14234` default, `310:14369` feedback open), **Companies** (section `286:11564`; tabs All `282:10824`, Assigned `285:11321`, Self Allot `282:10068`). Companies expand states: Self Allot expanded `282:10217`, All/Assigned history (approx.) `139:1979`, AI mail composer `293:11993` → `293:12221` → `293:12440`. **Team** (`263:3130`) + in-app team chat (no Figma). **Company detail** — view `139:4571` / edit `139:4229`. **Outreach kanban** — `139:2340` (opened from `139:2361`), expanded `139:3016`.

---

## Artboard
- Frame: **MacBook Pro 16" — 1728 × 1117**, white, radius **30**.
- The app renders this artboard at exact design px and scales it uniformly to the window ([Frame.tsx](src/components/Frame.tsx)).
- Sidebar is **123px** wide; content starts at **x = 194**.

## Responsive (phones)
- **≥ 900px wide** (laptop, desktop, tablet landscape): the scaled 1728×1117 artboard above.
- **≤ 899px wide** (phones, tablet portrait): no scaling — every page reflows via its `@media (max-width: 899px)` block. Positions from Figma are overridden to normal document flow, stacked in one column with 16px gutters.
- Sidebar → **floating pill tab bar**: purple, 72px tall, 36px radius, 12px in from the screen edges and bottom. Each tab shows an icon with a 12px white label. The active tab is an 84px white circle that rises 22px out of the bar, ringed 6px in purple, with the dark icon and a purple label. The chat button sits above it (bottom 124px), and the chat panel stops at 96px.
- Chat button floats above the tab bar; chat opens full-screen. The mail composer is pinned to the bottom and scaled to the screen width; the AI agent card floats at the top.
- Tables become stacked cards (Team), horizontal filter rows scroll sideways (chips, roles, students), the Company detail chart becomes horizontal bars.
- Minimum tap target on phones is ~36–40px; inputs use 16px text so iOS doesn't zoom on focus.
- **Phone hierarchy (phone-only; desktop untouched):**
  - **Home:** profile → an "Outreach funnel" card (bar chart) → the four ring stats on one row (62px rings) → Notes. My Companies is dropped from your own Home, since it's under Companies → Assigned. A coordinator's dashboard keeps their list.
  - **Resume:** a "Reviewing ‹student› · Change" bar opens the Assigned Students list as a drawer from the left, with a scrim and close button; picking a student closes it. The paperclip (proof) on a card opens the attachment as a full-screen sheet with a close button. On phones, zoom scales the page relative to the screen width.
  - **Team:** a single filter row (the coloured role legend, scrolling sideways); the duplicate grey role chips are hidden. Rows read name → role badge → companies (muted), all aligned under the name.
  - **Companies → All:** cards read name + date → notes → a meta row with the team icons on the left and actions on the right.
- **Desktop / Phone preview toggle** ([DevicePreview.tsx](src/components/DevicePreview.tsx)) is a prototype tool, not product UI:
  - A dark pill sits at the bottom centre of the window.
  - **Phone** loads the same app in a 390×844 phone mockup, using an iframe with `?embed`. It has a 44px status-bar strip under the notch, so the real ≤899px layout runs exactly as on a device. Scrollbars are hidden as on a phone.
  - The choice is remembered per browser in localStorage (`pp-device`).
  - The toggle is hidden when the window is already phone-sized.
  - Switching resets the app state, because it reloads the view.

## Dummy data
- Every list uses distinct, realistic companies (no repeated placeholders):
  - My Companies: 10.
  - Companies → All: 16. Assigned is the 7 marked `mine`, plus any claimed companies.
  - Self Allot: 12, each with its own categories, JDs per category and two named contacts.
  - Kanban: the full board.
- Status and category chip counts on the Companies page are computed live from the data. Contacted, IAF Filled and Reject are counted live. Shortlist and Interviews keep the designed counts, since rows don't carry those statuses.
- Contact history openers vary per company.

## Interaction states ([states.css](src/styles/states.css))
Every control has hover, pressed (`:active`), keyboard focus (`:focus-visible`, 2px primary outline) and disabled (`not-allowed`, 40–50% opacity) states, grouped by family:
| Family | Hover | Pressed |
|---|---|---|
| Icon-only buttons (mail, edit, dropdown, ↗, send…) | lavender halo `rgba(119,89,184,.09)` | halo `.18` + scale .92 |
| Icon buttons with their own surface (view toggles, viewer zoom, round icon buttons) | brightness .95 | brightness .88 + scale .93 |
| Light filled buttons (Add Company, Feedback, Tag, Claimed, EDIT) | brightness .95 | brightness .88 + scale .96 |
| Primary buttons (Approve, Claim, SAVE, Send) | brightness 1.1 + soft purple shadow | brightness .9 + scale .96 |
| Chips / tabs / pills | brightness .96 | brightness .9 + scale .96 |
| Text links (company names, Source, POC lines) | primary colour + underline | opacity .6–.7 |
| Cards & rows | soft shadow / lavender stroke | tighter shadow |
| Inputs & search fields | stroke `#9378AF` | focus: primary stroke + 3px `rgba(119,89,184,.15)` ring |
- Sidebar: white halo behind inactive icons on hover; scale .92 on press.
- Toggles/selected states: primary ring `rgba(119,89,184,.45)` (view toggles), filled pill (tabs), inset outline (chips).
- Touch screens (`hover: none`): no sticky hover; hidden-on-hover buttons (row message, mark-done) are always visible. `prefers-reduced-motion` disables transitions.

## Scrollbars ([ScrollTrack.tsx](src/components/ScrollTrack.tsx))
Real scrollbars in each page's Figma style. The track spans the **full height of the scrolling list**; the thumb is sized to the visible fraction, follows scrolling, can be **dragged**, and clicking the track jumps there. It hides when nothing scrolls, and on phones (native scrolling instead).
- Home 10px `#EADDFF` / thumb `rgba(177,143,215,.3)` · Companies 10px `rgba(177,143,215,.1)` / `.3` · Resume hairline `rgba(177,143,215,.2)` / `rgba(147,120,175,.7)` · Team 4px `#D1D9E0` / `#59636E`. All darken on hover/drag.

## Typography
Font: **DM Sans** (Google Fonts), optical size axis fixed at `opsz 14`. Weights used: 400, 500.

| Style (Figma)               | Size    | Weight | Line height | Tracking  |
|-----------------------------|---------|--------|-------------|-----------|
| Typography/24/Regular       | 24      | 400    | 1.2         | -0.3      |
| Typography/16/Medium        | 16      | 500    | 1.2         | -0.3      |
| Typography/16/Regular       | 16      | 400    | 1.2         | -0.414    |
| Typography/13.78/Regular    | 13.78   | 400    | 1.2         | -0.344    |
| Typography/12/Regular       | 12      | 400    | 1.3         | 0         |
| Typography/11.71/Regular    | 11.71   | 400    | 1.2         | -0.22     |
| Typography/32/Regular       | 32      | 400    | 1.3         | 0         |
| Typography/24/Regular (1.3) | 24      | 400    | 1.3         | 0         |
| Typography/16/Medium (1.3)  | 16      | 500    | 1.3         | 0         |
| Typography/16/Regular (1.3) | 16      | 400    | 1.3         | 0         |
| Typography/16/Light         | 16      | 300    | 1.3         | 0         |
| Small button label (raw)    | 14      | 500    | 1.2         | -0.433    |

| Typography/32/Medium (Companies title) | 32 | 500 | 1.2 | -0.3 |
| Segmented control label (raw) | 23.93 | 400 | 1.2 | -0.449 |
| **Roboto** 22/Regular (M3 title-large) | 22 | 400 | 28px | 0 |
| **Roboto** 14/Regular (supporting) | 14 | 400 | 20px | +0.25 |

> The Resume page uses a 1.3 line-height / 0 tracking type scale, while Home uses 1.2 with negative tracking. Both are kept as designed — worth unifying in Figma later.
> The Companies All/Assigned rows use **Roboto** (Material 3 list item) while everything else is DM Sans; Self Allot rows use DM Sans at the same sizes. Kept as designed — another candidate to unify.
| List headline (raw)         | 20      | 500    | 20px        | +0.25     |
| List supporting (raw)       | 16      | 400    | 20px        | +0.25     |
| Chip / pill label (raw)     | 16      | 500    | 1.2         | -0.433    |
| Chart caption (raw)         | 12.77   | 400    | 1.2         | -0.383    |

## Colour

**Brand**
- `primary` `#7759B8` — sidebar, funnel bars
- `light accent / L` `#F4EBFB` — panel stroke, text on purple bars
- `surface/accent/alt-1` / `border/alt-5` `#9378AF` — icon accents
- `surface/subtle/alt-5` / `border/primary` `#EADDFF` — soft lavender (arrow buttons, scroll track)

**Lavender surfaces (Resume page)**
- `color/neutral/0-248-244-251` `#F8F4FB` — side panels (+ `backdrop-blur 11.4`)
- `surface/accent/alt-2` `rgba(177,143,215,.10)` — counter pill
- `surface/accent/alt-3` `rgba(177,143,215,.15)` — small icon chips
- `surface/accent/alt-4` `rgba(177,143,215,.30)` — selected student pill
- `border/alt-9` `rgba(177,143,215,.30)` — card stroke (selected card → `primary`)
- `dark accent / L` `#463C64` — zoom % label

**Text**
- `text/strong/alt-2` `#000000` — Resume page headings and card copy
- `text/default/alt-1` `#4A4A4A` — headings, body
- `text/default/primary` `#636363` — secondary body, placeholders
- `text/default/alt-4` `#625B71` — emphasised secondary (note company, buttons)
- `text/default/alt-3` `#BBBBBB`, `text/strong/primary` `rgba(0,0,0,.3)` — disabled/inactive
- Chart accents: `alt-10` `#7A78AF`, `alt-13` `#9878AF`, `alt-14` `#9591F8`
- List: headline `#7A6F85`, supporting `#49454F` (raw, not variables)

**Surfaces**
- `surface/base/primary` `#FFFFFF`
- `surface/accent/primary` / `neutral/1000-a3` `rgba(0,0,0,.03)` — cards (profile), captions, inactive chip
- `neutral/1000-a2` `rgba(0,0,0,.02)` — Notes card

**Status palette** (pill bg / fg)
| Status              | Background                | Foreground |
|---------------------|---------------------------|------------|
| Contacted           | `rgba(232,161,0,.10)`     | `#E8A100`  |
| IAF Filled (pill)   | `rgba(67,163,94,.10)`     | `#43A35E`  |
| IAF Filled (chip)   | `#ECFDF3`                 | `#166534`  |
| Uncontacted         | `rgba(220,38,38,.12)`     | `#DC264D`  |
| Shortlist Released  | `rgba(153,164,255,.20)`   | `#9591F8`  |
| Reject              | `rgba(210,46,46,.60)`     | `#FFFFFF`  |
| Interviews (inactive)| `rgba(0,0,0,.03)`        | `rgba(0,0,0,.3)` |

> Note: the IAF Filled chip and the IAF Filled row pill use different greens in Figma — kept as designed.

**Team page / role palette** (GitHub-style table + M3 role tones)
- Table: surface `#FFFFFF`, header `surface/base/alt-1` `#F6F8FA`, borders `border/alt-6` `#D1D9E0`, header text `text/default/alt-5` `#59636E`, body text `text/strong/alt-1` `#1F2328`; scrollbar track `#D1D9E0`, thumb `#59636E`.
- Roles: Internship Coordinator `#E8DEF8` / `#6750A4` · Associate Placement Coordinator `#E8F5E9` / `#2E7D32` · Company Coordinator `#FFF3E0` / `#E65100`. These also tint chat avatars.

**Company status dots** (16px): contacted `#E8A100` · IAF filled `#689A52` · reject `#D22E2E`.

**Action buttons**: `secondary` `#D0BCFF` with `dark accent / D` `#322A4C` text (Tag) · `primary` with `#F4EBFB` text (Claim / Approve).

**Borders**: `alt-8` `#BBBBBB` (inputs), `alt-12` `#D9D9D9`, `alt-16` `#EAEAEA`, `alt-9` `rgba(177,143,215,.3)` (scroll thumb).

## Radius
`5` small action buttons · `8` input · `10` inner cards/rows/side panels · `12.77` chart bars & captions · `20` cards/panels/count bubbles · `28.89` pills & chips · `30` artboard & icon chips · `36.6` pill buttons · `40` selection pill · `100` circles.

## Strokes
Figma strokes are drawn **inside** the shape without moving its children. In code, panel/card strokes are drawn with an `::after` overlay (not `border`) so child coordinates stay identical to Figma.

## Elevation
`Elevation/2` — drop shadow `0 2.93 2.93 rgba(0,0,0,.25)` (Add Company button, table toggle).

## Components (code ↔ Figma)
| Component | Code | Figma |
|---|---|---|
| Sidebar navigation (Home/Resume/Team/Companies, active = white 131px circle w/ 11px purple ring) | `components/Sidebar.tsx` | `182:1301` |
| Status pill (contacted / Iaf Filled / Uncontacted), 115×41 | `components/StatusPill.tsx` | `Frame 2687` |
| Filter chip with count bubble (white, r20, 33px) | `.chip` in `components/StatusChips.css` | `263:1829` |
| Search field 323×32 | `.search` | `Search Staff` |
| Pill button (Add Company) | `.add-company` | `263:1825` |
| Arrow up-right button (32 / 44) | asset svgs | `Arrow up-right` |
| List item (headline + supporting, M3 style) | `.company-row` | `List item` |
| Resume point card — pending 180h / approved 128h / feedback open 334h, 545w | `components/ResumePointCard.tsx` | `Frame 2692` (`310:14504`) |
| Small action buttons: Feedback (114×26, lavender) · Approve (95×26, primary) · attachment (28, white) | `.rp-btn` | inside `310:14509` |
| Feedback box (496×132, `#F4EBFB`, r10, send icon) | `.rp-card__feedback` | `310:14546` |
| Lavender side panel (`#F8F4FB`, blur, r10) | `.students`, `.review` | `313:14972`, `310:14337` |
| Selectable list w/ pill highlight (Assigned Students) | `.student` | `313:15084` |
| Attachment viewer w/ zoom controls (617×793) | `.viewer` | `310:14346` |
| Counter pill (`0/150`) | `.resume__counter` | `310:14324` |
| Status filter chips (shared Home + Companies) | `components/StatusChips.css` | `263:1829`, `282:10959` |
| Segmented control All / Assigned / Self Allot (417×57, sliding primary pill) | `.segmented` | `282:10982` |
| Round icon button (58×57, `#F4EBFB`) — list view, insights | `.cp-icon-btn` | `282:10825/6` |
| Company row, M3 list item (1322×140, status dot, actions) | `.co-row` | `282:10829` |
| Assigned-team avatars (32px `perm_identity`, gap 10) | `.co-row__team` | `282:11042…` |
| Category chips (neutral `.03` bg, `#636363`) + total chip | `.cat-chip` | `282:10076` |
| Open company row (1322×90, tags, Tag / Claim / Source) | `.open-row` | `282:10105` |
| Expanded open company (342h): JD per tag + source icon, POC cards, actions bottom-right | `.open-row.is-expanded`, `.open-jd`, `.poc` | `282:10217` |
| POC card (`.03` bg, r10, `#463C64` text, phone + mail lines) | `.poc` | `282:10222` |
| Company history (M3 list item, dates 22px `#CAC4D0`, notes 14px `#49454F`, input 301×30 r5; leading image removed) | `.co-history` | `139:1979` |
| Tag picker (type-ahead team members) — **not in Figma** | `components/TagPicker.tsx` | — |
| Mail composer (exported compose image + editable overlays, Inter 13.14) | `components/MailComposer.tsx` | `293:12388` |
| AI agent card (290×203, r40, radial lavender gradient, inset `#F4EBFB` shadow; note 16px `rgba(0,0,0,.3)`) | `.agent-card` | `293:12383` |
| Team table (1481×826, r16; header Inter 12/600; rows 56px, 40px avatar, DM Sans 16/500 name) | `.team-table` | `263:3153` |
| Role badge (Inter 12, px10 py4, pill) + role legend pill with 8px dot | `.team-badge`, `.team-legend__pill` | `263:3165`, `263:3302` |
| Round view toggle (46px white, Elevation/6 shadow; grid = 4 squares `#9378AF`, list = 2 bars `#CAC4D0`) | `.team-toggle` | `263:3140/7` |
| Team chat — launcher (60px primary, red unread badge) + panel (400×616, r20) — **not in Figma** | `components/chat/` | — |
| Company detail card (1481×840, `#D9D9D9` stroke, r20) | `pages/CompanyDetail.tsx` | `139:4573` |
| Hires bar chart (y 0–18, `#EADDFF` grid, bars 28px `#E8DEF8`, selected year = white pill w/ Elevation/7) | `.cd-chart` | `139:4578` |
| Year picker chip (`rgba(177,143,215,.1)`, r40, 24/600 `#7E6599`) + open list (141×256, r22, `#CAC4D0` stroke, years 24/600 `#80828D`) | `.cd-years` | `139:4639`, `139:4673` |
| Key Notes card (896×389, `.02` bg, r20) — view: labels 16/500 `#7E6599`, values `#4A4A4A`, eligibility 16/300 bullets; edit: inline inputs + white editor | `.cd-notes` | `139:4669` / `139:4327` |
| SAVE button (107w, `#9378AF`, r10, 16/600 white) · EDIT / CANCEL (light variant, not in Figma) | `.cd-btn` | `139:4332` |
| Scrollbar (Figma style, functional) | `components/ScrollTrack.tsx` | `263:1723`, `282:10955`, `310:14340`, `263:3299` |
| Shared contact history (full + compact) | `components/CompanyHistory.tsx` | `139:1979` |

## Icons
All exported from Figma into `app/src/assets/icons/` (never redrawn). Sidebar icons are white on purple; the active one is dark inside the white indicator and shifts a few px right to sit centred in it. Exported so far: Home, Resume and Companies (active + inactive). Team active variant still pending.

Decorative blurred ellipses ("glows") are exported SVGs with the blur baked in; they're placed by their centre and rotated as in Figma.

## Prototype behaviour (Home)
- Sidebar buttons switch the active page (indicator animates).
- Search filters My Companies by name/comment; chips filter by status (Contacted / IAF counts are live).
- The date beside the company name in a row (`.company-row__date`) is 13px regular in `--text-default-alt-4`. Figma sets it at 20px medium; it was made smaller on request.
- Row **dropdown** expands the row into the contact history with an update input. There's no status picker, since the pill already shows the status. **Clicking the status pill** cycles Uncontacted → Contacted → IAF Filled. History dates are small and muted: 15px in the Companies dropdown and 12px on Home (11px on phones), at 75% opacity.
- **Funnel chart is interactive.** Hovering or focusing a bar highlights it with a lift and shadow, dims the other bars and captions, and shows a dark tooltip: stage name, value, % of allotted, % from the previous stage, and drop-off to the next stage. Clicking or tapping pins the tooltip, and clicking or tapping again closes it. The hit area covers the bar column plus its caption. On phones the tooltip sits above the column and stays inside the screen. **Pencil** opens it straight into the input. **Mail** opens the AI mail plugin.
- **Add Company** opens a small form; the new company goes to the top as Uncontacted.
- List / table toggles switch between the designed list and a compact one-line table.
- **↗ on My Companies** opens Companies → Assigned. **+ on Notes** (replaces Figma's ↗; same 44px `#BBBBBB` 3.5px stroke style, turns into × while open) opens an add-note form; hovering a note shows ✓ to mark it done.
- Company names open the company detail page.

## Splash screen ([Splash.tsx](src/components/Splash.tsx))
- Built from the agent logo **Frame 2723 (293:12215)**. Figma only exports it flattened, so the SVG was split into three layers that keep the exact Figma paths, gradients and 59.43×60.67 canvas: `logo-bg.svg` (gradient circle + shadows), `logo-flower.svg` ("Exclude" — the 4-lobed flower), `logo-diamond.svg` ("Union" — the white diamond).
- **Flower spins clockwise (6s/turn), diamond spins anticlockwise (3.6s/turn)**, each around its own centre (transform-origin taken from the SVG coordinates). Logo 178px (132px on phones) on a radial lavender background with a pulsing `#D0BCFF` halo, "Placement Portal" title (DM Sans 30/500) + subtitle + loading dots.
- **Zoom into the flower:** the three layers sit in a `.splash__zoom` wrapper whose transform-origin is the flower's centre (50% 42.857%). While spinning it pushes in slowly from scale 1 to 1.45 (2.6s, ease-in-out, 0.3s delay). On exit it **zooms out**: a small swell, then it shrinks to scale 0.05 (0.8s, back-ease `cubic-bezier(0.5,-0.45,0.75,0.6)`). The logo fades from 0.45s and the overlay fades from 0.5s. Both are CSS transitions, so the zoom-out starts from wherever the push-in has reached.
- Spin speed: flower 2.4s per turn clockwise, diamond 1.5s per turn anticlockwise.
- Shows on first load of each browser session for ~2.6s, then exits (0.9s total). Click/tap or any key skips. Add **`?splash`** to the URL to replay it and hold it on screen until clicked. With reduced motion the spin slows to 20s/turn instead of stopping.
- Not in Figma as a screen — layout, background, copy and timing are additions.

## Prototype behaviour (Outreach kanban — 139:2340)
- **How to get there:**
  - Home → My Companies header → **List | Kanban** toggle (lavender pill; white active segment; uses the Figma list bars and table glyph). Replaces Figma's two round icons; the search field now flexes to make room.
  - Companies → **All** or **Assigned** → the round **List / Kanban** buttons top-right (captioned; Kanban replaces Figma's Insights button). Assigned opens the *My Companies* board, All opens the *All Companies* board. Disabled on Self Allot. On phones it's a "Kanban" pill next to the title.
  - On the board, the **list** toggle returns to where you came from (Home, or the same Companies tab).
- One board for everything: *All Companies* shows every company, *My Companies* is the same board filtered to yours — moving a company on one shows on the other. Sidebar shows Companies.
- Seven stage columns: Contacted → IAF Filled → IAF Opened → IAF Closed → Shortlist released → Interviews Conducted → Selections out, each with a live count.
- **Drag a company badge to another column** to move it (column highlights while dragging; toast confirms). Click a badge or name to open the company page; Back returns to the board.
- Search dims non-matching badges and outlines matches. Add Company puts a new badge in Contacted.
- Board scrolls sideways; the 16px `#D1CFFF` scrollbar (139:2370) follows and can be dragged. Each column scrolls vertically when it overflows.
- Toggles: list → Home (My Companies list), grid → Companies page, kanban (purple) = current. Board changes persist while the app is open.
- **Expanded state (139:3016):** clicking a company (badge or name) selects it — columns shorten to 431px (body 312×319, card 291), the badge gets a white 67×82 r10 tile with Elevation/6, the scrollbar moves up (8px, y 693), and a detail panel opens below (1502×344, `.03` bg, r10): company name 20/500 at left, the stage timeline (dates 22px `#CAC4D0`, notes 14px `#49454F`), and a white **Remarks** card (823×287) showing the company's eligibility criteria (from its saved Key Notes, else the Figma copy). Click the same company again, ×, or Esc to collapse. Selection survives opening the company page and coming back.
- Additions not in Figma: stage name + "Open company page ↗" under the name, an Edit button on Remarks (opens the company page's Key Notes), and the × close.
- Components: column = chevron header (`#B18FD7`, 360.5×112, columns overlap by 37px) + lavender body 312×686 + white card 273×666 r10; stage label 273/230×70 white r10 (DM Sans 20/500, count `#625B71`; two-line labels 16px); badge = 52px `#EADDFF`-stroked pill with 40px users icon + 12/500 `#636363` name.
- Deviations: Figma repeats placeholder names to fill columns, so the board uses unique companies and counts reflect the real number of badges (Contacted shows 28, not 50). Long names truncate with "…". Drag-and-drop uses mouse drag; on touch screens and phones each badge shows a **Move** pill (lavender, 30px) that opens a stage picker — a bottom sheet on phones, a centred dialog on desktop — listing every stage with its count (current stage greyed). Keyboard users get the same Move button on focus. Not in Figma.

## Prototype behaviour (Coordinator dashboards)
- Clicking a coordinator's name (Team page, or a DM header in chat) opens their dashboard: the Home layout (263:1720) filled with their stats — profile, rings, funnel, "<Name>'s Companies", notes. Sidebar stays on Team.
- Header bar (not in Figma): back / "Placement Team / Name" breadcrumb, role badge, **Message <Name>** (opens chat). Clicking your own name opens your Home.
- Stats and companies are generated per person (deterministic prototype data, `data/memberDashboard.ts`); bar heights follow the Figma bars' value→height curve, values sit centred inside the bar or above it when the bar is short.

## Prototype behaviour (Company detail)
- Opened by clicking any company name (Home, Companies All / Assigned / Self Allot). Back chevron or "Companies" returns to where you came from (same tab).
- Search jumps to another company (type, pick a suggestion or press Enter).
- Chart: bars and year labels select a year (white pill); the year chip opens the year list; the timeline follows the selected year.
- Key Notes: a company with nothing saved opens in **edit** (Selections, Slot, Eligibility — placeholder copy from Figma). **SAVE** → view state (first eligibility line = heading, the rest = bullets) with an **EDIT** button; EDIT re-opens the form pre-filled, with **CANCEL**. Saved notes persist while the app is open.

## Prototype behaviour (Resume)
- Click a student → loads their work experience + PORs; the pill highlight moves.
- Card click selects it (primary stroke) and shows its attachment; the company name appears beside "Attachment".
- **Approve** → card collapses to the approved state with the green check; click the check to undo.
- **Feedback** → card expands with the feedback box; send closes it (draft is kept).
- Viewer: feedback icon opens feedback for the selected card; − / + zoom 50–200 %, click the % to reset.
- Counter shows students with every point approved / 150.
- Both lists scroll; the thin purple scroll thumbs follow.

## Prototype behaviour (Companies)
- Segmented control switches All / Assigned / Self Allot; the purple pill slides to the Figma position for each.
- **All**: every company with its assigned team (person icons) and status dot.
- **Assigned**: your companies with call / mail / edit actions; mail darkens on hover (the dark icon in the Figma frame).
- **Self Allot**: open companies with category tags. **Claim** → button becomes "Claimed" and the company appears in Assigned; click again to unclaim.
- Search filters the current tab; status chips (All/Assigned) and category chips (Self Allot) filter, the "25" chip clears the category.
- **Dropdown arrows expand rows.** Self Allot → job descriptions per category (globe / LinkedIn icon = where it was found), POC cards, Tag / Claim / Source. All / Assigned → contact history timeline with an input to log a new update (Enter); the edit pencil opens it straight into that input.
- **Tag** → type-ahead picker of placement-team members (↑/↓, Enter, click; Backspace removes last; × on a chip). Button shows `@First +n`.
- **Mail** (Assigned row mail icon, or a POC's email in Self Allot) → AI mail plugin:
  1. composer opens pre-filled (To, subject); the AI draft writes itself in as ghost text while the agent card shimmers;
  2. agent card shows its note ("New Poc is assigned…");
  3. click / Tab into the body to accept the draft → real, editable text. Send (disabled while drafting) logs "Mail sent: …" to the company history and shows a "Message sent" toast. Minimise, close and discard work.

## Prototype behaviour (Team + Chat)
- Search by name or company; role chips **and** the legend pills filter by role (click again to clear).
- Hovering a row shows a message button → opens chat straight into a DM with that person.
- Chat launcher (bottom-right, every page): conversation list with the *Placement Team* space + a DM per team member, sorted by latest message, unread badges, people search.
- Threads: send with Enter; a simulated teammate shows "typing…" then replies (space replies come from a random member, with sender names shown). Unread clears when you open a thread. Messages persist in the browser (localStorage `pp-chat-v1`).
- The Tag picker on Companies now uses the real Team roster.

## Known deviations
- Company rows use a uniform 105px pitch; Figma rows are spaced 100–109px (±5px drift on rows 4 & 8).
- Empty Figma divider vectors (no visible strokes) were not rendered.
- Resume: "Attach email threads asw." is the feedback box placeholder (shown in black like the design; dims while typing).
- Resume: the company name beside "Attachment" shows whenever a card is selected (Figma shows it only in the feedback-open frame).
- Resume: the sample attachment image in Figma is only 298×386, so it looks slightly soft at 528×685.
- Resume: the Google / Apple / Amazon cards placed below the artboard in Figma are used as sample data for the other students.
- Companies (All): Figma's last row (PwC) shows call/mail/edit like the Assigned tab; every All row here uses the person icons + dropdown instead. Team counts for rows 6–7 (off-screen in Figma) are made up.
- Companies: Source and the two round icon buttons (list view, insights) still do nothing — no designs for them yet.
- Expanded All/Assigned rows follow `139:1979` "approximately" as asked: history sits under the normal row header; the arrow rotates when open (the Self Allot arrow stays as designed).
- Tag picker, tagged-button outline and "Message sent" toast are not in Figma. Team member names are placeholders until the Team page exists.
- Mail composer: chrome/toolbar are the exported compose screenshot; only To, Subject, body, Send, minimise/close/discard are live. Agent note typos fixed ("assigned", "again"). The loading shimmer replaces the "Flow Block" skeleton font.
- Recipient emails other than Accenture's (carrier.hire@mail.com) are made up.
- Company history: the 80px placeholder "shapes" image from `139:1979` was removed on request.
- Team: the search field overlaps the "Internship Coordinators" chip exactly as in Figma, so that chip is mostly covered — the legend pill does the same filtering. Grid/list toggles are visual only (no grid design yet). Row hover tint + message button are additions.
- Chat plugin is entirely new (no Figma); seeded conversations and replies are fake.
- Scrollbars now run the full height of each list (Figma's were shorter fixed lines) and the thumb size reflects the content.
- Phone layouts, the Home status picker / compact view / Add Company form / note form, and all hover/pressed visuals are additions — no Figma frames for them.
- Company detail: EDIT and CANCEL buttons aren't in Figma (light variant of SAVE). The year chevron points down when closed / up when open (Figma shows the reverse). The green/yellow "data lines" and the white "Item"/"Label" chart texts in Figma are empty/invisible, so they're not drawn. Hire numbers for companies other than Accenture are generated; every year's timeline reuses the design's five entries.
- Companies "List view" button scrolls the list to the top; the Insights button was replaced by the Kanban button.
- Companies: chip counts are static as designed; filtering uses the row status dots, so Shortlist / Interviews return no rows.
- "Claimed" button style (lavender with primary text) isn't in Figma.
