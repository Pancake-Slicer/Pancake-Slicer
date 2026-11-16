import {normalizeSpecification,fitToLot,resolveGrid} from '../bmo/spec.mjs';
// This adapter is additive: the approved BMO generator/materials remain exact.
// The flat roof is the only supported configuration in this first family.
export const bmoTemplate=Object.freeze({id:'bmo-horizontal-lightweight',version:'1.0.0',family:'office',roof:'flat-mechanical',palette:'silver-blue-grey',maximumLot:{width:69.8,depth:55.8},envelopeMargin:1.2,
 normalize(input){if(input.roof&&input.roof!=='flat-mechanical')throw Error('Unsupported roof');if(input.palette&&input.palette!=='silver-blue-grey')throw Error('Unsupported palette');return {...normalizeSpecification(input),roof:'flat-mechanical',palette:'silver-blue-grey'};},
 fit:fitToLot,
 layout(spec){return {tower:resolveGrid(spec.width,spec.depth,spec),podium:spec.podium?resolveGrid(spec.podium.width,spec.podium.depth,{...spec,frontBays:null,sideBays:null}):null};}
});
