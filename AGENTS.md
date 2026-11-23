# Pancake City — Codex working guide

## Safety and orientation

- Inspect git status, current branch and worktrees before editing; checkouts may contain different game generations.
- Read README.md and relevant sections of docs/RECOVERY_NOTES.md once before game changes; prefer current source/latest milestone notes over superseded historical sections.
- This is a recovery from a compiled browser artifact, not the original modular source tree.
- Preserve original/Pancake (52).html byte for byte. SHA-256: c8eff97d4c0daefd2cf7b6d967a694ce8a999e4a3e1402d88fee4fea6077778c.
- Preserve roads/curves, zoning, continuous Office-block subdivision, lots, terrain, traffic, selection, demolition, history and existing functionality. Do not simplify systems or add unrelated features.
- Architecture owns approved geometry, facade textures and architectural materials. Do not redesign/recolour approved assets or edit benchmark sources without explicit authorization.
- Checkpoint before substantive changes; keep unrelated edits/worktrees separate. Never reset/delete current work to restore a version.
- Ask before destructive changes and every GitHub push. Never force-push, rewrite shared history, overwrite tags or change main without explicit approval.
- Keep dependencies, generated output, logs and city saves out of commits. Preserve notices and asset provenance; required versioned runtime assets belong in Assets/.

## Project map and renderer

| Location | Responsibility |
| --- | --- |
| original/ | Immutable v52 browser HTML and recovery baseline. |
| web/index.html; web/assets/game.bundle.js; game.css | Playable shell and generated recovered runtime/CSS. Core terrain, roads, camera, traffic and some zoning/rendering remain minified in the bundle. |
| web/features/offices.js; office-blocks.js; office-architecture.js; sc4-catalogue.js; sc4-rebuilds.js | Office zoning, continuous block lots, procedural catalogue selection and authored volumetric rendering. |
| web/features/growable-assets.js | Shared native asset placement, version lookup, resource caching, foundations, instancing and growable selection. |
| web/features/lightweight-bmo.js; lightweight-lind.js; bmo-materials.js | Lightweight family eligibility, saved records, controls, material pools and game rendering adapters. |
| web/features/procedural-offices.js | Controlled Ohneeohnee candidate integration; separate from the lightweight families. |
| web/features/cel-style.js; sc4-rebuilds.js | Existing catalogue palette mixing and illustrated physical-lighting shader. |
| architecture/bmo/; architecture/lind/ | Approved native parametric geometry/specification/material modules. |
| architecture/lightweight/template.mjs | Shared polygon fitting, native transforms, versioned specifications and assignment/history contract. Source-lock JSON files pin approved implementations. |
| architecture/assemblies/optimized-renderer.js | Existing material/chunk merging, repeated-geometry instancing and resource ownership/cleanup. |
| architecture/modernist/; assemblies/; integration/ohneeohnee-family/; lab/ | Ohneeohnee core, enhanced assemblies/facade profiles, portable package and isolated Architecture Lab viewers. These are subdirectories of architecture/. |
| benchmark/art-deco/; von-badel/; ohneeohnee/; shared/ | Approved/reference viewers and model sources; shared baked-geometry helper. These are subdirectories of benchmark/. |
| Assets/Architecture/; Assets/buildings/ | Source references and shared Architecture-published approved packages. Never alter incoming originals. |
| Assets/growable-registry/ | Accepted immutable versioned GLB packages used by the game. |
| Assets/procedural-templates/ | Versioned runtime texture data/provenance for procedural templates. |
| scripts/ | Recovery assembly recipes, asset validation/import, targeted tests, Lab preparation, build/export and review servers. |
| reference/; docs/ | Catalogue/reference data and notices; workflow contracts, recovery notes and measured evidence. |
| .tools/; dist/ | Ignored local dependencies, staged viewers/diagnostics and generated exports; do not edit as source. |

- The game uses one recovered **Three.js r180 / WebGL** engine: 3D meshes, procedural geometry and approved GLBs, not sprite buildings.
- Scripts assemble the runtime from original HTML plus reviewed recipes: assemble-runtime.cjs → rendering/Office/landmark patches → integrate-growables.cjs → lightweight-bmo.cjs → lightweight-lind.cjs → lightweight-von.cjs (all under scripts/).
- Change editable feature modules/recipes, then assemble; do not hand-patch the generated bundle or replace the renderer. Preserve existing camera/shadow/frame caches and hidden-tab safeguards.
- Architecture Lab tools reuse optional local .tools/node_modules/three@0.180.0. Follow preparation-script guidance if missing; never add a second engine to the game.

