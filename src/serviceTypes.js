const SERVICE_TYPES = {
  'holy-communion': {
    id: 'holy-communion',
    name: 'Holy Communion',
    sections: ['Opening', 'Bible Readings', 'Birthday/Wedding', 'Offertory', 'Communion', 'Closing'],
  },
  'acts': {
    id: 'acts',
    name: 'ACTS',
    sections: ['Opening', 'Adoration', 'Confession', 'Thanksgiving', 'Supplication'],
  },
  'praise-and-worship': {
    id: 'praise-and-worship',
    name: 'Praise and Worship',
    sections: ['Opening', 'Song 2', 'Song 3', 'Song 4', 'Song 5 (Closing)'],
  },
};

function getServiceType(typeId) {
  return SERVICE_TYPES[typeId] || null;
}

function getAllServiceTypes() {
  return Object.values(SERVICE_TYPES);
}

function isValidType(typeId) {
  return typeId === 'custom' || typeId in SERVICE_TYPES;
}

module.exports = { SERVICE_TYPES, getServiceType, getAllServiceTypes, isValidType };
