# Lightweight parametric Lind — isolated Phase1 — 2026-11-16

## Open and review

Open **C:\Users\camsh\Downloads\Pancake City - Parametric Lind Architecture Lab - 20261116T210400Z.html** with Google Chrome. It is a self-contained Architecture Lab, not a game integration. It needs no server or internet. All14 JavaScript modules, the approved source image/crops, reference thumbnail, CSS and third-party notices are embedded. SHA-256: 0c0859b365e5870f53d61edf165d8c30f8faf45582373b41c75340d06702d25b. Previous exports remain untouched.

Use **Five Lind variations**, select a lot and **Inspect selected**, **Front** or **Crown detail**. Drag to orbit and scroll to zoom. **Compare five BMO fits** uses the same native body/podium dimensions and floor levels. **Approved Lind + new family** shows the untouched original on the left and the new family at its canonical proportions on the right, under identical lighting/camera. **Measure Lind / BMO** and **Download measurements** work in the offline file.

Regenerate with one command: npm run architecture:lind:export. Source Lab/server: npm run architecture:lind, then http://127.0.0.1:4199/lind.html. The Lab uses the existing local optional Three0.180.0 tool package, not a new game dependency. If those existing tools are missing after a fresh checkout, Codex can restore the pinned package with npm install --prefix .tools --no-save --package-lock=false three@0.180.0. npm run architecture:lind:measure regenerates CPU geometry observations. Generated dependencies, HTML, logs and images remain ignored.

## Architecture and preservation

A verified complete-history Git bundle was created at .tools/lind-parametric-checkpoint/history.bundle before edits. Work branched from47152fb onto codex/lightweight-lind-phase1. The bundle and local commit are not off-computer backups; no GitHub push is authorized.

New files live in architecture/lind and architecture/lab/lind.*. The original benchmark/art-deco/model.js, its source images, approved Lind growable, Von Badel, Ohneeohnee/nine configurations, existing BMO generators/material adapter, shared polygon template and neighbourhood optimizer are unchanged. So are all web/ runtime/CSS, roads, lots, zoning, traffic, terrain, history, selection and normal-game packaging. Original52 SHA-256 remains c8eff97d4c0daefd2cf7b6d967a694ce8a999e4a3e1402d88fee4fea6077778c.

The new **lind-stepped-lightweight@1.0.0** definition consumes the same createTemplateSystem contract as BMO. It uses the existing game's polygon booleans, street-facing axes, conservative rectangular-envelope solver, scale1 native placement, persisted parameters/seed/version/grid, assignment/history interface and existing OptimizedFamilyRenderer. It never edits or merges lots. This is integration readiness, not live registration: the normal catalogue and existing static Lind selection remain untouched.

Proportions derive from approved Lind's44.4 ×29.6m body,3.7m floor,22.2m central shaft,11.1m wings and33/38/43/48 upper levels. At the canonical size, the family reproduces those height relationships and approximately184m crown height. Full-height limestone piers, narrow opaque bronze/blue-grey recessed window stacks, stepped shoulders, corner buttresses, cornices, louvred crown and framed green-grey hipped cap retain its identity. The podium can be flush like original Lind or project beyond the body. Without a podium the entrance sits on the recessed central shaft; it is not floating at the unused front envelope edge.

Width/depth/storeys generate new geometry and bay grids, never scale a completed model. Body range22–68m by20–54m,18–52 floor levels and3.5–3.9m floor heights; slenderness/capacity/unsupported polygons reject cleanly. Last3–5 floor levels form the mechanical crown rather than ordinary glazed office floors; future capacity integration must account for that. Physical window width stays1.93m. Whole bay counts and bounded3.1–4.1m pitches reflow; leftover width becomes corner masonry, not distorted windows. Seeded variation adjusts wing termination levels; integer floor rounding can make two variants coincide at some heights.

The original two Lind crop coordinates are reused without editing their image. Each window stack is one vertical textured quad repeating once per floor, not one object/quad per window. Piers retain front/side faces and top closures; buried backs/bottoms are omitted. Finials are selective; cornices, entrance, corner blades and crown are real baked geometry. The raised hip frame has a continuous stone fascia below it, eliminating an otherwise exposed air gap without additional faces. Each terrace is rectangle-difference clipped against the next tier, with one surface owner and no slab through the upper tower. The crown has four intentional hip planes/ribs; these are physical roof edges, not diagonal depth-fighting seams.

Seven opaque materials and two repeating maps are pooled family-wide. Limestone, bronze and green-grey source colours follow approved Lind, adjusted toward the existing city palette; its actual pcRebuiltLighting/pcCelPhysicalShader are reused in the review alongside the actual harmonized BMO material adapter. No global game-lighting or architecture material change occurs. Geometry cache keys omit names/IDs/seeds after resolving the shape variant. Equal shapes share buffers even across different seeds; the unchanged batcher instances repeated geometry and merges unique shapes by material/chunk. It retains source-building indices for a later host selection adapter. Leases must be released after clearing owned batches.

