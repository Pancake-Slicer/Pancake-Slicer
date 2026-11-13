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

## Update future approved buildings

Double-click **Update Approved Buildings.cmd**, or run `npm run update:buildings`. It scans the shared Architecture-approved packages, validates and tests compatible versions, preserves last-known-good registrations, and writes new offline Playtest/Demo HTML files plus readable reports to Downloads. You never need to edit code or manifests. See [the complete command and Codex workflow](docs/APPROVED_BUILDING_WORKFLOW.md) for package ownership, skipped-asset reports and visual-review steps.

## Standalone offline playtest

Run `npm run export:html` to build and package the current game as `dist/Pancake City - Playtest.html`. Double-click that file to play in Chrome without a server or internet connection. JavaScript, CSS, and license notices are embedded without changing gameplay.

Run `npm run export:html -- --downloads` to also copy the result to your Windows account's Downloads folder. This refuses to overwrite an existing Downloads playtest; keep or rename that file before exporting another copy. The protected original HTML is never used as an output destination.

## Development workflow

The current rendering follows the user's illustrated-city reference: fine grey architectural creases, pale masonry and glass, clean window grids, matte light, lighter cast shadows and subtle distant haze. This supersedes the rejected heavy comic treatment; black edge filtering and luminance posterisation have been removed. Gameplay, building volumes, camera controls and animations are unchanged. Authoring files are `web/features/cel-style.js`, `comic-finish.glsl` and `sc4-rebuilds.js`; exact assembly patches remain in `scripts/rendering-fixes.cjs`. The result is a reference-guided interpretation, not an exact reproduction of the supplied picture's separately authored buildings and scenery.

Office zoning adds a second **Office** tab beside Brick rowhouses. Choose **Zoning → Office**, then **Bucket fill** and click inside a street block to zone the entire block. Lots divide automatically into adjoining sites; the paint brush still zones individual lots. Every building has a textured ground floor occupying its whole lot up to the sidewalk, with upper shafts and setbacks fitted inside it. Narrow corner remnants merge into neighbouring lots. Enclosed blocks fill completely on suitable terrain; open streets get a continuous 64 m development belt. Residential plots retain their original dimensions. Undo/redo, demolition, repainting, and rezoning use the existing tools. See [the block layout notes](docs/OFFICE_BLOCKS.md) and [earlier footprint research](docs/OFFICE_FOOTPRINT_REFERENCES.md).

Edit Office source in `web/features/`, then run `npm run assemble` to regenerate the development runtime. Build and export commands assemble automatically. The immutable v52 artifact and `approved-v52` Git tag remain the fallback; new Office development is not part of that approved checkpoint.

The Office tab offers all 98 named entries from the linked Commercial Wealth $$$ catalogue: 64 offices and 34 shops, hotels and services. **The active game uses newly constructed solid geometry and newly drawn material textures, with SC4 designs as references.** Choose a name under **Commercial $$$ building**, then paint lots or fill a block. Leave the selector on **Mix all 98** for deterministic variety matched to lot area. Selecting a design leaves existing buildings alone; repaint applies a different design. When testing an older city, refill its Office blocks to apply the new continuous layout; previous standalone HTML files keep their previous behavior.

All current model recipes are committed in `reference/sc4-rebuilt-designs.json`; rendering and texture drawing live in `web/features/sc4-rebuilds.js`. A normal checkout/build/export requires no SimCity installation or imported artwork. Facades use scene lighting and shadows; camera headings do not replace surfaces. See [the rebuild notes](docs/SC4_REBUILDS.md) for methods, checks and fidelity limits. The [earlier asset import](docs/SC4_ORIGINAL_ASSETS.md) and its local files are retained only for reference work.

Landmark placement preserves existing building layouts and requires a site clear of occupied buildings. Foundation grading protects nearby development, preview input is coalesced per frame, existing landmark shadow bounds are cached, and placement does not rebuild road geometry.

The local Windows setup adds `npm run check` (original preservation, reviewed runtime changes, syntax, and rendering regression checks), `npm run build` (validated packaging into `dist/`), and `npm run preview` (built game at port 4174). See `AGENTS.md` for milestone rules; each push requires your approval.

The rendering fixes keep a stable image during camera movement, remove internal cap faces between building foundations/walls/roofs, and correct roof UVs. Development now uses a separate mitered road-setback mask so road fillets cannot round ordinary building plots; rounded boundaries are retained only for enclosed triangular plots. Camera rendering uses one render pixel per CSS pixel, two MSAA samples, smaller shadow targets, and at most ten camera-driven shadow-view recalculations per second while moving. Shadows refresh after settling, and traffic, road rendering, facade details, and camera controls remain active. `scripts/rendering-fixes.cjs` records each exact change against the immutable v52 runtime. Tests exercise full street-block generation and the neighborhood renderer without a GPU. Actual frame rate and the reported zoom-dependent roof lines still require a browser playtest.

