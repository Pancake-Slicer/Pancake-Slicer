# Recovery notes

Source file: `Pancake (52).html`
SHA-256: `c8eff97d4c0daefd2cf7b6d967a694ce8a999e4a3e1402d88fee4fea6077778c`

Extraction:
- Exactly one module script was extracted to `web/assets/game.bundle.js`.
- Exactly one style block was extracted to `web/assets/game.css`.
- Embedded third-party license notices remain in the extracted HTML.
- The original HTML is copied byte-for-byte.
- JavaScript and CSS are unchanged in their extracted form.

Validation performed:
- Byte-exact comparison of original vs recovered embedded JS and CSS.
- Node JavaScript syntax check of extracted bundle.
- HTML references checked.

Not validated:
- Full interactive browser gameplay (requires hands-on regression testing).
- Identity with the unavailable original Codex source repository.
- Recovery of local Git tags, commits, or checkpoints.

Suggested smoke tests: load the world, camera movement, freeform road placement, road editing, zoning, property tools, save/load and any other latest v52 features.

## Windows recovery setup — 2026-11-10

- Read all seven recovered project files, including the original HTML, extracted runtime, styles, HTML shell, and notices; the bundle remains minified.
- Original HTML SHA-256 matches the fingerprint above. Runtime JavaScript and CSS remain byte-identical to the embedded v52 blocks.
- Installed Node.js v26.13.0 (npm 11.20.0) and Git 2.56.0.windows.4 using Windows Package Manager.
- Added a Windows launcher, dependency lock file, build packaging, preservation checks, Git ignore rules, and development instructions. No gameplay assets were edited.
- `npm install` completed with zero reported vulnerabilities. `npm run build` passed syntax and preservation checks and created `dist/`.
- GitHub main at setup: `681fc2b7d3a22235bce52b07a3be0eb0a87571b4` (Add files via upload). It contains the seven recovery files. Existing remote history is retained.
- Visual browser testing was blocked by the browser tool's saved permission policy, including a retry after user approval. Interactive play remains unverified. Do not interpret the successful build as full gameplay regression coverage.
- See WINDOWS_GUIDE.md for launch instructions and the milestone commit/push approval workflow. No push is authorized by setup alone.

## Standalone HTML export — 2026-11-10

- Added `npm run export:html`, which runs preservation/syntax checks, rebuilds from the current web files, and embeds the built JavaScript and CSS into the built HTML shell. License notices remain embedded. No gameplay files were changed.
- Optional `-- --downloads` writes `Pancake City - Playtest.html` to the current Windows account's Downloads directory, refusing to overwrite an existing file. The dist copy remains available for repeatable builds.
- The generated Downloads file is 1,379,198 bytes and currently has the same SHA-256 as v52. All changes so far concern tooling and documentation, so rebuilding the current runtime reproduces the original standalone game exactly.
- Checked embedded JavaScript/CSS equality, lack of external HTML resources or CSS URLs, and the unchanged original fingerprint. Runtime inspection found bundled worker code using a data URL and no external asset loads; the only HTTP URLs in the JavaScript are XHTML namespace identifiers. The module-preload helper has nothing to fetch in this standalone shell.
- Browser launch and interactive play testing remain blocked: Chrome computer-use access was denied, including a retry after user approval. Static validation and file identity passed; do not report interactive gameplay as verified.

## Rendering fixes — 2026-11-10