## Five actual lot fits

Blue rings show the original polygons. Bodies include lower wings; final decorative envelopes are slightly larger and tested in full. Rotated and irregular sites retain rectangular architecture inside their polygons, rather than deforming walls.

|Lot|Body m|Floor levels|Podium m / floors|Lind triangles|BMO triangles|
|---|---:|---:|---|---:|---:|
|Narrow · no podium|25.6 × 25.6|24|None|4,398|4,076|
|Wide · street podium|57.6 × 31.6|40|63.6 × 35.6; 5 floors|6,770|7,616|
|Deep · no podium|31.6 × 53.6|34|None|6,250|5,708|
|Rotated · street podium|37.2 × 31.6|42|43.2 × 35.6; 4 floors|6,042|7,376|
|Irregular · no podium|43.2 × 32.8|36|None|5,682|5,828|

## Measurements

Five-family source triangles: **29,142 Lind vs30,604 BMO**. Lind individual models range4,398–6,770 triangles. Canonical new Lind: **6,210 triangles /434,828 source geometry bytes**, versus the approved fixed original26,040 /1,822,928. These are different implementations, not identical geometry; the new family intentionally simplifies small finials and repeats façade patterns.

Actual browser comparator uses seven active material batches for each family (BMO's three glass slots share one harmonized material). Both submit **eight scene draw calls** with lot lines hidden, including the ground; submitted triangles29,144 vs30,606. The CPU report uses the original BMO nine-slot material library for geometry comparison, so it reports9 rather than7 batches; its triangle/buffer counts are the same. Existing batcher chunk size768m is shared for the five-lot fixture. Different native city chunks can increase calls.

At1155×818 canvas, pixel ratio1, Intel Iris Xe / ANGLE D3D11, median CPU render+gl.finish was **1.4ms Lind vs1.0ms BMO**, p952.3 vs1.5ms (20 synchronous samples after4 warmups). These include driver/GPU synchronization and DOM stats updates, not isolated GPU timer queries. Results support a similarly small rendering budget in this scene, but Lind's finish samples are somewhat slower. Do not infer a whole-city or NVIDIA frame rate.

The40 moving-frame interval medians were1000.8 vs1002.4ms, with29 vs40 intervals over250ms. The browser's roughly1-second scheduling stalls make FPS unusable as a rendering-speed comparison. Earlier trial finish medians3.8 vs2.6ms are retained locally, not substituted for final measurements. The first trial overlapped existing-game test execution; final profiling occurred afterwards. Raw final report is LIND_PARAMETRIC_BROWSER.json.

Browser cold generation across five shapes was Lind17.3/5.8/4.2/4.7/4.3ms; BMO5.8/6.1/3.9/4.2/3.6ms. These are single cold/JIT-sensitive samples, not statistical benchmarks. Node cold samples are in LIND_PARAMETRIC_CPU.json. Two Lind maps occupy655,360 raw RGBA bytes (plus mipmaps/driver overhead), versus98,304 for BMO; the richer reused Lind bay crop costs more texture memory but remains a single family-wide pool. Source geometry bytes across five shapes2,040,580 vs2,146,120. Process JS heap sample40,445,817bytes includes both families and the retained original, and is not incremental asset memory.

## Checks, visual review and limits

Seven isolated suites pass: crown-fascia closure verified by actual mesh ray intersections between piers, five polygon/rotated/irregular native envelopes and floor counts, proportional grids/constant window widths throughout the range, disjoint roof owners/upper-volume clipping, deterministic cold JSON and actual road-history Undo/Redo assignment restore, pooled materials/20-building shared geometry instancing/selection index retention/full cleanup, and rejection without mutating real continuous office lots or roads. Existing game build and all94 game checks pass. All approved source/runtime boundaries match47152fb.

Screenshots capture the five-lot lineup, matching BMOs, original/new Lind pair, irregular-lot inspection and crown close-up. Actual standalone export modules/textures and controls ran without browser errors. The final crown-fascia closure and caption UI were included in the last export, measured and visually checked. Download copy is byte-identical. Browser automation uses loopback for the exact HTML; direct file:// launch could not be automated. Local imports/assets are all data URLs and the offline profiling path makes no report request. Temporary test tab closed, viewport reset.

Visible differences from the approved original include fewer miniature roof carvings/finials, more regular repeating spandrels, lighter city-compatible limestone, and adaptive shoulder heights/bay counts. Deep footprints produce deeper wing bars; conservative irregular fitting leaves residual lot space. This is a deliberately lighter family, not a replacement for the approved fixed Lind asset. Sculpted/corner irregular buildings, large-city/NVIDIA profiling, automatic gameplay registration and simulation capacity mapping remain outside this milestone. Review appearance before approving any growth integration.
