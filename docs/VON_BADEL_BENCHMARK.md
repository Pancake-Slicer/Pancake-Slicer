# Von Badel Art Deco benchmark — 2026-11-13

## Play and inspect

Double-click `Play Von Badel Benchmark.cmd`, keep its window open, and visit http://127.0.0.1:4184. Alternatively run `npm run benchmark:von-badel`. Drag to orbit, scroll to zoom, use arrow keys, press R to reset, or choose Three-quarter, Opposite front, Rear, Front or Crown detail. **Front is a true orthographic elevation with zero camera pitch**, so the wing-width correction is visible directly.

`npm run benchmark:von-badel:build` assembles a self-contained HTTP-served scene in `.tools/von-badel/`. Authoring files are `benchmark/von-badel/model.js` and `benchmark.json`; the reusable solid/quad batching helper is `benchmark/shared/batched-architecture.js`. The preparation script reuses Lind's viewer source, stylesheet, r180 engine exports, daylight, tone mapping, shadow configuration and controls without editing any approved Lind file. Only the new benchmark's framing/plinth and true-front preset differ. No main city or growable-system code is changed.

## Discovered sources

Recursively inspected `Assets/Architecture/Art Deco/Von Badel/`; it contains exactly these three files:

| Actual filename | Pixels | Role |
| --- | --- | --- |
| `U-2_von_adel_ag.jpg` | 146 × 270 | Original game screenshot; silhouette and character authority |
| `Art Deco Limestone Skyscraper with Patinated Crown.png` | 1024 × 1536 | Supplementary architectural detail, with its left-wing width corrected |
| `Art Deco Limestone Window Facade (1).png` | 1254 × 1254 | Exterior texture artwork |

Generated aliases original.jpg/reference.png/facade.png exist only in the ignored output folder. Source files were not renamed or edited. No Quaternius or external architectural assets were used.

The original shows a broad flat-roofed podium, a straight uninterrupted masonry shaft, a short stepped rectangular crown and a dark metal hip roof. These govern the massing. The lower lateral portions are the two **podium wings**; no extra mid-height Lind-like towers were invented. The concept's wider left terrace/wing is intentionally reduced to the narrower right-side two-bay module. Both source images remain beside the rendered model for comparison.

## Proportional reconstruction and symmetry

Dimensions are architectural estimates from the images, **not surveyed measurements**. A 3.6 m floor and 3.5 m bay establish the grid:

| Component | Body dimensions / elevations |
| --- | --- |
| Corrected podium | 56 m wide × 42 m deep, roof body at 50.4 m |
| Central shaft | 42 × 35 m, from 50.4 to 151.2 m, centred on X=0 |
| Lower crown | 35 × 28 m, from 151.2 to 169.2 m |
| Upper crown | 28 × 21 m, from 169.2 to 176.4 m |
| Hipped metal roof | Starts around 177.3 m; upper panel at 187.0 m, framing reaches 187.2 m |
| Left wing | X = −28 to −21 m, centre −24.5 m, width **7 m**, depth 42 m, two front bays |
| Right wing | X = +21 to +28 m, centre +24.5 m, width **7 m**, depth 42 m, two front bays |

The conceptual wider left portion would occupy four bays; only the right's two-bay width is used in the model. The right wing was not widened. The shaft's 42 m width, centreline, elevation and straight walls remain fixed while establishing this symmetry. Every corresponding lower-wing facade row, coping, pier, storefront and small roof-equipment group is mirrored.

Measurements are taken from actual baked vertices transformed by each mesh's world matrix, not just parameter declarations:

| Measurement | Left | Right | Difference |
| --- | ---: | ---: | ---: |
| Body width | 7 m | 7 m | **0 m** |
| Width including projecting masonry | 8.349998474121094 m | 8.349998474121094 m | **0 m** |
| X centre | −24.5 m | +24.5 m | Centre sum **0 m** |
| Highest point including small equipment | 51.790000915527344 m | 51.790000915527344 m | **0 m** |

The complete left-wing position list, reflected across X=0, equals the complete right-wing position list exactly at Float32 precision. Each has 5,728 baked vertices. The body intervals and front-elevation capture demonstrate that this is geometric symmetry rather than a camera illusion. Projecting trim overlaps the central podium junction normally; its full envelope is wider than the 7 m structural body.

## Facades and roof

The facade is already orthogonal, so no perspective rectification is necessary. The usable bay crop is `(146, 90, 135, 322)` in source pixels, containing one window and spandrel; it is stored in a 256 × 512 canvas texture. Every facade quad uses the original **135:322 physical aspect**, including wing and side faces. Resizing the texture's pixel storage does not stretch the displayed windows. The maximum measured aspect deviation is 0.000001164, from Float32 world-coordinate precision. Wing symmetry is achieved by bay count and geometry, never by scaling a facade.

A `(318, 22, 65, 216)` limestone crop is reduced to 128 × 256 and tiled with metric UVs. Principal piers, fluted reveals, entry surround, copings, parapets, crown head panels, hip frames and metal standing seams are actual geometry. Separate PBR materials distinguish limestone, trim, shaft/podium/crown facade planes, glazing, bronze, roof metal, terraces and mechanical details. The three facade materials share the same bay texture rather than copying it. All elevations use the same architectural grid and material family; rear details are inferred.

The roof is a four-face **truncated hip with an upper panel**, not Lind's pointed pyramid. Visual review revealed that the first diagonal frame ribbons were too edge-on to read well. They were replaced by solid sloping members, and seams were added across the upper panel. The light hip/perimeter frame is now visible in both front quarters and the crown close-up. Window-aspect checks use a tolerance appropriate to Float32 positions at 187 m height; the UV coordinates themselves remain exact.

