# Pancake City — v52 recovery

## Original Alderwick heritage tower — fixed review

One independently designed 26-storey commercial tower with isometric/front/side previews. Approved Reamon remains unchanged and reference-only. No fitting or gameplay integration. Run `npm run review:heritage:export`. [Composition, provenance and validation](docs/ORIGINAL_HERITAGE_TOWER.md).

## Reamon — fixed reconstruction awaiting visual approval

One reference-sized building, beside the original at a comparable isometric angle, plus an H-plan/roof view. No lot-fitting or gameplay changes. Run `npm run review:reamon:export`. [Review scope, commands and evidence](docs/REAMON_FIXED_REFERENCE_REVIEW.md).

## Corrected H-shaped Brick Office family — latest

The existing brick family now has projecting wings, recessed courts, limestone base/crown and stepped roofs. Run `npm run export:brick-growables` for the updated Playtest and direct in-game isometric reference comparison. [Correction, checks and measured limits](docs/BRICK_OFFICE_H_CORRECTION.md).

## All growable foundations and office paving — latest

Facade-matched terrain foundations now cover catalogue offices and native homes as well as BMO/Lind/Von. Office setbacks and courtyards use sidewalk-matching concrete; homes retain landscaping. Run `npm run export:auto-foundations` for updated offline Playtest/Test City builds. [Scope, checks and limitations](docs/ALL_GROWABLE_FOUNDATIONS.md).

This project was reconstructed **only** from the user-provided `Pancake (52).html` browser build. It is **not** the original Codex repository or its Git history.

## Facade-integrated lightweight foundations

Run npm run export:facade-foundations for the latest Playtest and an in-game flat/sloped Test City. Lind, BMO and Von Badel use their facade materials down to terrain with accessible door transitions, replacing the broad generic platforms. Roads, sidewalks and lot fitting are preserved. [Details, validation and limits](docs/FACADE_INTEGRATED_FOUNDATIONS.md).

## Current gameplay — lightweight custom offices only

Run npm run export:lightweight-only for a new offline Playtest and populated Test City in dist/. Lightweight Lind, Von Badel and BMO grow beside the existing catalogue. Original bespoke Lind/Von Badel/Ohneeohnee models are preserved for reference and excluded from gameplay loading/spawning. Legacy saved keys are retained and shown through the existing catalogue fallback. [Retirement details and validation](docs/RETIRED_CUSTOM_GROWABLES.md).

## Lind + BMO — playable growable integration

Run `npm run export:lind-growables` for fresh standalone Playtest and prebuilt Test City files. The supplied Playtest enables natural mixed Lind/BMO growth alongside the existing catalogue. Use Office / Mix all98; the existing development panel includes Favour Lind. [Launch instructions, architecture, tests and measured limits](docs/LIND_GROWABLE_INTEGRATION.md).

## Parametric Lind — isolated visual review

Open the timestamped **Parametric Lind Architecture Lab** HTML in Downloads with Chrome. It contains five native lot fits, BMO comparison, approved-Lind comparison and performance tools without a server. Rebuild with `npm run architecture:lind:export`. [Review instructions, measured costs and limitations](docs/LIND_PARAMETRIC_PHASE1.md). Not enabled in gameplay.

## BMO-inspired tower — awaiting visual approval

**BMO material review:** run `npm run export:bmo-harmonized` for the updated offline Playtest and the same-geometry, four-palette city comparison. [Materials, launch instructions, performance evidence and review limits](docs/BMO_MATERIAL_HARMONIZATION.md).

**Phase2 playable integration:** run `npm run export:lightweight-bmo` for new self-contained development Playtest and manual Benchmark HTML files. Enable **Lightweight BMO Growables** and **Favour BMO** in the development panel, then zone new Office lots using Mix all98. OFF preserves existing buildings and returns future growth to the existing catalogue. [Launch instructions, architecture, measured results and limitations](docs/LIGHTWEIGHT_BMO_PHASE2.md). No permanent normal-game control, approved-architecture overwrite or additional family.

