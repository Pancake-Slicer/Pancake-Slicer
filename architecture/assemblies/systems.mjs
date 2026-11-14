export const ASSEMBLY_VERSION='2.0.0';
export const LOBBY_TYPES=Object.freeze({
 A:Object.freeze({name:'Recessed lobby',minBays:8,requiresPodium:false,entranceBays:2,recess:1.1,columns:false,canopy:false}),
 B:Object.freeze({name:'Expressed lobby',minBays:12,requiresPodium:false,entranceBays:2,recess:1.4,columns:true,canopy:true}),
 C:Object.freeze({name:'Podium lobby',minBays:16,requiresPodium:true,entranceBays:4,recess:1.55,columns:true,canopy:true})
});
export function hash(text){let n=2166136261;for(const c of String(text))n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
export function lobbyProfile(spec,type='C'){
 const profile=LOBBY_TYPES[type];if(!profile)throw Error('Unknown lobby assembly');
 if(profile.requiresPodium&&!spec.podium)throw Error('Type C needs a podium');
 const bays=spec.podium?.widthBays||spec.widthBays;if(bays<profile.minBays||spec.lobbyHeight<4.3)throw Error('Lobby does not fit the existing massing');return profile;
}
export function paneModule(spec,side,floor,col){
 const group=Math.floor(col/spec.structuralBays),band=Math.floor(floor/3),n=hash(`${spec.seed}:${spec.archetype}:${side}:${band}:${group}`);
 return {variant:n%3,atlasCol:((n>>>5)+col%spec.structuralBays)%4,atlasRow:((n>>>9)+floor%3)%3};
}
export function reviewKey(spec){return 'pancake-city:architecture-review:'+hash(JSON.stringify(spec)).toString(16)+':'+ASSEMBLY_VERSION;}
export function validateReview(data,spec){
 if(!data||data.schemaVersion!==1||data.assemblyVersion!==ASSEMBLY_VERSION||data.prototypeKey!==reviewKey(spec))throw Error('Review belongs to another prototype or assembly version');
 if(!['unreviewed','approved','needs-refinement','rejected'].includes(data.status)||typeof data.notes!=='string'||data.notes.length>5000)throw Error('Invalid review status/notes');
 return {schemaVersion:1,assemblyVersion:ASSEMBLY_VERSION,prototypeKey:reviewKey(spec),status:data.status,notes:data.notes,updated:typeof data.updated==='string'?data.updated:new Date().toISOString()};
}
export function emptyReview(spec){return {schemaVersion:1,assemblyVersion:ASSEMBLY_VERSION,prototypeKey:reviewKey(spec),status:'unreviewed',notes:'',updated:''};}
