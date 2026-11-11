const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),catalogue=require('../reference/sc4-commercial-wealth3.json');
const text=`# Commercial Wealth $$$ catalogue

Reference: https://simcity4buildings.net/c/13 (reviewed 2026-11-11).

The site's public buildings.php dataset and frontend filter select commercial records (scb_typ > 5) with scb_wohlstand = 3: 98 entries, including 64 offices and 34 commercial services. All 98 reference images were reviewed. IDs, names, tilesets, stages, image filenames and lot options are source metadata. Names shared between entries do not make those entries interchangeable.

## How to use

Open Zoning → Office. Choose a named entry in Commercial $$$ building, then paint or bucket-fill a full Office parcel beside a surface street. Mix all 98 selects by a stable parcel hash. A selector change leaves placed buildings alone; repaint applies a new choice. Undo/redo records the per-parcel catalogue assignments. The hover/demolition description identifies the chosen reference name.

## Fidelity and limits

These are original procedural reconstructions, not extracted SimCity 4 meshes or textures. Each entry specifies an observed massing, approximate storeys, facade treatment, colour, roof and body coverage. Shared rendering primitives implement those recipes. Special plans include stepped, pencil, oval, bow-front, octagonal, courtyard, fluted, notched, cross and winged buildings; special roofs include domes, pitched/mansard forms, curved caps, sloped caps, crowns and helipads. Parking, spa and mall recipes include site details. This establishes complete catalogue coverage, not verified exact visual matching.

Storeys, colours and body proportions are estimates from small isometric images, not published measurements. Model footprints fit inside the existing 32–56 m by 30–58 m office parcels; source lot options are shown as references, not used as exact lot sizes. Original SC4 props, signage, landscaping, LOD meshes and night-lighting are not reproduced. All entries remain in Office zoning for this milestone, including low-rise services; this catalogue request supersedes the earlier 10-storey minimum for these entries.

No source image is shipped or loaded by the game. All game geometry and facade/relief maps are generated locally and embedded with the runtime in the offline export. The importer is a maintenance tool; normal assembly/build/export reads the checked-in JSON without network access. Running node scripts/import-sc4-catalogue.cjs deliberately refreshes metadata, and refuses a changed entry count or unreviewed IDs. node scripts/document-sc4-catalogue.cjs regenerates this coverage table.

## Validation

Automated tests instantiate every reference through actual zoning, render its real geometry, check finite vertices/normals, picking IDs, floor totals, footprint containment and render-cache reuse. They exercise the complete selector, repeat names, repainting and undo/redo. Roof orientation is tested with both polygon windings. Existing residential, camera, landmark and office-parcel regressions remain active. These checks cannot judge resemblance or GPU performance.

Chrome testing was attempted using the computer-use skill. The tool stopped because it could not determine the browser's current URL confidently enough to enforce policy. No interactive visual match or measured FPS is claimed; visual review remains outstanding.

## Entry coverage

The storey counts and shape/roof descriptions below are implementation estimates. Lot options are transcribed source facts.

| ID | Reference name | Type | Reference lots | Approx. storeys | Model plan | Roof |
| --- | --- | --- | --- | ---: | --- | --- |
`+catalogue.entries.map(e=>`| [${e.id}](${e.source}) | ${e.name.replaceAll('|','/')} | ${e.type} | ${e.lots.join(', ')} | ${e.estimatedFloors} | ${e.shape} | ${e.roof} |`).join('\n')+'\n';
fs.writeFileSync(path.join(root,'docs/SC4_COMMERCIAL_CATALOGUE.md'),text);
