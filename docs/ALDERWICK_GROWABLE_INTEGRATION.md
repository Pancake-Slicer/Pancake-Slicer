# Alderwick growable integration — 2026-11-18

The approved fixed Alderwick remains byte-identical in architecture/heritage-tower/. The revised family lives in architecture/alderwick/ and registers the virtual key template:alderwick-commercial@1.0.0 through the existing growable adapter. Source/reference hashes are pinned in architecture/lightweight/alderwick-source-lock.json.

The canonical 26-storey preset retains the approved shaft, crown and roof position/normal/UV arrays exactly. Only the square limestone base and central two-storey portal differ: a10.8m-wide,8.4m-high recessed assembly, substantial fluted pilasters, entablature/modillions, bronze doors, masonry reveals and stone threshold. The approved original/chamfer remains available in its original viewer.

## Controlled grammar

- Width uses10/12/14/16 structural bays:35.4/42/48.6/55.2m. Depth uses8–12 complete3.3m bays:26.7–39.9m. No model scaling or stretched details.
- Four4m base storeys,22–32 total storeys,3.6m shaft/crown floors; two or three setback stages, bounded stage heights and canonical/compact setback profiles. Roof-stage minimum16.8×10.8m protects the fixed detailed roof assembly. Invalid combinations/lots reject.
- Three coordinated brick, stone/terracotta and opaque glazing tones; two roof arrangements and restrained relief variants. The original canonical palette and all eight original pixel maps remain unchanged. Material clones share those maps:11 slots per model,27 pooled opaque materials across all tones,737280 raw texture bytes.
- Native per-lot polygon fitting and decorated3.2m envelope clearance, street-facing transforms, assignment/history/picking, shared chunk renderer and geometry leases are reused. Fitted shape caching excludes seed/name/palette. Unchanged frames do not regenerate buildings; demolition/clear prunes leases.
- Existing facade-integrated limestone foundation and concrete paving reused. Portal-wide grade samples and narrower door-width steps keep the central opening accessible; no generic levelling slab. Terrain/road/zoning generation unchanged.

## Play and review

Run npm run export:alderwick-growables for uniquely named offline Playtest, populated Test City and Chrome launcher in dist/. Playtest starts empty; zone Office lots using Mix all 98. Development → Lightweight offices includes Alderwick enable/favour and Canonical 26-storey controls, affecting suitable future growth only. Existing assignments survive toggles, fixed menu choices, Undo/Redo and cold JSON restore. Other families and optional Ohneeohnee remain unchanged; retired static models stay excluded.

Run npm run review:alderwick at http://127.0.0.1:4206/ for the revised canonical and six examples; /game serves the Test City and /playtest the ordinary build. Foundation controls switch flat/sloped disposable fixture terrain only. The canonical and all six variants were rendered and inspected with shared game lighting and comparable isometric camera angles. PNGs are in .tools/alderwick-review/reports/; six-variants.png combines the six example captures.

## Validation and limits

- npm run build:141 existing regressions plus4 new integration tests pass. npm run architecture:alderwick:check:2 tests pass. Canonical shaft/crown/roof arrays and original material pixels match exactly; checkpoint/reference SHA audits and original v52 hash pass. git diff --check passes.
- Actual mixed city:8 Alderwick,8 BMO,3 Lind,8 Von Badel,8 Brick,33 catalogue offices; eight preexisting offices preserved. Original static resource keys empty, optional enhanced runtime unallocated. Flat and sloped portal/corner inspections pass; slope rises about2.10m across Alderwick footprints, using at most2 entrance steps. Demolition, Undo/Redo, deterministic regeneration pass in both scenes; cold restore/picking/cleanup tested in VM.
- Revised canonical14970 source triangles; six examples12916–20452,11 material batches each. Fidelity intentionally costs more geometry than ordinary lightweight families. Shared mesh batching/caching remains active.
- Final10-family-plus8-catalogue comparison, Intel Iris Xe / ANGLE D3D11,1280×720: Alderwick setup207.7ms, median9.7ms/p9512.1ms frame interval,392 full-scene calls/450191 triangles; BMO125.3ms, median12.2ms/p9523.9ms,354 calls/321115 triangles.32 rAF samples after8 warmups; browser scheduling, different fitted heights and postprocessing included. These are small-fixture observations, not GPU timings, large-city parity or a claim that Alderwick is faster.10 Alderwick:91 architecture batches,27 materials/8maps,9 shape cache entries/10 leases.
- Exact final standalone HTML bytes verified over loopback HTTP. Direct file: navigation is blocked by the browser tool, so direct offline launch remains user-side. No gameplay/save files, generated exports or user asset moves are committed.

Checkpoint: safety/pre-alderwick-integration-ee4d8cc plus verified .tools/checkpoints/alderwick-integration-ee4d8cc/history.bundle and unrelated-work copies. Milestone branch codex/alderwick-growable-integration. Local commit only; push awaits specific user approval and is not an off-computer backup.
