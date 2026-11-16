# Lightweight BMO growables — Phase 2

2026-11-16, America/Toronto. Experimental gameplay integration on `gameplay/lightweight-bmo-phase2`. Architecture sources and other growables are preserved.

## Launch and play

The exact new Downloads filenames and SHA-256 fingerprints are in `BMO_PHASE2_EXPORTS.json`. Double-click the matching **Play Lightweight BMO in Chrome** `.cmd` launcher in Downloads. It opens the matching self-contained Playtest HTML in a separate Chrome game profile and requests the high-performance GPU. Keep both files in the same folder. Alternatively, right-click the HTML and choose Open with → Google Chrome. No server/internet/model download is required by the HTML.

1. Create terrain through the ordinary game setup. For an easy first test, select Inland and set Hills, Mountains and Slope to0.
2. Draw ordinary ground-level two-lane streets and enclosed blocks. Roughly100–140m street spacing gives useful Office lots. The generated highway does not itself provide zoning frontage.
3. Open **Development · Lightweight BMO** at the lower right. Tick **Lightweight BMO Growables: ON / OFF** and, for testing, **Favour BMO during testing**.
4. Open **Zoning → Office**, leave **Commercial $$$ building** on **Mix all98**, then paint new lots or bucket-fill a block. Compatible sites grow fitted BMO buildings. Unsuitable sites fall back to the existing growable selection.
5. The development panel shows frame-loop FPS, mean interval, last completed render's draw calls/triangles, actual graphics adapter and active BMO count. These controls appear only in the marked development exports or a server session with `?lightweight-bmo`.

Turn BMO **OFF** to return future development to the existing catalogue. Existing BMO buildings remain. Demolishing and repainting an old BMO site while OFF redevelops it through the existing catalogue. Explicit selections from the original98-entry menu still work. Ordinary non-development startup has no permanent BMO settings panel and BMO defaults OFF.

The separate **Lightweight BMO Manual Benchmark** HTML begins empty. Choose10,25 or50 and press **Run selected comparison**; it deliberately resets that disposable benchmark city, not a city in another game window. It uses a flat480m/seed1138 map, the same road grid, sites and moving camera for original-catalogue versus mixed growth, with eight original buildings retained in each mixed case. Nothing spawns automatically. The final benchmark panel can be collapsed for inspection; Download results saves actual browser measurements. Long-interval/hidden-frame/viewport fields help identify invalid timing conditions.

## Checkpoint and preservation

Phase1 commit `a7f7704658b73b341631923ae8436509d15ac539` and its branch remain unchanged. A verified complete-history local Git bundle was created before integration at `.tools/phase2-checkpoint/history.bundle`; all work is on the separate Phase2 branch. Existing worktrees and their unrelated launcher/reference-file changes were not touched. No main change, tag overwrite, force-push or GitHub push occurred. Local commits/bundles are not off-computer backups.

The immutable original52 SHA-256 remains `c8eff97d4c0daefd2cf7b6d967a694ce8a999e4a3e1402d88fee4fea6077778c`. `architecture/bmo`, original Lab files, all Ohneeohnee architecture/assemblies/nine approved configurations, Lind/Von Badel and the other accepted GLBs/maps/manifests are unchanged. Source comparisons against a7f7704 enforce those boundaries.

## Integration design

- `scripts/lightweight-bmo.cjs` embeds the unchanged BMO generator, Phase1 shared template interface and existing optimizer as isolated ESM closures. A source lock pins this template version to the reviewed checkpoint, preventing future source edits from silently restyling saved1.0.0 buildings. They use the **existing recovered Three.js r180 constructors**, not a second engine. All modules/maps are local and embedded offline.
- `web/features/lightweight-bmo.js` owns development controls, eligibility, fitted records, history, chunk leases, selection and statistics. It does not own a competing road, lot, zoning, terrain or growth system.
- A single versioned template key joins the host selector through additive hooks. The original registry files/entries and menu are unchanged. BMO is evaluated for new unassigned Office lots only. Normal mixed selection tries BMO on a deterministic quarter of lots; Favour tries it first on every compatible site. Static authored models and original catalogue selection remain available.
- Each eligible property is passed to the Phase1 solver using actual polygons, corrected road-facing axes and existing polygon booleans. Storeys follow the property's profile/area capacity within the BMO studied10–55-floor range. Floor height, roof-equipment count and optional podium are deterministic from parcel identity. Podium failure retries a supported tower before falling back to the catalogue. Dimensions and whole bay counts reflow; no Object3D stretching or five-model lookup is used.
- Complete native envelopes, including projecting architecture and clearance, must fit. Irregular sites receive a supported inscribed rectangle or a safe rejection. The current gap-free Office subdivision, curved roads, residential plots, foundations, terrain suitability and suppression/history semantics remain.
- Captured zoning history includes template/version/seed, full fitted parameters/grid/placement and control state. Existing assignments survive OFF/Favour changes. Cold JSON capture/restore and actual game Undo/Redo restore deterministic buildings. No new whole-city file-save system or save UI was added; closing/reloading an unsaved game still loses its city.
- One lazy BMO runtime shares nine opaque materials and two small repeating/reflection DataTextures. No downloaded maps, per-window objects, transparent panes, interiors, dynamic reflection captures or heavy Ohneeohnee generation are introduced by BMO. Existing Ohneeohnee code remains preserved but is not initialized by this integration.
- The existing256m neighbourhood renderer queues BMO alongside static assets. Its existing optimizer merges opaque material buckets and instances equal geometry. Batches map hits to real building IDs. Clear owned batches before releasing source leases; prune only after the synchronous chunk transaction, preserving cache reuse. Unchanged frames do not regenerate buildings. Removal-cycle tests return0 leases/batches/cache entries.
- Statistics use the existing animation callback, with no extra persistent render loop. Idle/background scheduling can distort frame-loop FPS; the manual moving-camera benchmark is the meaningful comparison. Last scene draw counters are not independent GPU timer-query results.

