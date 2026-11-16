# Lightweight Lind growable integration — 2026-11-16

## Launch

Open **C:\Users\camsh\Downloads\Pancake City - Lind and BMO Growables Playtest - 20261116T214357Z.html** with Google Chrome. Create terrain, draw ordinary streets, choose **Zoning → Office**, leave **Mix all98** selected and zone new properties. BMO and Lind are ON in this supplied build and spawn naturally alongside the original catalogue/static growables. Not every lot is suitable for Lind. For quick tests, open **Development · Lightweight offices** and check **Favour Lind during testing**; only suitable future growth is favoured. Existing buildings stay when controls change. Explicit legacy building choices continue to work for properties deliberately repainted.

A prebuilt disposable neighbourhood is in **C:\Users\camsh\Downloads\Pancake City - Lind Growables Test City - 20261116T214357Z.html**. It automatically starts with9 Lind,11 BMO and48 original offices, preserving eight offices zoned before either template was enabled. Buttons focus a Lind, rebuild the test neighbourhood, verify demolition/Undo/Redo/regeneration and compare10/25/50 instances. Only this fixture city resets when those buttons are used. The optional **C:\Users\camsh\Downloads\Play Lind and BMO in Chrome - 20261116T214357Z.cmd** opens the matching ordinary Playtest in Chrome with a high-performance GPU request and the existing dedicated test profile; no Windows graphics preference or existing Chrome window is changed.

Both HTML files are self-contained, with local code, CSS, approved geometry, repeating maps and notices embedded. No development server or internet is needed to play them. Rebuild with **npm run export:lind-growables**. **npm run review:lind-growables** serves the same exports at http://127.0.0.1:4200/playtest.html and /review.html. **node scripts/lind-integration-measure.cjs** records actual-game CPU/geometry diagnostics. Fresh timestamped names refuse overwrite; older playtests and original52 remain intact. Fingerprints and paths are in LIND_INTEGRATION_VALIDATION.json.

## Checkpoint and preservation

Before editing, created and verified a complete-history Git bundle at .tools/lind-integration-checkpoint/history.bundle and branched **codex/lightweight-lind-integration** from **f856c4cd02a9f1bdc159bfbe5c71602bd4462cdf**. Other worktrees and their unrelated work were not changed. No main/tag/history rewrite, force-push or GitHub push. Local bundles/commits are not off-computer backups.

Original52 SHA-256 stays **c8eff97d4c0daefd2cf7b6d967a694ce8a999e4a3e1402d88fee4fea6077778c**. Original Lind model/GLB/source art and static registration, BMO generator/material adapter/host source, Ohneeohnee/nine configurations, Von Badel/custom assets, Architecture Lab sources, shared polygon template and shared geometry optimizer are byte-unchanged. A new source lock pins the approved Lind sources and its crop data. There is no new architectural family or gameplay rewrite.

## Shared integration

**template:lind-stepped-lightweight@1.0.0** has its own family identity, eligibility/record adapter and a lazy material/geometry pool. It uses the **existing BMO createTemplateSystem** with the actual game polygon booleans and street axes. No parallel zoning, parcel merging, placement solver, terrain foundation or selection system was introduced. The current continuous Office block subdivision remains unchanged. Invalid/too-small/holed sites fall back to existing choices rather than stretching models.

The existing BMO flush gets an optional typed-family argument in the generated host wrapper. Its default BMO behaviour remains unchanged. Lind passes its runtime/records/batch set into that same flush, **OptimizedFamilyRenderer**,256m chunks, cleanup leases and footprint picker. Existing BMO source files themselves are unchanged. Shared counters accept the selected family set; Lind geometry is pruned after each synchronous neighbourhood transaction. No extra animation loop, per-window object, transparent glazing, reflection capture or heavy Ohneeohnee initialization.

The existing Office growable selector tries Lind on a deterministic subset of unassigned properties, then BMO and existing/static choices. Assigned original buildings are read unchanged. If both favour options are ON, a deterministic family ticket arbitrates instead of one family monopolizing every compatible site. Lind uses higher hash bits for its natural ticket to avoid the correlated low-bit pattern that initially selected all BMO candidates. Fixed legacy menu selection affects deliberate painting; it cannot suppress existing Lind assignments during rebuild/Undo. That distinction has dedicated cold-rebuild and actual-browser regression coverage.

Eligibility follows existing area/profile capacity bands, with minimum600m² and at least18-floor capacity. The approved18–52-level family derives width/depth/floors,3.6/3.7/3.8m floor heights, whole proportional bays, podium and stepped shoulders from the actual lot plus its stable seed. It retries without a podium when a broad base cannot fit. Complete decorated envelopes retain native scale1 and must fit the polygon. Records persist template/version, seed, full normalized parameters, tier/bay grid, entrance/street transform and versioned material tone. Zoning history includes Lind controls and assignment records; old snapshots without Lind remain valid. This is the existing zoning/history contract, not a new whole-city file-save feature.

## Materials and offline textures

The approved Lind geometry, atlas crop coordinates and massing are preserved. Three restrained warm/neutral/weathered limestone tones are deterministically stored in the record; only stone/pier material references vary. Bronze/opaque blue-grey glazing, muted green-grey crown and grey terraces remain common. The actual **pcRebuiltLighting / pcCelPhysicalShader** is used, with limestone roughness.92, trim.85, bay.58, opaque crown glass.32, bronze.62 and crown roof.78. No global lighting or other building materials change. Game screenshots show the warmer limestone and quieter crown beside silver/slate BMO and existing offices; its vertical contrast is retained as part of Lind's identity.

