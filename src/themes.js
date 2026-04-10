// ============================================================
// Theme system — 3 distinct visual modes
// ============================================================
// Beyond colors, each theme controls RENDERING STYLE:
// - Material type (toon vs PBR)
// - Toon gradient steps (2-step Ghibli vs 3-step Pokemon)
// - Outline thickness and style
// - Cloud shape and scale
// - Ocean wave behavior and rendering
// - Lighting mood
// ============================================================

export const THEME_IDS = {
  POKEMON: 'pokemon',
  ASSASSIN: 'assassin',
  GHIBLI: 'ghibli',
}

// -----------------------------------------------------------
// Pokemon / Animal Crossing — bright pastel toon
// -----------------------------------------------------------
const pokemon = {
  id: THEME_IDS.POKEMON,
  name: 'Pokemon',
  icon: '🎮',

  // --- STYLE ---
  useToonShading: true,
  toonSteps: 3,           // 3-step gradient: bright/mid/shadow
  outlineThickness: 1.0,
  materialRoughness: 0.8, // fallback for standard mat

  // Clouds: round cartoon puffs, medium size
  clouds: {
    main: '#ffffff',
    accent: '#f8f8ff',
    shadow: '#d0d8e0',
    scale: 1.0,           // base cloud size
    puffs: 'cartoon',     // 'cartoon' | 'ghibli' | 'realistic'
    opacity: 1.0,
    speed: 1.0,
  },

  // Scene
  scene: {
    background: '#87CEEB',
    fogColor: '#c8e6f5',
    fogNear: 35,
    fogFar: 90,
  },

  // Lighting: soft golden hour, balanced
  lighting: {
    ambient: { color: '#fff5e6', intensity: 0.7 },
    main: { color: '#fff8e8', intensity: 1.0, position: [8, 14, 5] },
    fill: { color: '#b8d4ff', intensity: 0.35, position: [-6, 8, -6] },
    hemisphere: { sky: '#ffe8c0', ground: '#a0d8a0', intensity: 0.4 },
  },

  sky: {
    zenith: '#7ec8e3',
    mid: '#b8e4f0',
    horizon: '#ffe5c4',
  },

  // Ocean: toon banded, gentle waves, bright caustics
  ocean: {
    deep: '#0891b2',
    mid: '#22d3ee',
    shallow: '#a5f3fc',
    foam: '#e0f7fa',
    waveHeight: 1.0,
    waveSpeed: 1.0,
    causticIntensity: 1.0,
    sparkleIntensity: 1.0,
    toonBanding: true,
    specularSun: false,    // no sun reflection disc
  },

  island: {
    grass: ['#66d962', '#4abb46', '#7ee87a'],
    grassSunny: '#b8e86e',
    sand: '#f5e6c8',
    sandVariant: '#eed9b0',
    cliff: ['#c4a882', '#a08868'],
    underwater: '#8fb8a0',
    outlineColor: '#2a5a2a',
  },

  trees: {
    foliage: ['#4dbd4a', '#5cc85a', '#3da83a', '#68d466'],
    trunk: '#8B6840',
    trunkOutline: '#5a3a20',
    foliageOutline: '#2a6628',
    palmTrunk: '#a07830',
    palmTrunkOutline: '#5a4020',
    palmLeaves: '#48c858',
    coconut: '#6a5030',
  },

  bushes: {
    main: '#4cc050',
    secondary: ['#5ad060', '#42b848'],
    outline: '#2a7030',
  },

  flowers: {
    petals: ['#ff8fa0', '#ffb347', '#fff06a', '#a8d8ff', '#dda0dd', '#ff6b8a', '#87e897'],
    center: '#fff8a0',
    stem: '#5aaa40',
  },

  rocks: { colors: ['#b0a898', '#a8b0a0', '#c0b8a8', '#98a090'] },

  dock: {
    platform: '#c8a060', platformOutline: '#7a5830',
    supports: '#8a6838', mooringPost: '#8a6838', mooringOutline: '#5a3a18',
  },

  sign: {
    post: '#7a5830', postOutline: '#3a2010',
    plankBase: '#c0a070', plankDark: '#8a6840', plankLight: '#d8be90', plankOutline: '#4a2a10',
    textColor: '#1a1008', textOutline: '#3a2818',
  },

  ark: {
    hull: { upper: '#d4985a', mid: '#b87a40', lower: '#8a5a2a', stripe: '#c86840',
            woodBase: '#c8a878', woodDark: '#9a7850', woodLight: '#dcc098' },
    deck: { light: '#dab068', dark: '#c09050',
            woodBase: '#d4b888', woodDark: '#a88a60', woodLight: '#e8d0a8', outline: '#6a4820' },
    walls: { light: '#c89858', dark: '#a07840',
             woodBase: '#c8a878', woodDark: '#9a7850', woodLight: '#dcc098',
             outline: '#3a2010', bowsprit: '#d4985a' },
    cabin: { woodBase: '#c8a878', woodDark: '#9a7a55', woodLight: '#dcc098',
             outline: '#3a2010', windowFrame: '#7a5030', windowGlass: '#78b8d8' },
    roof: { ridge: '#c85a30', eave: '#a84420', outline: '#5a2010' },
    flag: { pole: '#5a3018', poleOutline: '#2a1508', cloth: '#f04838' },
  },

  seagulls: {
    body: '#fafafa', bodyOutline: '#b0b0b0', head: '#ffffff',
    eyes: '#222', beak: '#ffa040', blush: '#ffbbbb',
    wings: '#e8e8f0', tail: '#f0f0f0',
  },

  fish: {
    colors: ['#ff7744', '#ffaa33', '#44bbff', '#ff5588', '#88dd44', '#ffcc00', '#ff6699', '#55ccaa'],
    outline: '#333',
  },

  dolphins: {
    main: '#5a8ab0', dark: '#4a7a9a', light: '#88b8d8',
    belly: '#b0d8e8', accent: '#6898b8', eyes: '#1a2a3a',
  },

  // --- GEOMETRY ---
  geometry: {
    island: {
      heightScale: 1.0,
      topFlatness: 0.12,
      cliffRoughness: 0.06,
    },
    tree: {
      foliageBalls: [
        { offset: [0, 0.8, 0], radius: 0.4 },
        { offset: [0.2, 0.95, 0.1], radius: 0.22 },
        { offset: [-0.15, 0.9, -0.12], radius: 0.18 },
      ],
      trunkHeight: 0.6,
      trunkTopR: 0.05,
      trunkBottomR: 0.08,
    },
    palm: {
      type: 'palm',  // 'palm' | 'olive'
      trunkHeight: 1.2,
      trunkTopR: 0.04,
      trunkBottomR: 0.07,
      trunkCurve: 0,
      leafCount: 6,
      leafLength: 0.55,
      leafDroop: 0.7,
      hasCoconuts: true,
      canopyBalls: null,
    },
    bush: {
      balls: [
        { offset: [0, 0.1, 0], radius: 0.18 },
        { offset: [0.12, 0.14, 0.06], radius: 0.12 },
        { offset: [-0.1, 0.12, -0.05], radius: 0.1 },
      ],
    },
    rocks: { sizeMin: 0.05, sizeMax: 0.13, count: 8, detail: 1 },
    animal: { scale: 1.0, showBlush: true },
    ark: {
      hullPreset: 'round',
      hullWidth: 0.7,
      hullDepth: 0.65,
      wallHeight: 0.36,
      cabinSize: [0.9, 0.5, 1.65],
      cabinY: 0.66,
      roofRadius: 0.45,
      roofLength: 1.7,
      bowspritLength: 0.4,
      bowspritRadius: 0.06,
      flagPoleHeight: 1.1,
    },
  },
}

