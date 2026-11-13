# Approved Architecture integration — 13 November 2026

## Play

Both files are self-contained and saved in `C:\Users\camsh\Downloads`:

- `Pancake City - Approved Architecture Demo - 20261113.html`: immediately playable city with **four Linds, four Von Badels and 28 legacy offices**.
- `Pancake City - Approved Architecture Playtest - 20261113.html`: normal new-city startup with both architectural assets available automatically.

Open either with Google Chrome. Models, textures, CSS, game code and existing license notices are embedded; no server or internet is needed. The accompanying Read Me explains zoning and controls. As in the existing game, refreshing resets the city; this milestone adds no city-save UI.

## Discovery and authority

Recursively inspected the Architecture reference directory, registered assets, benchmark handoff files and the latest completed Architecture workflow. Two authored building families exist: Lind was already registered; the newly completed refined Von Badel International Style model is supplied as a GLB and registration template at Architecture commit `526df5e83c6031c3a1b8c22462ff7322b173197d`. Reference PNG/JPEG files are authoring inputs, not additional growable models.

This user's request authorizes registering the completed handoff. No source model, benchmark, façade texture, material, reference image or original v52 file was modified. Existing user moves of the Lind reference images into `Assets/Architecture/Art Deco/Kind/` remain untouched and unstaged. The older Lind benchmark preparation path may still need its separate authoring-workflow reference-path update; gameplay uses the already embedded Lind GLB and is unaffected.

| Asset | Registration | Result |
| --- | --- | --- |
| Lind Art Deco 1.0.0 | Existing `Assets/buildings/lind-art-deco/` | Manifest and GLB preserved byte-for-byte |
| Von Badel International Style 2.1.0 | New `Assets/buildings/von-badel-art-deco/` | Latest nine-part Architecture GLB copied byte-for-byte; native 57.35 × 43.78 × 187.2 m envelope and 51-floor specification retained |
| Original 98-entry catalogue | Existing game recipes | Retained as existing explicit choices and automatic fallback |

Von Badel source/registered GLB SHA-256: `998000c6aa0011bcb4541517d6cb1375e45e5b1d72360a281c23afab5405a691`. Its stable ID follows the supplied handoff template; the display name correctly identifies International Style. Registration data records the Architecture commit, model/module/helper/dependency hashes and user integration authorization. The template itself is unchanged.

## Integration behaviour

The existing compiler discovers `Assets/buildings/*/asset.json` automatically. No per-building switch, renderer function, zoning menu, factory or custom gameplay code was added for Von Badel. Geometry, indices, normals, UVs, texture payloads, material colours and PBR factors flow through the existing shared static GLB adapter. No recolouring, material substitution, texture regeneration, model simplification or nonuniform scaling occurs. The city's pre-existing lighting differs from the isolated architectural viewer; it was not changed in this milestone.

The standard manifest controls zone, native footprint/bounds, road-facing entrance, capacity, minimum lot dimensions, setback, version and selection weight. Von Badel requires an eligible high-capacity Office lot, at least 57.95 m frontage and 44.38 m depth including safety clearance. Suitable unassigned mixed development may choose either approved model. Insufficient/irregular/low-capacity sites retain the original catalogue. Explicit legacy selections and existing versioned assignments remain authoritative. No roads, lot grids, parcel subdivision, terrain, traffic or simulation algorithms were changed to force model fits.

Both models use shared geometry/material resources and ordinary per-chunk instancing. Existing building IDs, selection, demolition, foundations and serializable assignment history remain. The common compiler now also verifies declared helper and dependency hashes, so a later authoring change cannot silently alter an approved handoff during packaging.

## Verification

- `npm run build`: **61 tests passed**, including all previous gameplay regressions.
- New fidelity test compares the registered GLB payload to the Architecture handoff, including every part, buffer, image and material. Runtime PBR values match the handoff.
- Native zoning test naturally develops four Linds and four Von Badels among 36 buildings, without assignment overrides. It verifies unchanged heights/floors, unit scale, containment, demolition/Undo/Redo, JSON assignment restoration, rotated fits and rejection of undersized sites.
- Existing Lind placement, catalogue, history, shared geometry/material disposal and picking checks remain active. Their formerly single-asset assertions were expanded deliberately to cover multiple registered resources while retaining Lind-specific assertions.
- Protected-file SHA-256 snapshots verify all benchmark sources, reference images, registered Lind files and original v52 stayed unchanged. The original v52 hash remains `c8eff97d4c0daefd2cf7b6d967a694ce8a999e4a3e1402d88fee4fea6077778c`.
- Actual rendered demo shows the dark, flat-roof Von Badel with its approved façade and roof equipment among existing architecture. Real screen-space demolition, Undo/Redo/Undo and camera pan/zoom worked. Browser error logs were empty. The normal standalone file opens its usual full-map terrain setup. DOM resource checks show inline scripts and no external HTML resources.

The repeatable demo uses ordinary 136 m street spacing on the existing flat 480 m test map. This yields native parcels large enough for both assets; no lot-generation code was changed. `npm run demo:approved-assets` reproduces it. The preceding Lind demo and architectural benchmark source files remain untouched.

Browser automation tested the actual embedded HTML over localhost. File-URL restrictions were respected; literal double-click launch was not automated-tested. No new full-city FPS benchmark or hundreds-model capacity claim is made. Startup/payload grows with the registry because assets are embedded and initialized once; current geometry/material sharing is retained. Exact output hashes and the protected-source inventory are recorded in `APPROVED_ARCHITECTURE_INTEGRATION.json`.

## Checkpoint

Safety branch `safety/pre-approved-assets-20261113-124130` retains `526df5e`. `.tools/pre-approved-assets-20261113-124130/` contains a verified complete Git bundle, the pre-existing working-tree patch, a copy of current Architecture reference files and their hashes. The integration branch is `gameplay/approved-assets-20261113-124130`. Only integration files are staged; the user's reference-image moves are preserved separately. Main and existing tags/history are unchanged. No GitHub push occurred; local checkpoints are not off-computer backups.
