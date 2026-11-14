# Phase 2 — Building 07 facade and podium lobby comparison

## Current revision — lobby head joint and roof trim (assembly 2.1.1)

Closed the visible approximately 6 cm slot between the lobby's upper frame and its fascia. The reusable opaque header now reaches the existing glazing head and spans back over the recessed entrance, providing an actual solid closure rather than hiding the slot with a material or lighting adjustment. Glass panes, doors, mullions, columns and canopy keep their existing positions; massing and floor elevations are unchanged.

The retained roof trim also contained coincident upward-facing surfaces at mullion/frame intersections, parapet caps and plant-screen corners. `architecture/assemblies/roof-surfaces.js` now subtracts duplicate coplanar areas once during 07B construction, retaining each surface's interpolated UVs and normals. It adds no render effect, depth bias, frame-time geometry operation, material or draw call. Roof decks themselves and non-top-facing details remain exact copies. The original 07A, original generator, other nine buildings and approved architectural assets are untouched. This repair is limited to the enhanced comparison assembly; no rollout to the baseline family has occurred.

Choose **Lobby head joint**, **Roof comparison**, or **Podium terrace** in the comparison camera menu. Actual browser inspection covered close-up lobby closure, top roof at multiple zooms and angles, and the exposed podium terrace. Screenshots in Downloads: **Pancake City - Building 07 Seam Fix - Lobby Head / Roof / Terrace.png**. No browser warnings/errors were captured. All **21 architecture checks**, **74 game checks** and the build pass. Both new geometric regressions failed before the fix. Roof intersection checks allow 0.0001 square metres for Float32 rounding along long, thin cap edges; substantial source overlaps were up to approximately 0.038 square metres. The revised source-preservation test checks exact deck and vertical-detail attributes, plus source plane/UV interpolation for trimmed caps.

07B remains **21 meshes/materials and 22 full-view scene draw calls**, with **26,512 model triangles** (previously 26,004). Splitting overlapping polygons adds a small number of triangles while removing duplicate surface area. Four texture maps remain in use. Matched render/GPU-finish timing at 285 × 556 CSS pixels, ratio 1.25, measured A median/p95 **0.30/0.60 ms**, B **0.40/0.70 ms** over 60 samples after eight warmups. These are isolated lab timings, not city FPS. See `docs/BUILDING07_SEAM_VALIDATION.json` for current evidence. Assembly 2.1.1 awaits visual review; version-bound prior reviews remain preserved. Safety branch `safety/pre-lobby-roof-seams-3570bd1` retains the previous revision. Nothing has been pushed.

## Previous revision — opaque lobby glass (assembly 2.1.0)

The user approved the overall 07B detailing and requested opaque lobby glazing. The current comparison uses blue-grey **MeshStandardMaterial** glazing with opacity 1, transparency disabled and depth writes enabled. Lobby panes and doors share one small 128 × 64 static sky/horizon reflection map, with restrained roughness/tint variation. It is an approximation of reflected surroundings, not a live scene reflection or a transparent interior.

The reusable `createAssemblyMaterials(base, {lobbyGlazing: 'opaque-reflective'})` option is now the default; the builder reads that option and omits the hidden interior floor/ceiling, core, reception counter, wall fins and emissive strips. Only exterior paving and the soffit inside the entrance recess remain. `clear-interior` retains the previous assembly as an explicit optional mode; it is not active in 07B. Existing exterior mullion/frame geometry, entrances, columns, canopy and all glazing plane positions are preserved. No massing, roof, 07A, other benchmark or game changes.

Actual browser checks confirmed opaque doors with soft reflected tonal variation and no visible interior, preserved entrance detailing, matched full-building massing and the unchanged ten-building lineup (99 calls / 188,852 triangles). Screenshots in Downloads: **Pancake City - Building 07 Opaque Lobby - Street / Entrance / Full - 20261114.png**. Browser warnings/errors were empty. All **19 architecture checks**, **74 game checks** and `npm run build` pass. A regression compares the opaque and clear variants' glazing positions and unchanged exterior geometry, tests the opaque material flags and verifies hidden interior removal.

| Current model statistic | 07A | Opaque 07B |
| --- | ---: | ---: |
| Meshes / materials | 9 / 9 | 21 / 21 |
| Triangles | 40,804 | 26,004 |
| Maps | 3 | Same three source maps + one lobby reflection map |
| Full-view calls including ground | 10 | 22 |

The new reflection texture adds 32 KiB of source pixel data; the renderer additionally caches a filtered environment map. Texture totals in the report are estimates, not complete GPU allocations. The prior transparent 07B had 23 meshes/materials and 26,208 triangles; removing its interior reduces geometry and draws, but this is not a city-scale performance certification. Current measurement and screenshot details are recorded in `docs/OPAQUE_LOBBY_VALIDATION.json`.

Assembly 2.1.0 has a new review key, so earlier review decisions are preserved without silently approving this revised appearance. The opaque revision awaits visual review. The local safety branch `safety/pre-opaque-lobby-c4095c7` retains the previous prototype. No push or rollout has been performed.

## Historical 2.0.0 prototype record

The details below document the preceding transparent-interior prototype. Its lobby material, interior and performance figures are superseded by the opaque revision above; its massing, external detailing and general comparison controls still apply.

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
