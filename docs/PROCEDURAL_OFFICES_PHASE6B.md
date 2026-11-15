# Phase 6B — controlled procedural Office integration

## Play and test

Two self-contained HTML builds are recorded in `docs/PROCEDURAL_OFFICES_PHASE6B_VALIDATION.json` with their exact Downloads paths and SHA-256. Both embed the full approved generator closure, nine specifications, textures, game, CSS and existing license notices. No server or internet is required by the artifact.

- **Procedural Offices Demo** creates a flat480m test map with ordinary two-way streets. It grows68 offices through normal zoning:55 experimental buildings covering all nine candidates, plus13 existing catalogue buildings. Wait for **Phase6B checks PASS**; it first measures the normal catalogue, then tests the mixed city, history and cleanup. Afterwards it is the normal playable game, with camera, construction, demolition and Undo available.
- **Procedural Offices Playtest** starts the ordinary terrain setup. Double-click in Chrome, create terrain, build streets, then open **Development · experimental offices** at bottom right. Enable Ohneeohnee and choose all/vertical/horizontal/grid. Choose **Zoning → Office → Mix all98**, then paint unassigned lots or bucket-fill a block. Use roughly120m street spacing for a useful mix of sufficiently large lots. Native model fit, available floor capacity and existing catalogue weights determine which buildings grow. Growth is immediate, following the existing game; no new demand simulation was added.
- Disable the experiment for normal *future* growth. Existing buildings and already assigned sites retain their model/specification. A facade filter never restyles an existing building. Use new, unassigned Office lots when testing another filter. Demolish/repaint permits redevelopment using the existing assignment rules; Undo restores the exact former building.

Reproduce both uniquely named Downloads files with **`npm run export:procedural-offices`**. It runs the game checks/build, preserves existing exports, and writes a blank-city Playtest and populated Demo. Ordinary `npm start` shows no permanent experimental controls; use `http://127.0.0.1:4173/?experimental-offices` for a server-based development session. These special HTML exports mark themselves as development builds, so their controls are available without a query string.

## Integration boundary

- Architecture remains authoritative: `architecture/integration/ohneeohnee-family/index.js`, its frozen catalogue/candidates and source-lock; original architecture/assemblies, modernist and benchmark modules are unchanged. No approved GLB/map, Lab, facade profile, lobby or optimizer edits.
- `scripts/procedural-offices.cjs` embeds that exact ESM source closure into isolated module scopes and binds it to the **existing recovered Three.js r180 constructors**. No second engine, separate simplified generator, dependency install, runtime module request or external artwork. Source-lock validation rejects unreviewed architectural changes. The package's material payload is supplied directly, so its optional fetch branch is not used.
- `web/features/procedural-offices.js` owns only host registration, controls, placement metadata, history, chunk leases and picking. Nine stable `asset:ohnee-family-…@6.0.0` keys join the existing runtime catalogue; static accepted registries and existing assets stay unchanged. The portable architecture catalogue itself remains an inactive handoff; activation belongs to this explicit opt-in host adapter.
- Existing `offices` zoning, capacity limits, polygon containment, lot axes and frontage choice are used. Full decorated bounds, canopy/entrance projections and0.3m clearance are respected at scale1. Unsuitable narrow, concave, curved-edge or low-capacity sites use a compatible existing building. No lot or road generator changes were made to force a fit.
- Native grounds sit on the existing foundation Y; terrain support remains separate game geometry. There is no architectural stretching/recentering or automatic podium addition.

## Rendering, selection and ownership

One async material pool is initialized at startup. If experimental loading fails, the experiment reports unavailable and ordinary startup/catalogue/zoning remain usable. Only buildings actually chosen by growth request model leases. Repeated candidates share geometry/materials/maps; camera movement does not generate buildings.

Each affected existing256m neighbourhood chunk delegates its experimental buildings to the unchanged package `createBatch` / Phase4 optimizer. Opaque merging/whole-mesh instancing and independently sorted transparent office surfaces are retained. Opaque reflective lobbies remain exact. The game renders batch roots, never the source Groups as well.

The picking adapter maps actual batch hit points back to the original nonoverlapping native footprints and building IDs. It works for merged and instanced batches, preserves the regular selection highlight and enables normal demolition. No simplified architectural proxy is rendered.

Before a chunk is replaced, dispose its owned batch buffers, then release its source-model leases. Templates remain available through the synchronous chunk transaction to avoid rebuilding them unnecessarily; prune unused geometry once after all chunk replacements/removals. Shared materials/maps remain available for the world lifetime. The package owns its resources; game teardown never blindly disposes borrowed source geometry. No new LOD or costly render effect was added.

`pcOhneeInfo()` exposes diagnostic counts/bytes without changing rendering. Development `performanceInfo()` now also includes existing renderer call/memory counters. The older neighbourhood `meshes` field counts direct children, so use these batch/renderer counters when comparing nested procedural batches.

## Persistence and existing systems

The existing zoning history participant now includes `proceduralOffices`: development filter state plus candidate ID, package version, full frozen architectural specification and string seed per assigned parcel. Original `catalogueAssignments` still stores stable asset keys. Rebuild/load resolves the known candidate and validates its full saved record rather than generating a new random building.

