# Solid office and commercial rebuilds

The user rejected the imported view meshes and baked lighting, and requested newly authored geometry and textures informed by SC4. This milestone supersedes the original-artwork renderer. All 98 catalogue entries remain independently selectable.

## Geometry and reference work

`reference/sc4-rebuilt-designs.json` holds authored polygon plans, volume heights, facade grammar and palette statistics. Source dimensions and cross-section surveys informed the massing; explicit plan templates and manual corrections create new volumes. No source triangle buffers, source UV buffers or raster pictures are retained in these recipes. The geometry is newly built at runtime with outward-facing walls, terrace caps that subtract upper volumes, and complete roofs.

Plans include oval and bow fronts, courtyard/notched/H-shaped wings, setbacks, octagonal shafts and compound cores. Simon and Frank has a subtly widening oval shaft and a sloped roof with plant and rim. Hurt combines a curved front volume with its taller rear core. Pedriana has a reference-guided setback sequence, stepped crown and mast. Barrel and gable roofs use true ridges/curved shells; domes, mansards, pinnacles, rooftop equipment, cornices and pilasters are newly generated geometry. A browser comparison caught an off-centre barrel roof; its placement was corrected and a base-corner coverage regression added.

The authoring tool `node scripts/author-sc4-rebuilds.cjs` can refresh the reference survey from the retained local import and catalogue. It requires the optional local conversion tools, but **normal assembly, building, exporting and playing do not**. The checked-in recipes are sufficient to reproduce the current game.

## Materials and lighting

Colour, bump and roughness maps are freshly drawn on local canvases, with regular window grids, frames, masonry courses, fluting, subtle grain and restrained blind variation. Reference colour statistics guide the palette; shadowed glass values are lifted to a neutral daylight albedo range. No imported picture is painted onto a wall, and no fixed sun-facing gradient or SC4 shadow is baked into the new textures.

Materials are opaque MeshStandardMaterials and respond to the game's existing hemisphere light, sun and shadows. A consistent diffuse-response calibration (1.7 direct, 2.3 indirect) makes these PBR materials readable under the recovered game's lighting without modifying other objects' lighting or adding emissive facades. Roof textures use non-collapsed planar coordinates. Materials, textures and batched meshes are cached. Camera motion does not swap direction-dependent building images or regenerate meshes.

## Integration and limits

Native sites extend up to 76 × 76 m. Selected designs require a fitting site, and are never squeezed sideways into a small plot. Rebuild height and proportions follow the reference recipes. Floor counts are design estimates derived from the rebuilt body height, not claimed SC4 facts. The existing zoning, road/terrain constraints, forest clearance, picking, demolition, history, residential generation and landmark protections remain active.

These are SC4-inspired reconstructions, not exact replicas. Fine ornament, signage, surrounding lot props and some complex architectural details remain approximations. The improvement is genuine geometry and consistent lighting across arbitrary camera angles, rather than imported view-specific pictures. No full-city FPS measurement is claimed.

## Validation and comparison

`npm run check` tests all 98 recipes and renders their actual geometry. New checks cover opaque light-responsive canvas materials, finite vertices/normals, non-collapsed textured UVs, outward wall coverage from eight headings, roof presence, barrel/gable base alignment, terrace areas excluding upper volumes, camera-invariant mesh identity, picking and native placement/demolition/undo/redo without imported assets. The prior camera, plot, roof, residential and landmark regression suites remain active. Legacy import tests now retain converter/decoder coverage; obsolete view-renderer expectations were replaced by rebuild regressions.

`node scripts/create-sc4-preview.cjs` generates the ignored development comparison page. It uses the actual neighborhood renderer and the game's light intensities, with camera/tilt/sun controls and local reference thumbnails shown beside the new building. The pictures are inspection references only, excluded from the game and export. Final browser checks and the new Downloads artifact are recorded in RECOVERY_NOTES.md.

The 153 MB local import file and earlier playtests remain untouched. The active HTML shell/build/export no longer loads or embeds that file. The standalone game generates its own textures and needs no server or internet connection. Original v52 and the approved-v52 tag remain protected.
