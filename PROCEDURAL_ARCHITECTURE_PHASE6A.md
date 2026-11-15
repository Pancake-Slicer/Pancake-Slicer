# Phase 6A — Ohneeohnee family integration preparation

Architecture-only packaging and validation, 2026-11-14. No gameplay integration. Project root: `C:\Users\camsh\Desktop\Pancake-City-restored-v53-20261112-153759`.

## Deliverables and reproduction

- Maintained source/API: `architecture/integration/ohneeohnee-family/index.js`.
- Nine frozen inputs: `architecture/integration/ohneeohnee-family/candidates.json`.
- Measured shared catalogue and schema: `architecture/integration/ohneeohnee-family/catalogue.json` and `catalogue.schema.json`.
- Game Coding consumption/ownership instructions: `architecture/integration/ohneeohnee-family/README.md`.
- Portable generated distribution: `dist/architecture/ohneeohnee-family/` (ESM source closure, metadata, material resource, peer-engine bridge, source lock and notices).
- Portable ZIP: `dist/Ohneeohnee-Family-Phase6A-6.0.0.zip` (1,137,420 bytes); all21 archive entries verified byte-identical to the generated distribution. SHA-256: `f6ecdae65d60309fe972ca6c44eda1a847f564abfad48dc2142691e5ef0f5e79`. The ZIP is a local generated deliverable, not committed build output.
- Regenerate: `npm run architecture:phase6a:prepare`.
- Verify package independently, compare with the current unchanged Lab, and smoke-test Lab style switching: `npm run architecture:phase6a:test`.
- Existing architecture regression suite: `npm run architecture:modernist:check`.

The tracked source wrapper is intentionally assembled with its approved dependencies before importing; consume the complete distribution, not an isolated copy of index.js from the source directory. Distribution files are reproducible build output, not a separately maintained generator. Tests relocate the distribution to `.tools/phase6a-portability/package` and serve it with a host Three.js r180 peer. No Lab request is made until independent generation/determinism/rendering checks have passed. Later source-comparison requests are explicit validation only.

Optional tools reuse the existing `.tools` three0.180.0/Playwright and installed Chrome, as with the Lab. No new dependency or version was introduced. `ART_DECO_CHROME` can select another Chrome executable. `dist/` and `.tools/` remain ignored.

## Inspected game interfaces — findings, not assumptions

| Concern | Actual existing convention / evidence |
| --- | --- |
| Asset publication / acceptance | `Assets/buildings` is the Architecture-approved static package inbox. The updater stages and validates into immutable versioned `Assets/growable-registry/<id>@<version>` snapshots with accepted.json receipts. `scripts/growable-assets.cjs:definitions` prefers the accepted registry, supports a configured alternate registry, and falls back to the older inbox convention only when no accepted registry exists. No scan/registration code changed. |
| Manifest | `asset.json`, schemaVersion1, includes id/version/name, model, dimensions/floors/floorHeight, full footprint/bounds, orientation, eligibility, selection, weight and provenance. `validateAsset` verifies current supported format, source hashes at acceptance, indices, decorated footprint and bounds. Accepted receipts pin model/manifest/metadata and notices. |
| Zoning | Inspection confirms an actual `offices` category in this recovered game (`web/features/offices.js`, `web/features/growable-assets.js`, eligibility validation). Existing residential rowhouses remain separate. This is a finding about this checkout, not an assumption that every city game has office zoning. No new zone/density UI is added. |
| Growth / capacity | Existing `pcGrowableChoose`/`pcGrowableOfficeSpec` select current asset versions and respect explicit saved assignments/legacy choices. Office eligibility uses lot area, capacityMinFloors, native fit and profile maximum floors. The area-based capacities are24/40/60/80, additionally profile-limited; zoning develops immediately. The new catalogue only suggests commercial-office compatibility pending Game Coding confirmation. |
| Scale / footprint | Metres, Y-up, model ground Y=0, front+Z, entrance in local coordinates. Placement retains scale1, tries road-facing quarter-turns on the lot's actual axes, translates the native envelope, applies setback clearance and checks containment. Unsuitable sites are rejected, never stretched. Full model trim/canopy/entrance extents are required. |
| Terrain / foundations | Game foundation/support geometry is separate. Placement/render uses the existing building.y/terrain grading; the package model stays at its local Y=0. No terrain or neighbour changes are made here. |
| Rendering / resources | `pcGrowableResource` caches parts/materials/images by asset key; PNG/JPEG data and static PBR factors are decoded once. `pcGrowablesReady` resolves images. `pcFlushGrowables` creates per-chunk/per-material InstancedMesh batches, with stable buildingIds for instance picking and cached shared geometry/materials. Game scene chunks remain256m; the optional architectural optimizer's768m default is separate and configurable. |
| Removal / release | Demolition/history and chunk rebuilds remove instances while shared asset resources remain cached. Existing tests explicitly prove demolition/undo/redo do not dispose shared model geometry. The procedural wrapper adds its own model/batch leases without touching those game policies. A future adapter must coordinate chunk ownership rather than dispose the whole family runtime per demolished building. |
| Save / load | Existing captureState/history participants serialize zoning catalogueAssignments containing stable `asset:<id>@<version>` keys; restore/rebuild resolves exact versions, including retained old versions. Current tests verify JSON round trips and demolition/undo/redo. There is no procedural-family specification persistence hook here; this package supplies the full versioned specification/seed to support a later host implementation. No claim is made that new candidates are already saved/loaded by the game. |
| Integration boundary | The current static importer is opaque GLB / UV0 / embedded PNG/JPEG. Its procedural format is a standalone function expression with no import/export and a limited constructor API. This full ESM generator needs the host's complete Three.js r180 APIs, asynchronous approved maps, preserved alpha-office sorting and the lobby reflection envMap. It is deliberately not disguised as an automatically compatible asset.json. |

