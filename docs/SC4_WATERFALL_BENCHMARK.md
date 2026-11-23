# SC4 Postmodern tower — fixed reconstruction benchmark

Internal reference study only; not an approved commercial asset. Supersedes the rejected 0.1.0 waterfall study. One fixed building; no size/height controls, random variants, original redesign or natural growable spawning. Stop for user visual approval.

The supplied 105x270 SC4 image is the architectural authority (SHA-256 bf41a44df075e71821a2957c4d0762d70764f788ca10ad68c647f817af8a4e8c). Source art is unchanged and ignored; embedded only in the comparison HTML, never sampled into facade maps. Prior prototype/source/export remains recoverable at checkpoint/pre-sc4-waterfall-f756f88 and .tools/checkpoints/sc4-waterfall-f756f88/history.bundle (verified full history), with an additional source copy there.

## Image reading and reconstruction

Before authoring geometry, the visible composition was separated into a broad highest rear bridge, paired light shoulder combs descending toward the street, three broad dark waterfall surfaces narrowing forward, a deep lower front channel, light horizontal floor ledges, dark recessed glazing, and a low mechanical service roof. The rejected broad uniform core, four-direction strip cascades and battered roof cap are removed. Existing batching, native placement/history, terrain foundations, engine and lighting are reused; the rejected massing is not.

| Assembly | Fixed reconstruction |
| --- | --- |
| Proportions | 46.8x36.4m body envelope; 50x3.2m storeys, 164.8m including plant |
| Highest bridge | 31.2m wide, rear 11.44m deep, roof160m |
| Central waterfall | Three connected volumes, widths27.3/23.4/19.5m; each6.24m deep with8m actual sloping roof drop; high edges153.6/144/134.4m |
| Outer shoulders | Five per side, roof heights150.4/140.8/131.2/121.6/112m, stepping6.24m forward; wings widen as the central cascade narrows |
| Ground recesses | Front15.6m-wide channel6.24m deep; rear corner cutbacks7.8x5.2m, continued vertically |
| Facade | Blue/lavender-grey precast, slim metallic frames, recessed opaque blue-grey glazing; projecting horizontal wing ledges and separate fine centre divisions |
| Roof | Charcoal service roof, three ribbed sloping falls, shoulder copings, louvred enclosure, ducts, equipment boxes and fan grilles; no invented Deco cap |

These are explicit inferred proportions, not surveyed original mesh measurements. Five shoulder landings per side and three prominent dark falls are the working reading of the tiny oblique reference. Absolute scale, concealed rear arrangement, entrance and individual mechanical details are conservative assumptions. They are subject to visual correction; rendering success and test success do not establish architectural approval.

Fourteen connected volumes rise from grade. Shared facade runs are clipped at real neighbouring edges; narrow partial runs retain at least one bay. Major roofs, recesses, shoulders, ledges and frames use geometry; code-drawn repeating maps supply fine glazing/spandrel detail. Six opaque shared material buckets, three maps, one cached shape; approximately15,100 source triangles, excluding terrain-dependent foundations. Approved family source/material files remain untouched.

## Review and policy

Run npm run export:waterfall and open the timestamped SC4 Waterfall Benchmark Test City HTML or its Chrome launcher. This creates one explicitly assigned benchmark in the actual game. npm run review:waterfall serves those exact bytes at http://127.0.0.1:4209/. The ordinary Playtest keeps normal approved gameplay and no automatically placed study. Set PANCAKE_WATERFALL_REFERENCE to a supplied PNG when rebuilding elsewhere.

Reference view uses22.5-degree azimuth,35.26-degree elevation and18-degree FOV. The original is displayed beside the model. Roof, recessed-plan and entrance controls examine the same building. Save view records a rendered side-by-side comparison at the reference angle and complete game captures for other angles. No reference pixels are retouched. The model remains unapproved pending user comparison.

Version0.2.0 is explicit. Rejected0.1.0 and older experimental assignment records remain archived in saved history and render the ordinary fallback instead of loading the rejected generator or silently restyling old records. No city data is deleted. Existing approved buildings, normal spawning, zoning, roads, terrain, demolition and history are preserved.

Validation and exact export/capture evidence are recorded in SC4_WATERFALL_BENCHMARK_VALIDATION.json. Direct file launch remains user-side: exported bytes are tested over localhost. The single Intel fixture does not establish FPS, GPU-time or large-city parity. Branch codex/sc4-waterfall-benchmark; local milestone only, no push approval or off-computer backup. Stop for visual approval before any original redesign or procedural expansion.
