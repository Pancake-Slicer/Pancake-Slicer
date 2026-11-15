# Empty-city slowdown investigation and code safeguards

User reproduction: lag starts after terrain creation in the blank Phase6B Playtest, before Office zoning or growth.

## Findings

The same flat10km map, seed1138 and regional highway were measured with the pre-integration `3bc8d0e` runtime and Phase6B `274cd7b`. Both had zero buildings. In the embedded browser, idle median frame intervals were167.1/166.8ms and moving intervals244.5/240.3ms respectively; frame-callback CPU work was about1.1ms idle and3.9/4.0ms moving. These are observations under graphics contention, not a clean hardware benchmark or a claimed improvement. Pre-integration rendering is also affected; the procedural building meshes are not the explanation for this empty-city result.

Windows reports both Intel Iris Xe and an NVIDIA RTX3070Ti Laptop GPU. The actual game contexts report **Intel Iris Xe**. A separate WebGL2 context requesting high-performance also reports Intel. Therefore the renderer request alone is not sufficient on this machine. Chrome currently has no explicit per-application Windows GPU preference. A Windows setting change has been proposed but is **pending user approval**, with its prior state saved locally in `.tools/empty-performance/chrome-gpu-before.json`; no graphics preference has been changed.

Windows GPU counters also observed the ChatGPT graphics process at about98%3D utilization. Many old game pages were open. With the user's explicit approval,15 old HTTP Lab/test pages were closed while retaining the latest Playtest and one Lab. Browser URL policy blocks access even to close older file-based pages; those remain and require manual closure. No HTML files were deleted. The native Chrome diagnostic window created by this investigation was closed after testing; the user's pre-existing Chrome window was preserved.

Desktop Chrome was tested independently over HTTP. It still selected Intel, with variable long frame intervals; a blank WebGL canvas also had variable intervals (median30.7ms,p9555.3ms). Its game controls update measured about0.1ms, and instrumented callback work remained a few milliseconds, so no smooth-play claim is justified from these observations. Re-test on the intended NVIDIA adapter in a fresh game Chrome process before claiming the reported lag resolved. The earlier dense demo measurements are not a substitute for this empty-city test.

## Code changes

- Removed eager `await pcOhneeReady()` from ordinary startup. An empty new city creates no experimental runtime, material pool, decoded experimental images or model/batch leases. Embedded source/catalogue/payload strings remain in the offline HTML.
- Load the shared library only when the development toggle enables it or a restored snapshot actually references experimental buildings. Concurrent requests share one promise. Loading failure keeps ordinary growth usable; existing deterministic history, saved specifications and later geometry reuse remain.
- Hidden pages now return before camera, simulation, forest, shadows or rendering work. Their frame clock advances so returning to the game does not process a long backlog. The visible frame body is otherwise unchanged; traffic, camera behavior, geometry, effects and resolution remain.
- The game requests `powerPreference:"high-performance"` on its existing renderer. Development controls show the actual renderer adapter rather than assuming the hint was honored. This is not a Windows settings change and does not guarantee NVIDIA selection.
- Exports now include an explicit desktop-Chrome `.cmd` launcher. It starts the matching self-contained HTML in a separate local game Chrome profile (`%LOCALAPPDATA%\PancakeCity\ChromeProfile`) with no first-run/default-browser prompts. Existing Chrome windows/profiles remain separate. A fresh process is useful when applying a Windows GPU preference. No browser security protections or GPU driver settings are disabled.
- The populated demo explicitly awaits its experimental runtime because it deliberately tests all nine candidates; the ordinary Playtest does not.

All architectural sources, GLBs, maps, Lab files, facade configurations, optimizer and the immutable original52 remain unchanged. No buildings, trees, shadows, simulation features or architectural detail have been removed to disguise lag.

## Verification and remaining step

`npm run build` passes84 game/integration tests;44 architecture checks pass. Added actual-callback hidden-frame/clock coverage, zero-allocation cold bootstrap/single-flight loading, and cold-runtime snapshot restoration. Existing native growth, nine candidates, filters, exact specification persistence, demolition/Undo/Redo, picking and resource cleanup checks still pass.

Actual browser checks on the exported runtime cover flat-terrain startup, development default-off state, actual GPU diagnostic label and enabling the library on demand without errors. The known480m smoke fixture was used for these control checks; the performance investigation above used the ordinary10km map. Direct file automation remains disallowed, so HTML launch tests used local HTTP copies. The launcher was inspected statically; it was not executed through a terminal/browser-policy workaround.

Exact new export paths/hashes and pending GPU state are recorded in `docs/EMPTY_CITY_PERFORMANCE_VALIDATION.json`. Open the **Chrome launcher from Windows Downloads**, rather than the HTML's chat preview. Until a fresh process reports NVIDIA and smooth play is confirmed, these are tested code safeguards and a recovery candidate, **not a verified resolution of the user's performance complaint**.

Microsoft documents choosing High performance for a specific application in System → Display → Graphics, saving and restarting the application: [Microsoft's graphics preference instructions](https://support.microsoft.com/en-us/windows/hardware/display-graphics/optimizations-for-windowed-games-in-windows-11). The user subsequently approved this change. Only Chrome’s per-user preference was set to GpuPreference=2; and read back successfully. The previous absent property was recorded locally. Existing Chrome windows were preserved. Actual NVIDIA selection still needs confirmation in a fresh process.

Safety branch `safety/pre-empty-performance-274cd7b` and a complete local history bundle retain the pre-change state. Unrelated Art Deco reference moves remain excluded. Work is local on `gameplay/ohneeohnee-phase6b`; no push, main change, tag overwrite or history rewrite was performed. Local commits are not off-computer backups.