Seven base materials plus four stone/trim clones yield **11 active shared materials**, with **two shared DataTextures** for the entire family. No unique material/texture per building or seed. Approved architecture files remain untouched; the game adapter applies colours after native generation. Source image crops are packaged as bottom-row-first opaque RGBA data under Assets/procedural-templates/lind-stepped-lightweight@1.0.0 with provenance/source hashes. Normal builds read this committed data without platform-specific conversion. The reproducible fallback crop uses Windows System.Drawing only if the packaged crop/cache is absent. Existing license notices remain embedded. Growth makes no new asynchronous image load or runtime network request.

Cold normal Playtest terrain creation left Lind geometry/material/map allocations inactive despite ON being checked; resources become ready only when a fitting/growth operation or explicit enable requests them. Existing/static Lind keeps its own original materials and assets.

## Verification

**npm run build:102/102 game checks pass. npm run architecture:lind:check:7/7 unchanged-family checks pass.** Original hash/expected runtime recipe, source locks and existing regression checks remain active; no old expectations were weakened.

New integration coverage includes lazy startup and delivered-build defaults, preservation of existing/static assets, many native fitted dimensions/tiers/floors, podium and no-podium, three shared opaque tones, natural BMO/Lind/catalogue mixing and favour arbitration, fixed legacy painting/read preservation, rotated/irregular/sliver behaviour, actual chunk hit mapping, unchanged-frame reuse, demolition, exact regeneration, Undo/Redo, cold JSON restore, OFF preservation/redevelopment, pooled maps and repeated removal returning zero live batches/leases/cache entries. Existing road/lot/property geometry is compared before/after; common architectural envelope/roof/crown suites still pass.

Actual browser fixture passed demolition, Undo while the legacy menu choice was403, Redo and regeneration with identical fitted specifications/material tones. Existing eight buildings stayed fixed while templates grew around them. Error logs empty. Ordinary final-family Playtest startup also created flat seed1138 terrain with the normal regional highway workflow, kept both defaults ON and no Lind geometry ready, and selected Office/Mix all98. That normal-startup test preceded the final read-only assignment guard; startup/shading/batching code did not change. The exact final review export verified the guard and measured performance afterwards. Test tabs closed and viewport override reset.

Direct file:// automation is unavailable. Static offline checks, exact exported-byte loopback execution and byte-identical Downloads copies were verified; the exports require no external asset server. Browser evidence is Intel Iris Xe / ANGLE D3D11, not NVIDIA.

## Actual-game performance

Same50 family sites plus the same eight existing offices,1280×720,32 moving-camera intervals after8 warmups. Families independently derive heights/massing, so these are comparable city workloads, not identical models. Final run had zero intervals over250ms in either phase.

|Metric|BMO50 + existing8|Lind50 + existing8|
|---|---:|---:|
|Last scene draw calls|448|448|
|Submitted scene triangles|548,764|584,324|
|Median frame interval|10.8ms|10.6ms|
|p95 frame interval|14.6ms|12.1ms|
|Bulk zoning + neighbourhood build|189.3ms|191.2ms|
|Template chunk batches|146|146|
|Active family material / map count|13 /2|11 /2|
|Source geometry bytes|20,647,792|23,101,920|
|Owned merged bytes|17,447,536|15,438,064|

Lind adds about6.5% submitted scene triangles with the same draw calls in this fixture. Median/p95 observations support comparable performance here; they do not prove a speedup, NVIDIA parity or large-city behaviour. Scheduling, culling, shader/geometry cache warmup and GC are not isolated GPU timers. Initial trials had roughly1-second scheduling stalls and are retained alongside the final clean run in LIND_INTEGRATION_BROWSER.json. Bulk-generation samples use already fitted sites/shared caches, not a cold end-to-end startup measurement.

Renderer geometry/texture counters include retained caches and all existing assets; JS heap is a process snapshot and must not be interpreted as incremental family memory. The two Lind maps total655,360 raw bytes plus mipmaps/driver overhead; two BMO maps total98,304. These bounded pools remain reusable after the last building is removed. Live counters return0 once no models reference them; the reusable material pool is intentionally retained.

Actual-game Node diagnostics (sandbox CPU, not WebGL/GPU) are recorded separately. Timings include VM/JIT/GC effects and are single cold samples, not statistical frame-rate measurements:

|Family count|BMO batches|Lind batches|BMO model triangles|Lind model triangles|BMO zoning/render ms|Lind zoning/render ms|
|---|---:|---:|---:|---:|---:|---:|
|10|48|50|57,812|67,000|470.6|434.8|
|25|102|102|149,576|166,074|1055.6|2511.2|
|50|146|146|294,376|329,936|4284.8|4303.2|

## Limits

The conservative fitter can leave unused irregular corners and reject some otherwise usable sites. Mechanical crown levels count in the displayed structural floor total; occupied levels are separately exposed in dimensions for future simulation work. No new whole-city save/load, simulation policy, road rendering, lot layout, external asset pipeline or additional family was added. Local development outside the supplied flagged Playtest retains prior experimental defaults; enable templates through the existing lightweight development panel when using its test URL. Existing archived playtests remain unchanged. Review the playable build before approving any further scope or GitHub push.
