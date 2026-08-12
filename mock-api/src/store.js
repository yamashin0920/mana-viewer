const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const SEED_PATH = path.join(__dirname, '../data/seed.json');
const CREDENTIALS_PATH = path.join(__dirname, '../../auth/api/data/credentials.json');

function loadSeed() {
  const raw = fs.readFileSync(SEED_PATH, 'utf-8');
  return JSON.parse(raw);
}

function saveSeed(store) {
  fs.writeFileSync(SEED_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf-8');
}

function createStore() {
  return loadSeed();
}

function loadTokenMap() {
  try {
    const raw = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
    const credentials = JSON.parse(raw);
    const map = {};
    for (const entry of credentials) {
      if (entry.token && entry.linkedUserId) {
        map[entry.token] = entry.linkedUserId;
      }
    }
    if (Object.keys(map).length > 0) return map;
  } catch {
    // fall through to defaults
  }
  return {
    'mock-token-learner': 'user-001',
    'mock-token-instructor': 'user-002',
    'mock-token-admin': 'user-admin',
  };
}

function paginate(items, page = 1, limit = 20) {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 20));
  const start = (p - 1) * l;
  return {
    data: items.slice(start, start + l),
    pagination: {
      page: p,
      limit: l,
      total: items.length,
      totalPages: Math.ceil(items.length / l) || 1,
    },
  };
}

function findUser(store, userId) {
  return store.users.find((u) => u.id === userId);
}

function isLicenseValid(license, now = new Date()) {
  if (license.status !== 'active') return false
  if (new Date(license.startsAt) > now) return false
  if (new Date(license.expiresAt) < now) return false
  return true
}

function userLicenses(store, userId, { validOnly = true } = {}) {
  return store.licenses.filter((l) => {
    if (!l.assignedUserIds.includes(userId)) return false
    if (validOnly && !isLicenseValid(l)) return false
    return true
  })
}

function userLicenseAssignments(store, userId) {
  return store.licenses.filter((l) => l.assignedUserIds.includes(userId))
}

function canAccessContent(store, userId, contentId) {
  const user = findUser(store, userId);
  if (!user) return false;
  const content = store.contents.find((c) => c.id === contentId);
  if (!content || content.orgId !== user.orgId) return false;
  return userLicenses(store, userId).some((l) => l.contentId === contentId);
}

function watermarkText(policy, user) {
  if (!policy?.watermarkText) return null;
  const now = new Date().toISOString().slice(0, 10);
  return policy.watermarkText
    .replace('{userName}', user.name)
    .replace('{date}', now);
}

function generateMockChunk(contentId, page) {
  const header = `--encrypted-chunk-${contentId}-page-${page}--`;
  const payload = Buffer.from(
    JSON.stringify({
      contentId,
      page: Number(page),
      encrypted: true,
      algorithm: 'AES-256-GCM',
      mock: true,
      timestamp: Date.now(),
    })
  ).toString('base64');
  return Buffer.from(`${header}${payload}`);
}

module.exports = {
  createStore,
  saveSeed,
  loadTokenMap,
  paginate,
  findUser,
  userLicenses,
  userLicenseAssignments,
  isLicenseValid,
  canAccessContent,
  watermarkText,
  generateMockChunk,
  uuidv4,
};
