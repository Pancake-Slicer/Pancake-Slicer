# Lightweight parametric architecture — Phase 1 review

2026-11-16, America/Toronto. Isolated BMO-inspired family, template 1.0.0. **Not registered or activated in normal gameplay. Visual review and NVIDIA profiling remain pending.**

## Open the review

Open **http://127.0.0.1:4195/lightweight.html** in desktop Google Chrome. The isolated server was started during development. If it is no longer running, double-click **Review Lightweight Architecture.cmd** in this checkout and keep its window open, or run **npm run architecture:lightweight**. No asset selection or JSON editing is required. The original Architecture Lab remains separate on port4187.

The comparison contains actual generated geometry on five different lots: Narrow24×26m, Wide64×34m with a podium, Deep32×56m, Rotated42×32m at0.43radians, and an irregular trapezoid. Use the selector, Inspect, Front and Roof buttons, drag to orbit and scroll to zoom. Lot outlines distinguish the legal parcel from the rectangular architectural envelope. The irregular-lot result remains rectangular; it does not deform around the boundary or claim complete lot coverage.

**Measure both families** runs the isolated architecture comparison and saves a local report in `.tools/lightweight-reports/report-lab.json`. **Save current view** writes the actual canvas to that same ignored folder. Download measurements saves a user-readable JSON through Chrome. No screenshots have been claimed from an unobserved scene.

For the unchanged current game, open **http://127.0.0.1:4195/game-baseline.html**. This profiling-only copy creates a flat480m city, seed1138, ordinary120m road spacing and the existing catalogue on68 Office lots, with experimental Ohneeohnee disabled. It records moving-camera intervals, FPS calculated from mean interval, draw calls, triangles, generation/rebuild CPU time, renderer geometry/texture counts, GPU label, viewport and browser JS heap where exposed. The report is saved to `.tools/lightweight-reports/report-game.json`.

## Preservation and checkpoint

The starting commit is `820d31d` (BMO Lab study). A separate worktree/branch, `architecture/lightweight-parametric-phase1`, keeps the older worktree's launcher edit and Art Deco reference moves separate. Before implementation, a verified complete-history Git bundle plus the old worktree's binary diff and untracked references were saved under `C:/Users/camsh/Desktop/Pancake-Slicer-main/.tools/lightweight-phase1-checkpoint`. That folder is local, ignored and **not an off-computer backup**.

Original52 remains SHA-256 `c8eff97d4c0daefd2cf7b6d967a694ce8a999e4a3e1402d88fee4fea6077778c`. The BMO prototype and original Lab, Ohneeohnee generators/assemblies, nine integration configurations, approved assets/maps, Lind, Von Badel, existing registry, game runtime, roads and continuous Office-block logic are unchanged. No main/tag/history rewrite, force-push or GitHub push occurred.

## Shared contract

- `architecture/lightweight/template.mjs`: host-neutral fit/generate/release and atomic history-participant capture/restore.
- `architecture/lightweight/bmo.mjs`: versioned adapter around the unchanged BMO specification and generator.
- `scripts/lightweight-host.cjs`: review/test binding to the **actual recovered game's** polygon operations (`Te`, `je`, `sn`, `Bo`, `cS`) and corrected street-facing function (`pcGrowableFacing`). It does not maintain a competing polygon engine.
- `architecture/lab/lightweight.html` / `lightweight.js`: isolated visual review and browser measurement controls.
- `scripts/prepare-lightweight.cjs`, `lightweight-serve.cjs`: local packaging, actual-game baseline fixture and loopback-only report/capture endpoints. They never patch the production runtime.

`createTemplateSystem({definition,generator,polygon})` accepts an existing lot/property. `fit(lot,{parameters,seed,setback,capacity})` returns either `{ok:true,record}` or `{ok:false,reason}`. Rejection leaves the host free to try another eligible catalogue building. No allocation/model generation happens during fit.

A record contains schema version, template identity/version, deterministic seed, lot ID, normalized architectural parameters, native position/rotation/scale and the conservative full footprint. Parameters include width/depth, whole storeys, floor/lobby height, resolved bay inputs, optional podium, flat mechanical roof and silver/blue-grey material palette. Unsupported roofs/palettes reject explicitly. Material variation families are intentionally not added. The seed is persisted for reproducibility; this first family has no extra random decoration.

The solver uses the existing street axes, projects the lot into local coordinates, rebuilds the BMO dimensions/bay grids and checks polygon difference against the inset lot. A bounded deterministic search tries candidate sizes/centres. Clearance includes projecting architecture. It does not stretch Object3D scale or modify plots. Window/structural bays retain the existing1.8–3.2m pitch constraints. Storey counts are retained or rejected against the supplied capacity; height is not arbitrarily scaled to fit.

