# Ohneeohnee family — enhanced benchmark, Phase 3

## Open and review

Open **http://127.0.0.1:4187/** in Chrome and press **Ctrl+F5** if an old page is open. If the server is stopped, double-click **Play Procedural Architecture Lab.cmd** in this project and leave its window open. This is the separate Architecture Lab, not a new game export.

1. Leave **Architectural assemblies** on **Enhanced family** and the seed at **1138** for the ten-building benchmark.
2. Choose a building, then use **Inspect selected**, **Facade**, **Street lobby**, or **Roof**. Street lobby starts at a 1.6 m eye height. Drag to orbit, right/Shift-drag to pan, scroll to zoom, and use **Reset camera** or **Full lineup** to recover the view.
3. Switch **Architectural assemblies** to **Original benchmark** for the same specifications, positions, camera and lighting with the original facades. Switching in an inspection retains the selected building and refits its full-building camera. No models are repainted or overwritten.
4. **Regenerate selected** changes only that building's revision. **Generate ten** restores revision zero for the entered seed; **New seed + ten** creates another deterministic family. Cold generation builds both comparison variants and can take a few seconds; it is not performed during camera movement.
5. Scroll down the sidebar to save review status/notes for the selected enhanced building. Reviews are bound to the exact seed/specification/revision and family version. Export/import provides a portable backup; ordinary local storage survives reload in the same browser/profile/origin. Changing review status never changes geometry or publishes a growable.
6. The header's **07A / 07B comparison** retains the approved Phase 2 prototype and its separate review records. **Ten-building lineup** returns to the family.

All family review entries are left **Unreviewed**, with temporary test notes cleared. The user's approval of 07B is retained as the design reference, not treated as blanket approval of the new family.

## What changed

`architecture/assemblies/family.js` wraps the unchanged specification/massing generator with the existing approved curtain-wall, spandrel, profiled mullion, corner, opaque reflective lobby, entrance and repaired roof assemblies. It accepts specifications rather than building indices. One shared approved 07B facade material library and lobby reflection map serve the family; existing source roof palettes remain. Repeated specifications reuse generated geometry through a bounded, reference-counted cache. Geometry stays merged by material, with no individual window meshes, live reflection captures or complex LOD pipeline.

Lobby selection uses geometry: compatible podiums select **C**; otherwise broad towers with at least sixteen frontage bays select **B**, with **A** for narrower towers and a compatibility fallback. No podium is added. Non-podium columns are recessed within the existing decorated envelope; existing canopy specifications retain their original projection. Paired structural-bay rhythm gets the appropriate wider mullion accents. These rules are reusable and do not special-case any benchmark index or seed.

The approved 07B specification and complete geometry/material-setting signature are frozen in `scripts/fixtures/family-phase3-approved07.json` from commit `88e774d`. A regression verifies identical output through the new family generator. The Phase 2 assembly version remains 2.1.1; the family wrapper/review schema is version 3.0.0. The original massing specification and geometry modules are unchanged, as are original custom models, maps, source packages, main game and growable registry.

| Building | Storeys | Lobby | Original composition retained |
| --- | ---: | --- | --- |
| 01 Compact court | 8 | A | Compact non-podium, parapet roof |
| 02 Broad commercial slab | 12 | B | Wide non-podium slab, recessed roof |
| 03 Slender urban office | 18 | A | Narrow tower, canopy, screened plant |
| 04 Lobby and low podium | 22 | C | Three-storey podium |
| 05 Rectangular curtain tower | 26 | B | Broad rectangular tower |
| 06 Mechanical penthouse | 30 | B | Distinct penthouse silhouette |
| 07 Broad podium tower | 35 | C | Exact approved 07B output |
| 08 Slender high-rise | 40 | A | Slender non-podium tower |
| 09 Restrained upper setbacks | 45 | B | Upper setback and terrace |
| 10 Paired-bay headquarters | 25 | B | Paired mullion rhythm, screened roof |

All ten have exact original measured min/max bounds, heights, footprints and massing volumes at seed 1138. Seeds, floor/bay dimensions, podiums and setbacks remain original. Width changes add whole modules rather than stretching windows.

