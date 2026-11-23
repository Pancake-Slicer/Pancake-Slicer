# Waterfall benchmark — previous iteration with two corrections

At the user's request, restored6135a43's straight angled roofs, facade detail and materials. The intervening curved/detail study is recoverable at1bbb929 and checkpoint/waterfall-details-before-rollback; no source work was discarded. The larger supplied precedent remains the comparison image. One fixed internal benchmark only, with no natural spawning or variations.

Two changes from the restored model:

- The outer shoulder walls now step inward at the same depth landings as the roof tiers. Outer half-widths from highest/rearmost to lowest/frontmost are20.8,21.45,22.1,22.75 and23.4m. Each rising tier moves inward0.65m per side, one-third of the existing1.95m target side bay. The corresponding exterior wall volumes and ground perimeter use actual geometry, not decorative ledges. The maximum footprint/envelope and fitting rules are retained.
- Each angled central panel starts1.6m below the flat roofs immediately to its left and right. Upper elevations are139.2,129.6 and120m, against neighbouring flat roofs140.8,131.2 and121.6m. Their8m downward slopes, widths and depth landings are retained. The original upper bridge/plant height, storey heights and remaining facade proportions are unchanged.

The actual stepped ground perimeter now has28 vertices and1443.936m2 area. Existing native polygon fitting, facade-to-grade foundations, Office concrete, shared batching/history/picking and cleanup remain in use. Approved families, roads, terrain and zoning are unchanged. Prior0.1/0.2/0.3 experimental records are kept as archival saved data with ordinary fallbacks, rather than silently restyled.

Validation:164 checks and npm run build pass. Five study tests cover connected massing, geometry/resource limits, native fitting, zero natural spawning, picking/history/cold restore, flat/sloped supports, exact stepped outer edges and the strict angled-below-flat roof relationship. Actual game inspection covers matching isometric, roof, plan and entrance views plus demolition/Undo/Redo; no browser errors.18514 source triangles,6 shared opaque material batches and3 maps. Intel Iris Xe fixture only; no FPS/GPU-time/city-scale claim.

Review: npm run export:waterfall creates uniquely named Waterfall Stepped Edges and Lower Roofs Test City/Playtest/Chrome launcher files. The launcher opens the one-building Test City directly. npm run review:waterfall serves these exact bytes at127.0.0.1:4209. Reference camera remains22.5-degree azimuth,35.26-degree elevation,18-degree FOV. Final renders are in .tools/waterfall-steps-final/. Exact exported bytes were verified over localhost; direct file launch remains unverified. Evidence: WATERFALL_STEPPED_EDGES_VALIDATION.json.

Original52 hash and approved architecture sources unchanged. Unrelated user asset moves/exporter edits excluded. Branch codex/waterfall-stepped-edges; local milestone only, not pushed/no off-computer backup. Stop for architectural review before any original variants or normal growable integration.
