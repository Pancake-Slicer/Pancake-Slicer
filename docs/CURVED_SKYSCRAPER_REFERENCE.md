# Curved skyscraper fixed reference study — 2026-11-23

One unapproved internal reconstruction in architecture/curved-reference/. It has no game imports, catalogue registration, lot fitter or variant generator. Approved buildings, the Waterfall study, gameplay and immutable v52 are unchanged. The supplied PNG is displayed unmodified beside the model; it is not used as a facade texture and is not committed.

## Architecture

The main volume is a convex oval clipped along its right-hand chord, meeting a lower rectangular dark-glass section. The fixed study has72 storeys at3.25m above an8.1m stone podium; the side section has66 storeys. The roof is242.1m and the antenna reaches264.1m. These are inferred study dimensions, not surveyed measurements. Native radii29.7m/21.6m,384 curved segments and96 facade bays maintain a smooth silhouette and dense mullion grid. The fixed footprint correction is baked into authored vertices; model scale remains1.

Actual geometry forms the convex silver framing, pale left blade, side ledges, recessed podium openings/heavy piers, canopy, curved roof fascia,27 individually supported elevated screen posts, circular equipment court, three-legged braced antenna and roof plant. Repeating maps supply muted green/blue-grey glazing variation, stone grain and roof paving. Four pooled maps use1638400 raw bytes;11 opaque material batches contain63574 triangles. ArchitectureBatch, OptimizedFamilyRenderer and the existing catalogue physical-lighting finish are reused unchanged.

Visual iterations corrected the initially narrow body, oversized pale blade/side section, unclipped oval roof, weak framing, overpopulated podium openings and low-contrast roof paving. The final isometric view is orthographic at22.5-degree azimuth /35.264-degree elevation. Rooftop and ground buttons inspect the same model, with unchanged reference crops alongside it. Drag to orbit, scroll to zoom; each preset restores its camera.

## Reproduce and inspect

Existing optional local Three.js0.180.0 is required at .tools/node_modules/three (same engine as the game; no new dependency). For a first export, set PANCAKE_CURVED_REFERENCE to the supplied PNG. Subsequent exports reuse its ignored local cache. Geometry tests do not require the image.

- npm run architecture:curved:check — prepare geometry dependencies and run five targeted checks.
- npm run export:curved-reference — produce a self-contained, uniquely named HTML in dist/.
- npm run review:curved-reference — serve that exact HTML at http://127.0.0.1:4212/.

Final local preview: Pancake City - Curved Skyscraper Fixed Review - 20261123T154351Z.html. SHA-256: 7d5a46178283b49849596e06c1862ee5dc9846d5aef0db332055fea9386d4783. It embeds engine, materials, controls, notices and the source comparison; no external requests are required. Save comparison writes local review captures through the loopback server, or downloads an image when opened directly. Direct file launch was not exercised; exact exported bytes were verified over local HTTP.

## Validation and limits

Five targeted checks pass: fixed/native study contract, smoothly shaded clipped facade and lower adjoining volume, upward roof deck/screen/court/antenna geometry, ground contact/podium/landscaping, and finite geometry/UVs with bounded opaque resources. npm run build passes all existing166 checks. Original52 hash and runtime/approved-source diffs pass unchanged.

Browser inspection covered final isometric, roof and ground views, preset switching, comparison capture and bounded rendering measurement. Browser error logs were empty. Local captures are in .tools/curved-reference-final/. The isometric fixture generated in106.9ms, drew12 scene calls including the ground plane, and recorded0.1ms median /0.3ms p95 CPU submission over60 samples after20 warmups. This does not measure GPU completion, FPS or city-scale parity. Evidence: CURVED_SKYSCRAPER_REFERENCE_VALIDATION.json.

The single image does not reveal exact dimensions or concealed rear geometry. Equipment internals, reflections and fine weathering are approximated. The result is a review candidate, not a claim of exact reproduction or commercial approval. Stop for user visual approval before any original redesign, parameterization or growable integration.

Checkpoint: checkpoint/pre-curved-reference-66cf214. Local branch: codex/curved-skyscraper-reference. Unrelated user asset moves and exporter edits excluded. No push/off-computer backup; push requires approval of the completed local commit.

## Vision / spandrel banding revision0.1.1 — 2026-11-23

The user-requested banding now separates darker muted-green vision glass (base atlas #5c7768) from paler grey-green spandrels (#919d99). The adjoining section retains its blue-grey identity with corresponding vision/spandrel tones (#5c7083 / #828f99). Spandrels occupy roughly the lower third of each storey. Both tones stay within the existing repeating maps; framing remains continuous. Geometry, normals, UVs and indices are byte-identical to268063f;63574 triangles,11 batches,4 maps and texture memory are unchanged.

Six targeted checks pass, including floor-by-floor tonal separation and uninterrupted vertical framing. Isometric/ground comparisons inspected and captured in .tools/curved-reference-banding/; browser errors empty. Current export: Pancake City - Curved Skyscraper Fixed Review - 20261123T155240Z.html, SHA-256 36bf382a8c8b535a01660158aeb9e409ea56f5462e33acce85dd81b5baebf9ab; exact local HTTP bytes verified. Direct file launch remains unverified. No new performance/FPS claim. Evidence: CURVED_SKYSCRAPER_BANDING_VALIDATION.json. Checkpoint/pre-curved-banding-268063f preserves the prior appearance. No growable integration, variants or original redesign; visual approval remains pending.

The revision also passes the full166-check npm run build. Original52 and recovered runtime remain unchanged; no additional dependencies.
