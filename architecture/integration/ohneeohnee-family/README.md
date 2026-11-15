# Ohneeohnee family — Phase 6A portable package

Package API version **6.0.0**. This wraps the unchanged approved core1.0.1, enhanced family assembly3.0.0 and facade profiles5.0.0. It contains no Architecture Lab UI, scene, controls, review storage, game registration or zoning code.

## Build and verify

From the project root:

```powershell
npm run architecture:phase6a:prepare
npm run architecture:phase6a:test
```

Portable output: `dist/architecture/ohneeohnee-family/`. The generated source copies come from the same hash-pinned modules the Lab uses; never edit distribution copies. No second architectural implementation is maintained. Source wrapper/configurations/catalogue are in `architecture/integration/ohneeohnee-family/`. Build output is ignored and reproducible. `source-lock.json` prevents silently changing this package version's approved architecture.

Peer rendering dependency: **the host's same Three.js r180 instance**, mapped as ES module `three`. Do not install a second engine into the game. Browser `Image` decoding is required; the approved reflection uses the existing generator's DataTexture. Runtime material data is embedded as PNG data URIs inside `approved-reference.json`; no architectural artwork, Lab URL, external CDN or project-specific absolute path is needed. Four maps are shared per runtime: three original approved maps and one generated lobby-reflection map. Retained reference geometry in the compiled payload is reconstructed once during material loading and immediately disposed; it is not rendered. Importing the module alone creates no scene or resources.

## Minimal host consumption

```js
import {createOhneeohneeRuntime} from './ohneeohnee-family/index.js';

const catalogue = await fetch('./ohneeohnee-family/catalogue.json').then(r => r.json());
const candidate = catalogue.candidates[0];
const runtime = await createOhneeohneeRuntime();
const model = runtime.generate(candidate.specification);
const metadata = model.userData.integration;
// Metadata is in local/native coordinates; the full decorated footprint is included.
model.position.set(worldX, foundationY, worldZ);
model.rotation.y = roadFacingYaw;
scene.add(model);

// Demolition/chunk eviction: release only this lease; shared maps stay alive.
runtime.release(model); // removes it from its parent; a second release returns false
runtime.trim();         // evicts unused geometry, never active geometry/materials
// At owner/world shutdown, after releasing every model and batch:
runtime.dispose();      // shared materials/maps disposed once; repeat returns false
```

Use a bundler/host import map for `three`. For a fully embedded HTML host, provide already parsed material data with `createOhneeohneeRuntime({payload: embeddedReference})`; this avoids fetch. An optional `resourceURL` overrides the default URL relative to index.js. The caller supplies the renderer, scene, lights, foundation and placement; there is no UI dependency.

For chunk optimization, generate models, place them, then call `const batch = runtime.createBatch(models, {chunkSize:768})` and add **batch.root only** to the scene. Do not also render the source Groups. This reuses the approved optimizer: merges compatible opaque material batches, instances repeated whole geometry, and preserves transparent objects for correct sorting. Models may not be released while a batch borrows them. Dispose/remove the batch first with `batch.dispose()`, then release its models. To move/change source placement, dispose/rebuild that chunk's batch. Runtime disposal rejects live leases rather than breaking another building's shared resources.

`validateBuildingSpecification(spec)` clones and validates the established architecture and facade rules. `describeBuilding(model)` measures a detached model in local coordinates and restores its transform; use the already supplied `userData.integration` after placement. Specification mutation after generation does not change geometry; request a new lease instead. Seed is preserved in the complete frozen specification, not regenerated implicitly. `candidate.id + generatorVersion + specification` should be retained by a future host for persistence; no new save hook is implemented here.

## Nine integration candidates

| Subfamily | Candidate suffix | Storeys | Podium |
| --- | --- | ---: | --- |
| Vertical | vertical-midrise | 12 | no |
| Vertical | vertical-slender | 40 | no |
| Vertical | vertical-podium | 35 | yes |
| Horizontal | horizontal-broad-midrise | 12 | no |
| Horizontal | horizontal-rectangular-tower | 26 | no |
| Horizontal | horizontal-podium | 22 | yes |
| Balanced grid | grid-compact | 8 | no |
| Balanced grid | grid-tall-tower | 30 | no |
| Balanced grid | grid-podium | 35 | yes |

Stable IDs prefix `ohnee-family-`. Each has a distinct explicit string seed and full specification, measured dimensions/height, complete footprint and bounding box, source versions, +Z front, threshold/actual-door positions and performance metadata in `catalogue.json`. Nominal floor count excludes roof plant, while measured height includes it. Minimum lots include an advisory0.3m setback; actual game fit is authoritative. All nine use existing compatibility rules and can be reproduced without the Lab. Catalogue `registrationEnabled` is false.

## Integration boundary and limits

This is a portable **ESM generator package**, not an automatically importable static GLB package or a current `model.format: procedural` function-expression file. Keep it outside `Assets/buildings` and `Assets/growable-registry`. Do not run the building updater on it. Current game zoning/source audit is documented in `PROCEDURAL_ARCHITECTURE_PHASE6A.md` at the project root.

The inspected game currently supports `offices` and high-capacity Office growables. Suggested compatibility is commercial-office, subject to Game Coding confirmation. Its existing procedural factory receives a much smaller engine API and forbids imports/exports. A later controlled common adapter must bind this ESM package to the full existing engine, async material readiness, versioned specifications, picking/chunks/history and scene ownership. No such adapter, growth choice or gameplay registration is implemented here.

Opaque reflective lobby glazing is preserved. Upper office glazing remains intentionally transparent; its per-object sorting is preserved rather than force-merged. Lobby envMap and alpha materials exceed the current static opaque-GLB import subset, so do not flatten/export them through that path and silently lose appearance. Reflection scratch buffers belong to the host renderer and are released when that renderer shuts down; runtime.dispose frees package-owned resources and never disposes the host renderer. Browser tests verify bounded renderer caches across repeated complete runtime lifecycles.

No new LOD, thousands-of-buildings performance guarantee, worker/headless image-decoder support or game-save schema is included. Exact geometry/material signatures match the unchanged Lab for these nine candidates. Original custom buildings, Lab, approved generator/styles and optimization code are preserved. See root phase report for tests, screenshots, measurements and recovery details. Existing third-party notices accompany the distribution; the Three.js peer retains its own license.
