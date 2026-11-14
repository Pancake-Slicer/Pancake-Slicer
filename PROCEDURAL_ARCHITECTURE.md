# Enhanced ten-building family — Phase 3

Phase 4 adds a separate [optimized rendering/performance lab](PROCEDURAL_ARCHITECTURE_PHASE4.md), preserving this approved generator and family. Its live view is http://127.0.0.1:4187/performance.html; no city/game publication occurs.

The default lab now uses the approved 07B detailing across all ten original specifications. Automatic compatible lobbies support podium and non-podium buildings; the original family remains selectable for comparison. See [Phase 3 instructions, measured costs and validation](PROCEDURAL_ARCHITECTURE_PHASE3.md). The historical Phase 1 record below remains the baseline; no main-game publication has occurred.

# Procedural Architecture Lab — Phase 1

Double-click **Play Procedural Architecture Lab.cmd**, leave its window open, and open **http://127.0.0.1:4187** in Google Chrome. No internet is used while the lab runs. This is a separate local-server lab, not a double-click offline game export.

The initial seed is **1138**. The lineup contains ten generated buildings and an unchanged approved Ohneeohnee reference. Nothing generated here enters the game or becomes architecturally approved.

## Building 07 comparison — Phase 2

Use **07A / 07B comparison** in the header, or open http://127.0.0.1:4187/?comparison=07. The original and enhanced podium-lobby prototype have identical massing. Full/facade/corner/street/roof views, isolation, rendering-cost measurements and persistent review controls are available. The enhanced kit applies only to 07B; the ten-building benchmark remains unchanged. See [Phase 2 guide, performance and limitations](PROCEDURAL_ARCHITECTURE_PHASE2.md).

## Operate the lab

- **New seed + ten** creates a different controlled set and displays its seed.
- Enter a seed and press **Generate ten** to reproduce/reset that benchmark.
- Select a numbered label or use the building dropdown; the sidebar shows its parameters and specification.
- **Regenerate selected** varies only that building's specification, advancing its recorded revision. Other specifications remain unchanged; spacing is recalculated when widths change.
- **Inspect selected**, **Front**, **Rear**, **Roof**, **Lobby**, **Reset camera** and **Full lineup** provide inspection views. Drag to orbit, right-drag/Shift-drag to pan, and scroll to zoom.
- **Save all specifications** downloads JSON containing each building's complete specification and measured metadata. Reference regeneration is disabled.

## Structure

| Module | Responsibility |
| --- | --- |
| `architecture/modernist/spec.mjs` | Seeded parameter generation, ten composition presets, whole-bay/floor rules, supported tier transitions and validation; no rendering dependency |
| `architecture/modernist/geometry.js` | One reusable builder for every composition, façade modules, ground floors, tier roofs and four plant systems; geometry-resource cache |
| `architecture/modernist/materials.js` | Reads exact approved embedded texture payloads, reconstructs the reference, and caches four restrained derived material palettes |
| `architecture/lab/` | Perspective scene, common daylight, lineup, controls and specification export |
| `scripts/prepare-modernist-lab.cjs` | Copies local tools into ignored `.tools/modernist-lab`; compiles the approved static GLB without modifying it |
| `scripts/modernist-generator.test.cjs` | Determinism, compatibility, geometry, supported volumes, grid alignment, reuse and preservation tests |

The reference/maps are pinned to accepted `ohneeohnee-modernist@1.0.0` and its GLB SHA-256, so future incoming packages cannot silently change this generator version.

The existing optional Architecture-tool installation of **Three.js 0.180.0** is reused, matching the game engine's revision. No new game dependencies were added. A fresh checkout needs that same local tool restored by Codex (`npm install --prefix .tools --no-save --package-lock=false three@0.180.0`); current setup already has it. Existing shared geometry batching code is copied unchanged into the prepared lab.

Commands: `npm run architecture:modernist` launches; `npm run architecture:modernist:check` prepares and tests. Main game commands remain unchanged.

## Architectural system

Width and depth are integer curtain-bay counts multiplied by a controlled 1.9–2.1 m bay module. Additional width creates additional panes/mullions rather than scaling a building. Height creates complete storeys: a 4.6–5.0 m lobby and 3.45–3.75 m upper floors. Architectural rules allow a slightly broader API range, reject fractional modules and excessive slenderness, and keep spandrels, rails, corners and mullions aligned on each floor.

