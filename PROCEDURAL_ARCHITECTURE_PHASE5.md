# Phase 5 — International Style facade subfamilies

Architectural review only. The live game, growable catalogue, approved custom assets and massing modules are unchanged. Default ten-building styles have not been changed.

## Open and review

Open **http://127.0.0.1:4187/facades.html**. The existing Architecture Lab server remains running. To restart it, run `npm run architecture:modernist` in this project folder and leave the window open. This is a server-based review page; previous family/review, 07A/07B and performance pages remain available through links.

1. Start with the nine-building matrix, seed1138.
2. Select a cell and click **Compare selected row** for identical lighting and synchronized cameras across three styles.
3. **Inspect selected** provides a full-building view. **Facade**, **Street lobby**, **Roof** and **Reset camera** provide closer inspection.
4. Change **Selected facade style** to rebuild only that facade, preserving seed, dimensions, storeys, podium and roof. **Rebuild selected facade** repeats that deterministic specification; it does not randomize massing.
5. **Generate nine** restores canonical vertical/horizontal/grid columns for the chosen seed. Expand **Specification and facade profiles** for parameters. **Measure selected row styles** and **Export facade report** provide browser measurements.

## Generator contract

`architecture/assemblies/facade-styles.mjs` exports version5.0.0, three immutable profiles, validation, `withFacadeStyle`, `massingSpecification` and the comparison matrix. The existing enhanced builder consumes these profiles; there are no duplicate building generators or individually hardcoded geometries.

`facadeStyle` accepts `vertical`, `horizontal` or `grid`. Missing style means the approved grid. Legacy and explicit grid share the same enhanced geometry cache. The original massing cache strips only facadeStyle, allowing three styles to reuse one baseline massing resource. Inputs are cloned. Explicit styles carry facade-version metadata; prior family versions/review keys remain unchanged for legacy specifications.

| System | Treatment |
|---|---|
| Vertical | Continuous130mm upper fins,380mm framing depth, glazing recessed200mm, restrained floor rails; inward corner returns close the deeper glazing joint. |
| Horizontal | Continuous deeper spandrels and80mm floor rails, restrained35mm vertical profiles, no middle vision rail; existing bay widths and glazing UVs retained. |
| Grid | Exact approved geometry/material settings, regular framing, original spandrels and intermediate rails. |

All styles share the approved material library, three source maps and one opaque-lobby reflection map. Identity comes from geometry and rhythm, not recolouring or stretched textures. Lobby frames, entrances, columns, canopies, opaque reflective glass and retained roof assemblies are reused. Original corner posts preserve the envelope. New upper profiles terminate below roof flashing to avoid duplicate coplanar caps. No new reflection passes or individual window meshes.

## Compatibility and preservation

- Existing specification validation remains: whole bays, valid tiers, podiums, roofs and floor heights.
- Facade validation requires the established1.8–2.2m bay system, plausible vision-panel proportions, approved minimum lobby height and profiles within the existing curtain envelope. Unknown styles and incompatible combinations throw before replacement.
- Storey-based spandrels and continuous tier profiles retain alignment. Existing podium/setback transitions are reused; styles never add a podium.
- Caches, material sharing, merging, instancing and release paths remain. The Phase4 optimizer is byte-identical.
- Frozen complete geometry/index/normal/UV/material-setting signatures were captured from3d8c402 for all ten original seed1138 specifications. Both legacy and explicit grid still match exactly.
- Phase4 source-hash guards deliberately exempt only enhanced.js and family.js, extended here. Other protected modules remain byte-guarded; the independent ten-building fixture protects approved grid output.
- Original52 SHA-256: `c8eff97d4c0daefd2cf7b6d967a694ce8a999e4a3e1402d88fee4fea6077778c`.

Safety branch `safety/pre-facade-phase5-3d8c402` and verified complete local history bundle `.tools/facade-phase5/history.bundle` preserve the prior committed state. Existing unrelated Art Deco reference moves are excluded. A local checkpoint is not an off-computer backup.

## Comparison matrix

