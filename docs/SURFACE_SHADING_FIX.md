# Shared surface shadow correction — 2026-11-19

Roofs, limestone entrances and concrete could self-shadow into diagonal bands. The shared directional-light controller used a fixed0.015m depth offset while filtered shadow texels grew with the view; its normal offset also stopped at0.25m. Fine facade/roof surfaces and untextured concrete were affected across families.

The existing sun controller now uses one fitted shadow texel of depth bias (normalized by the light camera near/far range) and half a texel of normal bias, with the existing small-view minimum. Initial and adaptive shadow fits share the same helper in web/features/shadow-surfaces.js. Real cast shadows, sun direction/intensity, PCF filtering, shadow-map sizes, camera fitting, update throttling and settled-frame caches remain active. No extra passes, geometry, materials or maps are added. Architecture, textures, lighting colours, terrain, roads, zoning, foundations and city assignments are unchanged.

## Validation

- npm run build passes143 existing/new rendering and gameplay checks plus4 Alderwick integration checks. Two shadow regressions exercise the actual controller at1024/2048 map sizes and multiple view distances; representative unoccluded roof/facade filter taps reproduce false legacy shadows and remain lit with the correction. Settled-view caching and physical shadows stay enabled.
- Actual in-game roof and lobby/concrete captures cover Alderwick, BMO, Lind, Von Badel, Brick and catalogue offices, with matched legacy/corrected views. Flat/sloped terrain and mixed-city demolition/Undo/Redo/regeneration were inspected. Corrected surfaces retain relief, mortar/tile maps and equipment/cornice shadows.
- Intel Iris Xe / ANGLE D3D11,1280×720 fixture: matched Alderwick lobby remains30 scene calls/230238 triangles, roof31/230463; no increase versus the legacy comparison. No FPS, GPU-time, NVIDIA-specific or large-city parity claim. Data: SURFACE_SHADING_VALIDATION.json. Full-resolution captures and surface-comparison.png are ignored local files under .tools/surface-shading/reports/.
- Original52 SHA and approved Alderwick/reference hashes unchanged. Recovery verifier and diff whitespace checks pass. Unrelated user asset moves and exporter edit excluded.

## Play and inspect

Run npm run export:surface-shading for uniquely named Clean Surface Shading Playtest/Test City HTML and Chrome launcher in dist/. Normal Playtest includes the shared correction without diagnostic controls. Test City has roof/lobby selectors, isolated family views, corrected/legacy comparison and actual composer capture controls; these are disposable review-only tools. Existing offline export/mixed-city lifecycle workflow is reused.

Run npm run review:surface-shading and open http://127.0.0.1:4207/ for Test City or /playtest for the ordinary build. Exact packaged bytes/SHA values are verified over HTTP; direct offline launch remains user-side because the browser tool disallows file URLs.

Checkpoint: safety/pre-surface-shading-ea1029f and verified .tools/checkpoints/surface-shading-ea1029f/history.bundle, plus unrelated-work copies. Local codex/surface-shading-fix milestone. Push awaits specific approval; a local commit is not an off-computer backup.
