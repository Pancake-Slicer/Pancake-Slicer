# Individually authored growable assets

**Current import workflow:** run `npm run update:buildings` or double-click `Update Approved Buildings.cmd`. Architecture publishes to `Assets/buildings`; the game compiles unchanged validated copies from `Assets/growable-registry`, retaining versioned assignments. See [approved-building workflow](APPROVED_BUILDING_WORKFLOW.md). The following records the original Lind milestone and format; future packages need no per-building code edits.

## Play this milestone

Run `npm run demo:growables`, then open `dist/Pancake City - Lind Growables Demo.html` in Chrome or Edge. It also works through `npm run preview` at port 4174. This is the actual city game with generated terrain, roads, Office zoning, normal automatic building choice, selection, demolition and undo/redo. It starts with **three Linds among 36 mixed Office buildings**. No Lind-specific placement override is used. The normal `dist/Pancake City - Playtest.html` still starts a new world; the normal game also automatically includes Lind in eligible mixed Office development.

Use the hand tool to orbit/pan/zoom. Choose Demolish and hover over Lind to inspect its identity; click to demolish it. Undo restores the exact building. Ordinary Office painting and bucket fill still work. The demo setup is separate from the normal runtime and never runs in an existing city.

## Recoverable checkpoint

Before implementation, annotated tag `checkpoint/pre-growable-assets-20261113` was created at `aea08edd8ae73663a8a9560edde27832818c996a`. The verified `.tools/pre-growable-assets-20261113.bundle` includes complete local history. The tag preserves the approved symmetric Lind and the preceding game. To inspect it safely, create another checkout/worktree from that tag; do not reset an active city-development checkout. These are local recovery points, **not off-computer backups**. No push is authorized by this milestone.

## Audit of the existing game

| System | Existing behaviour and integration decision |
| --- | --- |
| Zones | `vi` and `qb` expose `rowhouses` and `offices`. The commercial Office category is the correct existing term for Lind. No separate commercial-density tool exists. |
| Lot generation | `pcOfficeBlockLayout` splits road-cleared land into adjoining parcels, excludes landmarks/water/excessive slopes, and retains road/entrance metadata. No lot dimensions, subdivision rules or masks changed. |
| Building growth | `pcZonedBuildings` / `pcOfficeParcels` create buildings immediately when lots are zoned. There is no demand simulation, construction timer, unlock stage, or separate growth-stage state. Registration uses `developmentStage: immediate` rather than inventing one. |
| Capacity | `pcOfficeSpec` caps floor capacity at 24/40/60/80 by area, additionally limited by the parcel's profile. Lind's high-density eligibility means an Office parcel with at least 48-floor capacity, adequate area, and a complete native-scale fit. This is a capacity interpretation, not a new density control. |
| Legacy selection | The 98-entry catalogue remains intact. Existing numeric assignments and explicit catalogue choices retain their original behaviour. Its 16 nearest-area mixed candidates form the legacy fallback pool. |
| IDs/history | Building IDs remain `office:<property-id>`, with the existing `propertyIds`, signature, suppressed IDs and history participant. Versioned asset assignments share the existing `catalogueAssignments` map; no second independent history is introduced. |
| Terrain | Generated lots already record highest/lowest sampled ground and `y = high + 0.57`. The model sits at that level on a separate game foundation. Neither the model nor neighbouring terrain is deformed. |
| Rendering | `pS` caches 256 m neighbourhood chunks. Legacy material/geometry batching and facade LOD remain. Authored models use seven shared-geometry instanced material meshes per populated chunk, with normal `buildingIds` picking. |
| Lind | The approved `benchmark/art-deco/model.js` is unchanged. Its 26,040 model triangles, two facade/stone maps, seven PBR materials, symmetric wings and 183.9 m crown are exported to GLB. The architectural benchmark remains independent. |

## Standard asset format

See `building-asset.schema.json` and `Assets/buildings/lind-art-deco/asset.json`. Units are metres, Y is up, +Z faces the road, and model ground starts at Y=0. The footprint must cover the **entire model projection**, including projecting trim, not just its nominal podium. Lind's full envelope is 45.8 × 31.25 m; the podium body remains the approved 44.4 × 29.6 m.

