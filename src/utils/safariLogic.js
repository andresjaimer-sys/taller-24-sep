export const REGIONS = [
  { id: 'bosque', name: 'Bosque Esmeralda', short: 'Bosque', icon: '🌿', types: ['grass', 'bug'], description: 'Rastrea huellas entre árboles y senderos.', accent: '#5FAA85' },
  { id: 'volcan', name: 'Cráter Carmesí', short: 'Volcán', icon: '🌋', types: ['fire', 'rock'], description: 'Encuentra especies resistentes al calor.', accent: '#E77C63' },
  { id: 'oceano', name: 'Costa Azul', short: 'Océano', icon: '🌊', types: ['water', 'ice'], description: 'Explora la costa y sus corrientes.', accent: '#5C9DE6' },
  { id: 'cueva', name: 'Cueva Eclipse', short: 'Cueva', icon: '🪨', types: ['ground', 'ghost'], description: 'Avanza por túneles desconocidos.', accent: '#AC9DD3' },
  { id: 'pradera', name: 'Pradera Ámbar', short: 'Pradera', icon: '🌾', types: ['normal', 'electric'], description: 'Recorre campos y observa movimientos.', accent: '#E9B65D' },
];

export function calculateCaptureChance(captureRate, ball = 'pokeball', usingBerry = false) {
  const rate = Number.isFinite(Number(captureRate)) ? Number(captureRate) : 100;
  const base = 0.16 + (Math.max(0, Math.min(rate, 255)) / 255) * 0.55;
  const bonusBall = ball === 'superball' ? 0.18 : 0;
  const bonusBerry = usingBerry ? 0.12 : 0;
  return Math.min(0.94, Math.max(0.10, base + bonusBall + bonusBerry));
}

export function rarityLabel(captureRate) {
  if (captureRate <= 45) return 'Muy difícil';
  if (captureRate <= 100) return 'Poco común';
  return 'Común';
}

export function pickRandomPokemon(items, maxId = 1025, rng = Math.random) {
  const valid = items.filter((item) => Number.isInteger(item.id) && item.id >= 1 && item.id <= maxId);
  if (!valid.length) return null;
  return valid[Math.floor(rng() * valid.length)];
}