| Row | Original massing | Storeys | Columns |
|---|---|---:|---|
| A | Broad commercial slab, index1 | 12 | A1 vertical / A2 horizontal / A3 grid |
| B | Slender high-rise, index7 | 40 | B1 vertical / B2 horizontal / B3 grid |
| C | Building07 broad podium tower, index6 | 35, including4 podium | C1 vertical / C2 horizontal / C3 grid |

Each row uses identical massing and seed. Matrix rows are220m apart, columns120m apart. Matched row mode renders each building at its own local origin under identical camera/daylight, using separate cached2048 shadow maps for genuine fin shadows. Row maps are disposed on exit/change; hidden matrix shadow resources are released on entering row mode. This comparison overhead is lab-only.

## Performance measurements

Actual lab: Intel Iris Xe / ANGLE Direct3D11, Three.js r180, seed1138, each matched viewport190×556 CSS pixels, pixel ratio1.25. Sequential styles,60 frames after8 warmups, cached shadows, renderer.render plus gl.finish. These isolated timings are noisy, order/driver sensitive and are not city FPS or proof that vertical is faster.

Triangles include12 ground triangles; materials exclude ground. All styles use4 shared maps and the same camera within each row.

| Row/style | Calls | Triangles | Building materials | Median / p95 ms |
|---|---:|---:|---:|---:|
| A vertical | 21 | 16,322 | 20 | 0.70 / 1.60 |
| A horizontal | 21 | 15,698 | 20 | 0.50 / 0.90 |
| A grid | 21 | 13,202 | 20 | 0.60 / 1.30 |
| B vertical | 21 | 21,326 | 20 | 0.40 / 0.60 |
| B horizontal | 21 | 21,230 | 20 | 0.40 / 0.80 |
| B grid | 21 | 19,214 | 20 | 0.70 / 2.50 |
| C vertical | 22 | 30,244 | 21 | 0.40 / 0.70 |
| C horizontal | 22 | 28,420 | 21 | 0.50 / 0.80 |
| C grid | 22 | 26,524 | 21 | 0.60 / 1.20 |

Relative to grid, vertical adds10–24% model triangles; horizontal adds7–19%, with no additional per-style calls/materials. Full matrix:183 source meshes ->48 optimized objects,192072 building triangles,24 unique materials,4 maps;49 scene calls/192084 triangles. Phase4 repeated-geometry instancing/stress checks still pass. No new dense-gameplay performance certification.

## Validation and evidence

- `npm run architecture:modernist:check`:44/44 pass. All30 style/archetype envelopes, exact legacy-grid signatures, unchanged window UVs/lobby/retained roofs, cache behaviour, finite geometry/normals/indices/nondegenerate triangles, four-sided lobby-head rays, instancing and disposal covered.
- `npm run build`:success, including74/74 game checks, recovery hash/license verification. Protected main-game/model/map hashes match the pre-phase snapshot, excluding only the two intentionally extended assembly modules.
- Browser inspected full matrix, synchronized rows, three full-size facade close-ups, opaque podium lobbies and vertical/horizontal roof transitions. Tested style switching, deterministic rebuild, alternate seed1139 and restore1138. No browser warnings/errors, open lobby head, broken corner or diagonal roof artifact observed in inspected views.

Screenshots in `C:\Users\camsh\Downloads\Pancake City - Facade Subfamilies Phase 5`:

- Nine-building matrix.png
- Vertical facade close-up.png
- Horizontal facade close-up.png
- Grid facade close-up.png
- Podium lobbies - matched row.png
- Podium tower - matched full row.png
- Vertical podium roof.png / Horizontal podium roof.png

Raw report: `C:\Users\camsh\Downloads\Pancake City - Phase 5 Facade Report.json`. Committed measurements, screenshot hashes and preservation results: `docs/FACADE_PHASE5_VALIDATION.json`.

## Limits and next approval

The distant matrix shows matching massing; inspect close-ups for framing differences. Original palette, repetitive baked reflections/interior artwork and upper-office glass settings remain; only lobbies are guaranteed opaque. No new texture artwork, additional styles, LOD, dynamic reflections or gameplay integration. The lab is server-based with no separate offline export; existing game packaging builds successfully and remains unchanged.

Await visual approval of vertical/horizontal rhythm, corners, lobby junctions and podium transitions before applying styles across the full family. A later approved milestone can add style assignment and city-scale density/LOD tests. No growable publication yet.