- Camera movement previously reduced the composer render scale to 0.75 (0.5 on software renderers), then resized it back to 1 after movement stopped. It now stays at 1. Frame caching, traffic simulation, camera damping, shadows, MSAA, FXAA, and facade LOD remain intact. This removes the resolution transition but does not establish a measured FPS improvement; full resolution costs more GPU work during movement.
- The foundation, wall prism, and roof slab previously each had closed caps, including coplanar faces at their shared internal boundaries. They now share an exterior-only shell: foundation bottom, walls, and roof top/edges. Horizontal UV coordinates now use X/Z instead of X/constant-height, avoiding collapsed roof texture coordinates. These are targeted causes of roof artifacts; the zoom-dependent diagonal-line report still needs visual confirmation.
- Regular non-triangular footprints retain their cleaned boundary through both `dh` and `Ep`; erosion/dilation and acute-corner clipping remain available for triangles. Minimum width, minimum area, polygon simplification, and hole rejection remain in place. Landmark geometry is unchanged.
- Original v52 HTML and CSS remain byte-exact. `verify-recovery.cjs` now compares the current JS against the original plus the explicit recipe in `rendering-fixes.cjs`, rejecting unrelated changes rather than removing preservation validation.
- Regression tests run the recovered Three.js geometry and Clipper implementation in a Node VM, check camera resolution at multiple motion times on hardware/software paths, compare rectangular/acute quadrilateral and triangular plots, reject narrow/sliver plots, verify roof UV area and exterior cap geometry, and exercise the actual neighborhood renderer including facade details.
- Browser inspection of the user's open local playtest was rejected by the browser tool's file URL policy. No interactive visual verification or measured performance claim is made.
- The new standalone copy is `C:\Users\camsh\Downloads\Pancake City - Rendering Fixes Playtest.html`. The earlier Downloads playtest and original v52 HTML are preserved. Existing cities require a rebuild/reload to regenerate building geometry under the new rules.

## Corner and camera correction — 2026-11-10

- The user reported that the first rendering fixes still showed rounded buildings and made camera motion slow. The earlier unit tests started from sharp input polygons and missed curves inherited from the road-setback mask.
- Reproduced the missed issue through `zb.addBatch` → road mask/render-cache preparation → `Wb` → final building footprints: rectangular street corners contained multiple arc segments even with the earlier `dh`/`Ep` changes.
- Development now has its own cached mitered road-setback mask. Rendered road fillets and the road render cache are unchanged. Collision buffers around neighbouring buildings also use miter joins. Only holes identified as true three-sided enclosed plots receive rounded plot boundaries; subdivision inherits that classification. Square plots no longer inherit road curves.
- Downstream footprint cleanup validates area and width while preserving the chosen boundary. It no longer treats an individual triangular building subdivision as proof that its parent plot is triangular.
- Added a regression that checks every wall edge of a generated rectangular street block, with and without the road-render cache populated, and reproduces the curved edges in v52. Added a full triangular-plot fixture that confirms rounding remains available. These go beyond the initial hand-authored polygon tests.
- Kept steady render resolution but capped device pixel ratio at 1, MSAA at 2 samples, and shadow maps at 2048 on hardware/1024 on software. This avoids up to 4× high-DPI supersampling work and halves the earlier hardware MSAA sample count. Camera-driven shadow-view recalculation is capped at 10 Hz during motion; settling refreshes the view. Existing traffic, shadows, camera damping, facade LOD, and road systems remain active. These changes reduce work; FPS has not been measured in a browser.
- Original v52 HTML, CSS, license notices, and earlier exported playtests remain untouched. The new standalone file is `C:\Users\camsh\Downloads\Pancake City - Camera and Corners Playtest.html`. Open this new file to test; the older exports contain the earlier behavior.
- Browser verification remains unavailable under the previously observed file-URL and Chrome access restrictions. Automated geometry and scheduling checks cannot establish perceived frame rate or visual appearance on this computer.

## Office zoning — 2026-11-10

