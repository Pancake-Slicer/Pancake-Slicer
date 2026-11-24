# Original curved modernist experiments — 2026-11-23

Three independently authored parametric Office designs in architecture/curved-modernist/, template version0.1.0. The user approved the curved reconstruction as a technical benchmark; it remains an internal study. Normal spawning of the new family is OFF by default. Explicit Development → Lightweight offices → Experimental curved modernist controls permit opt-in review, favouring and A/B/C selection. Existing assignments remain unchanged when controls change. No commercial approval is implied.

## Architectural difference and quality

| Design | Native massing and entrance | Upper termination | Difference from benchmark |
| --- | --- | --- | --- |
| A · Arcus Corporate Tower | Freestanding symmetrical ellipse on a rounded commercial base; centred double-height entrance | Continuous upper taper, inset rectangular louver court and separate low fan units | No attached wing, no oval roof screen/circular court/antenna; reduced tapered summit |
| B · Crescent Plaza | Broad crescent with a genuinely concave entrance facade and convex rear; substantial three-storey podium with terrace planting | Recessed crescent attic and two separated low mechanical courts | Open concavity through the entire plan, no rectangular side mass; roof follows crescent |
| C · Facet Point | Asymmetrical rounded seven-sided outline; angled elevations and offset street entrance | Three progressively inset/offset upper stages and a flat paired-blade crown | Angular/curved composite silhouette, offset setbacks, no reference rooftop assembly |

The fixed reconstruction supplied techniques, not complete composition or geometry. New footprints, podiums, towers, roof assemblies, maps and design rules are authored separately. Its source is hash-pinned unchanged alongside selected approved sources/shared infrastructure in architecture/lightweight/curved-source-lock.json. It is never a growable definition or normal runtime dependency. Only the comparison export appends its scene-only geometry; the normal Playtest excludes it.

Facades use smooth native curved lofts, approximately1.5m curtain-wall bays and3.4m storeys. Fine floor divisions and vision/spandrel variation repeat in metric atlases; narrow physical mullions and shallow third-floor relief provide depth. Four coordinated glass options are silver, blue-grey, green-grey and charcoal. Palettes share the same cached geometry. Eleven pooled opaque materials/five maps support all designs; a single tower uses seven or eight material buckets. Roof paving has continuous metric UVs; trim is offset and closed back to the facade to prevent coplanar speckling. The native doorway has no raised cross-band.

## Parametric and game contract

- 20–70 whole storeys. Width/depth solve in discrete2.4m planning modules, with whole curtain-wall bays derived from native perimeter length. Curvature is subdivided at roughly0.65m, with smoothly shaded glazing and crisp angular edges. Upper taper/setbacks are architectural rules, not scaled completed models.
- The existing createTemplateSystem performs deterministic polygon containment/street alignment. An ellipse aspect rule and a broad crescent aspect rule preserve identity on square sites. Slenderness limits reject unsuitable heights. Complete decorated envelopes include cornices, frames and canopy. Conservative envelopes can reject an irregular parcel even if a bespoke placement might fit; holes are deliberately rejected.
- Existing assignment/history records, native scale1, picker, material/chunk batching, generation leases and pruning are reused. New integration recipe: scripts/lightweight-curved.cjs plus web/features/lightweight-curved.js. Assembly and recovery verification deliberately wrap the existing reviewed recipe with this new opt-in integration; original52 hash remains mandatory.
- Foundations use the existing facade-to-grade extruder and terrain sampling, supplied with the actual rounded/concave podium perimeter. The new family’s30cm facade plinth covers its projecting ground-floor pier feet, within the existing decorated envelope; the doorway remains open. Existing entrance-grade sampling, minimal transitions and Office concrete remain in charge. No generic foundation slab, alternative road/terrain/zoning mechanism or approved-family edits.

## Playable review

