// Office zoning is authored here, then embedded into the recovered runtime.
// No remote models, textures, or runtime dependencies are required.
function pcOfficeHash(value) {
  let hash = 2166136261;
  for (const character of value) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
}

// Dimensions are game-design interpretations of published floor-plate areas,
// not claims about measured dimensions of the reference buildings.
// See docs/OFFICE_FOOTPRINT_REFERENCES.md for primary sources and conversions.
const pcOfficeProfiles = Object.freeze([
  { id: 'compact-modernist', style: 'modernist', width: 32, depth: 30, minFloors: 10, maxFloors: 24 },
  { id: 'midrise-modernist', style: 'modernist', width: 40, depth: 36, minFloors: 15, maxFloors: 40 },
  { id: 'international-court', style: 'international', width: 44, depth: 44, minFloors: 25, maxFloors: 60 },
  { id: 'international-tower', style: 'international', width: 54, depth: 58, minFloors: 40, maxFloors: 80 },
  { id: 'deco-midrise', style: 'art-deco', width: 42, depth: 44, minFloors: 15, maxFloors: 40 },
  { id: 'deco-tower', style: 'art-deco', width: 56, depth: 54, minFloors: 35, maxFloors: 80 }
]);

function pcOfficeSpec(key, area, profile = null) {
  const seed = pcOfficeHash(key);
  const capacity = Math.min(profile?.maxFloors || 80, area < 1200 ? 24 : area < 1800 ? 40 : area < 2500 ? 60 : 80);
  const minimum = Math.min(capacity, profile?.minFloors || 10);
  return {
    style: profile?.style || ['art-deco', 'international', 'modernist'][seed % 3],
    palette: (seed >>> 8) % 4,
    variant: pcOfficeHash(key + ':massing') % 6,
    floors: minimum + pcOfficeHash(key + ':height') % (capacity - minimum + 1),
    floorHeight: 3.9
  };
}

const pcOfficePlotCache = new WeakMap;
function pcOfficePlots(network, landmarks = []) {
  const terrain = network.terrain;
  const boundsKey = JSON.stringify(Gi(network));
  const landmarkKey = JSON.stringify(landmarks.map(item => [item.id, item.x, item.z, item.rotation]));
  const cache = pcOfficePlotCache.get(network);
  if (cache && cache.revision === network.revision && cache.terrain === terrain && cache.heightAt === terrain?.heightAt && cache.terrainRevision === (terrain?.revision || 0) && cache.boundsKey === boundsKey && cache.landmarkKey === landmarkKey) return cache.plots;
  const mask = Yb(network), plots = [], cells = new Map;
  const buildable = je(Od(network), ve([...mask.paths, ...landmarks.flatMap(Gb)]));
  const heightAt = (x, z) => terrain?.heightAt(x, z) || 0;
  function eachCell(bounds, visit) {
    for (let x = Math.floor((bounds.minX - 2) / 64); x <= Math.floor((bounds.maxX + 2) / 64); x++)
      for (let z = Math.floor((bounds.minZ - 2) / 64); z <= Math.floor((bounds.maxZ + 2) / 64); z++) visit(x + ':' + z);
  }
  for (const road of [...network.roads].filter(Gc).sort((a, b) => a.id - b.id)) {
    const sample = Hn(Qo(road)), roadWidth = Ut(road.typeId).width;
    for (const side of [-1, 1]) {
      let cursor = 8, slot = 0;
      while (cursor + 32 < sample.length - 8) {
        const seed = pcOfficeHash(road.id + ':' + side + ':' + slot++);
        const preferred = pcOfficeProfiles[seed % pcOfficeProfiles.length];
        const profiles = [preferred, ...pcOfficeProfiles.filter(profile => profile !== preferred).sort((a, b) => b.width * b.depth - a.width * a.depth)];
        let placed = null;
        for (const profile of profiles) {
          if (cursor + profile.width > sample.length - 8) continue;
          const station = cursor + profile.width / 2, point = sample.at(station);
          if (Math.abs(ft(point)) > .2) continue;
          const normal = { x: -point.dz * side, z: point.dx * side };
          const front = { x: point.x + normal.x * (roadWidth / 2 + 3.5), z: point.z + normal.z * (roadWidth / 2 + 3.5) };
          const at = (x, z) => ({ x: front.x + point.dx * x + normal.x * z, z: front.z + point.dz * x + normal.z * z });
          const footprint = [at(-profile.width / 2, 0), at(profile.width / 2, 0), at(profile.width / 2, profile.depth), at(-profile.width / 2, profile.depth)];
          const paths = Te(footprint), area = profile.width * profile.depth, bounds = En(footprint);
          if (sn(Ee(paths, buildable)) < area - .02) continue;
          const neighbours = new Set;
          eachCell(bounds, key => { for (const plot of cells.get(key) || []) neighbours.add(plot); });
          if ([...neighbours].some(plot => sn(Ee(paths, plot.clearance)) > .001)) continue;
          const heights = [];
          for (let x = 0; x <= 4; x++) for (let z = 0; z <= 4; z++) {
            const p = at((x / 4 - .5) * profile.width, z / 4 * profile.depth);
            heights.push(heightAt(p.x, p.z));
          }
          const low = Math.min(...heights), high = Math.max(...heights);
          if (terrain && (low < 1.4 || high - low > 3.6)) continue;
          const centre = at(0, profile.depth / 2);
          const id = `office-plot:${road.id}:${side}:${station.toFixed(2)}:${profile.id}`;
          placed = {
            id, zone: 'offices', roadId: road.id, side, station, footprint, bounds, area,
            x: centre.x, z: centre.z, y: high + .57, ground: low,
            foundationDepth: high - low + .75, entrance: { ...front, y: heightAt(front.x, front.z) },
            towardRoad: { x: -normal.x, z: -normal.z }, rotation: Math.atan2(-point.dz, point.dx),
            variation: (seed >>> 8) / 0x1000000, frontage: profile.width, depth: profile.depth, officeProfile: profile
          };
          placed.signature = JSON.stringify([id, footprint, placed.y, low]);
          placed.clearance = Bo(paths, 2);
          plots.push(placed);
          eachCell(bounds, key => { if (!cells.has(key)) cells.set(key, []); cells.get(key).push(placed); });
          cursor += profile.width + 4;
          break;
        }
        if (!placed) cursor += 12;
      }
    }
  }
  pcOfficePlotCache.set(network, { revision: network.revision, terrain, heightAt: terrain?.heightAt, terrainRevision: terrain?.revision || 0, boundsKey, landmarkKey, plots });
  return plots;
}