Podiums and setbacks differ by even, whole bay counts around a shared centre; each upper volume lies inside the one supporting it. Podium heights are complete floors. Every exposed tier gets its own roof and perimeter parapet. The four top-roof types are simple parapet, recessed low plant, mechanical penthouse, and screened plant. Plant housings, curbs, ducts, screens and posts stay within the top-roof footprint and sit on actual supports. Ground floors have taller glazing, aligned doors, transoms, thresholds, optional recessed entries/canopies and podium columns.

Curtain walls use Ohneeohnee's original twelve-pane atlas. Pane UVs address individual source panes; enlarging a building does not stretch an atlas across a wider façade. Controlled module-proportion differences and taller lobby panes necessarily change the image-to-pane aspect slightly; this first phase does not synthesize new reflection/interior artwork. Solid panel and roof UV density is measured in metres. No approved texture is overwritten or repainted. Four cached, restrained material tints alter generated models only; reference materials are never recoloured.

All detail is merged by material (8–9 model meshes in the initial generated buildings), not one mesh per window. Palette materials and three source texture maps are shared; repeated identical shapes share complete geometry. A bounded inactive resource cache avoids retaining every discarded seed indefinitely. Unique shapes are batched rather than instanced; future repeated-city instances can reuse these batches. No LOD/streaming system is introduced.

## Benchmark and reproduction

The ten presets are **compositional data**, not ten model implementations: 8-storey compact; 12-storey broad; 18-storey slender; 22-storey low-podium; 26-storey rectangular; 30-storey penthouse; 35-storey broad-podium; 40-storey slender; 45-storey upper-setback; and 25-storey paired-bay headquarters. Width/depth ratios, bay/floor modules, material palettes, intermediate rails, entries and roof types vary within the rules. Seed + archetype + individual revision + generator version determine the specification.

Each JSON record contains identity, family/version, seed, storeys, massing/tiers, curtain configuration, material palette, roof/entrance choices, measured decorated dimensions/footprint and geometry-byte/triangle/material-batch estimates. `buildModernist(specification, materials)` recreates the geometry. Keep published generator versions immutable when reproducibility becomes part of a future approved handoff.

Initial full lineup: **99 rendered calls, 188,540 triangles including the reference and ground; 3 shared source maps**. The ten generated models themselves total **173,576 triangles**. These are scene counts, not FPS or a large-city performance certification. See the [source analysis and validation record](docs/OHNEEOHNEE_PROCEDURAL_ANALYSIS.md).

## Roof correction — 1.0.1

Removed the hidden portions of façade caps that coincided with roof decks, while retaining exposed trim caps. Roof textures, lighting, massing, dimensions and all other architectural parameters are unchanged. Earlier 1.0.0 specifications remain accepted and use the corrected 1.0.1 roof construction. The scene counts above record the initial 1.0.0 benchmark; the correction changes only a small amount of cap topology and preserves material batches. Refresh the running lab with Ctrl+F5 after updating.

## Limits and next iteration

The original source has inferred real-world proportions, repetitive baked reflections/interior silhouettes, and an inferred rear. Generated lobbies reuse the source pane atlas; no true interiors or dynamic reflections exist. Façades currently use the same general four-sided system with controlled rhythm changes, not ten individually authored identities. Mechanical plant is organized architectural geometry, not engineering-certified equipment. Real-world floorplates, cores, egress, structure, energy and code compliance are not simulated.

Next: review the ten compositions architecturally, improve lobby-specific artwork, add more controlled façade/upper-service-band and corner assemblies, then test repeated approved instances/LOD at city scale. Additional families should implement the same specification/validation/build/metadata contract in separate modules. Do not add Von Badel/Lind/residential families or growable publication until separately approved. Nothing in this phase changes roads, zoning, simulation, live growable selection, approved files or the original v52.

## Phase 5 — facade subfamilies

The approved grid remains the default. Vertical and horizontal framing configurations are available only in the separate nine-building review lab. See [Phase5 implementation, compatibility, measured performance and evidence](PROCEDURAL_ARCHITECTURE_PHASE5.md). Do not roll the new styles across the full family or publish them as growables before visual approval.
