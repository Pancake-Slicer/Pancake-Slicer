# Lind and Reamon retirement — 2026-11-19

Retired from gameplay:

| Reference building | Retired selection |
| --- | --- |
| Lind Entertainment | Catalogue423; template:lind-stepped-lightweight, all versions |
| Reamon Plaza / brick reconstruction | Catalogue420; template:brick-commercial-lightweight, all versions |
| Original static Lind | Already excluded by reference/retired-growables.json; remains excluded |

The fixed Reamon review in architecture/brick-office/reference-reconstruction.js was never a growable and remains archival. All original reference JSON, generators, models, textures, materials, benchmark/Lab tools and license notices are preserved. No building geometry changed. BMO, Von Badel, Alderwick Commercial Tower, Aster Tower, Calder Exchange and Marlowe House remain operational.

## Runtime policy

scripts/retire-reference-offices.cjs applies the narrow retirement policy after the existing integration recipes. The production catalogue/design payloads contain96 active entries; archived reference JSON retains all98. Retired template lookup, fitting, selection, direct resource construction and developer enable/favour controls are blocked, including stale explicit choices. Lind's embedded facade texture payload is omitted; retired family runtimes stay null, with no maps/materials/geometry allocated. The existing shared Lind material factory and roof helpers remain available to the newer buildings, using their own maps.

Legacy template records and catalogue assignment keys are retained on cold restore and history replay without initializing retired generators. Their lots render the existing active-catalogue fallback. Redevelopment chooses an active building; no city save is deleted. Previous standalone HTML exports are preserved and naturally retain their older content; use the new build for this policy.

## Checks and delivery

- Full npm run build passes159 checks (155 existing +4 retirement). Four targeted production tests cover96-entry selection, all-version template/resource rejection, disabled controls, omitted pixels, zero retired runtimes/images, natural coexistence of all six retained lightweight offices, rendering/picking infrastructure, demolition/regeneration, Undo/Redo, legacy template/numeric cold restore, saved-data preservation and stale explicit catalogue selections.
- Earlier Lind/brick geometry and foundation regressions continue through scripts/archived-office-fixture.cjs, a build-time VM fixture using the pre-retirement recipes. This adds no browser flag or route that can re-enable retired families. Production retirement tests always read the assembled shipped runtime. The original52 SHA and exact reviewed runtime recipe remain mandatory in verify-recovery.cjs.
- Run npm run export:original-offices for uniquely named Original Offices Playtest, Test City and Chrome launcher files in dist/. Test City uses natural mixed growth and checks for absent Lind/Reamon instances/runtimes alongside Alderwick/Aster/Calder/Marlowe and the remaining families. Serve with npm run review:original-deco at127.0.0.1:4208.
- Checkpoint: checkpoint/pre-retire-lind-reamon-32f924e, with full history bundle and unrelated-work copies under .tools/checkpoints/retire-lind-reamon-32f924e/. Branch codex/retire-lind-reamon. User asset moves and unrelated exporter edits are excluded. A local commit is not an off-computer backup; push requires approval.

Actual packaged-game review: 3 Aster, 9 Calder, 11 Marlowe, 20 Alderwick, 17 BMO and 31 Von coexist with61 catalogue buildings; zero Lind/Reamon, both retired runtimes null, eight existing offices preserved and static resource cache empty. The menu has96 designs,62 Office entries and neither retired name. Real Marlowe demolition/Undo/Redo/regrowth passes; browser error log empty. Exact export hashes match loopback responses. Details: RETIRED_LIND_REAMON_VALIDATION.json. Direct local-file launch remains user-side.