- Added an Office tab beside Brick rowhouses, including keyboard navigation, selected-tab state, blue zoning overlays, and office counts. Existing paint-area and bucket-fill controls remain available.
- Office zoning uses the original property layout. Contiguous painted properties on the same street side may combine into an office site, bounded to 65 m and 2,000 m², with slope and adjacency checks. Individual narrow properties remain available for smaller offices. Existing residential plot geometry is unchanged.
- Added deterministic Art Deco, International, and modernist designs: masonry setbacks and vertical ribs; glass-and-metal curtain-wall grids; and concrete ribbon-window façades. Site area controls the height capacity, with the complete 10–80-storey range available on larger sites. Storeys are 3.9 m tall; tiers account for exactly the advertised floor count. Footprint setbacks stay inside the office site, preserving prior square/triangular plot rules.
- Procedural textures and material caches avoid per-window mesh objects or remote assets. Roofs, lobby entrances, equipment, and Art Deco ribs use the existing batched geometry/instancing path and picking IDs. In the regression scene 134 residential properties become 22 office buildings across all three styles; façade windows remain texture detail rather than tens of thousands of individual meshes.
- Integrated rezoning, undo/redo, building demolition, repainting, and forest clearance with existing zoning history. Demolishing a combined office suppresses its constituent properties until repainted or restored. Older zoning snapshots without an offices key normalize safely.
- Office source lives in `web/features/offices.js` and `offices.css`. `assemble-runtime.cjs` applies the reviewed rendering recipe and Office integration to v52 and embeds all feature code/CSS into the generated assets. Build/export assemble first. Preservation checks verify the original SHA-256 and exact expected JS/CSS composition, rather than disabling protection.
- Added tests for the full height/style range, real zoning-menu mouse/keyboard selection, actual road-to-property-to-Office generation, mixed residential/Office zoning, undo/redo, demolition/repaint, older snapshots, footprint containment, floor totals, material reuse, geometry batching, and renderer cache/picking IDs. Prior camera, roof, and corner regression tests remain active.
- Original HTML and `approved-v52` remain unchanged. The standalone output is `C:\Users\camsh\Downloads\Pancake City - Office Playtest.html`; earlier playtests are preserved. Browser appearance and frame rate remain unverified because the previously observed Chrome/file-URL tool restrictions prevent a visual playtest.
- Validation: build and all 19 automated tests passed. The Downloads HTML matches the generated standalone output; the original fingerprint and approved tag target were rechecked. Residential properties/buildings compare exactly with the approved rendering recipe in a full street-block fixture.

## Dedicated office parcel sizes — 2026-11-11

- The first Office implementation merged rowhouse plots sideways but retained their 10–18 m depth, creating long, thin towers. Replaced that strategy with a dedicated Office property generator. Office frontage/depth are now 32 × 30, 40 × 36, 44 × 44, 54 × 58, 42 × 44, and 56 × 54 metres, with base footprints from 960 to 3,132 m².
- Dimensions are design interpretations informed by primary architectural/official leasing sources for Inland Steel, PIMCO headquarters, 28 Liberty, 30 Rockefeller Plaza, and Willis Tower. The source table, metric conversions, distinctions between floor area and footprint, and profile mapping are in OFFICE_FOOTPRINT_REFERENCES.md. No exact real-building reconstruction is claimed.
- Switching the zoning tab now switches the displayed property layout. Brush and bucket operations both select whole native office parcels. Plots must fit fully inside the tile, clear road setbacks and landmarks, avoid other office parcels, and pass terrain checks. Constrained streets fall back to a smaller complete office profile or remain empty; they never shrink an office into a residential-depth strip.
- Residential property generation is unchanged. Existing residential/Office zones can coexist; rezoning removes complete conflicting sites to prevent overlapping buildings. Tab changes retain placed buildings; demolition/repaint and undo/redo continue using the existing history system.
- Office layout caches track road revision, terrain identity/function/revision, tile bounds, and landmark positions. Generation is cached rather than repeated for camera movement. Rendering still uses the earlier batched geometry/material path.
- Regression tests now measure native plot frontage, depth, area, and aspect ratio; exercise deep single-parcel bucket fill; check rotated streets, road/tile/landmark clearance, plot overlap, cache reuse, mixed-zone conflicts, tab persistence, and unchanged residential geometry. All 22 automated checks passed during implementation; the final build/export is revalidated before committing.
- Updated standalone file: `C:\Users\camsh\Downloads\Pancake City - Larger Office Plots Playtest.html`. Earlier exports and original v52 are preserved. Chrome visual appearance and frame rate remain unverified under the previously observed browser-tool restrictions.
