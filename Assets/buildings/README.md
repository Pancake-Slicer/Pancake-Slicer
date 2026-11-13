# Approved architectural building library

Shared folder: `C:\Users\camsh\Desktop\Pancake-City-restored-v53-20261112-153759\Assets\buildings`.

This is the EXISTING asset library, not a parallel registry. All three models are independently loadable embedded GLB 2.0 files. The existing `asset.json` in each package is the sole registration manifest governed by [building-asset.schema.json](../../docs/building-asset.schema.json). It is preserved byte for byte. `architecture.json` supplies descriptive style, explicit origin, suggested classification, measured bounds, texture inventory and provenance; it is not read by the game. All three use the same two-file metadata structure. [Metadata companion schema](../../docs/approved-building-metadata.schema.json).

| Package | Approved model | Registration manifest | Architectural metadata |
| --- | --- | --- | --- |
| Lind 1.0.0 | [lind.glb](lind-art-deco/lind.glb) | [asset.json](lind-art-deco/asset.json) | [architecture.json](lind-art-deco/architecture.json) |
| Von Badel 2.1.0 | [von-badel.glb](von-badel-art-deco/von-badel.glb) | [asset.json](von-badel-art-deco/asset.json) | [architecture.json](von-badel-art-deco/architecture.json) |
| Ohneeohnee 1.0.0 | [ohneeohnee.glb](ohneeohnee-modernist/ohneeohnee.glb) | [asset.json](ohneeohnee-modernist/asset.json) | [architecture.json](ohneeohnee-modernist/architecture.json) |

[approved-library.json](approved-library.json) is a generated inventory pointing to those existing manifests, not a new registration format. Run `npm run assets:library:prepare` to validate and refresh it. New approved packages with `architecture.json` are discovered without changing existing packages or the publisher. This tooling does not modify the game's discovery, selection or placement logic.

Every model uses metres, Y-up, +Z front and ground Y=0 at its original authoring origin. Do not recenter or rescale it. Footprints/bounds cover projecting trim and entrances; manifests use conservative envelopes while companion metadata records exact measured Float32 extents. Minimum lot dimensions and current `offices` eligibility remain in `asset.json`. Suggested classification for all three is high-density commercial, for Game Coding to confirm; publication does not override current runtime eligibility.

All PNG textures and PBR materials are embedded in the GLB; there are no external runtime texture/module dependencies. Load once, then share its geometries/materials/textures or instance it. Independent packages intentionally carry their own model-specific embedded images; do not duplicate resources per building instance. Authoring dependencies are hash-listed separately and are not required to load the GLB. Von Badel retains its historical stable `von-badel-art-deco` ID despite its approved International Style design.

Run `npm run assets:library` and visit http://127.0.0.1:4186, or double-click `Inspect Approved Building Library.cmd`. Choose a building; drag/scroll to inspect and use **16 copies** to inspect shared-resource quarter-turn instances. Source comparison is a separate optional mode; normal package loading does not request authoring sources. Run `npm run assets:library:test` for independent GLTFLoader checks, geometry/material matching and rendered comparisons.

Inspection tooling requires optional tools installed in ignored `.tools`: `npm install --prefix .tools --no-save --package-lock=false three@0.180.0 playwright`, plus an installed Chrome (or set `ART_DECO_CHROME`). The runtime viewer is generated with local Three.js r180/GLTFLoader and license notices; the models themselves load in any compatible standard glTF viewer without these authoring tools. No runtime network/CDN dependency is introduced.

See [publication report](../../docs/APPROVED_BUILDING_LIBRARY.md) for actual rendering checks, metrics, camera presets, source comparisons, remaining compatibility considerations and recovery checkpoint. The original benchmark models, live manifests, game and renderer are unchanged by this publication. These assets were already integrated by prior Game Coding milestones; no new integration is performed here. Files are immediately available to Game Coding in this shared checkout; repository push is a separate approval step.
