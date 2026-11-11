# Detailed office architecture

Updated 2026-11-11. These are original procedural office designs inspired by the architectural variety and dense surface detail of classic city-building games. They are not extracted SimCity 4 assets or a reproduction of its complete office catalogue.

The [SimCity 4 Deluxe manual](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/24780/manuals/SIMC4DpcMAN%28ukeng%29_DDAM.pdf) describes the Chicago, New York, Houston, and Euro-Contemporary building-style controls. [Community skyline examples](https://community.simtropolis.com/gallery/image/2429-fort-grayon-skyline/) were used as broad visual references; community cities may contain custom buildings and do not establish an inventory of the stock game. No downloaded game models or textures are included.

## Massing families

| Family | Six variants |
| --- | --- |
| Art Deco | Ziggurat; Wedding Cake; Shoulder Tower; Twin Beacons; Cruciform Crown; Setback L |
| International | Slab and Core; Paired Slabs; Glass Cross; Offset L; Stepped Glass; Pinwheel |
| Modernist | Terraced Wings; Concrete Cross; Split Bars; Ribbon L; Offset Pavilion; Layered Podium |

The variants combine stepped podiums, flanking wings, setbacks, separate shafts, L-shaped plans, and cruciform plans. Upper floor plates are clipped to the supporting lower plates, and every tier fits within the existing large office parcel. Storey counts still sum exactly to the advertised 10–80-storey design. Plan corners stay angular; no bevelled/rounded-corner system has been introduced for rectangular office sites.

## Surface and architectural detail

- Facades use 512 × 1,024 pixel procedural atlases spanning four bays and eight floors, with varied glazing, occasional lit windows, blinds, sills, mullions, masonry courses, fluting, concrete bands, and mechanical vents. Deterministic variation avoids a single repeated one-floor stripe.
- Bump maps give masonry and frames surface relief. Glass and masonry have different roughness/metalness settings. Texture anisotropy remains enabled.
- Batched geometry adds cornices, parapets, columns, structural fins, horizontal sunshades, lobby entrances, canopies, rooftop screens, plant housings, fans, and selected Art Deco masts.
- Roofs use a shared membrane/gravel texture. Generic roof, glass, dark metal, and equipment materials are shared across styles to contain draw-call and texture costs. Windows are texture detail, not thousands of separate meshes.

Visual appearance and frame rate have not been verified in Chrome because browser tools remain restricted. Automated tests cover distinct massings, support/containment, floor totals, texture construction, finite geometry, material reuse, batching, and picking IDs; they cannot judge whether the visual match meets the user's expectations. Specific reference building names/images would allow a more targeted later iteration.
