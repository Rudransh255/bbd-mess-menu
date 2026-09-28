import assert from 'node:assert/strict';
import test from 'node:test';
import { mealNames, menuForDay } from './menu.ts';

test('the supplied sheet has four populated meals for every day', () => {
  for (let day = 0; day < 7; day++) {
    const menu = menuForDay(day);
    assert.deepEqual(Object.keys(menu), mealNames);
    for (const meal of mealNames) assert.ok(menu[meal].length > 0);
  }
  assert.ok(menuForDay(0).Dinner.includes('Egg curry (2 eggs)'));
  assert.ok(menuForDay(5).Dinner.includes('Fruit custard'));
});
