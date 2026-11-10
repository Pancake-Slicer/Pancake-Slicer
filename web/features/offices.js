// Office zoning is authored here, then embedded into the recovered runtime.
// No remote models, textures, or runtime dependencies are required.
function pcOfficeHash(value) {
  let hash = 2166136261;
  for (const character of value) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function pcOfficeSpec(key, area) {
  const seed = pcOfficeHash(key);
  const capacity = area < 180 ? 20 : area < 350 ? 35 : area < 650 ? 55 : 80;
  return {
    style: ['art-deco', 'international', 'modernist'][seed % 3],
    palette: (seed >>> 8) % 4,
    floors: 10 + pcOfficeHash(key + ':height') % (capacity - 9),
    floorHeight: 3.9
  };
}

function pcOfficeParcels(properties) {
  const sorted = [...properties].sort((a, b) => a.roadId - b.roadId || a.side - b.side || a.station - b.station || a.id.localeCompare(b.id));
  const groups = [];
  for (const property of sorted) {
    const previous = groups.at(-1);
    let joined = null;
    if (previous && previous.roadId === property.roadId && previous.side === property.side) {
      const bounds = En([...previous.footprint, ...property.footprint]);
      const heights = [...previous.members, property].map(member => member.y);
      if (Math.max(bounds.maxX - bounds.minX, bounds.maxZ - bounds.minZ) <= 65 &&
          Math.max(...heights) - Math.min(...heights) <= 2 &&
          sn(Ee(Bo(Te(previous.footprint), .12), Te(property.footprint))) > .001) {
        const union = ve([...Te(previous.footprint), ...Te(property.footprint)]);
        const candidates = xn(Bo(Bo(union, .07), -.07));
        if (candidates.length === 1 && !candidates[0].holes.length && sn(Te(candidates[0].outer)) <= 2000) joined = candidates[0].outer;
      }
    }
    if (joined) {
      previous.footprint = joined;
      previous.members.push(property);
    } else groups.push({ roadId: property.roadId, side: property.side, footprint: property.footprint, members: [property] });
  }
  return groups.map(group => {
    const members = group.members;
    const key = members.map(member => member.id).sort().join('|');
    const area = sn(Te(group.footprint));
    const spec = pcOfficeSpec(key, area);
    const entry = members[Math.floor(members.length / 2)];
    const building = {
      ...entry, id: 'office:' + key, propertyIds: members.map(member => member.id),
      zone: 'offices', footprint: group.footprint, bounds: En(group.footprint), area,
      ground: Math.min(...members.map(member => member.ground)), y: Math.max(...members.map(member => member.y)),
      x: group.footprint.reduce((sum, point) => sum + point.x, 0) / group.footprint.length,
      z: group.footprint.reduce((sum, point) => sum + point.z, 0) / group.footprint.length,
      floors: spec.floors, height: spec.floors * spec.floorHeight, office: spec
    };
    building.signature = JSON.stringify([key, group.footprint, building.y, building.ground, spec]);
    return building;
  });
}

function pcZonedBuildings(collection) {
  const homes = [], offices = [];
  for (const property of collection.properties) {
    if (collection.suppressed.has(property.id)) continue;
    const anchor = Lp(property);
    if (Vb(collection.regions.offices || [], anchor)) offices.push(property);
    else if (Vb(collection.regions.rowhouses || [], anchor)) homes.push(property);
  }
  return [...homes, ...pcOfficeParcels(offices)].filter(building => !collection.suppressed.has(building.id));
}

function pcSuppressOffice(collection, building) {
  for (const id of building.propertyIds || []) {
    const property = collection.propertyById.get(id);
    if (property) collection.suppressed.set(id, Lp(property));
  }
}

function pcOfficeTiers(building) {
  const floors = building.floors;
  const deco = building.office.style === 'art-deco';
  const base = deco ? Math.floor(floors * .55) : Math.max(2, Math.floor(floors * .15));
  const middle = deco ? Math.floor(floors * .27) : floors - base;
  const counts = deco ? [base, middle, floors - base - middle] : [base, middle];
  const centre = cS(building.footprint);
  const setback = (centre?.clearance || 1) * (deco ? .55 : building.office.style === 'international' ? .3 : .18);
  let y = building.y, outline = building.footprint;
  return counts.map((count, index) => {
    if (index) {
      const inset = setback * index / (counts.length - 1);
      const candidates = xn(Ee(Bo(Te(building.footprint), -inset), Te(building.footprint)))
        .filter(part => !part.holes.length && sn(Te(part.outer)) > 12)
        .sort((a, b) => sn(Te(b.outer)) - sn(Te(a.outer)));
      if (candidates.length) outline = candidates[0].outer;
    }
    const tier = { footprint: outline, y, height: count * building.office.floorHeight, floors: count };
    y += tier.height;
    return tier;
  });
}

const pcOfficeMaterialCache = new Map;
function pcOfficeMaterials(spec) {
  const key = spec.style + ':' + spec.palette;
  if (pcOfficeMaterialCache.has(key)) return pcOfficeMaterialCache.get(key);
  const colours = {
    'art-deco': ['#c9b997', '#b8ad98', '#a97859', '#d2c9b5'],
    international: ['#527888', '#6c7e84', '#796b57', '#3d535d'],
    modernist: ['#b9b8ab', '#d2d1c5', '#9daba9', '#a69d8c']
  };
  const colour = colours[spec.style][spec.palette];
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const context = canvas.getContext('2d');
  context.fillStyle = colour; context.fillRect(0, 0, 256, 256);
  if (spec.style === 'art-deco') {
    context.fillStyle = '#263d49'; context.fillRect(58, 36, 140, 188);
    context.fillStyle = '#65808b'; context.fillRect(66, 42, 56, 168);
    context.fillStyle = '#93866b'; context.fillRect(122, 36, 8, 188);
    context.fillStyle = '#e4d6b9'; context.fillRect(8, 0, 20, 256); context.fillRect(228, 0, 12, 256);
    context.fillStyle = '#80755f'; context.fillRect(32, 240, 192, 8);
  } else if (spec.style === 'international') {
    context.fillStyle = '#97adb3'; context.fillRect(12, 12, 100, 228);
    context.fillStyle = '#416372'; context.fillRect(132, 12, 110, 228);
    context.fillStyle = '#c7cecb'; context.fillRect(0, 0, 7, 256); context.fillRect(124, 0, 6, 256); context.fillRect(0, 0, 256, 7);
    context.fillStyle = '#293c44'; context.fillRect(7, 230, 249, 26);
  } else {
    context.fillStyle = '#243d46'; context.fillRect(0, 66, 256, 158);
    context.fillStyle = '#729096'; context.fillRect(8, 74, 112, 135);
    context.fillStyle = '#3e6069'; context.fillRect(136, 74, 112, 135);
    context.fillStyle = '#e2e0d3'; context.fillRect(0, 12, 256, 14);
    context.fillStyle = '#797d76'; context.fillRect(0, 224, 256, 12);
  }
  const texture = new vr(canvas);
  texture.colorSpace = hn; texture.wrapS = texture.wrapT = gr; texture.anisotropy = 4;
  const materials = {
    facade: Ji({ color: 0xffffff, map: texture }),
    stone: Ji({ color: colour }),
    roof: Ji({ color: 0x4d575a }),
    glass: Ji({ color: 0x294651 }),
    trim: Ji({ color: spec.style === 'art-deco' ? 0xd8c69b : 0xaab5b7 })
  };
  pcOfficeMaterialCache.set(key, materials);
  return materials;
}

function pcOfficeWalls(footprint, y, height, floorHeight) {
  const geometry = Ql(footprint, y, height, { top: false, bottom: false });
  const position = geometry.attributes.position, normal = geometry.attributes.normal, uv = geometry.attributes.uv;
  for (let vertex = 0; vertex < position.count; vertex++) {
    uv.setXY(vertex, (-position.getX(vertex) * normal.getZ(vertex) + position.getZ(vertex) * normal.getX(vertex)) / 3,
      (position.getY(vertex) - y) / floorHeight);
  }
  return geometry;
}

function pcRenderOffice(building, addGeometry, addBox, statistics) {
  const materials = pcOfficeMaterials(building.office);
  addGeometry(Ql(building.footprint, building.ground - .18, building.y - building.ground + .18, { top: false }), materials.stone, building.id);
  const tiers = pcOfficeTiers(building);
  for (const tier of tiers) {
    addGeometry(pcOfficeWalls(tier.footprint, tier.y, tier.height, building.office.floorHeight), materials.facade, building.id);
    addGeometry(Ql(tier.footprint, tier.y + tier.height, .16, { bottom: false }), materials.roof, building.id);
    const ring = tier.footprint;
    const orientation = Math.sign(ring.reduce((sum, point, i) => sum + point.x * ring[(i + 1) % ring.length].z - ring[(i + 1) % ring.length].x * point.z, 0));
    for (let edge = 0; edge < ring.length; edge++) {
      const a = ring[edge], b = ring[(edge + 1) % ring.length];
      const dx = b.x - a.x, dz = b.z - a.z, length = Math.hypot(dx, dz);
      statistics.windows += Math.floor(length / 3) * tier.floors * 2;
      if (building.office.style !== 'art-deco' || length < 3) continue;
      const bays = Math.min(8, Math.max(1, Math.floor(length / 3.8)));
      for (let bay = 0; bay <= bays; bay++) {
        const t = bay / bays;
        addBox({ x: a.x + dx * t + orientation * dz / length * .08, y: tier.y + tier.height / 2, z: a.z + dz * t - orientation * dx / length * .08 },
          .2, tier.height, .18, Math.atan2(-dz, dx), materials.trim, building.id);
      }
    }
  }
  const front = building.towardRoad, entry = building.entrance;
  addBox({ x: entry.x + front.x * .12, y: building.y + 2, z: entry.z + front.z * .12 }, 2.4, 4, .22, Math.atan2(front.x, front.z), materials.glass, building.id);
  const top = tiers.at(-1), centre = cS(top.footprint);
  if (centre?.clearance > 1.5) {
    const size = Math.min(3, centre.clearance * .65);
    addBox({ x: centre.x, y: building.y + building.height + .65, z: centre.z }, size, 1, size, 0, materials.trim, building.id);
  }
}

function pcInitZoneTabs(container) {
  const tabs = [...container.querySelectorAll('[data-zone]')];
  for (const tab of tabs) tab.addEventListener('keydown', event => {
    const index = tabs.indexOf(tab);
    const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
    if (next === null) return;
    event.preventDefault(); event.stopPropagation(); tabs[next].focus(); tabs[next].click();
  });
}
