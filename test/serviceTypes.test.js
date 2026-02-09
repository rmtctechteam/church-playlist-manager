const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { SERVICE_TYPES, getServiceType, getAllServiceTypes, isValidType } = require('../src/serviceTypes');

describe('serviceTypes', () => {
  it('defines three service types', () => {
    const types = getAllServiceTypes();
    assert.equal(types.length, 3);
  });

  it('holy-communion has correct sections', () => {
    const t = getServiceType('holy-communion');
    assert.equal(t.name, 'Holy Communion');
    assert.deepEqual(t.sections, ['Opening', 'Bible Readings', 'Birthday/Wedding', 'Offertory', 'Communion', 'Closing']);
  });

  it('acts has correct sections', () => {
    const t = getServiceType('acts');
    assert.equal(t.name, 'ACTS');
    assert.deepEqual(t.sections, ['Adoration', 'Confession', 'Thanksgiving', 'Supplication']);
  });

  it('praise-and-worship has correct sections', () => {
    const t = getServiceType('praise-and-worship');
    assert.equal(t.name, 'Praise and Worship');
    assert.deepEqual(t.sections, ['Opening', 'Song 2', 'Song 3', 'Song 4', 'Song 5 (Closing)']);
  });

  it('returns null for unknown type', () => {
    assert.equal(getServiceType('unknown'), null);
  });

  it('isValidType accepts known types and custom', () => {
    assert.equal(isValidType('holy-communion'), true);
    assert.equal(isValidType('acts'), true);
    assert.equal(isValidType('praise-and-worship'), true);
    assert.equal(isValidType('custom'), true);
    assert.equal(isValidType('bogus'), false);
  });

  it('each type has id, name, and sections', () => {
    for (const t of getAllServiceTypes()) {
      assert.ok(t.id, 'missing id');
      assert.ok(t.name, 'missing name');
      assert.ok(Array.isArray(t.sections), 'sections not an array');
      assert.ok(t.sections.length > 0, 'sections empty');
    }
  });
});
