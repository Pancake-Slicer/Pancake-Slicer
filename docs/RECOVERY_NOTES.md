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