## Package contract and shared implementation

Wrapper ABI/generator package6.0.0 combines the **unchanged** massing core1.0.1, enhanced family assembly3.0.0 and facade profiles5.0.0. `source-lock.json` pins the ten approved implementation/helper files to the Phase5 checkpoint. Preparation copies their bytes into the portable layout; the Lab continues to use exactly those canonical sources. No Lab UI, family panel, comparison interface, performance page, HTML controls or review/localStorage code is in the package. No architectural formula, facade profile or optimization was reimplemented.

`createOhneeohneeRuntime()` loads the hash-pinned original Ohneeohnee material payload once. The existing reference loader reconstructs named materials; its temporary original-building geometries are immediately disposed. A single material library and EnhancedFamilyGenerator then serve all specifications. The four shared maps retain original source artwork and the approved opaque lobby reflection. The original static building is never rendered or modified by the family package.

`generate(spec)` clones and validates inputs, returns a Three.js Group with accurate local metadata, and caches/reuses identical geometry/materials. Spec contains explicit seed, versions, storeys, bays, tiers, roof, lobby, palette and facadeStyle. No hidden UI setting or random global state contributes. The wrapper uses the existing compatibility validators, including floor/bay ratios, whole modules, podium/tier fit, upper setback rules and slenderness limits.

Metadata includes complete measured min/max, width/depth/height, rectangle footprint, +Z front/+Y up, [0,0,0] origin, ground-level frontage entrance and actual recessed doorway, nominal floor count and raw geometry/material/map counts. Height includes roof plant. The rectangular conservative footprint includes all geometric projections. Do not measure after parenting/placing; use `model.userData.integration` for local metadata and apply the game's placement transform once.

`createBatch(models, options)` delegates to the unchanged Phase4 optimizer: opaque compatible batches merge, repeats instance whole shared mesh geometry, upper transparent objects remain independently sortable. Optimizer sourceBuildings indices allow a later game adapter to associate instance/batch ranges with candidate IDs; this phase does not implement game picking.

`release(model)` removes an individual lease/parent link and is idempotent. `batch.dispose()` releases only owned merged/instance buffers and borrowed references. A model cannot be released while a live batch borrows it. `trim()` prunes inactive geometry only. `runtime.dispose()` rejects live leases, disposes shared materials/maps once after all releases, and rejects later generation. The host renderer/scene remain caller-owned. There is no automatic activation or updater action.

## Nine frozen candidates

All unique IDs prefix `ohnee-family-`; all seeds prefix `phase6a-1138-` and are fully recorded. These are nine different specifications, not the Phase5 matrix's three identical massings repeated under three facades.

| Subfamily / suffix | Storeys | Podium | Measured W × D × H, m | Triangles / source meshes |
| --- | ---: | --- | --- | --- |
| vertical-midrise | 12 | no | 49.70 × 27.12 × 45.56 | 16,422 / 20 |
| vertical-slender | 40 | no | 28.30 × 28.52 × 143.37 | 22,158 / 20 |
| vertical-podium | 35 | yes | 52.70 × 32.72 × 129.35 | 29,592 / 21 |
| horizontal-broad-midrise | 12 | no | 45.90 × 23.32 × 45.96 | 15,186 / 20 |
| horizontal-rectangular-tower | 26 | no | 38.10 × 34.12 × 92.61 | 19,654 / 20 |
| horizontal-podium | 22 | yes | 34.90 × 27.32 × 84.08 | 18,616 / 19 |
| grid-compact | 8 | no | 28.30 × 16.99 × 29.48 | 7,214 / 18 |
| grid-tall-tower | 30 | no | 36.30 × 28.99 × 108.47 | 18,050 / 20 |
| grid-podium | 35 | yes | 52.70 × 40.72 × 134.45 | 29,188 / 21 |

