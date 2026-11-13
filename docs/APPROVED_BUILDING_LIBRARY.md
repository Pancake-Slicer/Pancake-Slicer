# Approved building library publication — 2026-11-13

## Shared location and canonical format

`C:\Users\camsh\Desktop\Pancake-City-restored-v53-20261112-153759\Assets\buildings`

Reused the existing library and `docs/building-asset.schema.json`. All three current approved GLBs were already present following separate Game Coding milestones. This publication validates and documents those exact packages; it neither re-exports/redesigns the buildings nor changes their registration. The live `asset.json` manifests and all GLB bytes remain unchanged. No competing registry or growable implementation was created.

| Package | Model filename / format | Version | Conservative full envelope W × D × H, metres | Minimum lot W × D, metres |
| --- | --- | --- | --- | --- |
| lind-art-deco | lind.glb / embedded GLB 2.0 | 1.0.0 | 45.8 × 31.25 × 183.9 | 46.4 × 31.85 |
| von-badel-art-deco | von-badel.glb / embedded GLB 2.0 | 2.1.0 | 57.35 × 43.78 × 187.2 | 57.95 × 44.38 |
| ohneeohnee-modernist | ohneeohnee.glb / embedded GLB 2.0 | 1.0.0 | 36.39 × 18.68 × 53.201 | 36.99 × 19.28 |

Each directory has its original `asset.json` plus a new uniform `architecture.json` descriptive companion. The existing registration schema intentionally disallows extra top-level fields, so architectural style, explicit origin, suggested classification, measured Float32 bounds, embedded texture inventory and authoring dependencies are recorded in the companion without altering runtime metadata or generated game bytes. `asset.json` remains the ONLY registration contract. The companion schema is `docs/approved-building-metadata.schema.json`; it is not a new model/registration format. `approved-library.json` is an automatically generated index pointing to those manifests.

All three suggest **high-density commercial**, mapped descriptively to the existing `offices` vocabulary and flagged for **Game Coding confirmation**. Current minimum lot, floor-capacity and development-stage eligibility are preserved, not reinterpreted. Von Badel's historical ID deliberately remains `von-badel-art-deco` despite its refined International Style architecture.

## Inspection and packaging findings

- Lind: approved symmetric-wing Art Deco model from benchmark/art-deco/model.js; seven batched materials, source-derived window/stone maps, stepped volumes, framed green-grey crown. The registered GLB is the approved 1.0.0 export; source hash and approved commit remain pinned.
- Von Badel: refined 2.1.0 International Style model, straight shaft and flat mechanical roof, dark source-derived materials and equal wings. It depends on baseline-v2.js, materials.js and the shared authoring helper, all hash-pinned. No old green-roof export was used.
- Ohneeohnee: completed Study 03, single 36×18 m body, fourteen nominal storeys, narrow dark sides, grey curtain wall and connected roof plant. The GLB matches the Study 03 handoff hash.

Every runtime dependency (geometry, UVs, normals, indices, PBR factors and PNG base-colour images) is embedded in its GLB. External runtime dependency lists are empty. No procedural source, source image, benchmark viewer or game module is fetched in normal package mode. Authoring dependencies are recorded separately for provenance/source-comparison verification. The original models, textures and benchmark directories have not been moved, overwritten or deleted.

Texture/image payloads are unique model-specific artwork inside each GLB; no permanent duplicate exports or loose processed textures were introduced. The inspection viewer loads one resource set and shares it across instances. Its vendor renderer/loader is shared across all packages and generated only in ignored output, with Three.js license and existing third-party notices.

## Scale, coordinates and bounds

Metres, Y-up, model ground at Y=0, front/road-facing direction +Z. Ground origin remains [0,0,0] at the original authoring datum; the geometry was not recentered to its bounding-box centre. Positive-Z trim/threshold asymmetries are deliberately retained. Entrances: Lind [0,0,15.75], Von Badel [0,0,22.105], Ohneeohnee [-4,0,9.485]. Do not distort models to fit smaller lots.

`asset.json` contains the complete conservative footprint, bounding box and dimensions. `architecture.json.measured` records exact transformed Float32 min/max and dimensions from the packaged geometry. Differences from the conservative manifest are below 0.002 m; Ohneeohnee's outward-rounded envelope height is 53.201 m versus actual Float32 geometry 53.20000076293945 m. Projecting piers, cornices and entrance thresholds are included, not merely the core wall rectangles.

## Independent verification

Run `npm run assets:library:test`. The preparation script discovers approved companions beside existing manifests, uses the existing compiler to validate canonical format/bounds/footprint/hash provenance, verifies descriptive measured bounds and all authoring hashes, refreshes the index and prepares an isolated viewer. The browser test starts its own local HTTP server and uses standard **Three.js 0.180.0 GLTFLoader**, not the game's model compiler or original benchmark viewer, to load each GLB. Package requests are checked to exclude authoring source paths.