## Family status and visual standards

- **BMO lightweight:** integrated parametric Office growable. Horizontal bands, silver/grey cladding, opaque blue-grey/slate glazing, restrained charcoal and flat mechanical roof. Four coordinated palettes in web/features/bmo-materials.js.
- **Lind and Reamon reference families:** archived from gameplay by scripts/retire-reference-offices.cjs and reference/retired-reference-offices.json. This excludes catalogue423/420 and the lightweight Lind/brick-Reamon templates, including legacy regeneration. Preserve architecture/lind/, architecture/brick-office/, reference models and shared materials/roof helpers. Alderwick, Aster, Calder, Marlowe, BMO and Von remain active. See docs/RETIRED_LIND_REAMON.md.
- BMO starts ON in historical export:lind-growables builds via data-lightweight-growables; retired Lind remains blocked. Other modes retain their own defaults. Active families have ON/OFF and Favour controls; do not assume every export enables them.
- **Original static GLBs — reference-only:** all versions of lind-art-deco, von-badel-art-deco and ohneeohnee-modernist are retired from gameplay by reference/retired-growables.json. Preserve sources/packages/Lab access. activeDefinitions() excludes them before compilation; saved keys remain and display the existing catalogue fallback. See docs/RETIRED_CUSTOM_GROWABLES.md. Lightweight Von/BMO remain active; the later Lind/Reamon retirement is described above.
- **Ohneeohnee enhanced generator:** nine frozen opt-in candidates, disabled by default; vertical/horizontal/grid facade subfamilies. Preserve its optimized implementation and approved maps, but do not substitute its expensive detailing into lightweight city growth.
- **Von Badel:** current approved v2.1.0 is charcoal International Style, recessed blue-grey glass, symmetric wings and flat roof. Historical art-deco names/notes are not instructions to restore the superseded design.
- Lab/benchmark presence alone does not register an asset for growth. Preserve original comparisons and archived versions; consult docs/LIND_GROWABLE_INTEGRATION.md, docs/LIGHTWEIGHT_BMO_PHASE2.md and docs/PROCEDURAL_OFFICES_PHASE6B.md for host contracts/status.
- Use actual catalogue shader/material definitions for harmony. Keep warm limestone distinct from silver-grey offices; avoid arbitrary saturation, cream/mint lift or generic cartoon restyling. RT.jpg is the established visual reference, not permission to alter approved assets.
- Use opaque glass, existing roughness/metalness conventions, SRGB colour maps, repeating metric UVs and restrained shared texture sizes. Respect each asset's sampler/orientation; do not repaint or stretch approved maps.

- **Waterfall reference study:** one fixed unapproved reconstruction under architecture/waterfall/. No variations, parametric expansion or natural spawning before explicit visual approval. Review with export:waterfall; the launcher opens the single study. Preserve the archived rejected prototype and approved families. Latest SC4 benchmark is version0.2.0; prior0.1.0 is rejected/archive-only. See docs/SC4_WATERFALL_BENCHMARK.md.

## Parametric building and integration workflow

1. Reuse an existing implementation first. Static approved GLB packages use npm run update:buildings and docs/APPROVED_BUILDING_WORKFLOW.md; no per-building game code or hand-edited accepted manifests.
2. For a new procedural family, keep architecture in its own versioned module and test it in the Lab before gameplay activation unless that activation is explicitly authorized. Preserve earlier approved families.
3. Reuse architecture/lightweight/template.mjs with the real game polygon booleans/street axes. Fit the complete decorated envelope; keep native scale1. Rebuild width/depth/storeys/bay counts/setbacks, never stretch completed models/windows. Reject unsuitable polygons and retain existing catalogue fallbacks.
4. Keep metres, Y-up, +Z frontage, ground at Y=0 and an explicit native entrance. Account for podiums, projecting trim, roofs and terrain foundations; seal roof/lobby joins and avoid coplanar roof owners.
5. Use deterministic seeds, bounded palette variants and explicit template/version identity. Persist fitted parameters, grids, transforms and material tone in existing zoning history; preserve regeneration and cold JSON/Undo/Redo identity.
6. Reuse existing growable selection, foundations, shared flush/picker, chunk renderer and controls. Do not create a competing road/lot/placement system or restore obsolete parcel merging.
7. Pool opaque materials/maps; bake repeated facade detail into material geometry, use repeating textures and selective 3D features. Avoid per-window meshes, unique per-building materials, transparent interiors and costly effects.
8. Cache geometry by resolved shape, reuse/instance equal shapes, merge material buckets and retain chunking. Clear owned batches before releasing source leases; prune unused geometry after the transaction. Idle frames must not regenerate buildings.
9. Preserve assigned buildings when enabling/favouring a family or selecting a legacy menu item. Distinguish reading an assignment from deliberately repainting it; avoid duplicate registrations and archive old versions.
10. Keep source locks/provenance and offline packaging functional. A new approved version must not silently restyle saved assignments or overwrite accepted packages.

