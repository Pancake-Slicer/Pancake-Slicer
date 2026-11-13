# Growable alignment and Von Badel growth fix

The user reported absent Von Badel growth and visibly crooked custom buildings. Preserved a local safety branch safety/pre-growable-placement-fix-20261113 at a332fb7 before editing. All benchmark/model/material/texture sources, three registered assets and immutable v52 remain byte-identical to the protected snapshot. User's existing reference moves remain unstaged.

## Causes and fixes

The rigid model adapter previously used the vector from lot centre to a coarsely sampled road position as its yaw. On an ordinary orthogonal street this vector was about 1.13 degrees off-axis. The shared adapter now chooses the lot-axis direction closest to the road-facing vector, using the existing local lot rotation; standalone parcels without that field derive their axes from the longest polygon edge. Arbitrarily rotated grids remain rotated rather than being snapped to world north. Native unit scale and strict buffered footprint containment still apply; irregular or undersized parcels may fall back to legacy designs.

Equal subdivision often produced approximately 51.7 m square parcels on ordinary 120 m streets, narrower than Von Badel's 57.95 m minimum clearance width. The existing polygon partitioner now biases a cut toward the largest registered native minimum width (plus 0.1 m clearance, within its existing parcel size range) when the balanced cut would leave both sides too narrow. At least 20 m of remainder is required. The same polygon subtraction retains complete coverage and no gaps/overlap; no model is scaled or stretched and roads are unchanged. Existing catalogue choices and versioned asset assignments retain their selection rules. This is a shared manifest-driven sizing correction, not a hardcoded Von Badel spawn.

Native ordinary 120 m street fixture now naturally grows Von Badel; probes at 100, 120, 128, 136, 140 and 160 m street spacing all include it. Different map layouts still require a physically fitting high-capacity site and mixed selection is deterministic rather than a promise of every model on every block. The repeatable 136 m playable demo contains 4 Linds, 8 Ohneeohnees, 2 Von Badels and 22 legacy buildings. Its camera now frames the tallest custom asset for immediate verification.

## Checks and delivery

All 64 checks and npm run build pass. New regressions exercise noisy road vectors on straight and arbitrarily rotated grids for all three assets, exact local-axis alignment, unit scale, buffered containment, real automatic Von Badel growth on ordinary streets, rebuild stability and demolition/Undo identity. Existing concave/rotated block coverage, no-overlap, zoning/history, model fidelity, cached instancing and original preservation checks pass.

Actual rendered browser screenshot shows the tall dark Von Badel parallel to nearby roads, with smaller imported offices also aligned. Screen-space demolition and Undo visibly remove/restore it. Browser error logs empty. Embedded exports were browser-tested over localhost; literal double-click file-URL launch was not automated. No new FPS claim.

New self-contained Downloads files: Pancake City - Aligned Growables - 20261113.html (normal city startup) and Pancake City - Aligned Growables Demo - 20261113.html (populated actual game). Open with Google Chrome; no server or internet required. Earlier HTMLs are unchanged and cannot receive this fix automatically; use the new file. Output fingerprints are in GROWABLE_PLACEMENT_FIX.json.

Changes remain local on gameplay/latest-custom-buildings-20261113; no push, history rewrite, main or tag changes. A local checkpoint is not an off-computer backup.
