# BMO-inspired parametric office tower — visual review

2026-11-14. Architecture-only template, version1.0.0. No growable catalogue registration or game integration.

## Open the five-building comparison

With the existing Architecture Lab server running, open **http://127.0.0.1:4187/bmo.html**. To restart: `npm run architecture:modernist` or `Play Procedural Architecture Lab.cmd`, then follow the **BMO-inspired parametric study** navigation link. This is an additional page in the existing Lab; the original family, facade and performance pages remain available and unchanged at source.

The page shows all five buildings side by side. Select a variation, change width/depth/storeys/floor height, bay counts, podium dimensions/floors, roof-unit count or penthouse height, and click **Rebuild selected**. Other models keep their original geometry. **Inspect selected**, **Front elevation**, **Opposite corner**, **Roof detail**, orbit/zoom and **Reset view** support review. **Restore five presets** resets the requested compositions.

Under **Test a lot**, choose or enter lot width/depth and click **Fit selected by rebuilding bays**. The selected building is reframed with lot/setback outlines. The generator recalculates physical dimensions, counts and pitch, retains complete floors, and keeps scale=[1,1,1]. It rejects footprints too small for the studied architecture. Invalid inputs report a readable error and retain the last valid model.

## Primary photograph and architectural interpretation

The original user-supplied `CN_Tower_SkyPod_2023b (1).jpg` is preserved byte-identically as `Assets/Architecture/International/BMO-inspired/reference.jpg`. It is11,042,528 bytes, displayed4160×6240 with orientation applied; SHA-256 `e191c75d3c49dfe85c655c3651e5137c0a60d7cf947705356e874962c18dd8e1`. `reference.json` records provenance. The Downloads original is unchanged. No other building artwork or Quaternius assets are used.

The central BMO tower supplies the identity: pale silver-white projecting horizontal panels, continuous narrow dark blue-grey vision ribbons, fine recessed mullions, continuous dark corner frames with small vision slots, a broad blank upper fascia and white rectangular mechanical penthouse. The template retains those features across its five sizes. It does not reproduce the neighbouring towers or corporate marks. No photograph is mapped onto the facade, so branding cannot appear through a source texture.

Typical bands project0.14m beyond the nominal wall; the glazing plane is recessed0.13m, giving0.27m actual relief. Slightly brighter folded edges catch daylight; fine panel joints align with the bay grid. Corner posts remain dark through the roof fascia. Roof membrane, low coping, white penthouse, restrained vents, supported fan units and short connected ducts create a functional flat roof. Ground-floor glazing/columns and a modest entrance complete the base without rooms or other interior geometry.

The base is partly occluded in the photograph. Its commercial entrance and optional rectangular podium are therefore reasoned interpretations rather than a claimed measured replica. The photo supplies proportions/rhythm/material character; the requested15/25/35/45/40 occupied storeys govern the variations, rather than attempting to assert the actual reference building's dimensions/floor count. The requested model omits all logos/signage. Repeated rear elevations and roof-equipment sizes are inferred from the visible architectural system.

## Reusable generator and parameters

Authoring files: `architecture/bmo/spec.mjs` (normalization, compatibility, bay-grid resolution, five presets and lot fitting) and `architecture/bmo/generator.js` (shared materials, geometry, caching and disposal). Lab UI lives separately in `architecture/lab/bmo.html` and `bmo.js`.

The Lab preparer copies these modules into `.tools/modernist-lab/bmo/`, binding the existing Three.js r180 engine and shared ArchitectureBatch helper. Use that prepared layout or provide equivalent engine/helper module bindings; importing generator.js alone without its dependencies is not the consumption contract. No existing architectural implementation is copied or modified; this is a distinct new parametric template using shared batching infrastructure.