// -----------------------------------------------------------
// Assassin's Creed Odyssey — photorealistic Mediterranean
// -----------------------------------------------------------
const assassin = {
  id: THEME_IDS.ASSASSIN,
  name: "Assassin's Creed",
  icon: '⚔️',

  // --- STYLE: PBR realistic ---
  useToonShading: false,
  toonSteps: 0,
  outlineThickness: 0,
  materialRoughness: 0.65,

  // Clouds: flat, spread, semi-transparent, warm grey
  clouds: {
    main: '#e8ddd4',
    accent: '#d8cfc4',
    shadow: '#a89880',
    scale: 1.8,           // bigger, flatter
    puffs: 'realistic',
    opacity: 0.75,        // semi-transparent
    speed: 0.5,           // slower drift
  },

  scene: {
    background: '#2a5a8a',
    fogColor: '#7aa0c0',
    fogNear: 50,
    fogFar: 140,
  },

  // Lighting: intense Mediterranean sun — warm gold, harsh shadows
  lighting: {
    ambient: { color: '#d8ccc0', intensity: 0.35 },
    main: { color: '#ffe0a0', intensity: 1.8, position: [12, 20, 6] },
    fill: { color: '#6890b0', intensity: 0.4, position: [-10, 8, -10] },
    hemisphere: { sky: '#6aaad0', ground: '#8a7050', intensity: 0.45 },
  },

  sky: {
    zenith: '#0a3a6a',
    mid: '#2a6a9a',
    horizon: '#c89050',
  },

  // Ocean: deep Aegean, big waves, sun specular, no toon
  ocean: {
    deep: '#08304a',
    mid: '#0a5068',
    shallow: '#1a7888',
    foam: '#b0c8d0',
    waveHeight: 2.0,
    waveSpeed: 0.8,
    causticIntensity: 0.3,
    sparkleIntensity: 2.0,  // strong sun sparkle
    toonBanding: false,
    specularSun: true,       // sun disc reflection
  },

  island: {
    grass: ['#3a6828', '#2a5820', '#4a7830'],  // dark olive
    grassSunny: '#7a9840',                       // dried golden
    sand: '#c8b890',                             // warm golden sand
    sandVariant: '#b8a878',
    cliff: ['#c8c0b0', '#a89880'],              // white limestone
    underwater: '#3a5a48',
    outlineColor: 'none',
  },

  trees: {
    foliage: ['#2a5820', '#3a6828', '#1a4818', '#4a7830'],  // dark Mediterranean olive
    trunk: '#4a3820', trunkOutline: 'none',
    foliageOutline: 'none',
    palmTrunk: '#5a4828', palmTrunkOutline: 'none',
    palmLeaves: '#2a6830', coconut: '#3a2818',
  },

  bushes: {
    main: '#2a5828', secondary: ['#3a6830', '#1a4820'], outline: 'none',
  },

  flowers: {
    petals: ['#a84858', '#c89038', '#b8a848', '#6888a0', '#8a6080', '#a04048', '#508860'],
    center: '#c8b060', stem: '#3a5828',
  },

  rocks: { colors: ['#8a8078', '#787068', '#989088', '#686058'] },

  dock: {
    platform: '#6a5838', platformOutline: 'none',
    supports: '#4a3828', mooringPost: '#4a3828', mooringOutline: 'none',
  },

  sign: {
    post: '#3a2818', postOutline: 'none',
    plankBase: '#6a5838', plankDark: '#3a2818', plankLight: '#887860',
    plankOutline: 'none', textColor: '#1a1008', textOutline: '#3a2818',
  },

  ark: {
    hull: { upper: '#6a5038', mid: '#4a3828', lower: '#2a1a10', stripe: '#5a2818',
            woodBase: '#5a4830', woodDark: '#2a1a10', woodLight: '#7a6848' },
    deck: { light: '#7a6848', dark: '#5a4830',
            woodBase: '#6a5838', woodDark: '#3a2818', woodLight: '#887860', outline: 'none' },
    walls: { light: '#5a4830', dark: '#3a2818',
             woodBase: '#5a4830', woodDark: '#2a1a10', woodLight: '#7a6848',
             outline: 'none', bowsprit: '#6a5038' },
    cabin: { woodBase: '#5a4830', woodDark: '#2a1a10', woodLight: '#7a6848',
             outline: 'none', windowFrame: '#3a2818', windowGlass: '#3a6880' },
    roof: { ridge: '#6a3820', eave: '#4a2010', outline: 'none' },
    flag: { pole: '#2a1808', poleOutline: 'none', cloth: '#8a2020' },
  },

  seagulls: {
    body: '#d8d4d0', bodyOutline: 'none', head: '#e0dcd8',
    eyes: '#1a1a1a', beak: '#b07028', blush: 'none',
    wings: '#c0c0c8', tail: '#c8c8c8',
  },

  fish: {
    colors: ['#a04830', '#b07828', '#286878', '#903848', '#487028', '#a88018', '#904058', '#306858'],
    outline: 'none',
  },

  dolphins: {
    main: '#3a5868', dark: '#2a4858', light: '#587888',
    belly: '#7898a8', accent: '#486878', eyes: '#0a1820',
  },

  // --- GEOMETRY: Greek / realistic ---
  geometry: {
    island: {
      heightScale: 1.8,       // tall dramatic cliffs
      topFlatness: 0.06,      // flatter plateau
      cliffRoughness: 0.14,   // rough jagged rock
    },
    tree: {
      // Cypress: tall, narrow, conical
      foliageBalls: [
        { offset: [0, 0.65, 0], radius: 0.2 },
        { offset: [0, 0.85, 0], radius: 0.16 },
        { offset: [0, 1.05, 0], radius: 0.12 },
        { offset: [0, 1.2, 0], radius: 0.08 },
      ],
      trunkHeight: 0.8,
      trunkTopR: 0.03,
      trunkBottomR: 0.06,
    },
    palm: {
      type: 'olive',  // gnarled olive tree
      trunkHeight: 0.7,
      trunkTopR: 0.06,
      trunkBottomR: 0.09,
      trunkCurve: 0.35,
      leafCount: 0,
      leafLength: 0,
      leafDroop: 0,
      hasCoconuts: false,
      canopyBalls: [
        { offset: [0, 0.65, 0], radius: 0.35 },
        { offset: [0.22, 0.6, 0.15], radius: 0.25 },
        { offset: [-0.18, 0.68, -0.12], radius: 0.22 },
        { offset: [0.08, 0.75, -0.18], radius: 0.18 },
      ],
    },
    bush: {
      balls: [
        { offset: [0, 0.08, 0], radius: 0.14 },
        { offset: [0.15, 0.1, 0.08], radius: 0.1 },
      ],
    },
    rocks: { sizeMin: 0.06, sizeMax: 0.2, count: 12, detail: 2 },
    animal: { scale: 0.7, showBlush: false },
    ark: {
      hullPreset: 'trireme',
      hullWidth: 0.5,
      hullDepth: 0.8,
      wallHeight: 0.28,
      cabinSize: [0.65, 0.4, 1.1],
      cabinY: 0.55,
      roofRadius: 0.32,
      roofLength: 1.1,
      bowspritLength: 0.8,
      bowspritRadius: 0.035,
      flagPoleHeight: 1.5,
    },
  },
}

