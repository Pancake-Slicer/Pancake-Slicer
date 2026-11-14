# Phase 2 — Building 07 facade and podium lobby comparison

Open **http://127.0.0.1:4187/?comparison=07** in Chrome. If the server is not running, double-click **Play Procedural Architecture Lab.cmd**, leave its window open, then open the link. Use Ctrl+F5 if an older lab page is already open. The header's **07A / 07B comparison** and **Ten-building lineup** buttons switch modes.

## Frozen prototype

| Parameter | Both 07A and 07B |
| --- | --- |
| Seed / archetype / revision | `1138` / `6` (Building 07) / `0` |
| Existing generator | `1.0.1`, unchanged |
| Storeys | 35 |
| Curtain bay / upper floor height | 2.1 m / 3.75 m |
| Lobby height | 5.0 m, single height |
| Tower body | 18 × 12 bays = 37.8 × 25.2 m |
| Podium body | 24 × 16 bays = 50.4 × 33.6 m; 4 storeys, 16.25 m to deck |
| Main deck / highest roof detail | 132.5 m / approximately 134.85 m |
| Decorated envelope | Approximately 51.10 × 34.32 × 134.85 m, exactly equal in mesh-bound checks |
| Roof | Existing screened plant and podium terrace, retained from exact 07A triangles/materials |

07A uses the existing builder, materials and specification unchanged. 07B gets a separate assembly layer. The massing generator, approved reference, other nine benchmark buildings and live city catalogue are untouched. The ten-building lineup still renders the original family, including its original Building 07.

## Compare and inspect

**Compare both** uses two viewports with the same camera state, viewport size, exposure, lights and local model coordinates. This keeps perspective and lighting matched. **Only 07A/B** isolates either model. Choose full building, facade, corner, street lobby or roof; use **Reset comparison camera**, drag to orbit, right/Shift-drag to pan, and scroll to zoom. The street preset starts at a genuine **1.6 m eye height**, with distance fitted to the available view width.

The facade close-up exposes 07B's recessed vision panes, opaque backed spandrels, two-depth aluminum pressure plates/edge highlights and continuous floor rails. Frame and spandrel elevations use the original floor/bay grid. Four explicit corner posts per tier close adjacent elevations without duplicated perimeter mullions. Three coordinated vision materials share the same approved pane atlas; deterministic structural-bay/floor-band assignments change pane selection and restrained roughness/brightness, without random window colours. Opaque dark backing prevents the office mass becoming transparent.

The Type C lobby has clear glazing separate from office panes, a four-bay recessed entrance composition with central glazed doors, paired framing, handles, a connected threshold/floor, flanking columns, and a thin canopy contained inside the existing decorated envelope. The central entrance is kept clear of an exterior column. A shallow lobby ring around an opaque core supplies a floor, ceiling, rear wall, reception counter, vertical wall feature and emissive ceiling strips. There are no complete office interiors or per-building light sources.

## Reusable modules

| File | Role |
| --- | --- |
| `architecture/assemblies/systems.mjs` | Assembly version, coordinated pane selection, lobby compatibility definitions and validated review data |
| `architecture/assemblies/enhanced.js` | Parameter-driven curtain-wall/lobby builder, unchanged-roof retention and model metrics |
| `architecture/assemblies/comparison.js` | Matched viewports/cameras, isolation, measurement and persistent review interface |

`buildEnhanced(spec, baselineModel, assemblyMaterials, options)` reads the existing specification and never changes it or the baseline model. Width changes add complete modules. Storeys, widths, depths, podiums, floor heights and roof placement still come exclusively from the original generator. Roof and terrace primitives are copied from the baseline into the enhanced model; no roof redesign is performed. Construction is merged by material, with no individual window meshes.

Lobby definitions: **A Recessed** requires at least eight frontage bays; **B Expressed** at least twelve; **C Podium** at least sixteen plus a podium. All require a compatible existing lobby height. The kit varies entrance width, recess, columns and canopy through those definitions. Only **Type C on Building 07B** is visually developed and exposed in this phase; A/B are compatibility definitions for subsequent work.

## Review without publication

Set **Unreviewed**, **Approved**, **Needs refinement**, or **Rejected**, enter optional notes and press **Save review on this device**. Local storage is keyed to this exact specification and assembly version. It survives ordinary browser restarts in the same browser profile at this origin. **Export review** creates a portable JSON backup; **Import review** restores matching review data and rejects another prototype/version. Storage errors are reported with an export fallback.

Review status never changes geometry, writes an architectural asset, registers a growable, or publishes anything. Testing used temporary review text, verified save/reload/export/import, and restored **Unreviewed with empty notes**. No architectural approval was assigned by the agent.

## Rendering cost

| Model-only statistic | 07A | 07B |
| --- | ---: | ---: |
| Meshes / materials | 9 / 9 | 23 / 23 |
| Triangles | 40,804 | 26,208 |
| Geometry allocation | 2.72 MiB | 1.82 MiB |
| Texture maps / estimated RGBA+mips | 3 / 1.58 MiB | Same three shared maps / 1.58 MiB |
| Full-view scene draw calls, including ground | 10 | 24 |

07B replaces many individual intermediate-rail boxes with continuous merged rail strips while adding profiled framing, separate glazing materials and lobby construction. Fewer triangles do **not** establish a general performance improvement: additional draws, transparency and physical lobby glazing add costs. Both views share the source texture objects. The fair comparison uses two separate cached 2048 shadow maps, approximately 64 MiB combined under an eight-bytes-per-pixel allocation estimate; this is a lab comparison cost, not a change to the game.

The actual browser's **Measure A/B frame submission** run collected 60 samples per model after eight warmups, alternated rendering order, and bracketed `render + gl.finish` with cached shadows. At 490 × 608 CSS pixels per view and pixel ratio 1.25, median / p95 measured **07A 0.30 / 0.50 ms; 07B 0.40 / 0.70 ms**. These exclude compositor/UI scheduling and are not city FPS or large-city certification. View controls are held fixed during a measurement. **Export comparison report** saves the current specification, counts and timing method/results.

## Verification, limits and next review

Eighteen architecture tests and all 74 game tests pass. Tests cover unchanged 07A data, exact A/B massing/bounds, roof primitive identity, floor/bay alignment, corners, finite geometry, lobby rays reaching glass and the deeper rear wall, deterministic variation, different synthetic dimensions and review validation. Existing ten-building regressions remain active. A phase checkpoint hash inventory also verifies all pre-existing generator, game, approved assets, benchmarks and original v52 files stayed byte-identical.

Actual browser review covered full/facade/street/corner/roof views, isolation, review persistence and file import/export, the unchanged lineup, and the main game's terrain/highway startup. Full, facade and street screenshots are in Downloads as `Pancake City - Building 07 Comparison - … - 20261114.png`; the comparison report is also in Downloads. Browser error logs were empty.

Remaining limits: the twelve source pane images still repeat; no dynamic environment reflection/refraction or true office interiors are added. Alpha-blended glazing is a visual approximation with opaque backing, not an optical simulation. Type A/B are not polished prototypes. Structural details are architectural concepts, not engineering/code validation. A future approved city rollout needs material-batch consolidation and representative city-scale transparency/LOD tests. Review 07B first; do not apply this kit to the other nine buildings or the growable catalogue without explicit approval.

Checkpoint: `safety/pre-assemblies-phase2-20261114` at `4e858a1`, with a complete verified local bundle under `.tools/assemblies-phase2-checkpoint`. Work is on `architecture/ohneeohnee-assemblies-phase2`. No push, main/tag/history rewrite or off-computer backup has been performed.
