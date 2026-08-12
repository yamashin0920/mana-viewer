const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, '../../../mock-api/data/seed.json');
const CREDENTIALS_PATH = path.join(__dirname, '../data/credentials.json');

function loadUsers() {
  const raw = fs.readFileSync(SEED_PATH, 'utf-8');
  const seed = JSON.parse(raw);
  return seed.users;
}

function loadCredentials() {
  const raw = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
  return JSON.parse(raw);
}

function findCredential(userId, password) {
  const loginId = String(userId).trim();
  const pw = String(password).trim();
  return loadCredentials().find(
    (entry) => entry.userId === loginId && entry.password === pw,
  );
}

const MOCK_TOKENS = {
  'mock-token-learner': 'user-001',
  'mock-token-instructor': 'user-002',
  'mock-token-admin': 'user-admin',
};

function userIdForToken(token) {
  return MOCK_TOKENS[token] || null;
}

function tokenForUserId(userId) {
  const entry = Object.entries(MOCK_TOKENS).find(([, id]) => id === userId);
  return entry ? entry[0] : 'mock-token-learner';
}

module.exports = {
  loadUsers,
  loadCredentials,
  findCredential,
  MOCK_TOKENS,
  userIdForToken,
  tokenForUserId,
};
