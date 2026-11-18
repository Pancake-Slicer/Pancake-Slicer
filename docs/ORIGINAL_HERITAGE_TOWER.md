# Alderwick Commercial Tower — original fixed architectural review

A new, independently authored late-1920s commercial tower. The approved Reamon reconstruction is preserved as a modelling-quality benchmark; its model, review sources and exports are not overwritten. This is one fixed model, without fitting, variation generation, catalogue registration or gameplay integration. Architectural approval remains pending.

## Composition

The 42 × 30 m commercial body has 26 storeys. Four 4 m storeys form a substantial chamfered limestone base with recessed storefront glazing, fluted pilasters, buff terracotta capitals and a continuous projecting entablature. A double-height rectangular bronze-and-stone portal addresses the southeast corner. The 15-storey shaft uses 3.6 m floor heights, a broad central field of Chicago-style tripartite windows, and narrower paired-window side pavilions projecting 0.6 m. Real deep masonry piers, stone sills, ornamental terracotta spandrels and an eleventh-floor stringcourse organize the disciplined bay grid.

Storeys 20–22, 23–25 and 26 step inward to 34.8 × 25.2, 27.6 × 19.2 and 21 × 14.4 m. The uppermost floor is recessed; brick remains the main upper material, with limestone bands, substantial cornices and capped parapet posts. A small brick lift/ventilation penthouse, capped boiler flues, gravity ventilators and access hatch terminate the roof. The 95.2 m occupied body reaches about 99.6 m with roof services.

| Element | Reamon benchmark | New original composition |
| --- | --- | --- |
| Floorplate / shaft | Deep H-shaped courts and paired wings | Almost solid rectangular plate, broad central field and shallow facade projections |
| Main frontage | Four bays on each projecting wing | Twelve bays: broad eight-bay field with two-bay side pavilions |
| Entrance | Central arch and glazed court canopy | Chamfered corner, rectangular double-height commercial portal |
| Crown | Paired pale-stone upper wings | Three sequential predominantly brick setbacks |
| Roof | Barrel skylight and separated equipment court | Brick mechanical penthouse, flues, gravity ventilators and terraced roof termination |

## Reuse and provenance

- Existing architectural meshes reused: none.
- Existing bitmap/texture assets or extracted SimCity4 pixels reused: none.
- Original building geometry and eight repeating maps authored in architecture/heritage-tower/fixed-model.js. Materials distinguish red/burnt-umber brick, pale limestone, buff terracotta, storefront/base/shaft/pavilion glazing, bronze and roof surfaces. Window maps are registered to actual floor heights; fine masonry grain has no diagonal directional repetition.
- Generic infrastructure reused: Three r180 unit primitives; ArchitectureBatch and OptimizedFamilyRenderer; current catalogue shader/material finish; review camera, lighting and capture/export conventions. These are shared modelling/rendering utilities, not reused building assemblies.

## Review and validation

Open the timestamped Alderwick Original Heritage Tower Review HTML in dist/. Isometric uses the approved reference review's 22.5° azimuth, 35.264° elevation, orthographic 58 m half-height, exposure 0.9 and identical sky/sun/shadow settings. Front and side buttons show true orthographic elevations. Save all three review images captures the actual model. The review has no dimensional/variation controls.

Commands: `npm run review:heritage:export`, `npm run review:heritage` (localhost4204), and `npm run review:heritage:check`. Existing optional .tools/node_modules/three@0.180.0 is reused; no dependency installation/change. The standalone HTML embeds modules/notices and has no external image or network dependency for viewing.

Four targeted tests pass for the 4/15/7-storey hierarchy, coherent setbacks, broad non-H floorplate/corner entrance, source independence, finite geometry, opaque material/map sharing and budget. All 141 existing game checks and npm run build pass. Original52 hash and all approved Reamon model/review source hashes are unchanged; production game/fitting diffs are empty. All three actual rendered images inspected, browser error logs empty. The exported bytes were exercised over loopback; direct offline file launch remains user-side.

Fixed model: 14,780 triangles, 11 shared architecture material batches, 8 maps totaling 737,280 raw bytes. Whole isolated scene: 15 calls / 14,818 triangles on Intel Iris Xe. This measures one review model, not FPS/city-scale/growable performance. [Raw evidence, source/capture/export hashes and preservation manifest](ORIGINAL_HERITAGE_TOWER_VALIDATION.json).

Recovery: safety/pre-original-heritage-13d647a and verified .tools/checkpoints/original-heritage-13d647a/history.bundle, with unrelated-work copies and Reamon hash manifest. User asset moves/export-script edits remain excluded. Local codex/original-heritage-tower milestone; push pending approval, not an off-computer backup. Stop at fixed-model review before any parameterization or further integration.