| Parameter | Default / allowed range | Behaviour |
| --- | --- | --- |
| width / depth | 34/28m; width16–68, depth14–54 | Nominal tower body, not trim envelope. Recalculates front/side modules. |
| storeys |25; integer8–55 | Occupied storeys INCLUDING any podium. Plant/fascia are additional height. |
| floorHeight |3.65m;3.3–4.1 | Rebuilds full typical floors and corresponding glazing/bands. |
| lobbyHeight |4.8m;4.2–5.8 | First floor only. |
| targetBay |2.4m;1.8–3.2 | Automatic whole bay count, then pitch = clear face/count. |
| frontBays / sideBays |null / auto | Optional whole counts3–42; actual pitch must remain1.8–3.2m. UI0 means auto. |
| bandRatio |0.58;0.46–0.62 | Controls typical solid/glass balance; default bands dominate the ribbons. |
| cornerWidth |1.2m;0.9–1.8 | Dark corner framing width. |
| capHeight |4.6m;1.8–6.5 | Blank silver top fascia; no signage. |
| podium |null or object | storeys2–6, below one-third total floors; width/depth at least4m broader than tower, maximum84/68m. Base modules resolve independently. |
| penthouseHeight |4.8m;3–7 | White mechanical enclosure height. |
| equipmentCount |2;integer0–6 | Rebuilds appropriately spaced low roof plant; the signature penthouse remains. |
| id / name |caller text | Stable caller identity/label; not a live game asset key. |

Additional compatibility: occupied height divided by the smaller tower body dimension cannot exceed10. Fractional floors, incompatible explicit bay counts and excessive slenderness are rejected. `fitToLot(spec,{width,depth,setback=.3})` reserves clearance for projections, fits body/podium, reflows bays and rounds dimensions DOWN to0.1m. It does not call Object3D.scale or deform existing geometry. Non-grid lot boundaries/road frontage/terrain remain future game responsibilities; the Lab fits rectangular lots only.

```js
// In the prepared Lab/compatible module layout:
import {BmoGenerator} from './bmo/generator.js';
import {fiveVariations,fitToLot} from './bmo/spec.mjs';
const generator = new BmoGenerator();
const spec = fitToLot(fiveVariations()[0], {width:32, depth:26});
const model = generator.generate(spec);
scene.add(model); // native geometry; ground Y=0, road/front +Z
console.log(model.userData.metadata); // full measured envelope/footprint/grids/performance
// With borrowed optimization batches: clear those FIRST.
generator.release(model); // removes from parent, repeated release is safe
generator.prune();        // dispose unused geometry, retain active/shared resources
generator.dispose();      // only after every lease has been released
```

Models are Groups containing at most nine material-batched meshes, not independent window objects. Specifications normalize deterministically and are cloned. Equal shapes share geometry and all variants share the same nine materials/two source maps. Do not mutate shared materials or dispose borrowed geometry per instance. The generator rejects final disposal while model leases are active. Use the existing OptimizedFamilyRenderer for opaque material merges and repeated whole-mesh instancing; clear its owned batches before releasing/pruning sources.

`model.userData.specification` contains the complete normalized inputs. `metadata` exposes family/version/id, floor count, floor height, complete measured dimensions/bounds/footprint, entrance orientation, per-tier grids, facade rows, performance and **visual-review-only-not-registered** status. The metadata is local/native; nominal body dimensions differ from the full envelope because of band edges/thresholds. Feet are atY=0 and front/road direction is+Z. A future common growable adapter can consume this contract after visual approval; no automatic registration or per-building game code is added now.

## Five requested variations and measured performance

| Variation | Body W×D | Occupied storeys | Full measured W×D×H, metres | Model triangles | Material batches |
| --- | --- | ---: | --- | ---: | ---: |
| Narrow |24×20 |15 |24.31×20.575×65.42 |2,876 |9 |
| Medium |34×28 |25 |34.31×28.575×101.92 |4,316 |9 |
| Broad |50×34 |35 |50.31×34.575×138.42 |5,804 |9 |
| Tall |36×30 |45 |36.31×30.575×174.92 |6,788 |9 |
| Podium |40×30 tower,54×40 base |40 including4 podium |54.29×40.565×156.67 |7,400 |9 |

Five-source total:45 mesh batches /27,184 triangles, merged into **nine opaque render batches**. With the ground: **10 scene draw calls /27,186 triangles**. A selected building likewise uses9 model calls plus ground. Lot/setback outlines add two annotation line draws only in lot-inspection mode. Repeated identical buildings use the existing whole-mesh instancing path, tested with five repeats. No individual window meshes, alpha sorting, dynamic reflection passes, interiors or oversized facade textures.

Two shared DataTextures:256×64 physical panel-joint tile and128×64 restrained sky/horizon reflection. Source map allocation estimate **0.125MiB including mip allowance**, shared across all five;96KiB before mips. Window reflections come from the shared environment rather than stretched window photography. White-panel joint UVs follow actual bay pitch. The photo shown in the reference panel is UI-only, not a GPU facade map. The renderer's PMREM/reflection scratch resources and cached2048 shadow map are additional and excluded from that source-map estimate.

