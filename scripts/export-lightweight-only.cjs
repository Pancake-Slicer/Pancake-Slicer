// Reuse the mixed-family offline exporter and actual-game test city.
process.env.PANCAKE_EXPORT_LABEL='Lightweight Offices Only';
require('./export-von-growables.cjs');