// -----------------------------------------------------------
// Ghibli — Miyazaki's dreamy watercolor
// -----------------------------------------------------------
const ghibli = {
  id: THEME_IDS.GHIBLI,
  name: 'Ghibli',
  icon: '🌿',

  // --- STYLE: cel-shading with hard 2-step shadows ---
  useToonShading: true,
  toonSteps: 2,           // hard edge: lit/shadow (Ghibli signature)
  outlineThickness: 0.5,  // thin, organic
  materialRoughness: 0.9,

  // Clouds: MASSIVE Ghibli cumulus — signature element
  clouds: {
    main: '#ffffff',
    accent: '#f0ece8',
    shadow: '#c8b8a8',     // warm shadow on underside
    scale: 2.5,            // huge cumulus
    puffs: 'ghibli',       // many more overlapping puffs
    opacity: 1.0,
    speed: 0.4,            // slow, majestic drift
  },

  scene: {
    background: '#78b8d8',
    fogColor: '#b0d0e0',
    fogNear: 25,
    fogFar: 75,
  },

  // Lighting: warm golden diffuse — dreamy Miyazaki afternoon
  lighting: {
    ambient: { color: '#fff0e0', intensity: 0.85 },
    main: { color: '#ffd8a0', intensity: 1.3, position: [5, 18, 3] },
    fill: { color: '#88b8d8', intensity: 0.45, position: [-4, 12, -4] },
    hemisphere: { sky: '#a0c8e0', ground: '#80a868', intensity: 0.55 },
  },

  sky: {
    zenith: '#3898c0',     // deep vivid blue
    mid: '#68b8d8',        // rich sky blue
    horizon: '#ffc890',    // warm golden peach
  },

  // Ocean: painted watercolor, soft waves, dreamy
  ocean: {
    deep: '#1868a0',       // rich painted blue
    mid: '#2888b0',
    shallow: '#58b0c8',
    foam: '#c8e0e8',
    waveHeight: 0.6,       // gentle
    waveSpeed: 0.7,
    causticIntensity: 0.5,
    sparkleIntensity: 0.4, // subtle
    toonBanding: true,
    specularSun: false,
  },

  island: {
    grass: ['#2a8830', '#1a7020', '#40a840'],  // deep Miyazaki emerald
    grassSunny: '#78b048',
    sand: '#d8c8a8',
    sandVariant: '#c8b898',
    cliff: ['#908878', '#787068'],
    underwater: '#508868',
    outlineColor: '#1a4020',
  },

  trees: {
    foliage: ['#1a7020', '#2a8830', '#106018', '#38a038'],  // deep lush Ghibli green
    trunk: '#5a4028', trunkOutline: '#2a2010',
    foliageOutline: '#0a3810',
    palmTrunk: '#6a4820', palmTrunkOutline: '#2a2010',
    palmLeaves: '#1a7828', coconut: '#4a3020',
  },

  bushes: {
    main: '#1a7828', secondary: ['#2a8838', '#107018'], outline: '#0a3810',
  },

  flowers: {
    petals: ['#d87088', '#d8a040', '#d8c858', '#78a8c8', '#b880b8', '#c85868', '#68b078'],
    center: '#e8d890', stem: '#387828',
  },

  rocks: { colors: ['#888078', '#808870', '#989088', '#787068'] },

  dock: {
    platform: '#907850', platformOutline: '#504028',
    supports: '#685038', mooringPost: '#685038', mooringOutline: '#383020',
  },

  sign: {
    post: '#584030', postOutline: '#281810',
    plankBase: '#907858', plankDark: '#604830', plankLight: '#a89070',
    plankOutline: '#382818', textColor: '#1a1008', textOutline: '#3a2818',
  },

  ark: {
    hull: { upper: '#a07848', mid: '#806038', lower: '#583820', stripe: '#904830',
            woodBase: '#907058', woodDark: '#584030', woodLight: '#a88868' },
    deck: { light: '#a88858', dark: '#887040',
            woodBase: '#987850', woodDark: '#685038', woodLight: '#b89870', outline: '#403020' },
    walls: { light: '#907048', dark: '#705838',
             woodBase: '#907058', woodDark: '#584030', woodLight: '#a88868',
             outline: '#281810', bowsprit: '#a07848' },
    cabin: { woodBase: '#907058', woodDark: '#584038', woodLight: '#a88868',
             outline: '#281810', windowFrame: '#584030', windowGlass: '#5898b0' },
    roof: { ridge: '#904828', eave: '#703018', outline: '#381808' },
    flag: { pole: '#382010', poleOutline: '#180808', cloth: '#c03830' },
  },

  seagulls: {
    body: '#e8e4e0', bodyOutline: '#909090', head: '#f0ece8',
    eyes: '#222', beak: '#d08030', blush: '#e0a0a0',
    wings: '#d8d8e0', tail: '#e0e0e0',
  },

  fish: {
    colors: ['#c86040', '#c88830', '#3888a8', '#c85068', '#609838', '#c8a020', '#c85878', '#389880'],
    outline: '#383838',
  },

  dolphins: {
    main: '#407080', dark: '#305060', light: '#609098',
    belly: '#88b0c0', accent: '#487888', eyes: '#0a1828',
  },

  // --- GEOMETRY: lush, round, overgrown Ghibli ---
  geometry: {
    island: {
      heightScale: 1.2,       // gentle rolling hills
      topFlatness: 0.20,      // more terrain variation
      cliffRoughness: 0.04,   // smooth organic
    },
    tree: {
      // Dense multi-ball canopy — lush Ghibli forest
      foliageBalls: [
        { offset: [0, 0.75, 0], radius: 0.48 },
        { offset: [0.22, 0.92, 0.1], radius: 0.32 },
        { offset: [-0.18, 0.88, -0.12], radius: 0.3 },
        { offset: [0.1, 1.08, -0.05], radius: 0.24 },
        { offset: [-0.12, 1.02, 0.14], radius: 0.22 },
      ],
      trunkHeight: 0.65,
      trunkTopR: 0.05,
      trunkBottomR: 0.09,
    },
    palm: {
      type: 'palm',
      trunkHeight: 1.0,
      trunkTopR: 0.05,
      trunkBottomR: 0.08,
      trunkCurve: 0.15,       // gentle lean
      leafCount: 8,            // more fronds
      leafLength: 0.65,
      leafDroop: 1.0,          // droopier
      hasCoconuts: false,
      canopyBalls: null,
    },
    bush: {
      // Very lush, 5 overlapping spheres
      balls: [
        { offset: [0, 0.12, 0], radius: 0.22 },
        { offset: [0.1, 0.16, 0.06], radius: 0.16 },
        { offset: [-0.08, 0.14, -0.06], radius: 0.14 },
        { offset: [0.06, 0.18, -0.08], radius: 0.12 },
        { offset: [-0.1, 0.1, 0.08], radius: 0.11 },
      ],
    },
    rocks: { sizeMin: 0.04, sizeMax: 0.12, count: 6, detail: 1 },
    animal: { scale: 1.15, showBlush: true },
    ark: {
      hullPreset: 'gentle',
      hullWidth: 0.75,
      hullDepth: 0.6,
      wallHeight: 0.4,
      cabinSize: [1.0, 0.55, 1.75],
      cabinY: 0.66,
      roofRadius: 0.5,
      roofLength: 1.8,
      bowspritLength: 0.3,
      bowspritRadius: 0.06,
      flagPoleHeight: 1.0,
    },
  },
}

// -----------------------------------------------------------
// Theme registry
// -----------------------------------------------------------
export const themes = {
  [THEME_IDS.POKEMON]: pokemon,
  [THEME_IDS.ASSASSIN]: assassin,
  [THEME_IDS.GHIBLI]: ghibli,
}

export const themeList = [pokemon, assassin, ghibli]

export function getTheme(id) {
  return themes[id] || pokemon
}
