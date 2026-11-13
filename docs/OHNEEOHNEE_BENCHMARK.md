# Architecture Study 03 — Ohneeohnee Modernist Office Tower

## Run and author

Work directory: C:/Users/camsh/Desktop/Pancake-City-restored-v53-20261112-153759. Double-click Play Ohneeohnee Benchmark.cmd, keep its server window open and visit http://127.0.0.1:4185 in Chrome/Edge. Or run npm run benchmark:ohneeohnee. The scene is standalone and HTTP-served, with all runtime files/textures local in ignored .tools/ohneeohnee; it is not the city game and does not require an internet connection after preparation.

Drag to orbit, scroll to zoom, use arrow keys or R to reset. Buttons provide three-quarter, opposite-front, rear orbit, true front/side/rear elevations and elevated roof detail. The 25 copies button switches between one model and a 5 × 5 instanced grid; its panel reports the actual active scene draw/triangle counts. The normal view is 25° yaw / 27° elevation; the roof preset is 35° / 42°. Lighting, tone mapping, materials, shadows and Three.js r180 come from the proven Lind benchmark, read-only. Study 03 adds only its framing and instancing inspection controls.

Authoring: benchmark/ohneeohnee/model.js and benchmark.json. Source images are already organized in the dedicated Assets/Architecture/Modern/ohneeohnee directory; no moves or substitutions were necessary.

| Actual source filename | Actual dimensions | Role |
| --- | --- | --- |
| U-3_ohneeohnee_gmbh.jpg | 174 × 270 | Primary geometry, composition, material character and roof layout |
| Modernist Office Tower with Rooftop HVAC.png | 1180 × 1333 | Supplementary detail, not a replacement for the original silhouette |
| Symmetrical Glass Office Facade.png | 1254 × 1254 | Curtain-wall texture source artwork |

All source bytes are preserved. No unrelated artwork or Quaternius assets were used.

## Reference analysis and modeled interpretation

The original has one broad rectangular front, narrow charcoal sides, a dense regular curtain-wall grid, a substantial solid upper fascia, low parapet, small offset entrance and compact roof plant: low housings along the left, a central connected duct and a larger right-hand housing. These distinctive relationships guide this asset. There is no podium tower, setback, pitched roof, crown, balcony or Art Deco ornament.

Native inferred body: 36 × 18 m; straight walls to 49.8 m; parapet coping to 50.46 m; equipment top 53.2 m. Fourteen nominal storeys include a lobby, eleven visible curtain-wall floor rows and opaque upper service space. The structural floor grid is 3.6 m, bay pitch 2 m: eighteen broad-face bays and nine side-face bays. The upper fascia is 5.4 m deep; lobby and base transition total 4.8 m. All opposing elevations share floor/bay datums. Dimensions are proportional estimates, not surveyed facts.

The supplied facade is already aligned/orthographic. Twelve glazing crops exclude its baked mullions/spandrels and form one 512 × 512 atlas, with small UV edge insets. Source blinds/interior silhouettes and controlled cool brightness variation remain. Actual 3D shared strips form continuous vertical mullions, horizontal floor rails, intermediate transoms, fascia panel joints and the perimeter frame. Glazing is recessed by 0.195 m behind the mullion front; thin backpans close joints behind it. Three textures total: glazing 512 × 512, source-derived neutral panel grain 256 × 128, and membrane 128 × 128. Ten PBR material batches distinguish light/grey glazing, darker sides, frame, panels, metal, membrane and mechanical parts; individual windows are not meshes.

Ground floor has restrained glazing behind framing, solid outer panels, a small entrance at X=-4 m, shallow header, threshold and handles. Roof has supported rectangular plant, louvres, linked ducts with restrained seams/supports, exhaust housing, coping and membrane. Equipment is laid out coherently on the narrow plan rather than scattered. Fine interiors/reflections come from texture artwork rather than extra geometry.

## Actual visual verification and corrections

Captured .tools/ohneeohnee-three-quarter.png, -front.png, -side.png, -rear.png, -opposite-front.png and -roof.png, plus -25-copies.png. .tools/ohneeohnee-reference-comparison.png places the original beside an actual render. Images/report are generated evidence and remain ignored; reproduce them with npm run benchmark:ohneeohnee:test while the server runs.

Review compared silhouette, height/width, curtain-wall rhythm, colour contrast, entrance and roof configuration directly against the original and supplementary concept. The first iteration was too deep, the side nearly black, and small facade joints leaked daylight into the cast shadow. Narrowed the body from 24 to 18 m, tightened roof plant depth, lifted cool glazing/panel values, reduced metal glare and added recessed backpans to eliminate the leaks. The final grid remains visible on dark sides without using excessive reflections. The deep fascia and two lighter upper glazed rows retain the reference's composition; the roof is functional and free of decorative additions. Front/side/rear are actual zero-pitch orthographic elevations.

