# Lind Art Deco standalone benchmark — 2026-11-13

## Run and reuse

Double-click `Play Art Deco Benchmark.cmd`, keep its window open, and visit http://127.0.0.1:4180 in Chrome or Edge. Drag to orbit, scroll to zoom, use the view buttons or arrow keys, and press R to reset. The city-building game is not loaded or changed.

Alternatively run `npm ci` once, then `npm run benchmark:serve`. `npm run benchmark:build` produces a self-contained HTTP-served folder in `.tools/art-deco/`; serve that folder with any static server. It needs no network assets. It is a standalone web scene, not an offline double-click HTML export. Generated files are ignored by Git.

Authoring files: `benchmark/art-deco/model.js`, `scene.js`, `index.html`, `style.css`. `loadMaterials()` processes the supplied facade; `createArtDeco(materials)` returns a Three.js Group with shared, batched geometries. `architecture` exports the proportional grid. Integration into the city is deliberately deferred.

The preparation script extracts the exact recovered Three.js **r180** engine prefix and explicitly exports its existing classes. It neither upgrades nor downloads Three.js. This recovered prefix also contains dormant helper definitions; it is not a newly recovered modular engine source. Third-party notices accompany the generated scene. No Quaternius assets are used.

## Sources and architectural interpretation

Actual supplied files are in `Assets/Architecture/Art Deco/`, not the requested `assets/ai-architecture/art-deco/` alias. The preparation script copies them into the generated benchmark as:

| Supplied source | Generated name | Source pixels |
| --- | --- | --- |
| Lind.jpg | assets/Lind.jpg | 103 × 270 |
| Art Deco Limestone Skyscraper Crown.png | assets/reference.png | 1024 × 1536 |
| Art Deco Limestone Window Facade.png | assets/facade.png | 1254 × 1254 |

Lind governs the slender central spine, unequal flanking elevations, and small pyramidal crown. The larger supplied reconstruction governs limestone pier treatment, recessed dark bays, copings and roof material. The two images are related interpretations rather than identical measured elevations. The very small Lind image cannot establish exact dimensions or carving detail.

Proportional dimensions: 44.4 × 29.6 m podium body, 183.9 m roof apex, 3.7 m floors, nominal 3.7 m facade grid. Projection of trim extends slightly beyond the podium body. The left shoulder terminates at 107.3 m, the right at 92.5 m. The 22.2 m central shaft reaches 122.1 m; subsequent widths are 18.5, 14.8, and 12.95 m at 140.6, 159.1, and 177.6 m. A 5.4 m pyramidal metal roof completes the crown. These are reasonable design ratios, not surveyed dimensions.

Prominent masonry piers, corner buttresses, copings, parapets, entry jambs, head panels, louver slats, roof standing seams and setbacks are solid geometry. A consistent floor grid prevents arbitrary mismatched window rows. The source's window + bronze spandrel is cropped at x=134, y=92, width=173, height=310 and downsampled to 256 × 512. Every facade quad preserves that original crop's physical aspect ratio, including side faces. Small variations in pier spacing absorb residual widths; windows are never stretched to fit them. The facade is already orthogonal, so no perspective correction is applied. A 59 × 193 limestone crop is reduced to 128 × 256 and tiled with metric UVs. Large piers use a separate limestone trim material. The full-resolution source images shown in the reference panel are browser images, not GPU material maps.

## Visual review and corrections

Actual Chrome/Intel Iris Xe screenshots were captured at 1440 × 1080: `.tools/art-deco-southeast.png`, `art-deco-southwest.png`, `art-deco-rear.png`, and `art-deco-crown.png`. Each full view includes both design references beside the rendered model. These are actual WebGL captures, not generated illustrations. Browser-test output also writes reusable processed texture PNGs into `.tools/art-deco/assets/`.