## Commands and validation

Run from the correct checkout root; on PowerShell use npm.cmd if npm.ps1 is blocked.

| Purpose | Verified command |
| --- | --- |
| Install locked game dependencies / serve | npm ci; npm start (127.0.0.1:4173) |
| Reassemble after feature/recipe edits | npm run assemble |
| Original hash, expected recipe and notices | node scripts/verify-recovery.cjs |
| Full game suite / milestone build | npm run check; npm run build |
| Targeted integration tests after assembly | node --test scripts/lightweight-lind.test.cjs scripts/lightweight-bmo.test.cjs scripts/bmo-materials.test.cjs |
| Shared fitting/BMO geometry | npm run architecture:lightweight:check |
| Lind geometry / isolated Lab | npm run architecture:lind:check; npm run architecture:lind |
| Ohneeohnee architecture / package | npm run architecture:modernist:check; npm run architecture:phase6a:test |
| Current mixed offline Playtest + Test City | npm run export:original-offices |
| Serve those generated files | npm run review:original-deco (127.0.0.1:4208) |
| Generic offline export | npm run export:html |
| Approved GLB package update | npm run update:buildings |

- npm run check compares the runtime/CSS against the **reviewed assembly recipe**, not untouched v52 JS/CSS. Keep the original HTML hash mandatory; document authorized recipe differences with regression coverage, never weaken checks to accept arbitrary edits.
- Target tests to changed behaviour: native containment/rotation/irregular rejection, floors/bays, determinism, opaque resource sharing, mixed spawning, existing assignment preservation, picking, demolition/regeneration, Undo/Redo/cold restore and cleanup as relevant.
- For gameplay/rendering milestones, inspect the diff, run full checks/build, update relevant recovery/development notes, verify the actual running game when permitted, then make a clear local commit.
- For visual/performance work, capture actual screenshots under comparable lighting/camera; measure calls, triangles, materials/maps, generation and frame intervals. Record GPU/viewport/warmup/throttling; do not invent measurements or claim NVIDIA/large-city parity from an Intel fixture.
- Verify offline embedding and a new uniquely named export for playable deliveries; never overwrite original52 or earlier user playtests. Be explicit if only exact-byte HTTP testing, rather than direct file launch, was possible.
- Documentation-only changes: validate links/paths/commands, line count and git diff --check; commit only requested documentation. Do not rebuild, rerun full suites, update unrelated notes or launch a browser without a relevant reason.

## Efficiency and Git delivery

- Inspect only task-relevant files. Use rg/rg --files, narrow reads and existing milestone docs; avoid repeatedly scanning the entire repository, minified bundle, base64 payloads or old reports.
- Reuse current implementations and helpers before writing systems. Avoid speculative abstractions, engine migrations, unnecessary refactors, dependencies and unrelated fixes.
- Run targeted tests while iterating; full suites at major code milestones. Once checks pass, repeat only after relevant changes, failures or unresolved concerns.
- Browser-test one representative affected flow; repeat only to verify a meaningful fix or a missing requirement. Close your disposable test tabs and reset viewport overrides to avoid GPU contention; leave user tabs alone.
- Keep progress updates, explanations and final reports concise. Explain required user actions in simple language; no manual model selection or JSON editing for routine approved-building imports.
- Before committing, inspect status/diff and stage only the milestone's files. Report commit, branch, checks and limitations; a local commit is not an off-computer backup.
- Request approval for that specific push. After approval, fetch/check remote changes, push without force, verify the remote commit matches and confirm main stayed unchanged.
