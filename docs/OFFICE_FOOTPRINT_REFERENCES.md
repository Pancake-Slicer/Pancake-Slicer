# Office footprint scale references

Reviewed 2026-11-11. These primary sources inform the scale of Pancake City's office buildings. Published office floor areas are not interchangeable with exact exterior footprints: rentable area can include allocations, and towers can have podiums, setbacks, and service cores. The game dimensions below are design interpretations, not measured replicas.

## Published building data

| Reference | Published data | Approximate metric equivalent | Source |
| --- | --- | --- | --- |
| Inland Steel Building, Chicago | 19-storey office tower; office floors of 10,200 ft² | 948 m² per office floor | [SOM, project architect](https://www.som.com/projects/inland-steel-building/) |
| PIMCO headquarters, Newport Beach | 20 storeys; typical floor plates of 20,500 ft² | 1,905 m² | [Pei Cobb Freed & Partners, project architect](https://pcf-prod.typeco.de/projects/650-newport-center-drive-pimco-headquarters/) |
| 28 Liberty, New York | Published floor range of 34,019–37,442 rentable ft² | 3,160–3,478 rentable m² | [Official leasing floor plans](https://28liberty.com/stacking-and-floor-plans/) |
| 30 Rockefeller Plaza, New York | Floors 11–58 listed at 28,298–36,297 ft² | 2,629–3,372 m² | [Official building specifications](https://www.rockefellercenter.com/leasing/30-rockefeller-plaza/) |
| Willis Tower, Chicago | Nine structural square tubes, each 75 ft × 75 ft, bundled into a square base | Each module is 22.86 m × 22.86 m; illustrates substantial tower floor plates | [SOM, project architect](https://www.som.com/projects/willis-tower-formerly-sears-tower/) |

Conversions use 1 ft = 0.3048 m and 1 ft² = 0.09290304 m². Areas are rounded to the nearest square metre. Willis Tower is a scale reference, not a new 110-storey game building; the requested 10–80-storey range remains in force.

## Implemented game profiles

| Game profile | Frontage × depth | Base footprint | Storeys | Scale interpretation |
| --- | --- | --- | --- | --- |
| Compact modernist | 32 × 30 m | 960 m² | 10–24 | Comparable area to Inland Steel's published office floors, using a deeper, balanced game footprint |
| Midrise modernist | 40 × 36 m | 1,440 m² | 15–40 | Intermediate size between the compact and PIMCO references |
| International courtyard/block | 44 × 44 m | 1,936 m² | 25–60 | Comparable area to PIMCO's typical floor plate |
| International tower | 54 × 58 m | 3,132 m² | 40–80 | Comparable scale to 28 Liberty's published floor range |
| Art Deco midrise | 42 × 44 m | 1,848 m² | 15–40 | Smaller fictional member of the Art Deco office family |
| Art Deco tower | 56 × 54 m | 3,024 m² | 35–80 | Within the published floor-area range for 30 Rockefeller Plaza |

The six base profiles have aspect ratios below 1.2:1. Upper setbacks vary by architectural style and remain inside the base footprint. Office parcels are generated separately from residential lots; no width-only concatenation of shallow rowhouse lots remains. Selecting Office changes the displayed property outlines to the office layout, so bucket-fill selects an entire deep office parcel.

Generation requires the complete profile to fit inside the build tile, clear the street setback mask and landmarks, avoid other office parcels, and satisfy terrain checks. If a block is too shallow for even the 32 × 30 m profile, it remains unavailable for office zoning rather than producing a thin tower. Residential zoning retains its own original lot widths and depths.
