# Pancake City — v52 recovery

This project was reconstructed **only** from the user-provided `Pancake (52).html` browser build. It is **not** the original Codex repository or its Git history.

## Contents

- `original/Pancake (52).html` — exact original playable build, unchanged. Keep this as the immutable fallback.
- `web/index.html` — HTML shell pointing to extracted files.
- `web/assets/game.bundle.js` — original bundled/minified JavaScript, extracted **without modifying the contents**.
- `web/assets/game.css` — original stylesheet, extracted **without modifying the contents**.
- `reference/third-party-notices.txt` — copy of embedded third-party notices (the notices remain in `web/index.html`).
- `docs/RECOVERY_NOTES.md` — verification details, limitations and suggested next steps.

## Run

**Windows quick start:** double-click `Play Pancake City.cmd`, keep its window open, and open `http://127.0.0.1:4173` in Chrome or Edge. See [the Windows guide](docs/WINDOWS_GUIDE.md) for controls, development commands, and the commit-and-approval workflow.

Option A: Open `original/Pancake (52).html` directly in a modern browser, exactly as before.

Option B: Run the extracted version with a local web server. From the project directory:

```bash
npm ci
npm start
```

Then open `http://127.0.0.1:4173`. The local server is important because browsers may block JavaScript modules loaded directly from `file://` paths.

## Continue development

The local Windows setup adds `npm run check` (v52 preservation and syntax checks), `npm run build` (validated packaging into `dist/`), and `npm run preview` (built game at port 4174). No original modular source or gameplay changes are introduced. See `AGENTS.md` for milestone rules; each push requires your approval.

1. Keep a backup of this ZIP and the original HTML.
2. Create a Git repository from this folder and push it to GitHub.
3. Open a new Codex task attached to the GitHub repository.
4. Ask Codex to preserve behavior, add a smoke test, and progressively split the bundled application into maintainable modules.
5. Require commits pushed to GitHub after each successful milestone. Local checkpoint archives alone are not off-workspace backups.

## Important

The bundle is minified and includes third-party rendering code. Its exact original modular source, build configuration, and commit history cannot be reliably recovered from this HTML alone. The extracted bundle is still functional JavaScript source, but should be refactored carefully with regression tests.