The catalogue records full precision (table rounded), core/component versions, complete specification, role, family/subfamily, advisory minimum lot dimensions with0.3m setback, existing offices vocabulary subject to confirmation, engine/resource dependencies, performance and deterministic geometry/material signature. It has `registrationEnabled:false`; its candidate schema is documentation for this procedural contract, not a competing static asset registration system. Nothing is placed in either live asset directory.

## Validation and observed limits

- **Nine independent imports/generations succeed** from a relocated portable folder with no Lab requests.
- Repeated/warm generation shares exact geometry/material objects. Fresh/cold runtimes produce matching geometry/index/normal/UV/material signatures. Inputs remain unchanged. Invalid styles/fractional bays are rejected.
- All nine packaged signatures match the unchanged Lab EnhancedFamilyGenerator, including podium/lobby/roof/alpha settings. Geometry is not rescaled or simplified.
- Native dimensions/footprints and entrance/actual doorway are measured from the generated Groups and checked against the recorded catalogue on subsequent tests. Ground remains0; front is consistently+Z. Materials decode with no errors; lobbies remain opaque and reflective.
- Nine sources:179 meshes ->52 optimized render objects (24 merged opaque batches, one borrowed opaque object and27 deliberately retained transparent objects),176,080 model triangles. Shared four-map memory estimate is1.625MiB including mip allowance; not multiplied by nine. The standalone test also exercises five repeated same-spec leases and confirms opaque instancing.
- Cleanup evidence:179 unique source geometries,28 used materials and4 textures each receive exactly one dispose event. Active model/batch counts and family/baseline caches return to0; double release/dispose is safe. Batch borrowers prevent premature release.
- The host renderer retains its PMREM scratch cache: one initial ground geometry/one shadow texture becomes9 geometries/2 textures after first env reflection use. Counts remain exactly9/2 across three additional fresh-runtime lifecycles; no growing leak was observed. Package dispose deliberately does not shut down a shared host renderer.
- Preserved Lab facade page renders and switches selected facade to horizontal successfully. All **44** existing architectural tests pass, including golden approved grid signatures, all30 facade/archetype combinations, lobby/ray/roof checks, optimizer transforms and stress/disposal coverage.
- `npm run build` passes all **74** existing game/import checks and original52 SHA-256/license checks. Main generated runtime and accepted/static model registries remain byte-unchanged.

Rendered evidence (ignored, reproducible): `.tools/phase6a-nine-candidates.png`, `.tools/phase6a-{vertical|horizontal|grid}-podium.png`, `.tools/phase6a-preserved-lab.png`. Raw report `.tools/phase6a-validation.json`. The images show preserved massing/opaque lobbies/roof plant; visual subfamily identity is clearer in closer views than the distant matrix. No city screenshot or new growable behavior is claimed in this phase.

Known limitations: this is browser ESM with a Three.js peer, not a standalone opaque static factory/GLB drop-in. Async image decoding/fetch (or caller-supplied material payload) is required. Original upper-office transparency and reflection environment must remain; current static import would reject or lose them, so a future common adapter is required. No worker image loader, LOD, dense-city GPU certification, simulation/zoning changes, procedural save hook, lot-fit activation or game-specific selection adapter is included. Texture/interior reflection repetition and simplified mechanical details remain those of the approved generator. A controlled Game Coding milestone must bind engine/imports, readiness, per-chunk batching, stable identity/history and ownership before enabling any candidate.

## Preservation / handoff

Checkpoint: annotated `checkpoint/pre-ohneeohnee-phase6a-20261114` at ae30ab76ca80ae8a35ff7942eda96767abee333d, verified complete `.tools/pre-ohneeohnee-phase6a-20261114.bundle`. Branch `codex/ohneeohnee-phase6a-package`. Existing unrelated Lind reference moves remain untouched/excluded. Local checkpoints/commits are not off-computer backups.

The new source package and catalogue are available to Game Coding through the shared checkout. Copy/serve the complete generated distribution and bind its `three` import to the existing full engine; follow its README for async initialization and lifecycle. Do not run the accepted-building updater on this candidate folder, copy it into a live registry, or silently coerce its materials to the static subset. No gameplay integration or registration was implemented. Push requires separate explicit approval under AGENTS.md.
