# Commercial Wealth $$$ catalogue

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
| [284](https://simcity4buildings.net/c/13/284) | Boutiques | services | 1x2, 1x3, 2x2, 2x3 | 1 | box | flat |
| [283](https://simcity4buildings.net/c/13/283) | Boutiques | services | 1x2, 1x3, 2x2, 2x3 | 1 | box | flat |
| [282](https://simcity4buildings.net/c/13/282) | Boutiques | services | 1x2, 1x3, 2x2, 2x3 | 1 | notch | flat |
| [281](https://simcity4buildings.net/c/13/281) | Andrew's Fashion Center | services | 4x6, 5x6, 6x6 | 2 | mall | skylights |
| [280](https://simcity4buildings.net/c/13/280) | Kenner Dinner Theatre | services | 2x2, 2x3, 2x4 | 4 | theatre | portal |
| [279](https://simcity4buildings.net/c/13/279) | Stratton Spa | services | 4x4 | 1 | spa | hip |
| [278](https://simcity4buildings.net/c/13/278) | Car Care Center | services | 2x2, 2x3 | 1 | garage | hip |
| [277](https://simcity4buildings.net/c/13/277) | Luxury Auto Center | services | 2x2, 2x3 | 2 | showroom | flat |
| [276](https://simcity4buildings.net/c/13/276) | Chez Eyler | services | 1x2, 1x3, 2x2 | 2 | box | portal |
| [275](https://simcity4buildings.net/c/13/275) | Boutiques | services | 2x2, 2x3, 3x3 | 3 | round-corner | skylights |
| [274](https://simcity4buildings.net/c/13/274) | Boutiques | services | 2x2, 2x3, 3x3 | 4 | box | flat |
| [273](https://simcity4buildings.net/c/13/273) | Boutiques | services | 2x2, 2x3, 3x3 | 5 | bow | flat |
| [369](https://simcity4buildings.net/c/13/369) | Oi Finance | office | 1x2, 2x2, 2x3, 3x3 | 1 | notch | flat |
| [370](https://simcity4buildings.net/c/13/370) | Chalmers Co. | office | 2x2, 2x3, 3x3, 3x4, 4x4 | 4 | box | flat |
| [371](https://simcity4buildings.net/c/13/371) | Jenkins Consulting | office | 1x2, 2x3, 3x3 | 2 | slab | flat |
| [373](https://simcity4buildings.net/c/13/373) | Rusewicz Ritzy Plaza | office | 1x2, 2x2, 2x3, 3x3 | 2 | slab | gable-teal |
| [372](https://simcity4buildings.net/c/13/372) | Todd & Co. | office | 1x2, 2x2, 2x3, 3x3 | 1 | box | flat |
| [374](https://simcity4buildings.net/c/13/374) | Alvin's Go -N- Grab Plaza | office | 2x2, 2x3, 3x3, 3x4, 4x4 | 3 | recessed | skylights |
| [367](https://simcity4buildings.net/c/13/367) | Farley Publishing | office | 2x2, 2x3, 3x3, 3x4, 4x4 | 5 | box | flat |
| [368](https://simcity4buildings.net/c/13/368) | Landry Co. | office | 2x2, 2x3, 3x3, 3x4, 4x4 | 5 | bow | flat |
| [379](https://simcity4buildings.net/c/13/379) | Kobylanski Accounting | office | 2x2, 2x3, 3x3 | 3 | box | glass-pyramid |
| [378](https://simcity4buildings.net/c/13/378) | Stompel Printing | office | 2x2, 2x3, 3x3 | 3 | round-front | flat |
| [377](https://simcity4buildings.net/c/13/377) | McCord Printing | office | 2x2, 2x3, 3x3 | 3 | round-corner | skylights |
| [376](https://simcity4buildings.net/c/13/376) | Cheng Currency Exchange | office | 2x2, 2x3, 3x3 | 2 | box | pediment |
| [380](https://simcity4buildings.net/c/13/380) | Byall Means Travel Agency | office | 2x2, 2x3, 3x3 | 3 | slab | barrel |
| [375](https://simcity4buildings.net/c/13/375) | Chin Corp. | office | 2x2, 2x3, 3x3 | 2 | u-court | flat |
| [285](https://simcity4buildings.net/c/13/285) | Euro Lux Boutique | services | 1x2, 1x3, 2x2, 2x3 | 2 | slab | gable-teal |
| [286](https://simcity4buildings.net/c/13/286) | Holistic Health Center | services | 2x2, 2x3, 3x3 | 3 | recessed | skylights |
| [288](https://simcity4buildings.net/c/13/288) | Boutiques | services | 2x3, 3x3 | 6 | court | glasshouse |
| [289](https://simcity4buildings.net/c/13/289) | Boutiques | services | 2x3, 3x3 | 3 | box | flat |
| [287](https://simcity4buildings.net/c/13/287) | Boutiques | services | 2x3, 3x3 | 7 | bow | flat |
| [383](https://simcity4buildings.net/c/13/383) | Curtin Fabrics | office | 2x3, 3x3, 3x4, 4x4 | 6 | court | glasshouse |
| [384](https://simcity4buildings.net/c/13/384) | Kearney LLC | office | 2x3, 3x3, 3x4, 4x4 | 3 | box | flat |
| [385](https://simcity4buildings.net/c/13/385) | Galvin Techtronics | office | 2x3, 3x3, 3x4, 4x4 | 6 | twin-core | flat |
| [382](https://simcity4buildings.net/c/13/382) | Modde Inc. | office | 2x3, 3x3, 3x4, 4x4 | 7 | bow | flat |
| [381](https://simcity4buildings.net/c/13/381) | Fancey Foods | office | 2x3, 3x3, 3x4, 4x4 | 5 | court | terrace |
| [296](https://simcity4buildings.net/c/13/296) | Boutiques | services | 1x1, 1x2 | 7 | box | pediment |
| [386](https://simcity4buildings.net/c/13/386) | Meehan Marketing | office | 1x1, 2x3 | 7 | box | glass-pyramid |
| [297](https://simcity4buildings.net/c/13/297) | Peck Cinema | services | 2x3, 2x4, 3x3 | 3 | slab | portal |
| [292](https://simcity4buildings.net/c/13/292) | Bilyk Galleria | services | 4x4, 4x5 | 4 | u-court | terrace |
| [387](https://simcity4buildings.net/c/13/387) | Marshall Printing | office | 2x2, 2x3 | 12 | notched | flat |
| [388](https://simcity4buildings.net/c/13/388) | Vikayakar Foods | office | 1x1, 1x2, 2x3 | 7 | box | pediment |
| [389](https://simcity4buildings.net/c/13/389) | Brink Real Estate | office | 2x2, 2x3 | 14 | round-front | flat |
| [390](https://simcity4buildings.net/c/13/390) | The McAdams Building | office | 1x1, 2x3 | 10 | pencil | gothic |
| [391](https://simcity4buildings.net/c/13/391) | Farly Audio | office | 2x2, 2x3 | 10 | notched | mansard-red |
| [293](https://simcity4buildings.net/c/13/293) | St. Ritzy | services | 2x2, 2x3 | 14 | hotel-wings | gold-domes |
| [392](https://simcity4buildings.net/c/13/392) | Reflect Systems Incorporated | office | 2x2, 2x3 | 16 | fluted | solar |
| [393](https://simcity4buildings.net/c/13/393) | Brickheaven Office Suite | office | 1x1, 2x3 | 9 | steps | gable-dark |
| [294](https://simcity4buildings.net/c/13/294) | Boutiques | services | 1x1, 1x2 | 7 | box | glass-pyramid |
| [295](https://simcity4buildings.net/c/13/295) | Boutiques | services | 1x1, 1x2 | 10 | pencil | gothic |
| [291](https://simcity4buildings.net/c/13/291) | Carlin Department Store | services | 2x2, 2x3 | 4 | box | portal |
| [290](https://simcity4buildings.net/c/13/290) | JEK Equestrian Market Place | services | 2x3, 3x3 | 6 | twin-core | flat |
| [395](https://simcity4buildings.net/c/13/395) | West & Co, Inc. | office | 2x3, 3x3, 3x4 | 18 | twin-notch | terrace |
| [394](https://simcity4buildings.net/c/13/394) | Letourneau Architects | office | 1x2, 1x3, 2x2 | 5 | box | terrace |
| [298](https://simcity4buildings.net/c/13/298) | Six Floor Fashion Center | services | 1x1, 1x2 | 6 | steps | gable-dark |
| [397](https://simcity4buildings.net/c/13/397) | Paull Inc. | office | 1x1, 1x2 | 14 | pencil | sail |
| [301](https://simcity4buildings.net/c/13/301) | Boutiques | services | 2x3, 2x4, 3x3 | 6 | court | terrace |
| [300](https://simcity4buildings.net/c/13/300) | Boutiques | services | 2x3, 2x4, 3x3 | 12 | fluted | flat |
| [299](https://simcity4buildings.net/c/13/299) | Boutiques | services | 2x3, 2x4, 3x3 | 10 | box | flat |
| [396](https://simcity4buildings.net/c/13/396) | Xia Publishing | office | 1x2, 1x3, 2x2 | 5 | l-shape | glass-pyramid |
| [398](https://simcity4buildings.net/c/13/398) | Hedman Planners | office | 2x3, 3x3, 3x4 | 6 | court | terrace |
| [399](https://simcity4buildings.net/c/13/399) | Despret Consulting | office | 1x1, 1x2 | 16 | oval | flat |
| [400](https://simcity4buildings.net/c/13/400) | The Freytag Building | office | 1x2, 1x3, 2x2 | 18 | wedge | mansard-blue |
| [401](https://simcity4buildings.net/c/13/401) | Ben Tower | office | 1x1, 1x2 | 14 | box | notch |
| [402](https://simcity4buildings.net/c/13/402) | Box Top Real Estate Office | office | 1x2, 1x3, 2x2 | 4 | box-top | flat |
| [302](https://simcity4buildings.net/c/13/302) | Blue Platter Limited | services | 2x3, 2x4, 3x3 | 18 | stepped-slab | flat |
| [407](https://simcity4buildings.net/c/13/407) | Vu Blue Denim Headquarters | office | 2x3, 2x4, 3x3 | 17 | twin-core | flat |
| [403](https://simcity4buildings.net/c/13/403) | Ajjanagadde Inc. | office | 2x3, 2x4, 3x3 | 10 | box | flat |
| [404](https://simcity4buildings.net/c/13/404) | Walton Plaza | office | 2x3, 2x4, 3x3 | 12 | fluted | flat |
| [405](https://simcity4buildings.net/c/13/405) | Bunch Engineering | office | 2x3, 2x4, 3x3 | 17 | box | flat |
| [406](https://simcity4buildings.net/c/13/406) | Ferrara Inc. | office | 2x3, 2x4, 3x3 | 17 | box | roof-track |
| [410](https://simcity4buildings.net/c/13/410) | Houstonrvitz Accounting | office | 2x3, 2x4, 3x3 | 22 | box | terrace |
| [306](https://simcity4buildings.net/c/13/306) | Nanale Shopping Center | services | 3x4, 4x4 | 4 | mall | skylights |
| [409](https://simcity4buildings.net/c/13/409) | Yates Real Estate | office | 2x3, 2x4, 3x3 | 37 | steps | helipad |
| [411](https://simcity4buildings.net/c/13/411) | Barthelet Corporation | office | 2x3, 2x4, 3x3 | 42 | slab-core | flat |
| [304](https://simcity4buildings.net/c/13/304) | Maxis Theatre | services | 2x3, 2x4, 3x3 | 4 | theatre | copper-domes |
| [408](https://simcity4buildings.net/c/13/408) | Goldman Building | office | 2x3, 2x4, 3x3 | 24 | box | terrace |
| [305](https://simcity4buildings.net/c/13/305) | White's Clothier | services | 2x3, 3x3 | 6 | steps | flat |
| [412](https://simcity4buildings.net/c/13/412) | Wren Insurance | office | 2x3, 2x4, 3x3 | 55 | pencil | gothic |
| [413](https://simcity4buildings.net/c/13/413) | Simon and Frank Associates | office | 2x3, 2x4, 3x3 | 64 | oval | angled |
| [303](https://simcity4buildings.net/c/13/303) | Grand Hotel | services | 2x4, 2x5, 3x4 | 32 | hotel-wings | hip |
| [414](https://simcity4buildings.net/c/13/414) | Graber Corporate Suites | office | 2x3, 2x4, 3x3 | 32 | twin-notch | flat |
| [415](https://simcity4buildings.net/c/13/415) | Brock Furnishings | office | 3x3, 3x4 | 38 | bow | flat |
| [428](https://simcity4buildings.net/c/13/428) | Khoury Art Foundation Building | office | 3x4, 4x4 | 46 | oval | flat |
| [416](https://simcity4buildings.net/c/13/416) | Cameron Cameras | office | 3x4 | 48 | steps | terrace |
| [417](https://simcity4buildings.net/c/13/417) | Cahalane Communications | office | 4x4 | 66 | steps | notch |
| [422](https://simcity4buildings.net/c/13/422) | Trottier Trading | office | 3x4 | 47 | slab-core | barrel-green |
| [430](https://simcity4buildings.net/c/13/430) | Hogan Wallace and White Insurance | office | 4x4 | 64 | octagon | dark-crown |
| [429](https://simcity4buildings.net/c/13/429) | Hurt Enterprise Headquarters | office | 4x4 | 72 | oval-core | flat |
| [427](https://simcity4buildings.net/c/13/427) | Brown's Record Inc. | office | 3x3, 3x4 | 45 | round-front | flat |
| [426](https://simcity4buildings.net/c/13/426) | Mid-Knight Office Suites | office | 3x3, 3x4 | 38 | stepped-slab | flat |
| [425](https://simcity4buildings.net/c/13/425) | Futa Consulting | office | 3x3, 3x4 | 48 | hotel-wings | flat |
| [423](https://simcity4buildings.net/c/13/423) | Lind Entertainment | office | 4x4 | 60 | cross | gothic |
| [421](https://simcity4buildings.net/c/13/421) | van Prooijen Trading | office | 4x4 | 55 | notched | flat |
| [420](https://simcity4buildings.net/c/13/420) | Reamon Plaza | office | 3x4, 4x4 | 52 | fluted | terrace |
| [419](https://simcity4buildings.net/c/13/419) | The Galvin Corp | office | 3x3, 3x4 | 55 | cross | gothic |
| [418](https://simcity4buildings.net/c/13/418) | Lillard Audio | office | 3x3, 3x4 | 45 | bow | flat |
| [424](https://simcity4buildings.net/c/13/424) | Pedriana Pharmaceuticals | office | 4x4 | 70 | steps | gothic |
