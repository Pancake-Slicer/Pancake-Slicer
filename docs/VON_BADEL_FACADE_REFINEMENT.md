# Von Badel facade refinement — 2026-11-13

## Scope and recovery

Work directory: C:/Users/camsh/Desktop/Pancake-City-restored-v53-20261112-153759. Branch: codex/von-badel-facade-refinement. Before editing, annotated checkpoint/von-badel-before-detail-20261113 and verified .tools/von-badel-before-detail-20261113.bundle preserve commit 68522c8. These are local recovery points, not off-computer backups.

The checkout contained only the pale Art Deco version. The user explicitly authorized applying the missing dark-grey, straight-shaft, flat-roof corrections first, then refining. baseline-v2.js is the frozen corrected baseline CREATED THIS MILESTONE, not a previously approved dark asset. Before/after captures compare that baseline with model.js. The original Art Deco state remains recoverable at the checkpoint.

## Current architecture

The podium remains 56 × 42 m, with identical 7 m wings at X ±24.5 m. The uninterrupted main shaft is 42 × 35 m, from 50.4 to 183.6 m, without a tiered crown. Overall maximum height remains 187.2 m. Refined and corrected-baseline volume tuples are exactly equal. Decorated wing bounds mirror within 0.1 mm Float32 tolerance; both terminate at 51.790000915527344 m including their equipment. Source dimensions remain inferred rather than surveyed.

Real openings replace the opaque wall box: continuous jamb returns and 65 mm chamfered piers flank recessed window planes. A triangle intersection through an actual opening hits glazing at Z 17.280000686645508, while the adjacent pier face is Z 18.020000457763672: 0.74 m relief. Window/source crop ratio 135:322, 3.6 m floors and 3.5 m bay grid are retained. Restrained spandrel planes and slim metal rails preserve vertical emphasis.

materials.js derives a four-cell blue-grey reflection atlas (512 × 256) and neutral concrete grain/joints (256 × 256) from the supplied facade. Two 128-pixel-wide roof/storefront maps complete the palette. Separate concrete, pier, glazing, frame, membrane and mechanical PBR factors avoid a uniform tint. No normal/roughness-map extension is required by the existing import adapter. Ground floor adds framed storefronts, recessed centre doors, returns, handles and a shallow canopy. Roof equipment uses paired supported HVAC units, fan collars, intake louvers, connected ducts, access enclosure, screen and coping. Access-cap coplanar overlap caught in review was corrected; glazing and pier/roof values were lifted after initial renders were too dark.

## Play and reproduce

Run Play Von Badel Benchmark.cmd or npm run benchmark:von-badel, then open http://127.0.0.1:4184. The baseline link uses ?baseline=1. Drag/scroll/arrow keys/R still work. Front is a zero-pitch orthographic elevation. Facade, Podium, Rooftop and Gameplay distance buttons provide detail presets. Existing Three.js r180, Lind lighting, tone mapping and shadow configuration are reused read-only.

Run npm run benchmark:von-badel:test with the benchmark server running. It captures seven views for BOTH variants: three-quarter, front, opposite-front, facade, podium, rooftop, gameplay. Files are .tools/von-badel-{baseline|refined}-{view}.png. Side-by-side outputs: .tools/von-badel-three-quarter-comparison.png and .tools/von-badel-facade-comparison.png. Geometry/metrics report: .tools/von-badel-refinement-report.json. Outputs remain ignored and can be regenerated.

## Validation and performance

| Measure | Corrected baseline | Refined |
| --- | ---: | ---: |
| Scene triangles, including plinth | 12,308 | 25,786 |
| Scene draw calls | 11 | 11 |
| Model material batches | 9 | 9 |
| Window bays | 2,300 | 2,300 |
| Geometry bytes | 859,880 | 1,847,884 |
| Material texture allocation incl. mip estimate | 0.83 MiB | 1.25 MiB |
| Render median / p95 | 0.4 / 0.7 ms | 0.4 / 0.8 ms |

Intel Iris Xe, Chrome, 1122 × 862 canvas; 120 orbit samples after 20 warmups, performance.now around renderer.render plus gl.finish, cached 2048 shadow map (separate approx. 32 MiB estimate). Excludes compositor/frame scheduling; these are not game FPS. Model batches share geometry/materials internally; windows are not independent meshes. No claim of full-city performance or implemented LOD is made.

Browser tests pass identical massing, equal wing elevations and mirrored vertex locations, preserved crop aspect, valid finite attributes/indices, unit normals, zero degenerate triangles, real aperture intersection, decoded references, drag/zoom/key controls, narrow layout and zero runtime/console errors. Visual review covered the seven requested perspectives and comparisons; close-ups show deeper jamb shadows, restrained pier bevels, coherent cool glazing, commercial entrance hierarchy and functional roof detailing. Distance capture keeps the vertical rhythm; fine handles/fan detail is intentionally modest.

npm run benchmark:von-badel:export produces a 2,016,032-byte embedded GLB and version 2.1.0 registration.template.json, with positions/normals/UVs/indices byte-identical through the EXISTING game GLB compiler. Source dependencies are hashed. The legacy stable ID von-badel-art-deco is retained despite its revised style. The template uses the existing offices eligibility vocabulary and full decorated bounds. Neither file is in the live asset registry. npm run build passed all 58 regressions and immutable original SHA-256 verification.

## Limits and isolation

Reflections are controlled artwork/atlas variation, not live environment reflections or modeled interiors. Close-up grain is subtle; no per-pixel roughness or displacement maps. Very long oblique views can still reveal repetitive source windows. Gameplay distance is a span-600 isolated benchmark approximation, not a screenshot or performance test of the actual game. Rear details and dimensions are reference-informed estimates. Hundreds of instances/LOD still require a later approved integration/performance milestone.

The concept is a DETAIL reference only: pale stone, green roof and Art Deco crown are deliberately excluded. The original screenshot supplies proportional context; the user's revised design supersedes its crown. Main gameplay/renderer, live registry and Lind sources/assets remain unchanged. Existing user-moved Lind reference files in Kind/ are untouched and excluded from this commit. No Quaternius assets. Push requires separate approval.
