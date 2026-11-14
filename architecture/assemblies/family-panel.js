import {FAMILY_ASSEMBLY_VERSION,lineupMetrics} from './family.js';
import {hash} from './systems.mjs';
const statuses=['unreviewed','approved','needs-refinement','rejected'];
export const familyReviewKey=spec=>'pancake-city:family-review:'+FAMILY_ASSEMBLY_VERSION+':'+hash(JSON.stringify(spec)).toString(16);
export function validateFamilyReview(data,spec){
 if(!data||data.version!==FAMILY_ASSEMBLY_VERSION||data.key!==familyReviewKey(spec)||!statuses.includes(data.status)||typeof data.notes!=='string'||data.notes.length>5000)throw Error('Review does not match this family specification/version');
 return {version:FAMILY_ASSEMBLY_VERSION,key:data.key,status:data.status,notes:data.notes};
}
export class FamilyPanel{
 constructor({readState,setVariant,measure}){
  this.readState=readState;this.pending=new Map;this.timing=null;
  const panel=document.querySelector('#benchmark-panel'),top=document.createElement('div');
  top.innerHTML='<label for="family-variant">Architectural assemblies</label><select id="family-variant"><option value="enhanced">Enhanced family · approved 07B assemblies</option><option value="original">Original benchmark · same specifications</option></select><p class="small">Original massing and seeds retained. Family awaits review; nothing publishes to gameplay.</p>';
  panel.prepend(top);const bottom=document.createElement('div');bottom.id='family-panel';
  bottom.innerHTML='<h2>Family rendering costs</h2><div id="family-counts"></div><button id="family-measure">Measure matched lineups</button><button id="family-report">Export family report</button><p id="family-timing" class="small">Counts exclude the approved reference and ground. Timing measures cached-shadow render + GPU finish, not city FPS.</p><h2>Selected enhanced building review</h2><label for="family-status">Family review status</label><select id="family-status"><option value="unreviewed">Unreviewed</option><option value="approved">Approved</option><option value="needs-refinement">Needs refinement</option><option value="rejected">Rejected</option></select><label for="family-notes">Family review notes</label><textarea id="family-notes" rows="3" maxlength="5000"></textarea><button id="family-save">Save selected review</button><div class="review-modes"><button id="family-export">Export family reviews</button><button id="family-import">Import family reviews</button></div><input id="family-file" type="file" accept="application/json,.json" hidden><p id="family-feedback" role="status"></p>';
  panel.append(bottom);const $=s=>document.querySelector(s);
  $('#family-variant').onchange=e=>{this.stash();setVariant(e.target.value);};
  $('#family-status').onchange=()=>this.stash();$('#family-notes').oninput=()=>this.stash();
  $('#family-save').onclick=()=>{this.stash();const s=this.readState().specs[this.readState().selected];if(!s)return;this.persist(this.load(s));};
  $('#family-export').onclick=()=>{this.stash();this.download({version:FAMILY_ASSEMBLY_VERSION,reviews:this.readState().specs.map(s=>this.load(s)),publication:false},'Ohneeohnee - Family Reviews.json');};
  $('#family-import').onclick=()=>$('#family-file').click();
  $('#family-file').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>100000)throw Error('Review file is too large');const data=JSON.parse(await file.text()),specs=this.readState().specs;if(data.version!==FAMILY_ASSEMBLY_VERSION||!Array.isArray(data.reviews)||data.reviews.length!==specs.length)throw Error('Wrong family/version or specification count');const accepted=specs.map(spec=>validateFamilyReview(data.reviews.find(r=>r.key===familyReviewKey(spec)),spec));for(const r of accepted){this.pending.set(r.key,r);this.persist(r);}this.update();$('#family-feedback').textContent='Matching family reviews imported. No geometry or catalogue changes.';}catch(error){$('#family-feedback').textContent='Import rejected: '+error.message;}finally{e.target.value='';}};
  $('#family-measure').onclick=async()=>{try{this.timing=await measure();$('#family-timing').textContent=`60 samples per lineup; original ${this.timing.original.medianMs}/${this.timing.original.p95Ms} ms, enhanced ${this.timing.enhanced.medianMs}/${this.timing.enhanced.p95Ms} ms (median/p95). Render + GPU finish; not city FPS.`;}catch(e){$('#family-timing').textContent=e.message;}};
  $('#family-report').onclick=()=>{const state=this.readState();this.download({version:FAMILY_ASSEMBLY_VERSION,seed:state.specs[0].seed,original:lineupMetrics(state.baselines),enhanced:lineupMetrics(state.enhanced),lastRender:state.lastRender,timing:this.timing,buildings:state.enhanced.map(m=>({spec:m.userData.spec,metadata:m.userData.metadata})),publication:false},'Ohneeohnee - Enhanced Family Report.json');};
 }
 load(spec){const key=familyReviewKey(spec);if(this.pending.has(key))return this.pending.get(key);try{const data=localStorage.getItem(key);if(data)return validateFamilyReview(JSON.parse(data),spec);}catch{/* allow portable export when storage is unavailable */}return {version:FAMILY_ASSEMBLY_VERSION,key,status:'unreviewed',notes:''};}
 stash(){if(!this.current)return;const review=validateFamilyReview({version:FAMILY_ASSEMBLY_VERSION,key:familyReviewKey(this.current),status:document.querySelector('#family-status').value,notes:document.querySelector('#family-notes').value},this.current);this.pending.set(review.key,review);}
 invalidateTiming(){this.timing=null;document.querySelector('#family-timing').textContent='Lineup or viewport changed; measure again for matching frame timings.';}
 persist(review){try{localStorage.setItem(review.key,JSON.stringify(review));document.querySelector('#family-feedback').textContent='Review saved on this device. No publication.';}catch{document.querySelector('#family-feedback').textContent='Storage unavailable; export reviews to preserve them.';}}
 update(){
  const state=this.readState(),spec=state.specs[state.selected],$=s=>document.querySelector(s);this.current=spec||null;$('#family-variant').value=state.variant;
  for(const id of ['#family-status','#family-notes','#family-save'])$(id).disabled=!spec;
  const review=spec?this.load(spec):{status:'unreviewed',notes:''};$('#family-status').value=review.status;$('#family-notes').value=review.notes;
  const a=lineupMetrics(state.baselines),b=lineupMetrics(state.enhanced);$('#family-counts').textContent=`Original: ${a.meshes} meshes / ${a.triangles.toLocaleString()} triangles / ${a.materialCount} materials / ${a.textureCount} maps. Enhanced: ${b.meshes} / ${b.triangles.toLocaleString()} / ${b.materialCount} / ${b.textureCount}. Shared map estimate ${(b.textureBytes/1048576).toFixed(2)} MiB.`;
 }
 download(data,name){const link=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
}