The five-building merged geometry adds1,906,720 bytes to the cached source buffers. Final inspection runs on Intel Iris Xe/ANGLE in Chrome at1620×1088 canvas reported roughly0.6–0.9ms median /1.6–2.1ms p95 for90 fixed-camera render+gl.finish samples after15 warmups, cached shadows. This is isolated rendering cost, not complete game FPS or a thousands-of-buildings guarantee. First-frame reflection preparation is settled before reading counters, preventing partial internal-render counters from being reported as main-scene totals.

## Verification and corrections made

- `npm run architecture:bmo:check`: **7/7** meaningful geometry/compatibility/performance/lifecycle tests pass.
- `npm run architecture:bmo:test`: actual rendered lineup, tall three-quarter, front, opposite, roof and podium screenshots; real UI width/depth/height/floor/bay/podium/equipment controls; other variants unchanged; invalid edits retain previous geometry; drag/zoom and narrow layout pass. Five lot-fit cases across20×18,32×26,48×36 and64×46m pass full-envelope/setback checks at scale1. An undersized15×12m lot is rejected.
- Independent rays confirm glazing is0.27m behind the projecting band face, with a sealed backing. A downward roof ray verifies there is no coincident inner-shell top under the visible deck. All meshes have finite attributes, valid indices, normalized normals and nondegenerate triangles. Full geometry/material signatures are cold-deterministic; cache/instance sharing and single-disposal checks pass.
- Direct rendered review against the supplied photo corrected nearly black initial glazing, strengthened the broad blank roof fascia, added restrained connected roof plant, eliminated coincident deck/shell tops and fitted cached shadow bounds to remove diagonal roof self-shadow striping. Numeric lot-fit controls were cleaned to0.1m outputs.
- `npm run architecture:modernist:check`: all **44** existing architectural tests pass. Existing facade Lab still renders and switches styles.
- `npm run build`: all **84** current game/import checks, recovery hash and license checks pass. No game source, main renderer or registry change is made by this milestone.

Evidence remains reproducible/ignored: `.tools/bmo-five-lineup.png`, `bmo-tall-three-quarter.png`, `bmo-front.png`, `bmo-opposite.png`, `bmo-roof.png`, `bmo-podium.png`, and `bmo-lot-{size}-{index}.png`. Detailed raw measurements are `.tools/bmo-validation.json`. Use `npm run architecture:bmo:test` to regenerate; the test starts its own temporary HTTP server. No architectural approval is inferred from passing tests.

## Remaining limits and approval boundary

Await visual approval of all five before any catalogue work. The rear faces are consistent inferred continuations; the podium/ground floor and equipment details cannot be surveyed from this partially occluded photograph. The static reflection is restrained but does not reproduce neighbouring buildings, dynamic reflections or transparent interiors. No antennas/background structures, corporate logos or signage are generated. No LOD or dense-city GPU certification is included. Very small lots, unsupported proportions or incompatible counts are rejected instead of distorting components.

Default five envelopes meet the scale/orientation conventions needed for a later growable adapter, but their use with actual zoning, roads, selection/history, terrain foundations, save/load or the current importer is NOT implemented or certified here. Shared reflection material handling would need to remain intact in any later integration; do not silently flatten it through an incompatible export path. There is no BMO asset.json, live registry entry or growth selector change.

## Recovery and preservation

Before edits: annotated `checkpoint/pre-bmo-parametric-20261114` at c17c577 and verified complete `.tools/pre-bmo-parametric-20261114.bundle`. Pre-existing worktree status and the already modified `scripts/export-procedural-offices.cjs` were separately copied to `.tools/bmo-before/` before implementation. That script's current hash still matches the pre-task copy; it is excluded from this commit, as are the user's earlier Lind-reference moves.

Original approved models, Ohneeohnee generators/styles, integration package, optimization helper, existing Lab source pages, game assets, live registry and original52 remain byte-unchanged. Only the Lab preparer is extended to copy the new page/modules/photo and insert generated navigation links; existing UI source is not overwritten. Branch `codex/bmo-parametric-office`. A local checkpoint/commit is not an off-computer backup; every GitHub push requires separate approval under AGENTS.md.