| Field | Purpose |
| --- | --- |
| `schemaVersion`, `id`, `name`, `version` | Stable authored identity, display name and model version. Save/history key is `asset:<id>@<version>`. |
| `model.format`, `model.path`, optional `sha256` | Portable GLB or procedural factory, relative to its own asset folder. No remote runtime resources. |
| `dimensions` | Native width/depth/height, nominal floors and floor height; optional window count for renderer statistics. |
| `footprint`, `bounds` | Ground-plane containment and three-dimensional bounds. The compiler checks every transformed GLB vertex against these declarations. |
| `orientation` | Required front/up convention and entrance in model coordinates. Placement computes road-facing yaw and translates the entrance to world space. |
| `eligibility` | Existing `offices` zone, high capacity, immediate stage, minimum area/frontage/depth and setback. The current adapter targets Office growables only. |
| `selectionWeight` | Deterministic weighted chance among eligible assets and the legacy fallback. |
| `selection` | Real model-instance raycasting, with declared bounds for validation and a footprint-based selection highlight. Lot occupancy remains reserved for the whole lot. |
| `source` | Provenance, approved source/commit/hash and authoring notes. Lind's source and GLB hashes are pinned to detect accidental redesign. |

## Adding future buildings without custom game integration

1. Author a model using the same metre/Y-up/+Z-front convention. Bake any texture transforms, use UV0, retain native proportions and put its ground plane at Y=0.
2. Create `Assets/buildings/<unique-id>/`, place an embedded GLB there, and add `asset.json` following the existing manifest/schema. Supply accurate full-envelope footprint/bounds, eligibility, version, entrance and weight. Change the asset ID and measurements; do not copy Lind's source hashes into another asset.
3. Run `npm run build`. The compiler discovers every `*/asset.json` automatically, validates and packages it, and registers it with the shared selector/placer/renderer. No per-building changes to zoning, rendering switches, imports, menus or application code are required.
4. Exercise eligible and unsuitable lots, rotation, terrain, selection, demolition and undo/redo; inspect actual-game screenshots. Run `npm run export:html` for the offline game. A fresh build/export is required to include a new asset.

Supported GLB core: static triangle meshes, embedded PNG/JPEG base-colour maps, UV0, normals, indices, node transforms and opaque metallic/roughness PBR factors, emissive colour and double-sided flag. Unsupported animation, skins, sparse accessors, morphs, additional vertex attributes, glTF extensions, normal/occlusion/emissive maps, alpha modes and packed metal/roughness maps fail the build instead of losing visual features silently. Extend the **common adapter** once when a new material capability is needed. Lind 1.0.0 and refined Von Badel 2.1.0 are now registered. The current Architecture integration is documented in APPROVED_ARCHITECTURE_INTEGRATION.md; the earlier Lind-only measurements below describe that preceding milestone.

For an already procedural asset, set `model.format` to `procedural` and point `path` to a standalone JavaScript function expression, e.g. `T => ({parts: [{geometry, material}], images: []})`. It receives the recovered engine's `BufferGeometry`, `Float32BufferAttribute`, `MeshStandardMaterial`, `CanvasTexture`, and `BoxGeometry`. It must return native local-space shared parts, and optional `{map, uri}` images for the standard readiness path; it must not fetch external resources or mutate lots. This is model-authoring code, not custom game glue. The same manifest eligibility, identity, placement, picking and instancing apply. The existing 98 procedural recipes retain their original implementation as the fallback catalogue.

## Placement, selection and persistence

An asset is considered only when no explicit legacy catalogue choice is being painted. Existing assignments are honoured before the current menu choice; the menu never retroactively changes an already grown/restored Lind. Eligible assets receive deterministic weighted tickets from the stable property ID. Lind's weight is 4 against legacy fallback weight 16, so about 20% of otherwise suitable unassigned lots select it. Smaller/irregular/low-capacity lots retain legacy buildings.

Placement aligns model +Z with `towardRoad`, accounts for an offset model origin, tries a frontage-aligned translation and then the lot centre, and tests the whole footprint **plus 0.3 m safety setback** against the lot polygon. Setbacks use the game's actual polygon-offset operation, including for concave footprints. It never rotates sideways just to squeeze into a lot, changes lot subdivision, stretches a podium, scales a facade, moves a road, or borrows adjacent land. If neither translation fits, the asset is ineligible and the old catalogue handles the lot. Assets retain unit scale `(1,1,1)`. Entrances, selected bounds, shadow bounds and instance transforms use the resulting placement.

