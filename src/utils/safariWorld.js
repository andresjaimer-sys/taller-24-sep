export const WORLD_COLS = 15;
export const WORLD_ROWS = 11;
export const START_TILE = Object.freeze({ x: 7, y: 5 });

const REGION_SEEDS = { bosque: 11, volcan: 29, oceano: 47, cueva: 61, pradera: 83 };

export function terrainAt(region, x, y) {
  if (x < 0 || y < 0 || x >= WORLD_COLS || y >= WORLD_ROWS) return 'wall';
  if (x === 0 || y === 0 || x === WORLD_COLS - 1 || y === WORLD_ROWS - 1) {
    return region === 'oceano' ? 'water' : region === 'volcan' ? 'lava' : 'wall';
  }
  if (x === START_TILE.x && y === START_TILE.y) return 'path';
  // Keep a small, guaranteed reachable strip of grass near the starting position.
  if (x === 7 && (y === 6 || y === 7)) return 'grass';
  if (y === 5 && x >= 5 && x <= 9) return 'path';
  const seed = REGION_SEEDS[region] ?? 11;
  const noise = ((x * 43 + y * 71 + x * y * 17 + seed * 19) % 101) / 101;
  if (noise < 0.115) return region === 'oceano' ? 'water' : region === 'volcan' ? 'lava' : 'rock';
  if (noise < 0.48) return 'grass';
  if (noise < 0.57) return 'flower';
  return 'path';
}

export function isPassable(tile) {
  return tile === 'path' || tile === 'grass' || tile === 'flower';
}

export function attemptMove(region, current, dx, dy) {
  const x = current.x + dx;
  const y = current.y + dy;
  const terrain = terrainAt(region, x, y);
  return isPassable(terrain) ? { moved: true, position: { x, y }, terrain }
    : { moved: false, position: current, terrain };
}

export function shouldFindPokemon(terrain, grassCount, rng = Math.random) {
  if (terrain !== 'grass') return false;
  return grassCount >= 4 || rng() < 0.38;
}
