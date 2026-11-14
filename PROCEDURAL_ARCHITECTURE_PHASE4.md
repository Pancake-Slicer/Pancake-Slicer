# Phase 4 — approved architecture rendering optimization

## Open the comparison

Open **http://127.0.0.1:4187/performance.html** in Chrome. If needed, double-click **Play Procedural Architecture Lab.cmd** in this project, leave its window open, then open the link. The ordinary family lab also has a **Rendering performance / stress lab** link. Press **Ctrl+F5** if an older page is open. Everything is served locally; no internet assets or new packages are required.

The performance view starts with **10**, never 100, buildings. **Rendering comparison** switches between the approved enhanced renderer, optimized renderer, and a labelled matched split view. Choose a building and use **Inspect selected**, **Facade**, **Street lobby**, or **Roof**; both versions share camera, lighting, geometry and materials. Drag/Shift- or right-drag/scroll preserve orbit/pan/zoom. **Regenerate selected** rebuilds only that source building and its render batches; **Load test** restores the deterministic benchmark.

Choose **10 / 25 / 50 / 100**, then **Load test** for the separate stress scene. **Repeat approved ten** studies reuse; **Varied deterministic seeds** generates different compatible specifications. **Measure before / optimized** locks controls while measuring matched views. **Remove test buildings** releases test geometry; the approved reference, ground and shared session resources remain. **Test resource removal · 3 cycles** repeats load/render/removal. **Export performance report** saves the current run history, camera parameters, specifications, GPU information, resource counts and method to Downloads. Camera/scene changes invalidate current timing text.

The original family generator, review workflow and 07A/07B comparison remain available through the header links. No building was published to the growable catalogue; the main game is unchanged. This phase delivers an optimized render path for the existing generator, not a redesigned geometry generator or a new game export.

## Measured results

Final run: Three.js r180, Chromium WebGL 2 / ANGLE Direct3D11 on **Intel Iris Xe**, 570 × 556 CSS pixels at pixel ratio 1.25. Before means the **approved enhanced Phase 3 family**, not the simpler Phase 1 buildings. Each pair uses the same camera, sunlight, materials and building specifications. Counts below are actual scene submissions.

| Test | Scene calls before → optimized | Submitted triangles in both | Median ms before → optimized | p95 ms before → optimized |
| --- | ---: | ---: | ---: | ---: |
| Approved ten | 210 → 70 | 191,920 | 3.1 → 1.8 | 4.1 → 2.3 |
| Building 07 alone | 22 → 22 | 26,524 | 1.0 → 0.9 | 1.3 → 1.3 |
| 25, repeated family | 496 → 105 | 424,784 | 5.4 → 2.2 | 6.5 → 3.5 |
| 50, repeated family | 996 → 320 | 884,792 | 10.0 → 4.7 | 11.6 → 10.1 |
| 100, repeated family | 1,991 → 470 | 1,769,572 | 15.1 → 4.3 | 19.0 → 7.2 |
| 25, varied seeds | 496 → 105 | 413,276 | 5.3 → 2.3 | 6.7 → 3.5 |

The ten-building scene includes the unchanged reference and ground (11 calls / 14,964 triangles). The single-building and larger/varied stress scenes include only the ground in addition to test buildings (one call / 12 triangles).

Building-specific counts: the approved ten go from **199 to 59 meshes/drawable objects**, with **176,956 triangles**, **32 unique materials**, and **four shared source/reflection maps** in both versions. The single approved 07 has 21 material batches already, so it receives no draw-count reduction. At 100 repeated buildings, building-specific objects go from **1,990 to 469**, with unchanged **1,769,560 triangles**. Its optimized representation uses **169 instanced opaque batches and 300 separately sorted glass objects**.

Each timing uses 60 wall-clock samples after eight warmups, sequential before then optimized, bracketing camera/renderer work plus `gl.finish` with cached shadows. It excludes construction and compositor/UI scheduling; it is not a GPU timer-query measurement, whole-app FPS, or a city-game certification. Sequential order, background work, driver scheduling and cache/GC effects can influence timings. Earlier exploratory runs varied; the table reports the final implementation's recorded run. Stress cameras fit each scene, so timings across different counts do not isolate geometry scaling alone. The complete configurations and camera state are saved in the report.

## Rendering decisions

The approved generator already merges each building's repeated windows, mullions and other parts. Making each pane an instance would add objects and setup work. `architecture/assemblies/optimized-renderer.js` instead accepts the existing generated models:

- Pool **opaque static geometry by exact shared material identity, spatial chunk and render flags**. No material recolouring, atlas substitution, shader replacement or geometric simplification occurs. World positions and normal matrices are baked into owned typed buffers; UVs, indices and shadow flags are retained. Single-record buckets borrow their original geometry instead of making an unnecessary copy.
- Instance **whole existing opaque mesh batches** when geometry repeats. A material bucket with at least four repeats per unique geometry favors instance reuse over copying vertices. Mirrored/sheared transforms use the exact matrix/normal path instead of approximate instance normals. This is a geometry/material rule, not a building-index rule.
- Keep transparent office panes as individual source meshes, retaining their geometry, material, world-space centres and order. Pooling those objects can change alpha sorting. Opaque lobby glass remains exactly the approved blue-grey material.
- Compute bounds on output batches/instances and retain normal Three.js frustum culling. The configurable chunk size is 768 m in this benchmark. This deliberately favors batching for a fully visible test scene; it is not a settled city-wide chunk size.

