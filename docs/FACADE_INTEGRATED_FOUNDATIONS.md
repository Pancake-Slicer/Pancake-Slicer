# Facade-integrated foundations — 2026-11-17

Lightweight Lind, BMO and Von Badel no longer render the generic lot-wide raised platform shown in the user's Curbs.png. Their base walls and piers meet existing terrain using each building's current facade materials. Other catalogue generators, original reference models, roads, sidewalks, terrain generation and lot/zoning sources are unchanged.

## Play

Run npm run export:facade-foundations for new timestamped offline Playtest, Test City and Chrome launcher files in dist/. The Playtest uses normal terrain creation and enables the three lightweight families. The Test City includes Flat lots / Sloped lots and per-family entrance/corner cameras, using the actual game rather than an Architecture Lab. The slope toggle reloads this disposable fixture; it never edits a user save.

npm run review:von-growables serves the most recent export at http://127.0.0.1:4202/review.html; ?foundation-slope=1 selects the sloped fixture. Earlier named exports remain intact.

## Scoped implementation

- web/features/facade-foundations.js is a host adapter applied by scripts/facade-foundations.cjs after the existing lightweight integrations. No architecture generator, template, fitting contract, source texture or material definition changed.
- Reuses the existing Ql foundation extrusion, polygon booleans, property terrain sampler, native street transform, material pools, chunk optimizer, picking and lease cleanup.
- Supports follow the union of ground-floor masses: the full podium when present; Lind's shaft/wings and recessed courtyard when absent. Solid bands, matching pier extensions and narrow sealed coping replace the broad slab. Only the small entrance transition has a horizontal landing outside the wall plane, inside the existing fitted envelope.
- Building datum comes from the doorway's existing terrain samples, including both door edges. Adjacent sidewalk height remains the existing terrain+.06. Lind/Von native floor is just above it; BMO's existing raised threshold is respected. No road, sidewalk or terrain modification.
- Upper geometry, storeys, bays, textures, dimensions and native scale remain exact. The adaptive plinth masks below-grade facade portions on uphill sides; exterior doors stay clear. Entry steps and coping use facade materials, without allocating new maps/materials.
- Terrain edges are sampled every 2 m with the existing .18m buried support allowance. Coping shares those stations to prevent gaps at changing grades. Door openings are cut through both the band and coping. Foundations are attached before existing material batching, then released with the chunk; source geometry caches never own them.
- Only derived building placement/signatures change. Saved template parameters/grids/tones remain unchanged and terrain contact joins the existing signature invalidation. No work is added to unchanged render frames.

## Verification and limits

npm run build passed all 124 checks. Seven foundation regressions cover flat/slope/rotation, native footprint/courtyard containment, podium and non-podium cases, door grade and band clearance, coping/wall seams, source buffer and material identity, no extra material batches, picking, idle reuse, demolition/Undo/Redo and geometry disposal. The existing BMO fingerprint regression now handles both indexed source meshes and the non-indexed support buffers; it still compares every buffer byte between material modes.

Actual mixed city: 5 Lind, 10 BMO, 12 Von and 41 existing catalogue buildings. Flat and sloped street-level views were inspected for terrain contact, corners and entrances. Sloped fixture reaches 2.33 m elevation spread across a building; inspected door transitions use one step. Browser demolition/Undo/Redo/regrowth passed and final console errors were empty.

Current support triangles across the 27 lightweight buildings: BMO 6,600, Lind 6,291, Von 10,380. These are additional low-detail base surfaces; no per-window meshes or new shared resources. Existing material batch counts are preserved by tests. Browser material usage was 13/9/7 for BMO/Lind/Von, with two existing maps per family. Exact observations/export paths/hashes: FACADE_FOUNDATIONS_VALIDATION.json.

Frame timing was throttled by the in-app browser, so no FPS or large-city performance parity is claimed. Direct offline launch remains user-side; the exact exported files were inspected over localhost. The existing eligible lot terrain limits remain.

## Recovery

Safety branch safety/pre-facade-foundations-a83cfb2 and verified .tools/checkpoints/facade-foundations/history.bundle preserve the previous pushed milestone. The folder also preserves the unrelated reference moves/export edit. Those user edits remain excluded. Original52 hash and reviewed runtime assembly checks remain mandatory.

Local branch codex/facade-integrated-foundations; push pending approval. A local commit is not an off-computer backup.
