# BMO material harmonization — 2026-11-16

Material-only follow-up to Phase2 commit ca2e47aacda5e227bd50550a449ed0ec715b845e on architecture/bmo-material-harmonization. A complete-history Git bundle was created and verified before editing: .tools/bmo-harmonization-checkpoint/history.bundle. Other worktrees and their unrelated changes were left alone. Nothing has been pushed; a local checkpoint is not an off-computer backup.

## Play and review

The release paths and SHA-256 values are in BMO_MATERIALS_VALIDATION.json. Open the new Material Comparison HTML with Chrome for an automatically populated eight-building city. Buttons focus each palette, switch all five identical BMO models between the original and harmonized materials, and measure matching camera paths. The fifth BMO remains the original dark reference in harmonized mode. Three original catalogue towers stand alongside: Ajjanagadde Inc. (403), Vu Blue Denim Headquarters (407), Graber Corporate Suites (414). Collapse the comparison panel for an unobstructed view; uncheck Lock comparison camera to orbit freely.

For the full playable game, open the matching Harmonized Playtest HTML with Chrome, or double-click its matching Chrome launcher. Create terrain; open Development · Lightweight BMO; enable Lightweight BMO Growables and optionally Favour BMO. Choose Office / Mix all98 and zone new lots. Existing controls, terrain, roads and catalogue behaviour remain as in Phase2. BMO remains OFF at cold startup. Changing this default or adding permanent controls is outside this visual milestone.

Rebuild with npm run export:bmo-harmonized. npm run review:bmo-materials serves the generated files at http://127.0.0.1:4198/comparison.html and /playtest.html. The HTML files embed code, CSS, approved models, two BMO DataTextures and notices; no asset server is needed for playing the exported files. Outputs use timestamped filenames and refuse to replace a matching export.

## Actual catalogue reference and finishes

Inspected web/features/sc4-rebuilds.js and cel-style.js. Existing offices use pcIllustratedPalette's pale neutral stone/trim and blue-green glazing mixes, with pcRebuiltLighting and pcCelPhysicalShader. These share softened directional/specular response and an existing indirect-light boost. BMO previously used its separate darker physically lit materials. Only BMO material clones now use that same catalogue shading; no global lighting, postprocess or other building materials changed.

Palette endpoints come from the actual tower definitions above: light uses407, medium403, warm414, charcoal403. The common metal is #777e7f (roughness .55, metalness .32), charcoal source #394448 (roughness .75), roof #767a78 (.94). Cladding/trim use catalogue .65/.06, glass .25/.20 with the original small reflection map. Glass is opaque, opacity1, depthWrite true. Three former glass-tone slots share one glazing material per palette to reduce harsh striping. Horizontal bands, panel joint map, UVs and every vertex remain unchanged.

A single lazy pool contains13 active harmonized materials: five common finishes plus two per palette, sharing the original two textures. Original nine materials remain owned by the unchanged generator and are available for the comparison. The mixed comparison therefore has22 active materials; ordinary four-palette gameplay uses at most13. No per-building or per-seed material allocation, transparent panes, interior geometry, extra window objects or reflection captures.

Palette selection hashes the already persisted seed with a versioned salt. The same seed retains its palette after cold JSON restoration or regeneration. Fitted parameters, grids, template/version, placement and history serialization are untouched. The saved old palette field remains intact; this authorized material layer determines appearance independently. Comparison-only overrides are not used by normal gameplay.

## Preservation and tests

Only two host integration expressions change: create the shared material library on lazy runtime creation; reassign generated model materials before the existing batcher consumes them. The original BMO source, shared template/lot solver, source lock, Ohneeohnee/nine configurations, Architecture Lab, Lind/Von Badel/custom assets and all gameplay source boundaries remain unchanged against ca2e47a. Protected original52 SHA-256 is c8eff97d4c0daefd2cf7b6d967a694ce8a999e4a3e1402d88fee4fea6077778c.

npm run build:94/94 checks pass. Four material suites check pooled opaque finishes and texture reuse, unchanged geometry attributes/indices/UVs/specifications and source materials, deterministic palette assignment after JSON restoration, and real50-building neighbourhood batching with identical history and source geometry. Existing fitting, orientation, irregular rejection, picking, demolition, Undo/Redo, OFF behaviour, cleanup and source-lock regressions still pass. The old material-count expectation deliberately changes from9 to13; other checks remain intact.

The50-building CPU fixture measured144→146 output batches,9→13 materials,2→2 textures,20,647,792→20,647,792 source geometry bytes and19,771,536→17,447,536 owned merged bytes. The reduction in owned buffers comes from sharing glass slots and different bucket allocation, not simpler models. These are CPU/owned-buffer counts, not total driver memory or measured GPU draw calls. Actual browser evidence and raw timing limitations are recorded separately.

## Visual review and limits

Actual game screenshots include same-camera before/after and close views of all four palettes. The lighter silver, medium slate and warm variants now share the catalogue's muted response; charcoal retains a deliberately dark option with softer band contrast than the original. Roof and machinery colours now share catalogue finishes. The game's warm environment still makes nominal silver appear somewhat warm, and the dark option remains substantially darker than the pale catalogue towers. No global grading, geometry, architectural texture redesign or RT.jpg fidelity claim is included. User visual approval is the next step; no additional family work or GitHub push is authorized.

## Browser performance observations

At1280×720, the final eight-building fixture submitted263,185 triangles both before and after; last draw calls324→325. BMO batches36→37; original9 materials versus22 in the mixed review (13 harmonized plus9 retained reference materials); two BMO maps throughout. Renderer geometry counts293→297; total scene textures26→26. JS heap snapshots74,380,512→75,437,068 bytes are process samples, not isolated asset memory.

The final40-interval comparison recorded median1005.6ms→20.4ms, p951043.4ms→24.2ms,32→0 intervals over250ms. An earlier final-scene trial stalled on both halves (37→40 long intervals). These roughly1-second intervals are consistent with browser scheduling throttling, and make the paired timing results unsuitable for judging a material speed change. A clean interim scene before changing the three low reference offices to tower references recorded8.9→8.0ms median, but that is not the final palette/scene benchmark. No acceleration claim or final NVIDIA certification is made. The output resource counts support a bounded, small increase; definitive frame-rate parity remains a desktop test. Raw final data is in BMO_MATERIALS_BROWSER.json.

The browser GPU was Intel Iris Xe / ANGLE D3D11. Comparison controls, all four palette closeups and normal exported Playtest startup were visually checked without console errors. Direct file:// automation is unavailable; static offline checks and execution of the exact exported bytes over loopback were used. Files were copied to Downloads without replacing older releases and verified byte-identical.
