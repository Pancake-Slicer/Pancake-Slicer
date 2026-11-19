# Original Art Deco experimental growables — 2026-11-19

Three original compositions use Lind as a construction/material quality benchmark. Lind's complete design, approved maps and source remain unchanged; no Reamon or other SimCity4 building mesh, image crop or distinctive composition is reproduced.

| Key | Original design | Native grammar |
| --- | --- | --- |
| template:original-deco-a@1.0.0 | Aster Tower | Slender ribbed shaft, three stepped crown levels, limestone crown pylons, tall fluted entrance with bronze transom.24–36 storeys,24–31.2m wide,20.4–27.6m deep. |
| template:original-deco-b@1.0.0 | Calder Exchange | Broad four-storey base, symmetrical lower wings/attics, central setback tower and flat penthouse. Paired commercial entrances/marquee.22–34 storeys,42–63.6m wide,27.6–42m deep. |
| template:original-deco-c@1.0.0 | Marlowe House | Mid-rise masonry block, substantial rusticated three-storey base, ornamental attic, flat decorated parapet and subordinate roof services. Off-centre fluted portal.10–16 storeys,27.6–56.4m wide,20.4–38.4m deep. |

## Construction and preservation

- New architecture lives under architecture/original-deco/. Reusable components cover recessed facade planes, continuous fluted piers, mitered cornice rings, solid corner returns, entrance orders and crown pylons. Unmodified Lind exposedRoof() handles terrace subtraction; unmodified createLindMaterials() supplies the established limestone/trim/bronze/glazing finishes. No Lind massing/crown assembly or approved texture pixels are copied into these buildings.
- Three independent code-drawn maps provide direction-neutral limestone grain, bronze-framed window/spandrel detail and terrace joints. Fixed3.6m bays/floors and2.04m window widths repeat at physical size; dimensions quantize to complete bays, with bounded archetype-specific storeys. Setbacks reflow rather than stretch geometry. Canonical examples and minimum/maximum sizes are tested.
- Six opaque shared materials, three shared maps,262144 raw texture bytes. Repeated details bake into indexed material buckets. Geometry caches omit name/seed/id, equal shapes share buffers, and the existing chunk renderer/cleanup owns per-building foundation leases. Settled frames do not regenerate geometry. No engine or dependency added.
- The existing BMO template fitter, street orientation, office zoning/capacity, picker, history/cold-restore and rendering adapters remain authoritative. The2.4m decorated envelope includes cornices, portals and marquees. Existing limestone foundations and office concrete follow terrain; C's off-centre entrance samples grade and places steps at its actual doorway.
- Source/dependency/preservation hashes are pinned in architecture/lightweight/deco-source-lock.json. Approved Lind, BMO, Von, Brick, Alderwick and shared source/assets were verified unchanged, including the user's relocated Lind references. Original52 hash remains mandatory. Retired bespoke GLBs remain excluded.

## Play and review

Run npm run export:original-deco for uniquely named Original Art Deco Experiments Playtest/Test City HTML and Chrome launcher in dist/. Normal Playtest starts empty; zone Office lots using Mix all98. Experimental Deco is enabled in this export only. Development → Lightweight offices includes enable/favour and A/B/C selection; existing assignments remain unchanged. Ordinary web builds retain their previous defaults, with this family opt-in.

Test City opens a mixed neighbourhood with all three new towers and the prior families. A/B/C buttons isolate the designs on native eligible lots; smaller-site, entrance, roof and flat/sloped controls support direct game review. Demolition/Undo/Redo/regrowth checks use the real game. Review-only scene/capture tools are excluded from normal Playtest. Run npm run review:original-deco at http://127.0.0.1:4208/; /playtest serves the ordinary build. Exact standalone bytes/hash were checked over loopback; direct file launch remains user-side.

## Validation and limits

- npm run build passes147 existing checks plus5 targeted experimental-family tests. Coverage includes preservation/lazy defaults, six native minimum/maximum shape cases, opaque map sharing, decorated containment, rotated lot orientation, unsuitable-site rejection, natural coexistence, picking, stable frames, demolition/Undo/Redo, deterministic regeneration, cold restore, terrain/concrete and cleanup.
- Actual mixed city:5 A,3 B,3 C,7 BMO,1 Lind,8 Von,7 Brick,5 Alderwick,29 catalogue offices. Eight older offices preserved; static resource cache empty. Actual A/B/C history actions pass; C's smaller31.2×38.4m fit and sloped off-centre entrance were inspected. Rendered isometric images and roof/entrance captures are under .tools/original-deco/reports/; three-original-towers.png combines actual game views.
- Source models remain below11000 triangles in all tested extreme cases, with six material buckets each. Ten-building native-lot CPU comparison and exact source budgets are recorded in ORIGINAL_DECO_VALIDATION.json. Modules/materials were initialized before timing; shape/layout/foundation/batch work was included. Fitted heights/massing differ; these are single CPU observations, not FPS/GPU-time or large-city parity claims.
- Browser GPU: Intel Iris Xe / ANGLE D3D11,1280×720. No NVIDIA-specific result or universal performance claim. The buildings remain experimental for visual review. User asset moves and unrelated exporter work are excluded from the commit.

Checkpoint: safety/pre-original-deco-0f658cd plus verified .tools/checkpoints/original-deco-0f658cd/history.bundle and unrelated-work copies. Branch codex/original-art-deco-family includes the preceding local surface-shading fix. Local commit only; push awaits specific approval and is not an off-computer backup.
