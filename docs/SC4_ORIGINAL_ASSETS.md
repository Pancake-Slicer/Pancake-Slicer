# Original SimCity 4 asset import

Historical workflow: the active game now uses [new solid rebuilds and fresh materials](SC4_REBUILDS.md). Imported files remain local references and are no longer loaded or embedded in the playable game.

The original installation was found at `C:\Program Files (x86)\Steam\steamapps\common\SimCity 4 Deluxe`. The importer reads SimCity_1.dat through SimCity_5.dat, EP1.dat and SimCityLocale.DAT without modifying them. It does not read city saves or copy the user's mods.

## What is imported

All 98 entries from the requested https://simcity4buildings.net/c/13 category are matched to original building exemplars. Exact localized names, commercial type and architectural tileset distinguish candidates. Explicit aliases handle spelling errors/differences in the catalogue; fifteen Boutique entries are distinguished by their specific model name, stage and tileset. `reference/sc4-original-mapping.json` records the source exemplar/resource keys and declared dimensions for audit.

For each entry the importer reads the four highest-detail S3D view resources, follows their animation block references to vertex/index/primitive/material groups, and resolves the original FSH texture pages. It reverses each stored quarter-turn so the four views share a world orientation. The original triangle positions, UV correspondence and dimensions are retained, without replacing facade patterns or adding invented rooftop equipment. Daytime texture pixels are decoded to lossless PNG atlases, with two-pixel edge gutters. Texture pages are not resized or painted over.

During visual verification an upstream `sc4` 0.2.24 BC1/DXT1 alpha defect was found: the helper returns four components, then endpoint palettes append another alpha component, leaving endpoint alpha at zero. The importer uses its own BC1/BC2 decoder instead. Regression blocks verify both opaque endpoint colours, BC1 transparency mode, explicit BC2 alpha and truncated data. This prevents holes/speckles in otherwise opaque facades. The helper library remains confined to ignored local conversion tools; none of its implementation is shipped in the game runtime.

## Rendering and placement

`web/features/sc4-originals.js` supplies the actual game renderer. One original view is visible per building, selected by camera heading relative to building orientation. The other views keep geometry cached, with texture decoding deferred until a view becomes visible. Texture completion invalidates the game's frame cache. Original baked artwork uses an unlit material to avoid adding a second set of facade lighting. Original geometry is batched through the existing neighborhood renderer and retains its building picking IDs.

The source bounding dimensions determine whether a model fits the selected plot. Painting an explicit large design on a small plot does nothing; it never narrows or stretches the building. Mixed mode chooses among fitting source models. Additional 64 × 64 m and 76 × 76 m native office profiles allow the largest buildings. Existing road/terrain/collision rules remain in force. Building height comes from original geometry. Estimated storeys remain reference metadata for counters, not a source of geometric rescaling. The thin terrain foundation is supplied by Pancake City.

## Practical limits

These are original building resources, not new full-detail 3D source models. SC4's artwork was rendered for four fixed directions and particular elevations; it can distort or expose missing surfaces at other camera angles, and view changes can be visible. Pancake City's free camera is preserved. Exact original appearance at every possible angle is not achievable from these resources. Surrounding lot props/landscaping, SC4's night-lighting variants, construction stages and the original renderer's lighting/environment are not imported in this milestone. No claim of exact equivalence in every way is made.

## Reproduce the conversion

The local conversion tools are installed outside project dependencies:

```powershell
npm install --prefix .tools/sc4-import sc4@0.2.24 pngjs@7.0.0
npm run import:sc4
npm run build
npm run export:html
```

An alternative installation folder can be passed after `npm run import:sc4 --`. Conversion writes `web/assets/sc4-originals.local.js`; this local asset file and build exports are ignored by Git. Assembly creates an empty stub only when the asset file is absent, so it cannot erase an existing import. A clean checkout without an import retains the procedural fallback. The standalone export embeds the entire local import and requires neither a server nor an internet connection.

`node scripts/create-sc4-preview.cjs` creates an ignored development inspection page at `/sc4-preview.local.html` using the same original-building rendering function. Its building/view/tilt controls make visual comparisons possible without drawing a city first. It is a test tool, not an additional gameplay menu.

## Verification

Run `npm run check` and `npm run build`. With a local import present, the checks exercise all 98 × 4 original views, PNG signatures, source keys, finite positions and UVs, dimensional preservation, camera-dependent visibility, minimum plot sizes, actual neighborhood rendering/picking, undo/redo and mesh cache reuse. Without a local import, only asset-specific tests are marked skipped; decoder and existing gameplay regression checks still run. Browser visual checks and the final export are recorded in RECOVERY_NOTES.md.
