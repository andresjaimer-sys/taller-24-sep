import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD_COLS, WORLD_ROWS, START_TILE, terrainAt, attemptMove, shouldFindPokemon } from './safariWorld.js';

test('el entrenador empieza sobre un sendero y tiene hierba accesible', () => {
  for (const region of ['bosque', 'volcan', 'oceano', 'cueva', 'pradera']) {
    assert.equal(terrainAt(region, START_TILE.x, START_TILE.y), 'path');
    assert.equal(terrainAt(region, 7, 6), 'grass');
    assert.deepEqual(attemptMove(region, START_TILE, 0, 1).position, { x: 7, y: 6 });
  }
});

test('el mapa bloquea los límites y no permite salir', () => {
  assert.equal(terrainAt('oceano', -1, 2), 'wall');
  assert.equal(terrainAt('bosque', WORLD_COLS, WORLD_ROWS), 'wall');
  const blocked = attemptMove('bosque', {x:1,y:1}, -1, 0);
  assert.equal(blocked.moved, false);
  assert.deepEqual(blocked.position, {x:1,y:1});
});

test('solo la hierba puede iniciar encuentros; después de cuatro tramos se garantiza', () => {
  assert.equal(shouldFindPokemon('path', 10, () => 0), false);
  assert.equal(shouldFindPokemon('grass', 1, () => 0.99), false);
  assert.equal(shouldFindPokemon('grass', 4, () => 0.99), true);
  assert.equal(shouldFindPokemon('grass', 1, () => 0.01), true);
});