The existing foundation supports the model at the lot's highest ground level with a level surface underneath. On the flat demo terrain ground is 8 m and model base is 8.57 m. Water and slopes above the existing 3.6 m lot tolerance remain excluded by ordinary Office lot generation. The terrain itself is not modified by asset placement.

The building's ordinary office ID stays stable. The versioned asset key persists in the existing serializable assignments/history map, and is also in its building spec/signature. Demolition suppresses the building and owning property using existing rules; undo/redo restores the assignment, shape and ID. Repainting an explicitly chosen legacy design still replaces Lind through the normal history operation. No new standalone city-save UI is introduced. If a registered version is unavailable or becomes unsuitable after lot changes, the existing catalogue is used as a compatibility fallback; older published standalone HTML files are unchanged.

## Fidelity, performance and tests

The browser test compares the GLB resource directly against the approved procedural source: **zero position, normal, UV, material-colour and sampled texture-pixel differences**, identical indices, unchanged roughness/metalness/side and sampler wrapping. glTF's vertical image convention is handled by flipping the embedded PNG at export and using `flipY=false` at load; UVs are unchanged. Lighting and colour treatment are the actual game's existing settings, so the game and architectural benchmark have different scene lighting. No Lind materials are recoloured or passed through the legacy procedural material shader.

One source geometry/material set and two decoded maps serve all Lind instances. Geometry is not cloned per building or chunk; instance matrices vary. Chunk disposal releases instance buffers and foundations while preserving shared model buffers/materials. Camera motion retains the same models/chunks. Legacy facade LOD remains; Lind's approved mesh is retained at full detail in this milestone.

Measured actual-game case on hardware Chrome/ANGLE Intel Iris Xe at 1440 × 1080: 68 mixed buildings, 4 Linds, 215 neighbourhood mesh batches, approximately 526,510 renderer-reported triangles during motion. One Lind resource uses about 1.74 MiB geometry and 0.83 MiB material textures including mipmaps, shared across all four buildings. Verification runs measured 39.5–39.9 ms median / 42.1–60.2 ms p95 for 80 requestAnimationFrame intervals after 10 warmup camera frames; the final run was **39.9 / 60.2 ms**. These include browser scheduling and the whole existing city renderer, not isolated Lind GPU cost or proof of 60 FPS. Exact latest values are in `.tools/lind-growables-browser.json`.

This establishes reusable registration, not performance certification for hundreds of **distinct** detailed models. The offline export embeds all registered assets and currently initializes their shared resources at startup; payload/startup memory will grow with catalogue size. Streaming, bounded resource eviction and asset-specific distant LODs are future work, and no hundreds-model capacity claim is made.

Commands:

```
npm run build
npm run demo:growables
# Serve dist/ on port 4183 for the browser test:
node node_modules/http-server/bin/http-server dist -a 127.0.0.1 -p 4183 -c-1
# In another shell; optional test driver stays ignored:
npm install --prefix .tools playwright --no-audit --no-fund
npm run test:growables:browser
```

All 58 Node regressions passed, including the 53 pre-existing checks with one deliberately expanded assertion allowing authored assets alongside numeric catalogue IDs. New coverage checks automatic growth, strict fits/rotation/rejections, native dimensions, containment/non-overlap, material/geometry sharing, instance picking, chunk cache/disposal, demolition/undo/redo and JSON assignment restoration. The original v52 hash and exact reviewed-runtime assembly checks remain mandatory; the asset assembler was added deliberately to that recipe.

Real browser screenshots: `.tools/lind-growables-city.png`, `-selected.png`, `-demolished.png`, `-restored.png`, `-dense-city.png`, and `-offline.png`. The test uses the actual game's generated terrain and road/zoning APIs, then real screen-space picking, hover/click demolition and Undo/Redo buttons. Three Linds grow automatically in the 36-building demonstration; zoning the rest of the available parcels produces four among 68 buildings. No runtime errors were observed. Both the standalone demo's complete local-file scenario and the ordinary offline game's terrain-setup startup were checked. There are no external model/texture/network dependencies in the exported game. Captures, logs, optional tool dependencies, bundles and build output stay ignored.

Lind's one-time authoring export can be repeated with `npm install --prefix .tools three@0.180.0 playwright --no-audit --no-fund` then `node scripts/export-lind-glb.cjs`. The exporter uses the exact approved source and matching r180 GLTFExporter; ordinary builds need neither Playwright nor an installed Three.js package. The game still uses its recovered r180 engine and retains third-party notices. Quaternius assets are not used.
