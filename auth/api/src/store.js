const {
  loadUsers,
  loadCredentials,
  saveCredentials,
  getLoginId,
} = require('@mana/dev-data');
const { isAdminRole } = require('@mana/contracts/node');

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
  return !!(user && isAdminRole(user.role));
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