## Verification

`npm run build`: **90/90** game/integration checks pass, including six new BMO suites. Tests cover ordinary cold startup/OFF, existing custom assets, normal mixed and favoured growth, many unique per-lot specifications, podium/non-podium, native containment, rotation/street orientation, irregular/sliver rejection, OFF preservation and OFF redevelopment, actual chunk selection, demolition, Undo/Redo, cold JSON restore, unchanged-frame reuse and repeated complete removal. Actual zoning/renderer fixtures with10/25/50 BMO plus eight original buildings also pass. Node diagnostics are in `BMO_PHASE2_CPU_SCENES.json`; those are CPU/geometry observations, not WebGL measurements.

Browser testing used an exact SHA-matched HTTP copy of the playable export through the allowed local test browser. It visibly grew10,25 and50 BMO buildings through the **actual game** and retained eight original buildings. OFF preserved all50. Browser error logs were empty. Normal Playtest displayed its original terrain dialog, created a flat ordinary map/region highway, exposed both BMO controls and selected the existing Office tab without errors. The Office-tab automation action timed out while processing, but the subsequent state confirmed it completed successfully; no repeated click was issued. Temporary test cities/tabs were closed and the test viewport reset to release GPU resources.

The automated browser was **Intel Iris Xe / ANGLE D3D11**, not NVIDIA. No new NVIDIA measurement is claimed. The Chrome launcher requests high-performance GPU; check its Graphics line when testing locally. Direct `file://` automation remains unavailable; export verification covers embedded JS/CSS/models/maps/notices, static offline checks and SHA-identical HTTP execution.

At1280×720,96 moving-camera intervals after16 warmups, the50-BMO-plus8-original case measured:

| Metric | Original catalogue,58 buildings | Mixed,50 BMO +8 original |
|---|---:|---:|
| Mean frame-loop FPS |93.74|93.14|
| Median / p95 interval |10.60 /13.20ms|10.80 /12.30ms|
| Last renderer draw calls |503|453|
| Last submitted triangles |650,471|555,767|
| Zoning + chunk CPU sample |115.0ms|217.2ms|
| Renderer geometry / texture counts |471 /86|474 /86|
| Process JS heap sample |86,647,242bytes|134,741,570bytes|

These are small-city observations including scheduling, camera culling, postprocessing and unequal shader/cache warmup. The mixed case reduced geometry/draw submissions in this fixture but cost more bulk generation CPU and JS heap; do not claim a universal speedup or large-city certification. The50 BMO models used9 shared materials/2 maps,20,647,792bytes of shared source geometry and19,771,536bytes of owned merged buffers across their chunks. Counts exclude driver overhead, shadows and retained renderer caches.

10/25 original-catalogue trials suffered roughly1-second scheduling stalls, while their mixed phases did not. All raw FPS/interval/counter/memory data and a discarded resize trial are preserved in `BMO_PHASE2_BROWSER.json`; these pairs **do not demonstrate a speedup**. Final benchmark exports add explicit long-interval and viewport diagnostics. The50-building pair completed without those long stalls and is the only summarized timing pair above. It remains an Intel in-app test, not standalone NVIDIA or isolated GPU timing. Timing runs preceded the final OFF-redevelopment guard; the final guard is regression-tested, and the final HTML startup was separately checked. Geometry/material/rendering code is identical; build fingerprints and this distinction are recorded in `BMO_PHASE2_VALIDATION.json`.

## Limits and next step

Conservative fitting can reject usable irregular sites and leave unused lot area. No maximal-rectangle solver, new LOD, new architectural family, terrain rewrite or simulation change is included. Source materials are preserved; their appearance follows the game's existing lighting/postprocess, so it can differ from the separately lit Architecture Lab. Large-city frame rates and NVIDIA performance require a dedicated desktop-Chrome test. Review the new Playtest before extending integration or architectural scope. GitHub push needs separate approval.
