# Update approved buildings

Double-click **Update Approved Buildings.cmd** in this game folder. Wait for “Finished”; the window lists the new playable files in your Windows Downloads folder. Open the **Demo** HTML with Google Chrome to inspect a populated city, or the **Playtest** HTML to start a new city. Both are self-contained offline files. Each run uses a unique filename and preserves older playtests.

The equivalent single command is:

```text
npm run update:buildings
```

You do not need to select models, edit code/JSON, create manifests, adjust materials, or place individual buildings. The Architecture workflow publishes complete approved packages; this command handles the receiving game integration.

## Shared directory and ownership

The authoritative incoming location is the existing shared library:

`C:\Users\camsh\Desktop\Pancake-City-restored-v53-20261112-153759\Assets\buildings`

Architecture owns that directory's models and approval metadata. A complete package contains the existing `asset.json` registration contract, an embedded GLB, and the existing `architecture.json` approval companion. Architecture supplies these automatically as part of its completed-building handoff; the player never edits them. Package folders can be nested. The importer discovers packages directly and does not depend on manually updating `approved-library.json`.

`Assets/growable-registry` is the game's accepted, versioned snapshot of those same packages. It uses the **same** registration format and shared Three.js adapter, not a second model format or renderer. Game tooling writes this cache; Architecture should leave it alone. GLB, original manifest, approval companion, texture bytes and license/attribution files are copied unchanged. No scale normalization, recolouring, remeshing, conversion or material replacement occurs.

## What the command does

1. Recursively scans for complete, incomplete, new, updated and duplicate packages.
2. Requires explicit `approval: approved`, matching stable ID/version and approval-pinned model/manifest hashes. Missing, draft or incompatible packages are reported and skipped.
3. Validates portable GLB structure and the existing supported material subset; finite geometry, indices, normals, UV0, native dimensions, decorated bounds/footprint, metres, Y-up, +Z front, entrance and Y=0 ground. Used embedded PNG/JPEG textures must match the approval inventory's hashes and sizes. PNG compressed data and JPEG headers/dimensions are checked, then Windows’ built-in image decoder validates pixel decoding without changing the texture bytes. No decoder installation is needed. Declared source/helper dependencies in the manifest are hash-checked at acceptance.
4. Tests each candidate with the actual game adapter on three rotated native-scale lots and builds its real shared instanced render batches. A candidate that cannot pass this basic placement/render test is skipped.
5. Detects duplicate copies by ID/version/fingerprint, rejects conflicting versions and identical models under different IDs, and preserves the last working version. Changed bytes under an already accepted version are rejected; Architecture must publish a higher version. Metadata-only updates are supported with a higher version.
6. Adds compatible versions to a staging registry, assembles the game, tests **every** registered version, runs the full project checks, then uses the normal game/offline export pipeline. A general code/test failure aborts activation and restores the previous generated runtime; it is reported as a failure rather than hidden as an asset warning.
7. Atomically promotes complete new package directories only after checks pass. Previous versions are never overwritten or deleted. Future automatic growth uses the newest accepted version per stable ID; explicit old version keys continue to resolve for history/assignments. Removing or breaking an incoming package does not remove its accepted snapshot. Frozen snapshots no longer depend on mutable authoring files; their own complete package hashes are verified during ordinary builds.
8. Writes uniquely named **Playtest** and **Demo** HTML files plus readable `.txt` and machine-readable `.json` reports to Downloads. Reports list accepted, unchanged and skipped packages, reasons, per-version smoke results, and output SHA-256s. Existing third-party notices remain; future package-specific notices are also embedded as recoverable base64 data in the HTML's `approved-building-notices` JSON block.

Detailed run logs/staging/checkpoints are under `.tools/building-updates/<run>/` and stay out of Git. A lock prevents two update commands running simultaneously. A dead process's lock is reclaimed automatically. There is no automatic Git push or tag operation.

## Compatibility and visual verification

The existing game adapter currently supports **Office growables** with static opaque GLB 2.0, UV0 and embedded PNG/JPEG. Animated/skinned models, unsupported glTF extensions/material maps, external runtime assets, FBX/OBJ, other zoning categories, capacity requirements over 80 floors, required parcel width/depth over the current 66 m policy, and models over the importer's 64 MiB per-package limit are reported for a later compatibility milestone. They are not silently converted or simplified. A normal lot must still physically fit the native model and meet its capacity; registration does not guarantee a specific model on every block. The existing roads, curves, land subdivision, mixed legacy fallback, terrain, traffic, demolition, selection, undo/redo and foundations remain authoritative.

The command's automated rendering check tests geometry/material/instancing construction and finite instance transforms without a GPU. It does **not** certify artistic fidelity or measure GPU frame times. Actual GPU output and scene appearance are checked in the running browser during the Codex review below. Windows image decoding is part of the command; on other platforms JPEG import is skipped until an equivalent decoder is available. The populated demo uses ordinary mixed zoning and may not display every future asset in a large catalogue; review newly accepted models explicitly when needed. Old versions remain packaged for assignment compatibility, so startup size/memory will grow with retained history; streaming/LOD/resource eviction are separate work.

For the complete Codex workflow, paste:

> Update Pancake City from the shared approved-building library using `npm run update:buildings`. Review the readable and JSON reports; leave incompatible packages skipped and preserve the last accepted versions. Verify the newly accepted models in the actual running game, including textures, street alignment, native lot fit, selection, demolition and undo. Capture a screenshot and report any visual limitations. Run the required build/checks, update development notes, inspect the diff, and commit only this milestone locally. Preserve Architecture sources and original v52. Give me the new playable HTML links. Do not push without my approval.

If Architecture has not yet published the package, its task is to produce the standard versioned GLB/manifest/approved companion in the shared directory. Do not ask the player to build that metadata manually.

## This milestone's verification

All three existing packages were accepted unchanged; repeated full updates reported all three **unchanged**, with zero duplicate registrations. The build and **74** checks pass. Added importer regressions cover duplicate copies, conflicting versions, immutable updates, higher-version retention, corrupt/missing/unsupported packages, rejected placement/render probes, missing source packages, license trees, metadata tampering, incomplete folders and latest-version/old-assignment behavior. Historical gameplay fixtures are pinned to the three known approved versions so future additions cannot invalidate an old regression merely by entering the random pool; separate generic smoke checks cover every registered asset/version.

Actual browser review of the generated demo shows the unchanged Lind, Von Badel and Ohneeohnee architecture, aligned with the roads; no browser errors. The current fixture naturally contains 4 Lind, 2 Von Badel, 8 Ohneeohnee and 22 legacy offices. Embedded HTML was tested over localhost; literal file-URL double-click was not automated. Original v52's SHA-256 remains `c8eff97d4c0daefd2cf7b6d967a694ce8a999e4a3e1402d88fee4fea6077778c`.

Safety branch `safety/pre-building-import-workflow-20261113` preserves `d009ff6` before this work. Existing reference-image moves remain unstaged. Main, tags and shared history are unchanged. A local commit is not an off-computer backup; GitHub publishing requires approval.
