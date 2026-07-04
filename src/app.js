// modgraph — bertie modpack mod map
// Loads the mod dataset and renders a filterable, bucketed view.
// Structure: config → helpers → data loading → filtering → rendering → UI → wiring.

// --- Configuration (data, not logic) ---------------------------------------

const STAGES = {
  S1: { name: 'ADVENTURE', blurb: 'combat · magic · bosses · mining · early Create' },
  S2: { name: 'MACHINES & POWER', blurb: 'ore processing · power · storage grid · semi-auto mining' },
  S3: { name: 'VOID FACTORY', blurb: 'full automation · Modular Machinery · Avaritia infinity · live in the void' },
};
const STAGE_ORDER = ['S1', 'S2', 'S3'];

// Content mods that aren't in a family are grouped by these functional axes.
const AXIS_ORDER = ['combat', 'boss', 'magic', 'dimension', 'material', 'tech', 'storage', 'trinket', 'economy', 'other'];
const AXIS_LABEL = {
  combat: 'Combat — weapons, armor, gear',
  boss: 'Bosses & boss dungeons',
  magic: 'Magic systems & progressions',
  dimension: 'Dimensions & gates',
  material: 'Materials & ore tiers',
  tech: 'Tech, automation & power',
  storage: 'Storage & logistics',
  trinket: 'Power trinkets (curios)',
  economy: 'Economy',
  other: 'Other',
};

// Addon ecosystems fold into one chapter, ordered by stage then prominence.
const FAMILY_ORDER = [
  "Iron's Spells", 'Simply Swords', 'Ice & Fire', 'Twilight Forest', 'Malum',
  'Mekanism', 'Refined Storage', 'EnderIO', 'Oritech',
  'Avaritia / Extended Crafting', 'Modular Machinery',
];

// Fluff / configurations / deconstruct group by these subtypes.
const SUBTYPE_ORDER = [
  'qol', 'ui_info', 'visual', 'audio', 'performance', 'control_dev', 'decoration',
  'structure_only', 'nav_explore', 'movement', 'mob_variety', 'enchant', 'economy',
  'food', 'curios_framework', 'storage', 'asset_donor', 'other',
];
const SUBTYPE_LABEL = {
  qol: 'QoL & convenience',
  ui_info: 'UI, HUD & information',
  visual: 'Visual, animation & audio',
  audio: 'Audio',
  performance: 'Performance & fixes',
  control_dev: 'Control, dev & pack-internals',
  decoration: 'Building & decoration',
  structure_only: 'Structures (structure-only)',
  nav_explore: 'Exploration & navigation',
  movement: 'Movement & transport',
  mob_variety: 'Mob variety & difficulty',
  enchant: 'Enchantments & enchanting',
  economy: 'Economy & trading',
  food: 'Food, farming & cooking',
  curios_framework: 'Curios frameworks',
  storage: 'Storage convenience',
  asset_donor: 'Asset donors',
  other: 'Other',
};

// --- Small helpers ----------------------------------------------------------

const $ = (selector) => document.querySelector(selector);

const escapeHtml = (value) =>
  String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const toggleInSet = (set, value) => (set.has(value) ? set.delete(value) : set.add(value));

// --- Data loading -----------------------------------------------------------
// The single-file build inlines the dataset as <script id="mod-data">; when the
// modular source is served directly, we fetch data.json instead.

