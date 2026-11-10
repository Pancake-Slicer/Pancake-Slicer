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
