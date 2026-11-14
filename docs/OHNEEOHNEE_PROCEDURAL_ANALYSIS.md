# Ohneeohnee architectural extraction and Phase 1 validation

## Approved source audit

The approved building is **procedural JavaScript geometry exported to a static GLB**, not a manually imported third-party mesh. Source: `benchmark/ohneeohnee/model.js`, using `benchmark/shared/batched-architecture.js`; approved portable file: `Assets/buildings/ohneeohnee-modernist/ohneeohnee.glb`. Those files, textures, manifests, approval companions and all other approved assets remain unchanged.

| Element | Source implementation / measured value |
| --- | --- |
| Nominal mass | 36 × 18 m rectangle; wall top 49.8 m; rooftop plant reaches about 53.2 m |
| Full decorated GLB envelope | 36.389999 × 18.679999 × 53.200001 m measured Float32; published conservative envelope 36.39 × 18.68 × 53.201 m |
| Storeys | Nominal 14; 11 visible curtain rows, plus lobby and upper service/fascia area. This is not fourteen identical 3.6 m rows. |
| Upper floor module | 3.6 m; curtain starts at 4.8 m and ends at 44.4 m |
| Curtain bays | 2.0 m; 18 broad-face and 9 side-face bays |
| Vision glazing | 1.92 × 2.12 m, recessed 0.10 m; bottoms at floor base +1.29 m |
| Spandrels/divisions | 1.22 m opaque backing band; approximately 0.06–0.065 m horizontal floor rails |
| Vertical mullions | 0.055 m face width, 0.12 m depth; about +0.035 m outward plane |
| Lower vision rail | 0.028 m high × 0.05 m deep in most glazed rows |
| Corners | 0.25 m frame/panel casing; complete face-to-face closure around four elevations |
| Lobby | 0.54 m lower panels, glazing about 0.56–3.13 m, taller fascia; small two-bay entrance centred at x=-4 m on +Z frontage |
| Roof | Flat slab with 0.7 m parapets/coping; supported, grouped low housings, louvred access block and connected ducts |
| Materials | Opaque scene-lit PBR, three shared embedded maps: glazing atlas (512²), stone/panel (256 × 128), roof grain (128²) |
| Glazing imagery | Twelve source panes rectified into 4 × 3 atlas; blinds, silhouettes and reflections are baked source imagery, not real interiors |
| Geometry organization | Indexed boxes/quads merged into 10 material batches; 14,952 source-model triangles; no per-window scene objects |

These are exact code parameters or direct mesh measurements. They are **not surveyed real-world measurements**. Overall proportions, nominal storey interpretation, source glazing details and unseen rear were inferred by the approved Architecture study from limited reference imagery. This generator deliberately converts the principles into complete, regular storeys rather than stretching the approved fourteen-storey model or reproducing its unusual upper service band on every variation.

## Reused principles and separation

Shared elements: consistent metric bays, repeating vision/spandrel division, aligned thin mullions, recessed glazing/backpans, resolved corner casings, taller lobby, matte metal/panel palette, supported roof plant and merged geometry. The new geometry builder does not read or transform the source building's vertices. The source payload supplies unchanged maps/material bases and the read-only comparison model only.

The family has controlled presets with broad/slender/low-podium/high-podium/setback compositions and four roof systems. Every composition goes through the same builder and validation. New spec fields or family modules can be added without changing the game's renderer or existing approved models.

## Verification performed

- Eight generator checks pass: deterministic initial/revised seeds and JSON round-trip; invalid-rule rejection; finite position/normal/UV arrays, unit normals, index validity and no degenerate triangles; native measured bounds; façade/floor alignment; supported tiers and roof-plant containment; shared geometry/materials and cache release; unchanged protected sources.
- Existing `npm run build` and **all 74 game regressions pass**. Phase checkpoint SHA-256 inventory verifies the entire current web/benchmark/Assets/original tree stayed byte-for-byte unchanged, including pre-existing reference-image moves; permanent approved-file guards are included with the lab.
- Actual browser renders show all ten + original in one perspective scene. Reviewed a compact curtain wall, broad podium lobby and columns, screened plant, mechanical-penthouse composition, upper-setback tower, paired-bay front/rear and approved reference. Corrected a lobby base strip across the entrance and tightened roof-screen support spacing during iteration. Frames/corners/plant are visible; no roof cap diagonal artefacts were seen in reviewed views. This is a Phase 1 review, not a declaration that every future seed is architecturally approved.
- Used visible controls to regenerate one building; revision advanced and a neighbour's full specification stayed identical. Changed seed, regenerated the set, restored 1138 and confirmed the same original specification. Tested new-seed generation, selection, independent inspection, front/rear/roof/lobby views, reset, full-lineup return, orbit/zoom and actual JSON download. Browser error logs were empty.
- Saved initial benchmark screenshot, setback/facade close studies and `Ohneeohnee-family-1138.json` in Downloads. Specifications include measured bounds, performance estimates and `experimental-not-approved` status. No live catalogue entry or package approval was created.

The lab uses an existing local Three.js r180 tool installation and local assets; no new game dependencies or external asset pipeline. It is served locally rather than packaged as a single offline HTML. Source texture limitations, repeating panes and restrained material variation remain visible. Generated podiums/roofs are coherent modular alternatives, not exact reconstructions of individually documented real buildings. Next iteration should receive architectural feedback before increasing variety or integrating any output into city growth.