Old snapshots with no procedural field default to disabled; old static keys and explicit SC4 choices retain their previous behavior. Demolition, Undo/Redo, regeneration and JSON capture/restore are tested. A newly constructed zoning collection restored from the captured JSON produces identical building signatures.

This checkout's user interface has no confirmed complete city-file save/load workflow. This milestone preserves/extends its existing history and serializable state contract; it does **not** add or claim a new disk-save system. Do not rely on closing/reopening an HTML to retain a city.

Roads, curves, lots, rowhouses, traffic, terrain, landmarks and simulation code are not rewritten. Existing74 regressions remain, with the accepted-static smoke probe deliberately restricted to its static registry format; the ESM family receives independent async placement/fidelity/lifecycle tests instead of being coerced into that opaque-static importer.

## Validation

The committed validation JSON records measurements and file/screenshot hashes. Tests cover natural growth of all nine candidates, all three filters, default disabled behavior, explicit saved identity, native fit on rotated/irregular lots, residential/undersized/low-capacity rejection, mixed existing catalogue growth, deterministic rebuilds, fresh collection restore, demolition/Undo/Redo, batch picking and complete removal. A failed experimental image load is tested to preserve ordinary zoning/catalogue operation.

Actual rendered-game checks confirm all nine geometry/normal/UV/index/material signatures equal the Phase6A catalogue/Architecture Lab signatures on the recovered engine. The demo checks normal growth, regeneration, JSON restoration, removal cycles and a real screen-ray pick. Separately, the normal demolition button removed the visible tower and Undo visibly restored it; all filter controls and the default-off new-city panel were exercised. The ordinary flat inland terrain/highway flow completed without errors.

Browser policy disallowed `file://` automation. Identical SHA-verified copies of the exact Downloads HTML were tested over a restricted localhost server at port4192; no externally hosted models/modules are required. Static offline embedding checks pass, but a direct double-click Chrome launch remains a user-side verification. This distinction is intentional.

Existing baseline forest materials emit MeshToonMaterial/flatShading warnings, and the existing postprocess shader emits driver derivative warnings. Those unrelated rendering sources were preserved. The final integration self-checks have no errors. Screenshots are in `C:\Users\camsh\Downloads\Pancake City - Phase6B Screenshots`.

## Measured performance and allocation

1280×720 test-browser viewport, identical flat map/68 Office lots/camera path,80 camera-motion rAF intervals after8 warmups. This includes browser scheduling, other browser workload and existing postprocessing; it is **not** isolated GPU time or a guaranteed standalone Chrome FPS measurement. The comparison swaps the populated catalogue, not equal-triangle models.

| Case | Renderer calls | Submitted triangles | Median / p95 interval | Initial neighbourhood build CPU |
|---|---:|---:|---:|---:|
| Original catalogue,68 offices | 519 | 744,044 |104.8 /114.1ms |126.7ms |
| Mixed,55 experimental +13 existing |831 |1,342,513 |113.2 /118.3ms |806.7ms |

The experiment increases detail/submitted triangles and calls; the observed median interval increases about8%. The already high baseline is a limitation of this test session, not evidence of smooth production performance. Bulk cold growth visibly costs CPU time. Native Chrome performance should be reviewed before broader rollout. No architectural detail or alpha settings were sacrificed to hide the cost.

The55 experimental buildings share179 source geometries (~12.12MiB),28 used materials and4 maps, with9 enhanced templates,4 live chunk batches and500 optimizer render objects. Owned merged buffers ~58.24MiB; instance matrices2048bytes. These are source/adapter allocation estimates, not total driver memory. Upper office glass retains its approved transparent sorting cost. The lobby remains opaque.

After each of three full removal cycles:0 active model leases,0 batches,0 enhanced/baseline cache entries. Renderer counts return to the same286 geometries/94 textures on all three cycles. Existing static-model resources, package materials/maps and renderer reflection/shader caches intentionally remain; no growing leak was observed, and no claim of zero retained driver memory is made.

## Recovery and limits

Work is on `gameplay/ohneeohnee-phase6b`. Safety branch `safety/pre-office-phase6b-3bc8d0e` and verified `.tools/phase6b/history.bundle` retain complete prior Git history. Existing uncommitted Art Deco reference moves were preserved/excluded, with an extra local copy of their Kind folder. All pre-phase Architecture/benchmark/approved asset/original52 file hashes remain unchanged. Main and tags remain unchanged; pushing this milestone requires explicit approval and includes its Phase6A parent commit. A local checkpoint is not an off-computer backup.

This is a nine-spec experimental integration, not unrestricted generation or a catalogue replacement. Appearance under the game's existing light/postprocessing differs from the isolated Lab despite exact model/material fidelity; no architectural appearance was retuned. Native fit can leave margins around narrower approved buildings. One pre-existing synthetic144m-grid parcel-centre failure was observed during exploration;120m test grids and the existing regression fixtures work, and lot generation was left unchanged. No exhaustive terrain/road-layout certification is claimed.

Next: play the development build, review lighting/placement and native Chrome frame times, then approve a separate rollout/performance milestone. Do not expand the generator's specification space or change approved architecture in this integration workflow.