| Criterion | Review against Lind and the larger reference |
| --- | --- |
| Silhouette and proportions | Narrow continuous spine, broad street wall, unequal wings and stepped crown reconstructed. Exact depths remain inferred. |
| Central/wing heights | Left 58% and right 50% of apex height; central spine dominates as in Lind. Larger reference has a somewhat fuller shoulder composition. |
| Setbacks | Main wing terraces and three upper reductions are modeled. Original fine shoulder offsets are approximated with rectilinear stepped masses. |
| Vertical rhythm | First render had weak masonry. Piers were widened, corner buttresses added, and long recessed bays retained. |
| Windows | Initial variations in side-bay widths were corrected to the source crop aspect. Repetition and source-baked reflections are still visible close up. |
| Materials | Warm muted limestone, dark blue-grey glazing, bronze spandrels and green-grey metal. No bloom or cartoon posterisation. Stone colour/roughness are approximations. |
| Roof and crown | Initially ordinary short window rows; replaced with tall recessed louver strips, broad corner piers, perimeter framing and a seamed four-face pyramid. Carved relief is simplified. |
| Lighting and style | Orthographic daylight, ambient sky/ground fill, filtered cached shadows. Shadow intensity reduced after review. Fine reveals provide restrained architectural edges; no heavy outline pass. |

The first review also identified excessively long unsupported shoulder fins; these were shortened to their matching roof elevations. Missing top window rows caused by floating-point floor division were corrected. Masonry UVs were changed from stretching one crop over whole volumes to physical repeats.

This is a functional, reviewed architectural benchmark, **not an exact replica or a claim of completed architectural fidelity**. Remaining discrepancies: simplified relief/carved motifs and entrance details, approximate shoulder/upper-shaft widths, inferred rear elevation, flat source reflections rather than dynamic interior/reflection detail, and simplified terrace junctions. Hidden surfaces remain inside adjoining volumes; later city integration should remove these and introduce distant LODs. The low-resolution screenshot cannot resolve all facade details.

## Performance and verification

Measured in headless Chrome using hardware ANGLE / Intel Iris Xe, 1122 × 862 render surface at DPR 1:

- 7 model material batches, 9 total scene draw calls after the shadow cache is populated.
- 26,224 scene triangles, 1,842 textured window bays; no per-window mesh objects.
- Approximately 1.75 MiB model geometry buffers and 0.83 MiB material texture allocation including mip chains.
- One 2048² filtered shadow target, approximately 32 MiB for colour + depth attachments; excludes driver overhead, framebuffer/MSAA and other browser allocations. This is an estimate, not instrumented total GPU memory.
- 120 orbit samples after 20 warmup frames: 0.3–0.4 ms median and 0.5–0.8 ms p95 across verification runs (final run: 0.3 / 0.5 ms) for synchronous render submission plus `gl.finish`. Browser scheduling, presentation and compositor costs are excluded. **These are not full-frame FPS or city performance guarantees.** Hardware and shadow refresh costs change the results.
- Static lighting uses a cached shadow map; camera movement does not rebuild model geometry or textures. Stopped views render on demand.

Run the reproducible browser checks after starting the benchmark server:

```
npm install --prefix .tools playwright --no-audit --no-fund
npm run benchmark:test
```

The optional test driver is ignored, outside tracked project dependencies. Chrome defaults to the standard Windows install; `ART_DECO_CHROME` can override its executable path. Checks cover four rendered views, camera buttons/keys/drag/zoom, narrow layout, finite vertices/normals/UVs, valid indices, exact source crop aspect for every window, floor-grid elevations, asymmetric shoulders, source image decoding, no game-bundle request, zero browser console/runtime errors, and a 10-draw-call / 30,000-triangle scene budget. Captures and measured JSON go into `.tools/`, not Git.

`npm run build` also passed all 53 existing game regressions and preservation checks. No city browser playthrough is claimed: the city runtime/assets were unchanged. The immutable original SHA-256 remains `c8eff97d4c0daefd2cf7b6d967a694ce8a999e4a3e1402d88fee4fea6077778c`.

This milestone requires a local commit and separate approval before any GitHub push. Screenshots and generated scene output are local review artifacts; a pending local commit is not an off-computer backup.