`generate(record)` produces a leased native-scale Group; release it after its borrowing chunk batch has been cleared. Identical shapes share cached geometry. All variants share nine opaque materials and two small maps. Existing material-batching and repeated whole-mesh instancing remain. The adapter does not add per-window objects, interiors, transparency, reflection captures or postprocess effects.

## Measured non-browser comparison

Reproduce with **npm run architecture:lightweight:measure**. Exact records, dimensions, grids, allocation counts and timings are committed in `LIGHTWEIGHT_PHASE1_CPU.json`. This is a Node geometry experiment, not renderer FPS. Detailed Ohneeohnee uses neutral material stubs, so its timings exclude image decoding. Both use the existing Three.js r180 geometry paths and existing optimizer.

| Lot | BMO triangles | Detailed Ohneeohnee triangles | BMO generation ms | Detailed generation ms |
|---|---:|---:|---:|---:|
| Narrow |3,260|11,936|9.68|45.18|
| Wide podium |6,152|20,558|2.56|60.75|
| Deep |4,652|20,494|1.76|60.07|
| Rotated |4,460|18,706|3.00|43.77|
| Irregular |4,508|19,852|1.99|40.70|
| Total |23,032|91,546|18.98|250.47|

Fit-search samples took0.73–5.26ms, separately from model generation. These are single cold samples with JIT/order effects, not statistically controlled speed guarantees. Comparator floors match, while body dimensions use the nearest supported2.2m Ohneeohnee grid (maximum24 depth bays); the BMO wide case has a podium and its comparator does not. Full measured dimensions are recorded, so this is an architecture-complexity comparison rather than identical models.

Across the five source models, BMO geometry uses1,616,080bytes versus6,554,716bytes. In one768m comparison chunk, the existing optimizer produces9 BMO architecture batches versus32 detailed batches, including15 transparent detailed objects. Owned merged buffers are1,616,080 versus5,701,548bytes. These are architecture batches, **not measured scene draw calls**; shadows/ground can add draws. Existing256m chunk behaviour is covered separately in tests.

BMO has about75% fewer triangles and75% less source-geometry storage in this fixture. Its nine opaque materials and two maps are shared across every lot; raw source maps total98,304bytes (96KiB), excluding generated mipmaps, environment processing, shadow maps and driver memory. The reported Node heap is process-wide and is not attributed to building GPU allocation.

## Browser status — no fabricated baseline

Computer-use could read the Chrome window but was stopped by its URL-verification safety check when opening the local profiling page. No further browser input or alternate automation was used. **Current NVIDIA GPU selection, FPS/frame time, actual scene draw calls, browser memory and visual appearance have not been verified for this milestone.** The earlier Chrome NVIDIA verification belongs to the earlier task and is not reused as a new measurement.

The prepared pages measure their own active WebGL renderer; a report counts as the requested NVIDIA baseline only if its `nvidia` field is true. Browser timing and screenshot files are absent until the pages actually run and save them. The reduced geometry/material cost is verified; visual success and complete game speed are not inferred from unit tests.

## Integration readiness and limitations

12 BMO/template tests cover decorated containment, narrow/wide/deep/rotated/irregular lots, incompatible concave/sliver/hole sites, zoning/capacity rejection, native scale, deterministic geometry, JSON capture/restore, actual game's Undo/Redo participant restoration, opaque material reuse, merging/instancing and lease cleanup. Actual continuous Office plots fit or reject without changing roads, zones or layout. The existing84 game checks/build and44 architecture checks also pass.

The host can store the record with a growable assignment, register the supplied capture/restore participant, feed the generated Group into the existing neighbourhood batch and release it on demolition/rebuild. Batch `sourceBuildings` retains building-index mappings for a later picking adapter. **No host registration, normal growth selection or production picking hook is activated in Phase1.** Full live-game demolition/selection integration still requires the later approved milestone; the existing game is preserved byte-identically.

The search is conservative and not a maximal inscribed-rectangle optimizer. It can reject some theoretically usable sites, and irregular sites can retain unused lot area. Lots with holes reject. Terrain suitability remains the host's responsibility; the generator honours the supplied foundation Y and does not grade terrain. Long-depth/width/slenderness limits deliberately retain the studied architecture. Only the approved BMO silver/blue-grey palette and flat mechanical roof are supported. No new city-save UI, LOD system or additional family is included.

Stop at this isolated review. Do not enable growth or develop another family before visual approval.