## Rendered review and remaining discrepancies

Actual Chrome WebGL captures at 1440 × 1080 are `.tools/von-badel-three-quarter.png`, `-front.png`, `-opposite-front.png`, `-rear.png`, and `-crown.png`. These are rendered screenshots, not generated concept artwork.

| Criterion | Review |
| --- | --- |
| Overall silhouette | Broad base, uninterrupted shaft, two upper rectangular reductions and dark hipped cap match the source's architectural character. |
| Podium/tower relationship | Approximately 27% podium height and a long straight shaft; lateral podium reduced only to enforce the right-wing reference. |
| Central shaft | Fixed 42 × 35 m body; 100.8 m uninterrupted rise above the podium. Exact historical proportions remain uncertain. |
| Wing widths | Equal 7 m bodies / equal 8.349998474 m decorated envelopes, verified from actual vertices. |
| Wing placement | Centres at ±24.5 m; complete mirrored-position equality, including matching facade rows and equipment. |
| Vertical piers | Continuous raised limestone piers with symmetrical fluted reveals; no arbitrary shaft setbacks. |
| Windows and facade depth | Shared cropped artwork, fixed physical aspect, recessed window planes and projecting real piers on every side. |
| Crown | Two coherent grid-based reductions; all rectangular volumes and roof centred over the main shaft. |
| Roof | Dark muted green-grey, solid pale hip frame and standing seams; upper roof plan and pitch are estimates. |
| Materials/daylight | Lind's restrained daylight and PBR treatment retained. No posterisation, bloom, heavy black outlines or modern curtain walls. |

This is a reviewed proportional reconstruction, **not an exact surveyed replica**. Remaining differences include simplified carved ornament and entrance relief, approximate plan depths and roof pitch, repetitive source reflections in the glazing, inferred rear detailing and approximate mechanical-equipment arrangements. The small original screenshot cannot resolve all of these. The concept's left-wing asymmetry is intentionally absent. No in-city appearance or growth-performance claim is made in this standalone milestone.

## Performance and portable model

Final hardware Chrome/ANGLE Intel Iris Xe run, 1122 × 862 render surface at DPR 1:

- **10 model material batches / 12 total scene draw calls**, including ground and plinth.
- **19,090 scene triangles**; 2,140 textured window bays, without per-window mesh objects or draw calls.
- **1,334,620 bytes** (about 1.27 MiB) model buffers and about **0.83 MiB** material textures including mipmaps. The full-resolution side-panel images are not GPU facade maps.
- One cached 2048² filtered shadow target; approximately 32 MiB colour + depth allocation, excluding driver/MSAA/framebuffer overhead.
- 120 orbit samples after 20 warmups: **0.4–0.5 ms median / 0.8 ms p95** across final verification runs (latest median 0.5 ms) for render submission plus `gl.finish`. Browser presentation/scheduling are excluded. This is not full-frame FPS or a city-performance guarantee.
- Static views render on demand; camera movement reuses all buffers and materials. The source can later be instanced using the existing growable renderer.

`benchmark/von-badel/von-badel.glb` is a portable 1,588,432-byte r180 GLTFExporter asset with embedded processed textures. Positions, normals, UVs and indices of all ten parts were compared by SHA-256 after parsing the GLB through the existing static asset compiler: **byte-for-byte equality passed**. GLB SHA-256: `974bd7c85531fc67f1b1f55a44039f7c385b934a4bf4d1c04d3d5f8192f8b694`.

`benchmark/von-badel/registration.template.json` describes the full decorated bounds, entrance, dimensions, source hashes and native-scale lot requirements in the existing growable schema. Its conservative full envelope is **57.35 × 43.78 × 187.2 m**, including the entry projection and trim. The template and GLB deliberately remain outside `Assets/buildings/`; **Von Badel has not been added to automatic city growth**. They can be copied into a registry folder during a later integration milestone without custom rendering code. The approved Lind GLB, source, registry and architectural benchmark files are unchanged.

## Repeatable verification

```
npm run benchmark:von-badel:build
npm run benchmark:von-badel
# Separate shell, with optional tools kept outside tracked dependencies:
npm install --prefix .tools playwright three@0.180.0 --no-audit --no-fund
npm run benchmark:von-badel:test
npm run benchmark:von-badel:export
npm run build
```

Browser checks cover five camera captures, true-front geometry, wing body/complete widths and centres, full mirror equality, crown/shaft centring, finite indexed geometry, window aspects, decoded source images, camera presets/keys/drag/zoom, narrow layout, console errors and a draw/triangle budget. Export checks use the matching optional r180 exporter and the existing game asset compiler. A normal benchmark build/play requires only the existing project dependencies; no new tracked runtime dependency was introduced.

`npm run build` passed all 58 existing game regressions and immutable-original/expected-runtime checks. The game, growable system, approved Lind model and original v52 artifact are unchanged. Existing user file moves of Lind reference images into `Assets/Architecture/Art Deco/Kind/` were present before this task and were left untouched and unstaged; consequently the old local Lind preparation path still depends on resolving that prior file reorganisation. This does not affect the new benchmark or the registered Lind GLB.

Screenshots, processed PNGs, measurements and generated viewer files stay ignored in `.tools/`. New reference images, authored model/helper/config, portable GLB and registration template are milestone source assets. A local milestone commit is not an off-computer backup; pushing requires separate approval.
