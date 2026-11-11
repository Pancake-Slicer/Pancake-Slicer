# Recoverable checkpoint: backup-v53

This annotated tag preserves the current illustrated-city game, including all 98 rebuilt office/commercial recipes, full-block office zoning, geometry repairs, source, procedural assets, recovered runtime, build/export tooling, tests, license notices and immutable original v52 HTML. It supersedes no existing tag and rewrites no history.

The game state is the illustrated treatment implemented in commit 81e72688d8eb32ad48a1a02081c42e30b3ad6e28. The checkpoint adds this recovery documentation without changing that game's JavaScript, CSS or recipes. The annotated tag's peeled commit is the authoritative checkpoint commit.

Repository: https://github.com/Pancake-Slicer/Pancake-Slicer

Recovery branch: recovery/windows-v52

The user explicitly authorized pushing the current checkpoint and its tag. The recovery branch includes the previous nine unpushed milestones. main and approved-v52 must remain unchanged. Before publishing, fetch remote changes and use a normal, non-forced push of only the named recovery branch and the new annotated tag. Verify the remote branch and the peeled tag commit equal the checkpoint.

## What is included

The checked-in recipes and procedural textures are sufficient to reproduce the active game. No SimCity installation or local artwork import is needed. Dependencies can be installed from package-lock.json. Dependencies, dist output, local reference artwork/thumbnails, temporary inspection pages, logs, screenshots and city saves are excluded. Earlier optional importer tools remain in history, but the active game does not load their ignored local artwork.

The checkpoint's standalone game should reproduce SHA-256 6abf206844f04a10651363d9cbd5ec22250895183fe403d8e1d7c859991b9283 (1,589,041 bytes). The export generates its own textures offline at runtime. The original/Pancake (52).html SHA-256 must always remain c8eff97d4c0daefd2cf7b6d967a694ce8a999e4a3e1402d88fee4fea6077778c.

## Restore without losing newer work

1. Fetch origin, including tags. Resolve backup-v53 as an annotated tag and verify its peeled commit against the recorded GitHub checkpoint commit.
2. Preserve any existing uncommitted changes. Create a new recovery branch and separate folder/worktree from that exact commit; do not reset or delete the current work, change main, force-push, or replace a tag.
3. Run npm ci, then npm run build. The checkpoint expects 53 passing tests and an intact original hash.
4. Run npm run export:html to create dist/Pancake City - Playtest.html. Copy it to a uniquely named HTML file in Downloads, preserving earlier files. Compare its SHA-256 with the value above.
5. Open the exported HTML in Chrome. Zoning → Office → Bucket fill develops adjoining office lots throughout a block. The Windows launcher also serves the game locally at http://127.0.0.1:4173.

Browser checks for this game's milestone covered the rendered city fixture, camera headings, façade detail, demolition/undo and the actual game world/menu. Fine scenery still differs from the user's illustration. Full-city FPS and browser-controlled file-URL launch were not established; no security restriction should be bypassed to test a local file.