## Measured performance and tests

| Measure | One model | 25 instanced copies |
| --- | ---: | ---: |
| Scene draw calls | 12 | 12 |
| Model material/geometry batches | 10 shared | 10 shared |
| Scene triangles (incl. ground/plinth) | 14,976 | 373,824 |
| Visible curtain-wall bays per model | 594 | 594 |
| Shared geometry data | 1,046,640 bytes | same plus instance matrices |
| Shared model texture allocation, mip estimate | 1.58 MiB | same |
| Synchronous render median / p95 | 0.7 / 1.2 ms | 0.7 / 1.5 ms |

Intel Iris Xe / Chrome / 1122 × 862 canvas; isolated scene, cached 2048 shadows (separate approx. 32 MiB estimate). One-model timing: 120 orbit samples after 20 warmups. Grid timing: 90 fixed-camera samples after 20 warmups. Both bracket renderer.render + gl.finish; timings exclude browser/compositor scheduling and are not city FPS. Single and grid timing workloads differ, so do not interpret similar results as scaling linearly. Earlier cold/contended runs had one-model p95 up to 4.9 ms. Model triangles alone: 14,952. Three model maps are reused; the renderer's fourth texture is the shadow target. No per-copy texture/geometry creation. No LOD yet; hundreds/thousands of full-detail copies still need later game-level evaluation.

Browser checks pass: finite vertices/UVs/normals, valid indices, unit normals, zero degenerate triangles, one undeformed rectangular mass, 594 exactly aligned bays, decoded source dimensions, positive ground datum, roof height and true elevations. A ray through actual triangles hits glazing at Z=8.899999618530273 and its mullion at 9.095000267028809, with closed backpan behind joints. Drag, zoom, key controls, narrow layout and zero runtime/console errors pass. Instanced copies explicitly share each geometry/material and keep scene draw calls and texture count unchanged.

npm run benchmark:ohneeohnee:export produced benchmark/ohneeohnee/ohneeohnee.glb (1,435,716 bytes). Existing GLB compiler verifies positions/normals/UVs/indices byte-identical to authoring geometry. Source metadata and model SHA-256 are in registration.template.json. The conservative full envelope is 36.39 × 18.68 m, height 53.201 m (outward-rounded Float32 bounds). npm run build passed all 61 existing regressions and original v52 preservation checks.

## Handoff and remaining discrepancies

The portable static opaque-PBR GLB and schemaVersion 1 registration.template.json follow docs/GROWABLE_ASSETS.md: metres, Y-up, +Z front, Y=0 ground, complete decorated bounds and footprint, stable ID ohneeohnee-modernist, version 1.0.0, entrance [-4,0,9.485], offices vocabulary and 14-floor capacity. They remain outside Assets/buildings, so this asset is NOT registered or integrated. After explicit approval, a future integration milestone can copy the GLB/template into that shared registry, validate appropriate lots and test city behaviour without custom per-building game code. Do not stretch it to unsuitable lots.

Remaining visual discrepancies: the 174 × 270 original cannot resolve exact pane counts, mullion sizes or equipment dimensions; the grid/storeys and roof layout are reasoned reconstructions. Horizontal spandrels are more legible than in the compressed original. Neutral-grey facade lacks some original purple/blue baked lighting. The rear and unseen west are consistent inferred continuations, not verified elevations. Reflections/blinds/interior silhouettes repeat twelve source panes and are not real interiors or dynamic environment reflections. Roof hardware is simplified rectangular geometry rather than manufacturer-specific plant; very fine grime, cables and drain outlets are omitted. Dense-grid preview approximates gameplay-distance readability, not an actual city test. These limits do not change the intended single-volume silhouette.

## Preservation and recovery

Before editing, annotated checkpoint/pre-ohneeohnee-20261113 at 8f7a535 and verified .tools/pre-ohneeohnee-20261113.bundle preserve complete history. New untracked references were also archived in .tools/ohneeohnee-source-checkpoint-20261113.zip before implementation. These are local recovery points, not off-computer backups.

Main game/renderer, live growable registry, Lind, Von Badel and shared geometry helper are byte-unchanged from that checkpoint. New optional config branches in the benchmark preparer do not affect existing studies: Von Badel generated engine/viewer/model/material files were compared byte-for-byte against the checkpoint preparer's output and match. Existing user moves of Lind references into Kind/ remain untouched and excluded. Branch codex/ohneeohnee-study-03; no push performed. Follow AGENTS.md for explicit push approval.