**Lightweight Phase1:** [five-lot review](http://127.0.0.1:4195/lightweight.html), or double-click **Review Lightweight Architecture.cmd**. Native lot fitting and shared opaque BMO geometry are isolated from gameplay. [Contract, measured geometry/CPU comparison, checks and browser-verification limitation](docs/LIGHTWEIGHT_PHASE1.md). NVIDIA browser timings and visual review are pending; no growable activation.

Open [the five-building parametric comparison](http://127.0.0.1:4187/bmo.html) while `npm run architecture:modernist` runs. Width/depth/storeys/bays/podium/roof controls rebuild the selected template; rectangular lot tests recalculate modules without scaling. [Parameters, statistics and verification](BMO_PARAMETRIC_TOWER.md). No BMO growable registration or gameplay integration.

## Contents

Architecture Phase5 review: [International Style facade subfamilies](PROCEDURAL_ARCHITECTURE_PHASE5.md). Open [the nine-building lab](http://127.0.0.1:4187/facades.html) while `npm run architecture:modernist` is running. New styles await visual approval and are not in the live game catalogue.

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

## Procedural Architecture Lab (experimental)

**Phase 4:** open http://127.0.0.1:4187/performance.html for approved-enhanced versus optimized rendering, matched camera views and separate 10/25/50/100-building stress tests. Appearance and source generator are preserved; the main game is unchanged. [Launch guide, measured results, resource tests and limits](PROCEDURAL_ARCHITECTURE_PHASE4.md).

**Phase 3:** the lab opens the enhanced ten-building family, using the approved 07B assemblies with automatic podium/non-podium lobby selection. Original massing/seeds, reference assets and gameplay remain unchanged. Switch **Architectural assemblies** to compare the original family; use the full/facade/street views and per-building review controls. [Phase 3 launch instructions, validation and performance](PROCEDURAL_ARCHITECTURE_PHASE3.md). Nothing is published to growables.

Double-click `Play Procedural Architecture Lab.cmd`, leave the window open, and open http://127.0.0.1:4187 in Chrome. Ten Ohneeohnee-family buildings are generated by one reusable modular system, alongside the unchanged approved reference. Use visible controls for seeds, regeneration, selection, inspection and JSON export. Nothing is added to city growth. See [PROCEDURAL_ARCHITECTURE.md](PROCEDURAL_ARCHITECTURE.md) and [source analysis / validation](docs/OHNEEOHNEE_PROCEDURAL_ANALYSIS.md).

The lab now also has a separate **07A / 07B comparison** at http://127.0.0.1:4187/?comparison=07: enhanced curtain walls and an opaque reflective-glass podium lobby on the same original Building 07 massing, with review save/import/export. No rollout to other buildings or gameplay. [Phase 2 instructions and performance](PROCEDURAL_ARCHITECTURE_PHASE2.md).

## Procedural architecture — Phase 6A handoff

The portable Ohneeohnee family package and nine deterministic integration candidates are documented in [Phase 6A](PROCEDURAL_ARCHITECTURE_PHASE6A.md). Run `npm run architecture:phase6a:prepare` to assemble `dist/architecture/ohneeohnee-family`, or `npm run architecture:phase6a:test` to validate independent import, determinism, Lab fidelity and resource cleanup. [Consumption and ownership contract](architecture/integration/ohneeohnee-family/README.md). Candidates are not registered or enabled in gameplay; the existing Lab and game remain unchanged.

## Controlled procedural Office growables (Phase6B)

**Empty-city performance safeguards:** experimental materials now load on demand, hidden game tabs stop scene work, and exports include an explicit desktop-Chrome launcher and actual GPU diagnostics. The Windows high-performance preference for Chrome was applied with approval; actual NVIDIA selection and smooth play still need a fresh-launch check. [Investigation, code changes and remaining step](docs/EMPTY_CITY_PERFORMANCE.md).

**Phase6B procedural Office development build:** the nine frozen Ohneeohnee family candidates can now grow through the existing Office zoning system when explicitly enabled. Existing buildings/catalogue remain. Run `npm run export:procedural-offices` for new standalone Playtest and populated Demo files in Downloads. [Launch instructions, integration contract, tests, performance and limitations](docs/PROCEDURAL_OFFICES_PHASE6B.md). Controls are development-only and default off in a new city; the demo enables all styles for review.

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

## Von Badel lightweight office growables — 2026-11-16

Run npm run export:von-growables for the latest offline Playtest and populated Test City in dist/. Von Badel grows naturally beside BMO, Lind and the existing catalogue; Development → Lightweight offices includes ON/OFF and Favour controls. Uses native per-lot generation and shared batching, with approved source assets preserved. [Implementation, checks and measured limitations](docs/VON_BADEL_DIRECT_INTEGRATION.md).


## Alderwick growables — 2026-11-18

Run `npm run export:alderwick-growables` for the playable Alderwick build and populated Test City. Natural Office growth mixes Alderwick with the existing families; development controls can favour Alderwick or its canonical26-storey preset on compatible new lots. Approved original fixed model preserved. [Architecture, validation and limits](docs/ALDERWICK_GROWABLE_INTEGRATION.md).


## Clean roof, facade and concrete shadows — 2026-11-19

Run `npm run export:surface-shading` for the latest corrected playable build. Shared shadow bias now follows view resolution to remove diagonal self-shadow banding across building families. [Scope and validation](docs/SURFACE_SHADING_FIX.md).


## Original Art Deco experimental growables — 2026-11-19

Run `npm run export:original-deco` for three original towers: Aster (slender), Calder Exchange (winged) and Marlowe House (mid-rise). The Test City offers direct in-game views and controls; Lind and previous buildings are preserved. [Scope, controls and validation](docs/ORIGINAL_DECO_EXPERIMENTS.md).

Art Deco correction review: `npm run export:original-deco` now produces **Art Deco Tower Corrections** builds with Aster's H podium/Lind-matched height, Aster/Calder copper pyramids and Marlowe's centred entrance. Review newly zoned Office lots; saved revision-1 buildings are preserved. [Details](docs/DECO_TOWER_CORRECTIONS.md).

Latest playable: npm run export:original-offices. Original Lind/Reamon growables are reference-only; Alderwick, Aster, Calder, Marlowe, BMO and Von remain available. [Retirement and legacy-save behaviour](docs/RETIRED_LIND_REAMON.md).

Waterfall red-granite / rear-crown benchmark: `npm run export:waterfall` creates one fixed prototype with the original reference beside the game. The Test City/Chrome launcher open the review; variants and natural growth await visual approval. [Rear projections, equal-height bands and red granite](docs/WATERFALL_RED_GRANITE.md).

Curved skyscraper fixed reconstruction: `npm run export:curved-reference` produces one interactive reference study with isometric, roof and ground comparisons. It remains outside normal gameplay and awaits visual approval. [Review and validation](docs/CURVED_SKYSCRAPER_REFERENCE.md).

Original curved modernist experiments: `npm run export:curved-modernist` produces a playable A/B/C comparison with the archived curved benchmark. Normal spawning remains OFF; experimental development controls are opt-in. [Architecture, controls and validation](docs/ORIGINAL_CURVED_MODERNIST.md).
