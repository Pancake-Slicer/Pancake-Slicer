const fs = require('node:fs');
const path = require('node:path');
function applyOfficeZoning(source) {
  const replace = (before, after) => {
    if (source.split(before).length !== 2) throw Error(`Expected one office patch location: ${before.slice(0, 100)}`);
    source = source.replace(before, () => after);
  };
  const helpers = fs.readFileSync(path.join(__dirname, '../web/features/offices.js'), 'utf8') + '\n' + fs.readFileSync(path.join(__dirname, '../web/features/office-architecture.js'), 'utf8');
  replace('const vi=Object.freeze([{id:"rowhouses",name:"Brick rowhouses",color:7911573,description:"Attached 2–3 storey homes · narrow frontage"}])',
    helpers + '\nconst vi=Object.freeze([{id:"rowhouses",name:"Brick rowhouses",color:7911573,description:"Attached 2–3 storey homes · narrow frontage"},{id:"offices",name:"Office",color:5486785,description:"Art Deco · International · Modernist · 10–80 storeys"}])');
  // Keep the original property layout independent of the selected zone type.
  replace('g=Object.fromEntries(vi.map(y=>[y.id,Od(e)])),m=Wb', 'g={rowhouses:Od(e)},m=Wb');
  replace('class qb{constructor', 'class qb{setPropertyZone(zone){if(!vi.some(type=>type.id===zone))return false;this.propertyZone=zone;this.syncProperties();this.rebuild();return true}constructor');
  replace('const t=Zb(this.network,this.landmarks.items);if(t===this.properties)', 'const t=pcActiveProperties(this);if(t===this.properties)');
  replace('const s=ve(t.flatMap(Ip)),r={};', 't=pcOfficeSelection(this,t,e);if(!t.length)return false;const s=ve(t.flatMap(Ip)),r={};');
  replace('const o=new Set(t.map(l=>l.id)),a=!i', 'pcResolveOfficeConflicts(this,r,s,e,i);const o=new Set(t.map(l=>l.id)),a=!i');
  replace('this.syncProperties(),t=t.filter((l,c)=>', 'this.setPropertyZone(i),this.syncProperties(),t=t.filter((l,c)=>');
  replace('if(!t)return!1;this.syncProperties();const s=typeof t=="string"', 'if(!t)return!1;this.setPropertyZone(e);this.syncProperties();const s=typeof t=="string"');
  replace('r=this.properties.filter(o=>!this.suppressed.has(o.id)&&Vb(this.regions[o.zone],Lp(o)))', 'r=pcZonedBuildings(this)');
  replace('this.regions=i?.regions??Object.fromEntries(vi.map(r=>[r.id,[]]))', 'this.regions=Object.fromEntries(vi.map(r=>[r.id,i?.regions?.[r.id]??[]]))');
  replace('this.suppressed.set(t,Lp(e)),this.revision++', 'pcSuppressOffice(this,e),this.suppressed.set(t,Lp(e)),this.revision++');
  replace('homes:this.buildings.length,paintedArea:', 'offices:this.buildings.filter(t=>t.zone==="offices").length,homes:this.buildings.filter(t=>t.zone==="rowhouses").length,paintedArea:');
  replace('for(const J of R){const at=Math.floor(J.variation', 'for(const J of R){if(J.zone==="offices"){pcRenderOffice(J,B,U,F);continue}const at=Math.floor(J.variation');
  replace('R.y+R.height+1.5,Math.max(...R.footprint', 'R.y+R.height+(R.zone==="offices"?8:1.5),Math.max(...R.footprint');
  replace('ZONING / NORTHEASTERN US', 'ZONING / NORTH AMERICA');
  replace('<div class="zoning-options">${vi.map', '<div class="zoning-options"><div class="zoning-tabs" role="tablist" aria-label="Zone type">${vi.map');
  replace('<button data-zone="${D.id}" aria-pressed="${D.id==="rowhouses"}">', '<button data-zone="${D.id}" role="tab" aria-selected="${D.id==="rowhouses"}" tabindex="${D.id==="rowhouses"?0:-1}" aria-pressed="${D.id==="rowhouses"}">');
  replace('.join("")}<label data-zone-brush>', '.join("")}</div><label data-zone-brush>');
  replace('<p>Property lines show the exact future building footprint.', '<p id="zoning-type-help">Property lines show the exact future building footprint.');
  replace('${D.rowhouses} rowhouses · ${(D.paintedArea/1e4)', '${D.rowhouses} rowhouses · ${D.offices} offices · ${(D.paintedArea/1e4)');
  replace('n.querySelectorAll("[data-zone]").forEach(N=>N.setAttribute("aria-pressed",String(N===D)))', 'e.setPropertyZone(c),b(),n.querySelectorAll("[data-zone]").forEach(N=>{N.setAttribute("aria-pressed",String(N===D));N.setAttribute("aria-selected",String(N===D));N.tabIndex=N===D?0:-1}),n.querySelector("#zoning-type-help").textContent=c==="offices"?"Office plots are 32–56 m wide and 30–58 m deep. Paint or bucket-fill these larger sites for 10–80-storey offices. Streets must leave room for a full office footprint; shallow sites remain unbuilt.":"Property lines show the future residential footprints. Paint an area or fill one property beside a surface street."');
  replace('return t.canvas.addEventListener("pointerleave",()=>{l&&!f', 'pcInitZoneTabs(n);return t.canvas.addEventListener("pointerleave",()=>{l&&!f');
  replace('(l.zone==="rowhouses"?"brick rowhouse":"apartment building")', '(l.zone==="rowhouses"?"brick rowhouse":l.zone==="offices"?"office tower":"apartment building")');
  return source;
}
module.exports = { applyOfficeZoning };
