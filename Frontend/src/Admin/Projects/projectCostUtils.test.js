import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateProjectTotal } from './projectCostUtils.js';

test('calculates total by adding the extension amount only when enabled', () => {
  assert.equal(calculateProjectTotal({ baseAmount: '1000', extensionAmount: '500', isExtended: true }), 1500);
  assert.equal(calculateProjectTotal({ baseAmount: '1000', extensionAmount: '500', isExtended: false }), 1000);
  assert.equal(calculateProjectTotal({ baseAmount: '', extensionAmount: '500', isExtended: true }), 500);
});
