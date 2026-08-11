const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, '../../../mock-api/data/seed.json');

function loadUsers() {
  const raw = fs.readFileSync(SEED_PATH, 'utf-8');
  const seed = JSON.parse(raw);
  return seed.users;
}

const MOCK_TOKENS = {
  'mock-token-learner': 'user-001',
  'mock-token-instructor': 'user-002',
  'mock-token-admin': 'user-admin',
};

function tokenForUserId(userId) {
  const entry = Object.entries(MOCK_TOKENS).find(([, id]) => id === userId);
  return entry ? entry[0] : 'mock-token-learner';
}

module.exports = { loadUsers, MOCK_TOKENS, tokenForUserId };
