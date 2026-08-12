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

function saveCredentials(credentials) {
  fs.writeFileSync(CREDENTIALS_PATH, `${JSON.stringify(credentials, null, 2)}\n`, 'utf-8');
}

function getLoginId(entry) {
  return entry.loginId || entry.userId;
}

function findCredential(userId, password) {
  const loginId = String(userId).trim();
  const pw = String(password).trim();
  return loadCredentials().find(
    (entry) => getLoginId(entry) === loginId && entry.password === pw,
  );
}

function buildTokenMap() {
  const map = {};
  for (const entry of loadCredentials()) {
    const linkedUserId = entry.linkedUserId;
    if (entry.token && linkedUserId) {
      map[entry.token] = linkedUserId;
    }
  }
  return map;
}

function userIdForToken(token) {
  return buildTokenMap()[token] || null;
}

function tokenForUserId(userId) {
  const entry = loadCredentials().find((c) => c.linkedUserId === userId);
  return entry?.token || null;
}

function findUserById(userId) {
  return loadUsers().find((u) => u.id === userId);
}

function isAdminUser(user) {
  return user && ['org_admin', 'content_admin'].includes(user.role);
}

function generateToken() {
  return `mock-token-${Date.now().toString(36)}`;
}

module.exports = {
  loadUsers,
  loadCredentials,
  saveCredentials,
  findCredential,
  getLoginId,
  userIdForToken,
  tokenForUserId,
  findUserById,
  isAdminUser,
  generateToken,
  buildTokenMap,
};
