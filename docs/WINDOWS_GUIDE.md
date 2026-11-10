# Play Pancake City on Windows

1. Open `C:\Users\camsh\Desktop\Pancake-Slicer-main` in File Explorer.
2. Double-click `Play Pancake City.cmd`.
3. Keep the command window open. Open Chrome or Edge and enter `http://127.0.0.1:4173` in the address bar.
4. Choose the terrain settings and create the terrain. Follow the game's on-screen guide; the help button opens its controls.
5. Use W/A/S/D to pan, right-drag to orbit, and the mouse wheel to zoom. H returns the camera home; Escape returns to the hand tool. Landscaping uses middle-drag to orbit.
6. Choose Roads, Transit, Zoning, Landscape, or Landmarks using the existing tool panels. Follow the hints along the bottom for the selected tool.
7. To stop the server, select its command window and press Ctrl+C. Closing the browser alone does not stop the server.

The launcher starts the development copy in `web/`. It never modifies the original HTML. If Windows reports that port 4173 is already in use, check whether an earlier game server window is still open. Use that running server or stop it before launching another.

## Commands for development

For a single-file offline copy, open `C:\Users\camsh\Downloads\Pancake City - Playtest.html` with Google Chrome. No server window is needed. The first export was generated on 2026-11-10; Chrome automation was blocked by permissions, so its interactive launch still needs a hands-on check.

To generate a fresh standalone build, run `npm.cmd run export:html`. The result is `dist/Pancake City - Playtest.html`. To also copy it to Downloads, use `npm.cmd run export:html -- --downloads`; an existing Downloads file must first be kept under a different name. Exporting never edits the original v52 HTML.

Open a terminal in this folder. If Node.js or Git is not recognized after installation, close and reopen the terminal (or restart Codex).

```powershell
npm.cmd ci
npm.cmd run check
npm.cmd run build
npm.cmd start
```

`npm.cmd ci` installs the exact dependencies recorded in package-lock.json. `build` validates the recovery and copies the three runtime files into `dist/`. This is a reproducible packaging build of the already compiled v52 game; the original modular source cannot be recovered from this folder alone. To play the built copy, run `npm.cmd run preview` and open `http://127.0.0.1:4174`.

## Milestones and GitHub backups

Tell Codex what one milestone should accomplish. Codex should make the change, verify it, explain any limits, and make a local Git commit. It must then ask your approval before pushing that commit to GitHub. Tell it: "Commit this completed milestone, show me the test results, and ask before pushing."

This setup uses branch `recovery/windows-v52`, based on the existing GitHub main branch. The repository is `https://github.com/Pancake-Slicer/Pancake-Slicer`. The first approved push will be `git push -u origin recovery/windows-v52`. A later merge into main is a separate review step. Do not force-push.

Git records code and project files. It does not automatically back up cities stored by the browser or recover city saves from the old cloud environment. Use any in-game export/save controls available and keep save files separately. A GitHub sign-in prompt may appear on the first push; sign in yourself and never paste a password or token into chat.

## Interactive verification checklist

Automated checks confirm the original fingerprint, recovered asset equality, JavaScript syntax, file references, license notices, and packaging build. Browser access was blocked by a saved tool permission during recovery setup, so interactive gameplay remains unverified.

Before accepting gameplay changes, check terrain creation and 3D rendering, camera pan/orbit/zoom, freeform and curved roads, road editing and upgrades, undo/redo, zoning and property tools, transit, landscaping, landmarks, and any available save/load controls. A short play test does not prove every v52 system is correct.