## Measured rendering costs

| Statistic | Original family | Enhanced family |
| --- | ---: | ---: |
| Model meshes | 88 | 199 |
| Model triangles | 173,888 | 176,956 |
| Unique materials | 27 | 32 |
| Unique texture maps | 3 | 4 |
| Geometry array allocation | 11.61 MiB | 12.24 MiB |
| Estimated texture RGBA + mip allocation | 1.58 MiB | 1.63 MiB |
| Actual lineup draw calls including reference/ground | 99 | 210 |
| Actual lineup triangles including reference/ground | 188,852 | 191,920 |
| Matched measured median / p95 | 2.30 / 3.00 ms | 3.50 / 4.60 ms |

Timings: 60 samples per variant after eight warmups, sequential original then enhanced, same 570 × 556 CSS viewport at pixel ratio 1.25, same lineup camera/daylight. Includes camera update, renderer submission and `gl.finish`, with cached shadows, reference and ground. Excludes cold construction, UI labels and compositor scheduling. It is neither whole-app FPS nor large-city certification. Controls are locked during measurement, then restored. **Measure matched lineups** can repeat it on the user's machine; **Export family report** records counts, method, specifications and timing. Regeneration/viewport changes invalidate old timings. Initial cached-environment warmup renders settle before displayed statistics are trusted.

Triangle count grows about 1.8%; draw calls more than double, and this isolated timing is about 52% higher. No performance improvement is claimed. City-wide rollout needs consolidated facade/material batches, representative city-scale profiling, and subsequent distance detail work. No complex LOD was introduced in this phase. Counts describe the family only unless marked otherwise; the lab also holds hidden original/prototype geometry for comparison. Texture estimates exclude renderer-filtered environment maps, shadow maps and other allocations. The separate prototype retains its own small reflection map.

## Validation and evidence

**29 architecture checks and all 74 game checks pass; `npm run build` passes.** Run `npm run architecture:modernist:check` for the combined generator/assembly/family suite. Coverage includes fixed historical parameters, exact envelopes/massing, frozen approved 07B output, auto A/B/C choice, opaque lobby doors, all-elevation lobby-head closure, floor/bay alignment, finite/nondegenerate indexed geometry, all ten roof-cap intersections, deterministic reuse/cache release and version-bound reviews. The existing Float32 roof-area tolerance remains documented in Phase 2.

Actual browser inspection covered all ten full-building and street-lobby views; facade close-ups for compact/approved/paired examples; penthouse and setback roof views; original benchmark/reference; approved 07 comparison; orbit, zoom/reset, new seed and seed restoration. Family review save/reload/export/import worked. Before/after exported specifications proved individual regeneration changed only Building 03, with the other nine identical. The seed 1138/revision-zero benchmark was restored. Browser warnings/errors were empty.

Screenshots are in **Downloads\Pancake City - Enhanced Family Phase 3**: all ten full-building and lobby views, representative facade/roof details, original/enhanced lineups and the approved 07 comparison. The raw report is **Downloads\Ohneeohnee - Enhanced Family Report.json**. Machine-readable validation, measurements and screenshot hashes are in `docs/FAMILY_PHASE3_VALIDATION.json`. A test-only exported review file is explicitly labelled with temporary notes; it is not a user approval record.

## Checkpoint, scope and next review

Safety branch **safety/pre-family-phase3-88e774d** and a verified complete history bundle under `.tools/family-phase3` retain the approved pre-rollout state. Development branch: **architecture/ohneeohnee-family-phase3**. No push, tag overwrite, main change or history rewrite. Local checkpoints are not off-computer backups. Pre-existing reference-image moves are excluded from the milestone.

Remaining limits: the approved pane atlas still repeats, the small reflection environment is an approximation, and only the ten archetypes/studied parameter range are covered. This demonstrates reusable assemblies, not automatic architectural judgment for every possible future design. The lab's synchronous generation and comparison copies are tooling costs; city integration has not been attempted. Review this enhanced family first. The next approved stage should consolidate rendering batches and validate a dense-city integration without changing approved geometry/material appearance, before registering growables.
