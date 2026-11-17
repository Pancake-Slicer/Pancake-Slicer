# Von Badel direct integration — 2026-11-16

Lightweight native parametric Von Badel grows beside lightweight BMO/Lind and the existing Office catalogue. The new family follows the approved v2.1.0 reference: charcoal straight shaft, continuous projecting piers, blue-grey opaque bays, symmetric broad podium wings and flat mechanical roof. Historical Art Deco naming does not restore its superseded crown. Benchmark sources, approved GLBs and existing generators are unchanged.

## Play

Run npm run export:von-growables for uniquely named offline Playtest, populated Test City and Chrome launcher files in dist/. BMO, Lind and Von Badel start enabled in these exports; normal source builds retain the existing opt-in defaults. Choose Zoning → Office → Mix all 98, then zone new lots. Development → Lightweight offices has Von ON/OFF and Favour. Controls affect future growth; existing assignments survive. The test city is the actual game with disposable diagnostic buttons, not an Architecture Lab or variation preview.

Run npm run review:von-growables and open http://127.0.0.1:4202/review.html for the most recent exported test city, or /playtest.html for the normal new-world flow.

## Architecture and ownership

- architecture/von-badel/spec.mjs and generator.js implement 12–52 storeys, native dimensions, 1.5m-wide repeating bays, varying bay count/pitch, and deterministic podium/non-podium choices. A versioned source lock pins the new generator and shared dependencies.
- Reuses architecture/lightweight/template.mjs for the complete decorated envelope, polygon containment, street orientation, capacity and saved specifications. No completed model scaling or lot/road changes.
- Uses the existing ArchitectureBatch, illustrated catalogue shader, shared BMO typed flush, OptimizedFamilyRenderer, foundations, chunk picking and resource cleanup. Seven opaque pooled materials/two generated maps (64×128 bay and32×32 grain) use approved charcoal/pier/glazing PBR factors. This is a lightweight interpretation, not the detailed approved model or a photograph copy.
- Existing zoning history persists family/version, seed, dimensions, storeys, grid, native placement and footprint. Static Von Badel remains registered independently.
- Source checkout initially pointed at820d31d. Fast-forwarded the new milestone branch to the existing completed BMO/Lind branch e574f73; did not reimplement those families. Existing reference moves and export-procedural-offices.cjs edits remain uncommitted and excluded.
- Lind build-time lookup accepts the user's moved Kind/ reference at the same SHA-256. It still accepts an untouched checkout at the original path. No image bytes or source locks were relaxed.

## Validation

npm run build passed all111 game checks, including9 Von-specific regressions. Original52 SHA-256 and exact reviewed assembly/CSS checks remain mandatory. Covered native decorated-envelope bounds, deterministic mixed growth, varied storeys/bays/podiums, rotated/irregular containment, rejection/fallback, explicit legacy choices, unchanged-frame reuse, picking, demolition, Undo/Redo, regrowth, cold JSON history and three removal/cleanup cycles.

Actual in-game mixed city:12 Von,10 BMO,5 Lind,41 existing; eight previously assigned buildings retained. Diagnostic demolition/Undo/Redo/regrowth succeeded, including restoration while a legacy menu choice was active. UI Favour toggled without changing counts. New-world Playtest startup also opened without errors. No errors were reported by the final test document; an earlier disposable-fixture syntax error was corrected before final verification.

Matched50-family plus8-existing test,714×667 viewport, Intel Iris Xe,32 rAF intervals after8 warmups:
| Measure | BMO | Von Badel |
| --- | ---: | ---: |
| Scene calls |448|414|
| Scene triangles |548764|323120|
| Family materials/maps |13/2|7/2|
| Family source geometry bytes |20647792|4698400|
| Family merged bytes |17447536|4602080|
| Growth + chunk rebuild ms |179.1|65.0|
| Frame interval median/p95 ms |16.7/33.9|17.1/18.3|

Raw measured evidence: VON_BADEL_INTEGRATION_BROWSER.json. Frame intervals include scheduling and postprocessing; independently fitted heights differ. Not GPU timer measurements, desktop-Chrome certification, NVIDIA validation or proof of large-city performance. Reviewed the in-game facade, roof/silhouette and neighbouring palette. Offline HTML embedding is verified; browser validation used the exact exported bytes through localhost, not direct file launching.

## Recovery

safety/pre-von-badel-direct-820d31d plus verified .tools/checkpoints/von-badel-direct/history.bundle retain prior history. That ignored folder also preserves the pre-existing binary diff, export script and Kind references. Work is local on codex/von-badel-direct; no push or off-computer backup. No Architecture Lab changes, dependencies, build artifacts, logs or city saves belong in this milestone commit.