async function loadData() {
  const inline = document.getElementById('mod-data');
  if (inline) return JSON.parse(inline.textContent);
  const response = await fetch('./data.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Could not load mod data (HTTP ${response.status}).`);
  return response.json();
}

// --- State ------------------------------------------------------------------

const state = {
  query: '',
  bucket: 'content',
  stages: new Set(),   // active stage filters (content bucket only)
  axes: new Set(),     // active axis / subtype filters
  flaggedOnly: false,
};

// --- Filtering --------------------------------------------------------------

function matches(mod) {
  if (state.bucket !== 'all' && mod.bucket !== state.bucket) return false;
  if (state.flaggedOnly && !mod.flag) return false;
  if (state.bucket === 'content' && state.stages.size && !state.stages.has(mod.stage)) return false;
  if (state.axes.size && !state.axes.has(mod.axis)) return false;
  if (state.query) {
    const haystack = `${mod.slug} ${mod.adds} ${mod.note} ${mod.flag} ${mod.family}`.toLowerCase();
    if (!haystack.includes(state.query)) return false;
  }
  return true;
}

// --- Rendering (build HTML strings; the DOM is written once per render) ------

function rowHtml(mod) {
  const isContent = mod.bucket === 'content';
  const rowClass = isContent ? mod.stage.toLowerCase()
    : mod.bucket === 'deconstruct' ? 'deconstruct' : 'fluff';

  const tags = [`<span class="slug">${escapeHtml(mod.slug)}</span>`];
  if (mod.stage) tags.push(`<span class="span ${mod.stage.toLowerCase()}">${mod.stage}</span>`);
  if (mod.axis) tags.push(`<span class="tag-axis">${escapeHtml(mod.axis)}</span>`);
  if (mod.family) tags.push(`<span class="tag-family">${escapeHtml(mod.family)}</span>`);
  if (mod.flag) tags.push('<span class="tag-flag">⚠ CHECK</span>');
  if (mod.conf === 'low') tags.push('<span class="conf">low-conf</span>');

  let html = `<article class="row ${rowClass}"><div class="row-top">${tags.join('')}</div>`;
  html += `<p class="adds">${escapeHtml(mod.adds)}</p>`;
  if (mod.note) html += `<p class="note"><b>note:</b> ${escapeHtml(mod.note)}</p>`;
  if (mod.flag) html += `<p class="flag-line"><span class="w">CHECK</span>${escapeHtml(mod.flag)}</p>`;
  return `${html}</article>`;
}

function groupHtml(title, mods, blurb = '') {
  const blurbHtml = blurb ? `<span class="gd">${escapeHtml(blurb)}</span>` : '';
  return `<section class="group"><h3>${escapeHtml(title)}${blurbHtml}<span class="gc">${mods.length}</span></h3>`
    + `<div class="rows">${mods.map(rowHtml).join('')}</div></section>`;
}

// Content bucket: grouped by stage, then families, then standalone axes.
function contentHtml(mods) {
  let html = '';
  for (const stage of STAGE_ORDER) {
    const inStage = mods.filter((m) => m.stage === stage);
    if (!inStage.length) continue;

    const { name, blurb } = STAGES[stage];
    html += `<section class="group"><h3>`
      + `<span class="sc" style="color:var(--${stage.toLowerCase()})">${stage}</span> ${name}`
      + `<span class="gd">${blurb}</span><span class="gc">${inStage.length}</span></h3>`;

    for (const family of FAMILY_ORDER) {
      const members = inStage.filter((m) => m.family === family);
      if (!members.length) continue;
      html += `<div class="family-head">⚙ ${escapeHtml(family)}<span class="fc">family · ${members.length}</span></div>`;
      html += `<div class="rows">${members.map(rowHtml).join('')}</div>`;
    }

    const standalone = inStage.filter((m) => !m.family);
    for (const axis of AXIS_ORDER) {
      const inAxis = standalone.filter((m) => m.axis === axis);
      if (!inAxis.length) continue;
      html += `<div class="axis-head">${escapeHtml(AXIS_LABEL[axis] || axis)}</div>`;
      html += `<div class="rows">${inAxis.map(rowHtml).join('')}</div>`;
    }
    html += '</section>';
  }
  return html;
}

// Fluff / configurations / deconstruct: grouped by subtype, with a catch-all.
function bySubtypeHtml(mods) {
  const seen = new Set();
  let html = '';
  for (const subtype of SUBTYPE_ORDER) {
    const inSubtype = mods.filter((m) => m.axis === subtype);
    if (!inSubtype.length) continue;
    seen.add(subtype);
    html += groupHtml(SUBTYPE_LABEL[subtype] || subtype, inSubtype);
  }
  const rest = mods.filter((m) => !seen.has(m.axis));
  if (rest.length) html += groupHtml('Other', rest);
  return html;
}

function allBucketsHtml(mods) {
  let html = contentHtml(mods.filter((m) => m.bucket === 'content'));
  const sections = [
    ['fluff', 'Fluff — adds tangible objects'],
    ['configurations', 'Configurations — behaviour/visual only'],
    ['deconstruct', 'Deconstruct — asset donors, not shipped'],
  ];
  for (const [bucket, title] of sections) {
    const group = mods.filter((m) => m.bucket === bucket);
    if (group.length) html += groupHtml(title, group);
  }
  return html;
}

function render() {
  const visible = DATA.filter(matches);
  refs.count.innerHTML = `<b>${visible.length}</b> / ${DATA.length}`;

  let html;
  if (state.bucket === 'content') html = contentHtml(visible);
  else if (state.bucket === 'deconstruct') html = groupHtml('Asset donors — harvested for assets, NOT shipped in the pack', visible);
  else if (state.bucket === 'all') html = allBucketsHtml(visible);
  else html = bySubtypeHtml(visible); // fluff, configurations

  refs.list.innerHTML = html || '<p class="empty">no mods match — clear a filter</p>';
}

// --- UI construction --------------------------------------------------------

function countBy(key, predicate = () => true) {
  const counts = {};
  for (const mod of DATA) {
    if (!predicate(mod)) continue;
    const value = mod[key];
    counts[value] = (counts[value] || 0) + 1;
  }
  return counts;
}

function buildDistribution() {
  const counts = countBy('stage', (m) => m.bucket === 'content');
  refs.dist.innerHTML = STAGE_ORDER.map((stage) => {
    const n = counts[stage] || 0;
    return `<button type="button" class="seg ${stage.toLowerCase()}" data-stage="${stage}" style="flex:${n || 0.5}" title="${STAGES[stage].name}">`
      + `<span class="n">${n}</span><span class="l">${stage} ${STAGES[stage].name}</span></button>`;
  }).join('');
}

function buildLegend() {
  const byBucket = countBy('bucket');
  const familyCount = new Set(DATA.filter((m) => m.family).map((m) => m.family)).size;
  const legend = [
    ['var(--s3)', byBucket.content || 0, 'content'],
    ['#3c3d4e', byBucket.fluff || 0, 'fluff'],
    ['var(--border-strong)', byBucket.configurations || 0, 'configurations'],
    ['var(--dc)', byBucket.deconstruct || 0, 'deconstruct'],
    ['var(--warn)', familyCount, 'families folded'],
  ];
  refs.ovmeta.innerHTML = legend
    .map(([color, n, label]) => `<span><span class="dot" style="background:${color}"></span><b>${n}</b> ${label}</span>`)
    .join('');
}

function buildStageChips() {
  refs.stageChips.innerHTML = STAGE_ORDER
    .map((stage) => `<button type="button" class="chip stage ${stage.toLowerCase()}" data-stage="${stage}">${stage} · ${STAGES[stage].name}</button>`)
    .join('');
}

// Axis/subtype chips depend on the active bucket; rebuilt on every bucket switch.
function buildAxisChips() {
  const pool = state.bucket === 'all' ? DATA : DATA.filter((m) => m.bucket === state.bucket);
  const counts = countBy('axis', (m) => pool.includes(m));

  let order;
  if (state.bucket === 'content') order = AXIS_ORDER;
  else if (state.bucket === 'all') order = [...new Set([...AXIS_ORDER, ...SUBTYPE_ORDER])];
  else order = SUBTYPE_ORDER;
  const labels = { ...AXIS_LABEL, ...SUBTYPE_LABEL };

  const chips = order
    .filter((axis) => counts[axis])
    .map((axis) => `<button type="button" class="chip axis" data-axis="${axis}">${escapeHtml(labels[axis] || axis)}<span class="cn">${counts[axis]}</span></button>`);

  const flaggedCount = pool.filter((m) => m.flag).length;
  chips.push(`<button type="button" class="chip flag" data-flag="1">⚠ flagged<span class="cn">${flaggedCount}</span></button>`);

  refs.axisChips.innerHTML = chips.join('');
  state.axes.clear();
  state.flaggedOnly = false;
}

function setBucket(bucket) {
  state.bucket = bucket;
  for (const button of refs.bucketToggle.querySelectorAll('button')) {
    button.classList.toggle('on', button.dataset.bucket === bucket);
  }
  refs.stageChips.hidden = bucket !== 'content';
  buildAxisChips();
  render();
}

function syncStageChips() {
  for (const chip of refs.stageChips.querySelectorAll('.chip')) {
    chip.classList.toggle('on', state.stages.has(chip.dataset.stage));
  }
}

// --- Event wiring (delegated) ----------------------------------------------

function wireEvents() {
  refs.search.addEventListener('input', () => {
    state.query = refs.search.value.trim().toLowerCase();
    render();
  });

  refs.bucketToggle.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (button) setBucket(button.dataset.bucket);
  });

  refs.stageChips.addEventListener('click', (event) => {
    const chip = event.target.closest('.chip');
    if (!chip) return;
    toggleInSet(state.stages, chip.dataset.stage);
    chip.classList.toggle('on');
    render();
  });

  refs.axisChips.addEventListener('click', (event) => {
    const chip = event.target.closest('.chip');
    if (!chip) return;
    if (chip.dataset.flag) {
      state.flaggedOnly = !state.flaggedOnly;
      chip.classList.toggle('on', state.flaggedOnly);
    } else {
      toggleInSet(state.axes, chip.dataset.axis);
      chip.classList.toggle('on');
    }
    render();
  });

  refs.dist.addEventListener('click', (event) => {
    const segment = event.target.closest('.seg');
    if (!segment) return;
    if (state.bucket !== 'content') setBucket('content');
    toggleInSet(state.stages, segment.dataset.stage);
    syncStageChips();
    render();
    $('.ctrl').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// --- Bootstrap --------------------------------------------------------------

const refs = {
  dist: $('#dist'),
  ovmeta: $('#ovmeta'),
  bucketToggle: $('#bucket-toggle'),
  stageChips: $('#stage-chips'),
  axisChips: $('#axis-chips'),
  search: $('#search'),
  count: $('#count'),
  list: $('#list'),
};

const DATA = await loadData();

buildDistribution();
buildLegend();
buildStageChips();
buildAxisChips();
wireEvents();
render();
