# Original custom growables retired — 2026-11-16

The bespoke static Lind, Von Badel and Ohneeohnee models are reference-only. Lightweight parametric Lind, Von Badel and BMO remain operational. No original model, material, texture, source, accepted manifest or Architecture Lab file was changed or deleted.

## Gameplay and saved references

reference/retired-growables.json identifies all versions of the three retired IDs. Runtime assembly filters these manifests before model compilation; stale injected registrations are also excluded from lookup, current selection and readiness. Direct resource creation rejects retired IDs. The updater reports their incoming packages as reference-only instead of probing/reimporting them. Archived accepted packages remain on disk.

Saved catalogue assignment keys remain verbatim, including historical/future version strings and unversioned IDs. Existing zoning re-creates those lots with its deterministic 98-entry catalogue fallback, retaining normal IDs, zoning, suppression and history. No automatic save migration or disk-save modification occurs. Deliberate repainting still replaces an assignment through the usual tools. Cold restore, demolition and Undo/Redo are covered.

The separate nine-candidate enhanced Ohneeohnee procedural experiment remains opt-in and unchanged. Its shared material data is now a hash-pinned materials-only asset in Assets/procedural-templates/ohneeohnee-family@6.0.0/, with provenance. No retired mesh vertex/UV/normal/index/transform arrays are embedded or constructed for material lookup. Only when this separate experiment is explicitly enabled are its shared maps decoded. The approved loader/generator source is unchanged; a guarded host-only linker adapter binds material names without constructing original meshes.

The generic growable resource/instancing infrastructure remains for other approved assets. Ordinary gameplay initializes zero static model resources or retired image decodes. No new dependency or renderer/road/terrain/zoning refactor.

## Play and reference access

Run npm run export:lightweight-only for uniquely named offline Playtest, populated Test City and Chrome launcher files in dist/. BMO/Lind/Von lightweight families are enabled in these exports. Run npm run review:von-growables and open http://127.0.0.1:4202/review.html for the most recent exported Test City. Other export commands also apply retirement.

Existing reference launchers are preserved: npm run benchmark:serve (Lind), npm run benchmark:von-badel, npm run benchmark:ohneeohnee, npm run assets:library and the unchanged Architecture Lab tools. These launchers were not re-tested for this retirement milestone. definitions() is the archive/tooling view; activeDefinitions() is the gameplay view. Historical original-model regression tests explicitly use an isolated reference-only VM; production has no archive override.

## Verification and recovery

- npm run build passed 117 checks, including 6 retirement regressions. Targeted batches 33 and 27 checks passed.
- Verified active assembly never reads a GLB, archived model vertex arrays are absent, resource guards block stale registrations, and ordinary readiness/growth/rendering creates zero retired resources and image decodes.
- The actual mixed city grew 12 lightweight Von, 10 BMO, 5 Lind and 41 existing catalogue buildings. Eight pre-existing assignments remained unchanged. Original static registrations/resources were empty and the enhanced experiment was unloaded. Browser demolition/Undo/Redo/regrowth passed; no console errors.
- Original52 hash remains mandatory. Shared Ohneeohnee materials exactly equal the archived data. Existing optional procedural tests still reproduce all 9 candidates and history/cleanup behaviour.
- Runtime bundle13,526,020 →3,897,655 bytes; exact export paths/hashes and observed values are in RETIRED_GROWABLES_VALIDATION.json. HTTP testing used exported bytes; direct offline double-click remains user-side. No claim about city-scale FPS or GPU selection.
- Pre-change safety/pre-retire-originals-ba1262d and verified .tools/checkpoints/retire-originals/history.bundle retain recovery. The local folder also preserves the unrelated asset moves/export edit. Those edits remain unstaged.
- Local branch codex/retire-original-growables; push pending approval. Local commits are not off-computer backups.