Source comparison is an explicit separate mode that instantiates the unchanged approved factories. The package and source renders use the SAME lights, tone mapping, shadows, projection, camera angle, viewport and plinth. Camera presets reproduce the approved benchmarks: Lind 35° yaw / 19° pitch, span 211 / target 91; Von Badel 35° / 19°, span 215 / target 93; Ohneeohnee 25° / 27°, span 68 / target 25. Framing is orthographic and does not alter native geometry.

Passed for all three:

- Byte-identical loaded position, normal, UV and index signatures versus authoring factories; identical PBR colour, roughness, metalness, side, texture resolution, sampler wrapping and colour-space settings.
- Measured source/package bounds exactly equal and inside the manifest envelope; ground Y=0; front +Z / up +Y.
- All embedded images/materials loaded with no runtime or console errors.
- Sixteen shared-resource instances render with quarter-turn rotations. Entrances remain on ground; transformed front directions match +Z, +X, -Z and -X. Geometry/materials/textures are reused; no per-instance image or geometry allocations.
- Full rendered canvas comparisons: Von Badel pixel-identical. Lind has two pixels differing by more than 2/255 in a channel; Ohneeohnee has four. Mean absolute RGB error is below 0.00004/255 for both. No visible missing detail/material was found in direct screenshot review.

Actual screenshots (generated/ignored, reproducible): `.tools/library-{id}-package.png`, `-source.png`, `-comparison.png`, and `-16-copies.png`. Detailed results: `.tools/approved-library-report.json`.

| Asset | Model batches | Model triangles | Scene draw calls, 1 or 16 copies | Approx. shared texture memory incl. mips | GLB bytes |
| --- | ---: | ---: | ---: | ---: | ---: |
| Lind | 7 | 26,040 | 9 | 0.83 MiB | 2,046,972 |
| Von Badel | 9 | 25,762 | 11 | 1.25 MiB | 2,016,032 |
| Ohneeohnee | 10 | 14,952 | 12 | 1.58 MiB | 1,435,716 |

Scene totals include two extra draws / 24 triangles for ground and plinth. Sixteen-copy scene triangle counts: 416,664 / 412,216 / 239,256 respectively. Texture estimates are uncompressed RGBA plus mip chains, exclude the separate cached shadow target (approx. 32 MiB at 2048), and are not GLB download sizes. The isolated viewer is not a full-city FPS benchmark. Geometry/material sharing does not remove per-instance triangle/shadow cost; large-city LOD/visibility policies remain Game Coding work.

`npm run build` passes all **64** current regressions, packaging and immutable v52 hash verification. A Git diff against the pre-publication checkpoint verifies web/, original/, all original benchmark directories/helpers, all existing asset.json and GLB files, and growable compiler unchanged.

## Inspect and extend

Run `npm run assets:library` or `Inspect Approved Building Library.cmd`, then open http://127.0.0.1:4186. Choose the building, orbit/zoom, toggle sixteen copies, or switch between independent GLB and source comparison. Optional tooling prerequisites: `npm install --prefix .tools --no-save --package-lock=false three@0.180.0 playwright`, plus installed Chrome or ART_DECO_CHROME. Generated vendor files are not project dependencies or committed build output. The GLBs themselves require no authoring tooling to load.

For future approved buildings, use a new package folder with the existing asset.json schema and embedded GLB, then supply an architecture.json companion following these examples. Run preparation/test commands; discovery and inventory generation need no per-building code edits. Keep a unique stable ID/version and complete decorated bounds. The benchmark source-comparison profile records its factory export, facade source, hash-pinned authoring modules and approved camera; its current module-copy convention follows the existing flat benchmark factory/helper layout. Standard independent GLB loading does not depend on that authoring convention.

The local Lind references were previously moved by the user into Kind/ while Git still tracks their old root location. Metadata keeps the tracked canonical facade path with a hash-verified Kind/ alternate for this checkout. Preparation resolves either location without modifying or staging those existing user moves. A clean checkout uses the tracked canonical path. Normal GLB loading requires neither location.

Inspection applies texture anisotropy 8 to match the authoring quality policy; receiving viewers should use a matching sampling policy. Compatibility limits: static opaque PBR / UV0 / embedded PNG/JPEG is the existing game's supported subset; no new loader/material extensions are needed. Architectural source limitations (inferred dimensions/rear details, repetitive source reflections, simplified plant) remain unchanged. No new city-growth/terrain/lot/history test or integration is claimed here; current eligibility remains authoritative until Game Coding chooses changes.

Files are available immediately to the Game Coding chat via the shared project folder. The metadata/index/tooling are versioned in this milestone's local commit, but no repository push has occurred. No message was sent to another chat and no gameplay work was performed.

## Recovery

Before changes: annotated tag `checkpoint/pre-approved-library-20261113` at dff655afa562048434b50712e923b0d4f00e2506 and verified `.tools/pre-approved-library-20261113.bundle` preserve complete history. Branch `codex/publish-approved-building-library`. These are local recovery points, not off-computer backups. Every push requires explicit approval under AGENTS.md. Existing uncommitted Lind-reference moves are untouched and excluded from this milestone.
