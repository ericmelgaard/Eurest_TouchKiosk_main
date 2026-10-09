# NPM Commands (Quick Reference)

Run these from the project root in a terminal. Run `npm install` once after
cloning, or whenever `package.json` changes.

| Command | What it does |
|---|---|
| `npm install` | Installs the dev tooling (Vite, Babel, core-js, esbuild) into `node_modules/`. |
| `npm run dev` | Starts the Vite dev server at http://localhost:5173 with live reload. It also listens on your LAN IP, so a kiosk or phone on the same network can open it. |
| `npm run package` | Builds the CMS asset: copies the runtime files into `dist/`, transpiles them for **Chrome 53**, and zips the result to `dist.zip`. **Use this for releases.** |
| `npm run package:raw` | Same as `package`, but skips transpiling. Ships the source files unchanged, which helps when debugging on a modern browser. |
| `npm run build` | Runs `vite build`. Not used for the kiosk asset (see note below). |
| `npm run preview` | Serves the output of `npm run build`. |

## Live Server Options

- **`npm run dev`** (Vite, port 5173): serves the source files directly, so
  there's no transpiling. Test it in a modern browser.
- **VS Code Live Server extension** (port 5502, set in
  `.vscode/settings.json`): right-click `index.html` → *Open with Live
  Server*.
- **Testing the Chrome 53 build locally**: run `npm run package`, then serve
  `dist/` (for example `npx vite dist --port 5174`) and open it on the old
  player.

## How the Chrome 53 Build Works

`npm run package` runs `scripts/build-asset.ps1`. That script calls
`scripts/transpile.mjs` on `dist/`, which:

1. Runs Babel (`@babel/preset-env`, target `chrome 53`) over `js/`,
   `dependencies/` (except `*.min.js`) and `sw.js`. This converts newer
   syntax such as `async/await`, `?.`, `??` and object spread.
2. Bundles the core-js polyfills Chrome 53 is missing (e.g. `Object.entries`,
   `padStart`, `Array.prototype.flat`, `Promise.prototype.finally`) into
   `dependencies/polyfills.js`.
3. Adds a `<script>` tag for `polyfills.js` to `dist/index.html`, ahead of
   every other script.

Source files are never modified. Only the copies in `dist/` are rewritten.

### Caveats

- Chrome 53 can't run `<script type="module">`, so the dev config panel
  (`js/devConfigPanel.js`) won't load on Chrome 53 players. Everything else
  is a classic script and runs normally.
- Babel converts syntax and core-js fills in missing built-in functions, but
  missing browser APIs (e.g. `AbortController`, `IntersectionObserver`) are
  **not** polyfilled. Avoid them, or add a polyfill to `dependencies/`.
- `npm run build` (Vite) only bundles module scripts and doesn't target
  Chrome 53. Use `npm run package` for kiosk deliverables.
- Babel is pinned to v7 because Babel 8 needs Node ≥ 20.19.