The approved source generator, massing rules, all ten seeds/parameters, original custom models and prototype modules remain byte-identical. Geometry checks compare the complete material-tagged world triangle/UV/normal multiset. The adapter has no Building 07-specific dimensions, recipes or exceptions.

## Memory and ownership

The adapter owns only its merged geometry and instance-matrix buffers. Borrowed source geometries/materials/maps belong to the generator. Call **clear before releasing source leases**; then the performance view prunes unused geometry from its private generator and baseline cache. Shared session materials/maps are retained deliberately. Regeneration follows the same order and preserves neighbors.

The final ten-building path adds approximately **10.66 MiB** of merged attribute/index arrays. The 25-repeat case uses approximately **25.61 MiB** plus 1 KiB of matrices. These are buffer-array footprints, not complete process/GPU allocation measurements; holding both representations for comparison also has a cost. Repeated 50/100 cases use **zero copied merged geometry buffers**, and **54,080 / 108,160 bytes** of instance matrices. A first prototype copied about 108 MiB for 100 buildings to reach 330 scene calls; the final policy deliberately uses 470 calls to avoid that large copy. It remains a 76% scene-call reduction from the approved baseline.

All variants retain the same material and texture objects. Four architectural maps estimate to 1.63 MiB using the existing RGBA/mipmap approximation. Renderer runtime counts settle at seven textures including environment/shadow resources; filtered environment/shadow/program allocations are outside that map estimate. After instancing warmup, 13 shader programs are cached for the session.

Actual three-cycle **100-building** removal testing returned to the same baseline every time: **19 renderer geometries, seven textures, 13 warmed programs, zero generated/baseline cache entries, zero owned merged geometries, and zero instance buffers**. Those 19 geometries include the reference, ground and renderer internals; they are not leaked test models. Removing the varied 25-building scene also returned to that baseline. This verifies the tested WebGL resource counters and owner bookkeeping, not an exhaustive browser heap/driver-memory leak certification.

## Validation and visual evidence

**37 architecture tests and all 74 game checks pass; `npm run build` passes.** `npm run architecture:modernist:check` includes all previous suites plus optimization tests for exact triangles/materials/UVs/normals, transparency preservation, whole-mesh instances, compatible flags, finite spatial bounds, transforms, borrowed-resource disposal, four stress counts and selected-building regeneration. Approved generator/prototype source hashes and the original v52 hash remain guarded.

Actual browser inspection covered the unchanged family lab, optimized ten-building scene, labelled 07 lobby/facade/roof comparisons, regeneration, all four stress counts, distinct varied seeds, removal cycles and return to the default ten. Browser warnings/errors were empty. The optimized render showed no visible architectural regression in inspected views.

Comparable PNGs are in **Downloads\Pancake City - Architecture Performance Phase 4**. A 570 × 400 pixel stage crop of the 07 lobby was **pixel-identical** before/after. The ten-building crop had mean absolute channel difference **0.167 / 255**, with **153 of 228,000 pixels** exceeding eight channel levels. These small raster differences are consistent with float32 baking/draw ordering; they are not a claim that every camera is pixel-identical. Screenshots were visually inspected as well as measured.

Final raw data: **Downloads\Pancake City - Phase 4 Performance Report (5).json**. Earlier numbered exports are exploratory runs and remain preserved. The compact committed report, source hashes, screenshot hashes and pixel checks are in `docs/ARCHITECTURE_PHASE4_VALIDATION.json`.

## Future integration and limits

The adapter supports static generated meshes with position/normal/UV attributes and a single material per mesh. It is not a general skinned/morphing/group-material GLB adapter. Source model references must remain leased until output is cleared. Chunk membership metadata identifies source building indices; city integration still needs persistent IDs, exact triangle/instance picking maps and dirty-chunk rebuilds for selection, demolition and undo/redo. None of those gameplay systems have been replaced.

Next priorities, after approval: profile a bounded city integration with real roads/traffic; tune spatial chunks against culling and rebuild costs; keep repeated geometry resident with clear ownership; investigate reducing the remaining three glass submissions per visible building without changing blending/material appearance; move cold procedural construction off the interaction path. Cold test construction remains synchronous (roughly 3 s for the final ten/repeated cases and 7 s for 25 distinct models in this run), separate from steady rendering. No 100-unique-model timing, moving-city FPS, complex LOD or city-wide renderer certification is claimed. No architectural details were removed.

Safety branch **safety/pre-performance-phase4-34bb4e4**, plus a verified complete local Git bundle under `.tools/performance-phase4`, preserve the approved checkpoint. Work is on **architecture/ohneeohnee-performance-phase4**. No push, main/tag change, history rewrite, asset publication or city integration has occurred. Pre-existing reference-image moves stay excluded. A local checkpoint is not an off-computer backup.
