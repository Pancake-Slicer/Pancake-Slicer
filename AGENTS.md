# Pancake City Codex guide

## Canonical development

- Work in `C:/Users/camsh/Desktop/Pancake-City-restored-v53-20261112-153759` on `codex/pancake-city-consolidated`. The older Pancake-Slicer-main checkout is recovery history.
- Run `npm run build` for the full checks and distribution, `npm run export:html` for the standalone `dist/Pancake City - Playtest.html`, and `npm start` to serve the web build. `Play Pancake City.cmd` opens the canonical offline export.
- Default mixed Office growth includes lightweight BMO and Von Badel, Aster Tower, Calder Exchange, Marlowe House, Alderwick, Arcus / Splice Crescent / Facet Point and the three Postmodern Office designs. Lots still require native fit and zoning capacity.
- Ohneeohnee procedural candidates are experimental. Retired Lind/Reamon growables, the bespoke Lind/Von Badel/Ohneeohnee models, and the fixed Reamon, curved, barrel-vault and Waterfall benchmarks stay out of normal growth.

## Work efficiently

- Verify the worktree, branch, and Git status before editing. Inspect only task-relevant files. Use targeted `rg` searches and narrow reads. Expand the search only when needed.
- Before changing the game, read [README.md](README.md) and the relevant sections of [recovery notes](docs/RECOVERY_NOTES.md). Use the latest milestone notes and existing conventions to locate source and tests. Avoid rereading the same files or scanning generated bundles, embedded assets, and old reports.
- Make the smallest reliable change using existing code. Try the simplest viable approach first. Keep unrelated refactors and fixes out of scope. If the work turns out to require substantially broader changes, explain why before proceeding.
- Install dependencies, regenerate assets, and run additional checks only when needed for the task. Keep updates and final reports brief. State what changed, which checks passed, and any material limitations or user action.

## Protect the game and approved assets

- Preserve `original/Pancake (52).html` byte for byte. Its SHA-256 is `c8eff97d4c0daefd2cf7b6d967a694ce8a999e4a3e1402d88fee4fea6077778c`. Keep that hash check mandatory and preserve third-party notices and asset provenance.
- This project recovers a compiled browser artifact. Edit `web/features/`, `architecture/`, or the reviewed recipes under `scripts/` as appropriate. Use `npm run assemble` to regenerate the runtime. Preserve the shared Three.js renderer and its camera, shadow, and frame safeguards.
- Change approved models, procedural building families, textures, benchmark sources, or existing gameplay systems only when explicitly requested. Preserve unrelated gameplay behavior, architectural fidelity, performance, and save compatibility.
- Checkpoint substantive changes and preserve unrelated local work. Keep dependencies, generated exports, logs, and city saves out of commits.

## Architecture and growables

- Use the [approved building workflow](docs/APPROVED_BUILDING_WORKFLOW.md) for GLBs. Preserve archived assets and existing versioned assignments. Introduce new procedural families in versioned modules and review them in the Lab before gameplay activation unless explicitly authorized.
- Reuse `architecture/lightweight/template.mjs` and the existing lot fitting, foundations, picker, history, and batching. Fit the complete decorated envelope at native scale using street alignment and polygon containment. Keep metres, Y-up, +Z frontage, and an explicit entrance. Preserve deterministic generation, saved revisions, Undo/Redo, cold restore, and catalogue fallbacks.
- Use existing opaque materials, metric UVs, geometry reuse, and chunked batches. Preserve material provenance and release owned resources when removed.
- Check current family status in the recovery notes. Use the [curved Office family](docs/ORIGINAL_CURVED_MODERNIST.md) for normal Office growth and preserve its approved reference revisions. Keep the [curved benchmark](docs/CURVED_SKYSCRAPER_REFERENCE.md) and [Waterfall study](docs/WATERFALL_RED_GRANITE.md) out of normal spawning.

## Validate and deliver

- Run the smallest existing tests that cover the affected behavior. Add regression coverage for authorized gameplay or assembly-recipe changes. Keep runtime and CSS verification tied to the reviewed assembly recipe. Repeat checks after relevant changes or to investigate a failure.
- For completed gameplay or rendering milestones, inspect the diff, run `npm run build` (which runs `npm run check`), verify the affected flow in the running game when permitted, and update the relevant recovery notes. For playable exports, verify offline packaging and use a unique filename. For visual or performance claims, record comparable screenshots or measurements and state their limits.
- For documentation-only changes, verify affected references, inspect the diff, and run `git diff --check`. Skip game builds and browser tests.
- Commit only the requested files and report the commit, branch, validation, and limitations. Ask before destructive changes and before each specific GitHub push. After approval, fetch and check the remote, push without force, and verify the remote commit matches. Shared history, tags, and `main` require explicit approval to change. A local commit still awaits an off-computer backup.
