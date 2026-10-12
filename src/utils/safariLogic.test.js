import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCaptureChance, pickRandomPokemon, rarityLabel, REGIONS } from './safariLogic.js';

test('hay cinco regiones con tipos definidos', () => {
  assert.equal(REGIONS.length, 5);
  assert.ok(REGIONS.every((region) => region.types.length > 0));
});

test('Super Ball y baya aumentan la probabilidad sin superar el límite', () => {
  const basic = calculateCaptureChance(45);
  assert.ok(calculateCaptureChance(45, 'superball', true) > basic);
  assert.ok(calculateCaptureChance(255, 'superball', true) <= 0.94);
});

test('una tasa base de captura baja significa mayor dificultad', () => {
  assert.ok(calculateCaptureChance(3) < calculateCaptureChance(200));
  assert.equal(rarityLabel(3), 'Muy difícil');
});

test('selecciona solamente especies de los primeros 1025', () => {
  const result = pickRandomPokemon([{ id: 1026 }, { id: 25 }, { id: 0 }], 1025, () => 0);
  assert.deepEqual(result, { id: 25 });
});