Run npm run export:curved-modernist to build/check and produce self-contained normal Playtest, populated Test City and Chrome launcher. npm run review:curved-modernist serves the exact Test City at http://127.0.0.1:4213/ and normal Playtest at /playtest. The Test City is a disposable fixture. All four opens the three original growables alongside the archived benchmark; A/B/C, Roof, Footprint and Entrance focus views. Smaller/larger lot,20/70 floors and palette buttons rebuild through the actual fitter. Demolition/Undo/Redo and the25-lot experimental neighbourhood are available for direct review. Normal spawning is disabled again after fixture placement.

Current Test City: Pancake City - Original Curved Modernist Experiments Test City - 20261123T164432Z.html.
SHA-256: 3427d4b5e9e7c6cb7ea05700f810e0a2a394dd419103cf8bb9a172500fc3b056.
Normal Playtest: Pancake City - Original Curved Modernist Experiments Playtest - 20261123T164432Z.html.
SHA-256: c2934be3c27a6c9e048bda0071762c77cfeb7f873cb16d1ff6a0ecd26c2876d9.

Exact HTTP bytes match both exported files. Existing license notices/offline embedding are preserved. Direct file launch was not exercised; the launcher is provided for user-side review. Final local images: .tools/curved-modernist/final/ (four-building comparison, three isometrics, B/C plans, clean A entrance and neighbourhood). Existing street trees can obscure some close entrance presets; orbit controls remain available.

## Validation and measured limits

Full npm run build passes173 tests, including seven new family checks: disabled/lazy startup and benchmark exclusion; original massings/20–70-storey geometry/shared palettes/metric roof UVs; multiple native lots and rotations/rejections; picking/stable-frame reuse/demolition/Undo/Redo/cold history/cleanup; flat/sloped podium foundations and paving;10/25/50 batch fixtures; preserved source hashes. Targeted command: npm run architecture:curved-modernist:check.

Browser review inspected final individual designs, crescent/asymmetric plans, roof paving and a clear street-level entrance. A/B/C demolition/Undo/Redo passed. C rebuilt on55.2x38.4m and50.4x50.4m native footprints and at20/70 floors. The actual-game neighbourhood grew25 experimental towers with no benchmark registration or browser errors. It used48 family batches across existing spatial chunks, eleven materials and five maps. City-level draw calls include terrain/forest/street furniture and are not a family-only cost.

The comparison prototypes use20548 /20462 /18285 triangles (A/B/C), versus63574 for the unchanged benchmark. Larger70-storey fixtures stay under35000 triangles per tower. Sequential10/25/50 standalone CPU/batch fixtures produced11 /23 /31 output batches in one2048m chunk and195105 /488380 /978388 triangles. Each case prunes its cache; JIT warming makes timings non-monotonic. These are CPU submission/build measurements, not GPU timing, FPS or large-city parity. Browser fixture: Intel Iris Xe,1280x720 canvas, normal app scheduling, no browser throttling override. Full measurements and scope: ORIGINAL_CURVED_MODERNIST_VALIDATION.json.

Checkpoint: checkpoint/pre-original-curved-79346b5. Branch: codex/original-curved-modernist. Unrelated user asset moves/exporter edit remain excluded. Local milestone only, no off-computer backup until an approved push. Stop for visual approval before enabling normal spawning.

Latest architecture revision2: Arcus glazed roof fins; Crescent rounded corners, doubled supported attic inset and central roof plant. Legacy records remain revision1 and C geometry is unchanged. [Revision details and playable hashes](CURVED_ROOF_REVISIONS.md).

## Revision 3 — Arcus taper and Splice Tower

Arcus carries its existing upper facade slope through the three-storey glazed fins. The crest uses the same elliptical taper as the glazing below the roof. Mullions follow the slope, and the fins retain the existing side openings, pooled materials and continuous curtain-wall grid.

Splice Tower replaces Crescent Plaza in the B slot for new experimental assignments. The new office has two rounded wings linked by a recessed glazed center, a street-facing three-storey podium and six floors of taper at the top. The roof has one compact central service enclosure. The design uses the existing lot fitter, facade foundations, opaque materials and batching.

Saved Crescent and Arcus retain their original revision, name and geometry. The revision 1 and 2 geometry buffers for all three designs, plus the current Facet Point buffers, match commit 02fb229. Normal spawning remains off.

