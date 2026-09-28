import assert from 'node:assert/strict';
import test from 'node:test';
import { mealsAt, nextMeal } from './meal-time.ts';

test('weekday breakfast boundaries', () => {
  for (const [minute, state] of [[479, 'UP_NEXT'], [480, 'LIVE'], [539, 'LIVE'], [540, 'COMPLETED']] as const) {
    assert.equal(mealsAt(1, minute)[0].state, state);
  }
});

test('weekend breakfast boundaries and after dinner', () => {
  for (const [minute, state] of [[509, 'UP_NEXT'], [510, 'LIVE'], [569, 'LIVE'], [570, 'COMPLETED']] as const) {
    assert.equal(mealsAt(6, minute)[0].state, state);
  }
  assert.deepEqual({ name: nextMeal(6, 1260).name, tomorrow: nextMeal(6, 1260).tomorrow }, { name: 'Breakfast', tomorrow: true });
});
