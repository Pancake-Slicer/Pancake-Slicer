# Pancake City — v52 recovery

This project was reconstructed **only** from the user-provided `Pancake (52).html` browser build. It is **not** the original Codex repository or its Git history.

## Contents

- `original/Pancake (52).html` — exact original playable build, unchanged. Keep this as the immutable fallback.
- `web/index.html` — HTML shell pointing to extracted files.
- `web/assets/game.bundle.js` — recovered bundled/minified JavaScript with the reviewed rendering fixes described below.
- `web/assets/game.css` — original stylesheet plus the Office tab styling.
- `web/features/offices.js` and `offices.css` — editable Office zoning source, embedded in the generated runtime and standalone export.
- `reference/third-party-notices.txt` — copy of embedded third-party notices (the notices remain in `web/index.html`).
- `docs/RECOVERY_NOTES.md` — verification details, limitations and suggested next steps.

## Run

**Windows quick start:** double-click `Play Pancake City.cmd`, keep its window open, and open `http://127.0.0.1:4173` in Chrome or Edge. See [the Windows guide](docs/WINDOWS_GUIDE.md) for controls, development commands, and the commit-and-approval workflow.

Option A: Open `original/Pancake (52).html` directly in a modern browser, exactly as before.

Option B: Run the extracted version with a local web server. From the project directory:

```bash
npm ci
npm start
```

Then open `http://127.0.0.1:4173`. The local server is important because browsers may block JavaScript modules loaded directly from `file://` paths.

## Standalone offline playtest

Run `npm run export:html` to build and package the current game as `dist/Pancake City - Playtest.html`. Double-click that file to play in Chrome without a server or internet connection. JavaScript, CSS, and license notices are embedded without changing gameplay.

Run `npm run export:html -- --downloads` to also copy the result to your Windows account's Downloads folder. This refuses to overwrite an existing Downloads playtest; keep or rename that file before exporting another copy. The protected original HTML is never used as an output destination.

## Development workflow

Office zoning adds a second **Office** tab beside Brick rowhouses. Choose **Zoning → Office**, then paint adjoining properties to form larger office sites, or use Bucket fill on one property for a smaller building. The mix includes Art Deco setback towers, International-style curtain walls, and modernist ribbon windows, spanning 10–80 storeys. Heights are deterministic and depend on site area; narrow individual plots produce lower offices. Undo/redo, demolition, repainting, and rezoning use the existing tools.

Edit Office source in `web/features/`, then run `npm run assemble` to regenerate the development runtime. Build and export commands assemble automatically. The immutable v52 artifact and `approved-v52` Git tag remain the fallback; new Office development is not part of that approved checkpoint.

The local Windows setup adds `npm run check` (original preservation, reviewed runtime changes, syntax, and rendering regression checks), `npm run build` (validated packaging into `dist/`), and `npm run preview` (built game at port 4174). See `AGENTS.md` for milestone rules; each push requires your approval.

The rendering fixes keep a stable image during camera movement, remove internal cap faces between building foundations/walls/roofs, and correct roof UVs. Development now uses a separate mitered road-setback mask so road fillets cannot round ordinary building plots; rounded boundaries are retained only for enclosed triangular plots. Camera rendering uses one render pixel per CSS pixel, two MSAA samples, smaller shadow targets, and at most ten camera-driven shadow-view recalculations per second while moving. Shadows refresh after settling, and traffic, road rendering, facade details, and camera controls remain active. `scripts/rendering-fixes.cjs` records each exact change against the immutable v52 runtime. Tests exercise full street-block generation and the neighborhood renderer without a GPU. Actual frame rate and the reported zoom-dependent roof lines still require a browser playtest.

1. Keep a backup of this ZIP and the original HTML.
2. Create a Git repository from this folder and push it to GitHub.
3. Open a new Codex task attached to the GitHub repository.
4. Ask Codex to preserve behavior, add a smoke test, and progressively split the bundled application into maintainable modules.
5. Require commits pushed to GitHub after each successful milestone. Local checkpoint archives alone are not off-workspace backups.

## Important

The bundle is minified and includes third-party rendering code. Its exact original modular source, build configuration, and commit history cannot be reliably recovered from this HTML alone. The extracted bundle is still functional JavaScript source, but should be refactored carefully with regression tests.