Run npm run export:curved-modernist to reproduce the Playtest and Test City. In the Test City choose A · Arcus and Roof, or B · Splice Tower and Footprint.

- Test City: Pancake City - Original Curved Modernist Experiments Test City - 20261123T203639Z.html (SHA-256 a71dc0073960496e4b489ffcad57e502f4d627b1b97f06f6482c74572427def6).
- Playtest: Pancake City - Original Curved Modernist Experiments Playtest - 20261123T203639Z.html (SHA-256 e1a2609325f0a9035c3b629601ff83fa4c47918519a23de6274771059605a712).
- Full build passed 177 checks, including 11 family checks. Both exported hashes verified. Chrome opened the Test City directly from disk and passed in-game demolition, Undo and Redo for both towers with zero browser errors.
- Local review captures: .tools/curved-modernist/splice-review/. Default A/B/C models have 22,012 / 16,576 / 18,151 triangles respectively, with seven material batches each. No performance benchmark was run.

## Revision 4 — normal curved Office growth

Arcus Corporate Tower, Splice Crescent, and Facet Point now appear in mixed Office growth and as explicit choices in the Curved offices group. Earlier selections and saved assignments retain their recorded revision. The approved Arcus, Splice Tower, and Facet Point can be inspected with **Approved originals**. The SC4 reconstruction appears only in the review comparison.

| Subfamily | Variation rules |
| --- | --- |
| Arcus | Three combinations of elliptical shaft proportions, podium, upper taper length and crown radius. The two glazed fins follow the upper slope and span two to four floor modules. |
| Splice Crescent | Three bow depths applied to Splice’s rounded wings and recessed glazed center. Podium heights, tapered shoulders, and single or paired roof plant vary with form. |
| Facet Point | Three combinations of corner rounding, setback depth, offsets, and blade crown span. The tower keeps its asymmetric footprint and street entrance. |

New assignments use 3.4 m storeys, a 20–70 floor range, 2.4 m planning modules and a persisted seeded form. The shared fitter tests the decorated envelope on the actual street-aligned parcel and can cap automatic height to a supported floor count. It rejects incompatible lots. The existing facade-to-grade foundations, shared materials, picker and history remain in charge.

Distance detail switches by existing 256 m render chunk, with a 1.1 km exit and 0.9 km return threshold. Distant profiles keep the crowns, podium, material maps and silhouette. They reduce curve subdivisions and rely on the facade atlas for small mullions and relief. Each chunk attaches one batch set at a time, while holding both sets in memory for immediate switching.

Run npm run export:curved-modernist to reproduce both standalone files. In the Test City choose **15 variations** and **Next variation** to inspect the 20, 32, 44, 56 and 70-storey examples in each subfamily. **Natural Office growth** paints eligible lots using normal selection.

- Test City: Pancake City - Curved Office Growables Test City - 20261124T164418Z.html (SHA-256 6ef51b82de21ece57ec2be5a9f4ac462387832960a480d0dca988a7aa91d7fc3).
- Playtest: Pancake City - Curved Office Growables Playtest - 20261124T164418Z.html (SHA-256 e30800e1260269dfc56767e6e8626050e2aa941679dc47d440aa2783ef742881).
- Full build passed 180 checks. The model set covers 43.2–79.2 m fitted widths, rotated lots, decorated containment, supported upper sections, bay pitch and street-facing entrances. Geometry buffers for all nine earlier archetype/revision pairs match 0992f9d.
- Direct-file Chrome review confirmed all 15 fitted variations and 28 naturally selected curved towers across 283 Office lots. Natural Splice Crescent demolished and regrew with an identical saved specification. Local comparison captures are in .tools/curved-modernist/full-family/.
- In the natural-growth city, the active curved mesh set went from 484,562 to 155,100 triangles (68% reduction), with 176 near and 176 distant batches. These counts cover the curved family, including its foundations. This is a geometry comparison from a local Chrome fixture, without a hardware FPS benchmark.