function pcActiveProperties(collection) {
  const stable=pcLandmarkProperties(collection);
  collection.pcResidentialProperties = stable.residential;
  collection.pcOfficeProperties = stable.offices;
  return collection.propertyZone === 'offices' ? collection.pcOfficeProperties : collection.pcResidentialProperties;
}

function pcOfficeSelection(collection, properties, zone) {
  collection.setPropertyZone(zone);
  if (properties.every(property => property.zone === zone)) return properties;
  const selected = ve(properties.flatMap(Ip));
  return collection.properties.filter(property => sn(Ee(Ip(property), selected)) > .01);
}

function pcResolveOfficeConflicts(collection, regions, selected, zone, erase) {
  if (erase) return;
  const other = zone === 'offices' ? 'rowhouses' : 'offices';
  if (!regions[other]?.length) return;
  const candidates = other === 'offices' ? collection.pcOfficeProperties : collection.pcResidentialProperties;
  const conflicts = candidates.filter(property => sn(Ee(Ip(property), selected)) > .01);
  if (conflicts.length) regions[other] = je(regions[other], ve(conflicts.flatMap(Ip)));
}

function pcOfficeParcels(properties, collection) {
  return properties.map(property => {
    const key = property.id, area = property.area;
    let spec = pcOfficeSpec(key, area, property.officeProfile);
    if(collection)spec=pcCatalogueSpec(collection,property,spec);
    const building = {
      ...property, id: 'office:' + key, propertyIds: [property.id],
      floors: spec.floors, height: spec.floors * spec.floorHeight, office: spec
    };
    building.signature = JSON.stringify([key, property.footprint, building.y, building.ground, spec]);
    return building;
  });
}

function pcZonedBuildings(collection) {
  const homes = [], offices = [];
  for (const property of collection.pcResidentialProperties || collection.properties) {
    if (collection.suppressed.has(property.id)) continue;
    const anchor = Lp(property);
    if (Vb(collection.regions.rowhouses || [], anchor)) homes.push(property);
  }
  for (const property of collection.pcOfficeProperties || []) {
    if (!collection.suppressed.has(property.id) && sn(Ee(Ip(property), collection.regions.offices || [])) >= property.area - .02) offices.push(property);
  }
  return [...homes, ...pcOfficeParcels(offices,collection)].filter(building => !collection.suppressed.has(building.id));
}

function pcSuppressOffice(collection, building) {
  for (const id of building.propertyIds || []) {
    const property = collection.propertyById.get(id) || collection.pcOfficeProperties?.find(item => item.id === id);
    if (property) collection.suppressed.set(id, Lp(property));
  }
}

function pcOfficeTiers(building) { return building.office.catalogueId?pcCatalogueTiers(building):pcDetailedOfficeTiers(building); }

const pcOfficeMaterialCache = new Map;
function pcOfficeMaterials(spec) { return pcDetailedOfficeMaterials(spec); }

function pcOfficeWalls(footprint, y, height, floorHeight) {
  const geometry = Ql(footprint, y, height, { top: false, bottom: false });
  const position = geometry.attributes.position, normal = geometry.attributes.normal, uv = geometry.attributes.uv;
  for (let vertex = 0; vertex < position.count; vertex++) {
    uv.setXY(vertex, (-position.getX(vertex) * normal.getZ(vertex) + position.getZ(vertex) * normal.getX(vertex)) / 12,
      (position.getY(vertex) - y) / (floorHeight * 8));
  }
  return geometry;
}

function pcRenderOffice(building, addGeometry, addBox, statistics) { return pcDetailedOfficeRender(building, addGeometry, addBox, statistics); }

function pcInitZoneTabs(container) {
  const tabs = [...container.querySelectorAll('[data-zone]')];
  for (const tab of tabs) tab.addEventListener('keydown', event => {
    const index = tabs.indexOf(tab);
    const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
    if (next === null) return;
    event.preventDefault(); event.stopPropagation(); tabs[next].focus(); tabs[next].click();
  });
}
