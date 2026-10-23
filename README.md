# fihaa.my.id

Personal portfolio of M. Fiqri Haikhar Anwar (Fihaa), Software Engineer, built twice over: a classic **2D site** and an explorable **3D world**. Visitors pick a world on the landing page, and the choice is remembered for next time.

**Live:** https://fihaa.my.id

## Two worlds, one source of content

| Route | What it is |
|---|---|
| `/` | Landing page, "Choose Your World", with a short server-rendered profile (for SEO) |
| `/2d/*` | The 2D portfolio: about, projects, blog, learn, dashboard, contact |
| `/world` (alias `/3d`) | A floating island you can turn, step onto and explore |

Projects, skills, experience, contact links and the profile live in [`content/`](content) and feed both worlds. Old URLs (`/about`, `/projects/*`, …) redirect permanently to `/2d/…`.

### The 3D world

- **Two ways to look**: turn the whole island by dragging, or press **Explore** (or scroll in) to stand on it at eye level. Drag to look around, click a glowing ring to walk to a viewpoint, or click the grass to walk anywhere. A **360° tour** flies round the island on request or after a minute of idling.
- **A living island**:
  - wind-swept shader grass that parts round your cursor and footsteps, then springs back;
  - swaying trees, reeds and flowers;
  - a meandering stream from a pond to a waterfall pouring off the rim into a sea of raymarched clouds;
  - birds, butterflies, fireflies and a campfire.
- **Weather** (clear, rain, mist) that changes on its own, with raindrops on the lens; day and night follow the site theme, with **aurora** on clear nights.
- **Sound**: fantasy music and nature sounds generated live with the Web Audio API (off until you turn it on).
- **Hidden crystals** to collect; finding them all reveals the hidden vault under the island.
- **Each place is a section of the portfolio**: Profile (castle), Projects (quest board), Skills (skill tree), Experience (travel journal) and Contact (tavern mailbox). Each one opens a card with a summary and a full details panel.
- **Rendering**:
  - image-based lighting with a key/rim/fill rig and baked ambient occlusion;
  - PBR materials;
  - post-processing: N8AO, bloom, god rays, Khronos PBR Neutral tone mapping and temporal AA.
- **Built to degrade gracefully**: pixel ratio, shadows, grass density and post effects step down on slow devices. `prefers-reduced-motion` and the effects toggle stop all motion. Without WebGL, every section is still reachable as plain HTML.

Debug helpers: `/world?debug=stats` (fps, draw calls, triangles) and `/world?post=off|low|high` (force a quality tier).

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- Tailwind CSS 4 (design tokens in `@theme`, shared with the 3D palette)
- [three.js](https://threejs.org) via [React Three Fiber](https://r3f.docs.pmnd.rs), [drei](https://drei.docs.pmnd.rs) and [postprocessing](https://github.com/pmndrs/postprocessing). Loaded only on `/world`, never on `/` or `/2d/*`.
- Zustand, SWR, framer-motion, MDX

## Getting started

Requires **Node 22** and **Yarn**.

```bash
yarn install
cp .env.example .env.local   # fill in the keys you need
yarn dev                     # http://localhost:3000
```

| Script | Does |
|---|---|
| `yarn dev` / `yarn build` / `yarn start` | Develop, build, serve |
| `yarn lint` / `yarn lint:fix` | ESLint (flat config) |
| `yarn type-check` | TypeScript |
| `yarn world:assets` | Rebuild the 3D model kits from `content/world-assets.json` (glTF-Transform + meshopt) |

Environment variables (all optional for local work) are listed in [`.env.example`](.env.example): GitHub, WakaTime and DEV.to for the dashboard and blog, plus the contact form key.

## Project layout

```
content/                 Shared content: projects (MDX), skills, experience, profile, world copy
src/app/                 Routes: landing, /2d/*, /world, API routes, sitemap, robots
src/modules/             2D feature modules (about, projects, blog, …)
src/modules/world/       3D world
  config/                Island shape, viewpoints, camera, visual knobs, crystals
  components/scene/      Scene parts: terrain, grass, water, sky, weather, post-processing
  components/            HTML layer: dock, cards, details panel, controls
  audio/                 Procedural music and nature sounds
src/common/styles/       Global styles and design tokens (incl. --color-world-*)
```

To change the 3D world without touching components:

| Change | Where |
|---|---|
| Place names, UI text | `content/world.ts` |
| World colours (day/night) | `--color-world-*` tokens in `src/common/styles/globals.css` |
| Light, fog, grass, water, clouds, post effects | `src/modules/world/config/visual.ts` |
| Island shape, pond and stream | `src/modules/world/config/island.ts` |
| Model placement | `src/modules/world/config/props.ts` |

## Credits

3D models are CC0, from [KayKit](https://kaylousberg.com) by Kay Lousberg and [Quaternius](https://quaternius.com). They are listed in [`ASSETS.md`](ASSETS.md) and credited in the world itself (ⓘ button). Everything else in the world (grass, water, sky, clouds, weather, music) is procedural and made for this site.

## License

[GPL-3.0](LICENSE)