1. Keep a backup of this ZIP and the original HTML.
2. Create a Git repository from this folder and push it to GitHub.
3. Open a new Codex task attached to the GitHub repository.
4. Ask Codex to preserve behavior, add a smoke test, and progressively split the bundled application into maintainable modules.
5. Require commits pushed to GitHub after each successful milestone. Local checkpoint archives alone are not off-workspace backups.

## Shared approved-building library

The three approved independent GLB packages are in [Assets/buildings](Assets/buildings/README.md), with unchanged standard asset.json manifests, architectural metadata companions and an automatically generated inventory. Run `npm run assets:library` to inspect them at http://127.0.0.1:4186; `npm run assets:library:test` verifies independent loading and rendered fidelity against the unchanged authoring factories. [Publication report and Game Coding handoff](docs/APPROVED_BUILDING_LIBRARY.md). This publication does not change the game or any approved model.

## Latest playable custom buildings

**Placement fixes:** use `C:\Users\camsh\Downloads\Pancake City - Aligned Growables Demo - 20261113.html` for a populated city showing aligned custom buildings and Von Badel. The matching file without `Demo` starts a new city. [Fix details and checks](docs/GROWABLE_PLACEMENT_FIX.md). Earlier exports below predate this correction.

Open `C:\Users\camsh\Downloads\Pancake City - Three Custom Buildings Demo - 20261113.html` in Chrome for the populated game with Lind, Von Badel and the newly integrated Ohneeohnee. The matching file without `Demo` starts a new city. Both are fully embedded offline HTML. See [latest integration notes](docs/LATEST_CUSTOM_BUILDINGS.md).

## Earlier approved architectural growables

The normal current game is `C:\Users\camsh\Downloads\Pancake City - Approved Architecture Playtest - 20261113.html`. Open it with Google Chrome. For an immediately playable populated city, open `Pancake City - Approved Architecture Demo - 20261113.html` from Downloads: four unchanged Linds, four refined Von Badels and 28 legacy offices grow through normal zoning. The new Von Badel GLB is copied unchanged from the Architecture handoff; no benchmark/model/material/texture source was edited. See [integration verification and asset provenance](docs/APPROVED_ARCHITECTURE_INTEGRATION.md).

Run `npm run demo:approved-assets` to reproduce the demo. New models register through standard manifests; there is no Von Badel-specific game code or lot-generation change. Existing catalogue choices and saved/history asset assignments remain authoritative.

## Architecture Study 03 — Ohneeohnee

Run `Play Ohneeohnee Benchmark.cmd` or `npm run benchmark:ohneeohnee`, then open http://127.0.0.1:4185. This isolated modernist office study includes reference-led curtain walls, true front/side/rear elevations, roof inspection, performance reporting and a 25-copy instancing preview. [Source files, measurements, screenshots and limitations](docs/OHNEEOHNEE_BENCHMARK.md). Its unchanged GLB is now registered through the shared growable interface for the latest playable release; the isolated benchmark remains unchanged.

## Standalone Art Deco architectural benchmark

The separate **Von Badel** study is available through `Play Von Badel Benchmark.cmd` or `npm run benchmark:von-badel` at port 4184. It uses its own source images and model, now has a dark International Style facade, a straight shaft, flat mechanical roof and equal wings, and does not alter Lind. The refined model is now separately registered for city growth through the shared asset interface. See [the Von Badel notes](docs/VON_BADEL_BENCHMARK.md) for measured symmetry, captures, portable GLB and remaining fidelity limits.

Lind is now also an automatically selected Office growable on sufficiently large, high-capacity lots. Its approved model is unchanged. Run `npm run demo:growables` and open `dist/Pancake City - Lind Growables Demo.html` for a playable city with three Linds among 36 mixed Office buildings. See [the growable asset guide](docs/GROWABLE_ASSETS.md) for the reusable manifest/GLB interface, adding future buildings, eligibility rules, measured performance and tests. The original 98-entry catalogue remains available.

Double-click `Play Art Deco Benchmark.cmd`, then open `http://127.0.0.1:4180` to inspect the reference-led Lind skyscraper. Or run `npm run benchmark:serve`. This separate scene uses the game's recovered Three.js r180 without changing city gameplay. See [the benchmark notes](docs/ART_DECO_BENCHMARK.md) for source images, controls, geometry/material design, measurements, browser checks and remaining architectural differences.

## Recovery limitation

The bundle is minified and includes third-party rendering code. Its exact original modular source, build configuration, and commit history cannot be reliably recovered from this HTML alone. The extracted bundle is still functional JavaScript source, but should be refactored carefully with regression tests.
