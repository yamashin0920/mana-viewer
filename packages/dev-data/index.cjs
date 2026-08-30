const fs = require('fs')
const path = require('path')

const REPO_ROOT = path.resolve(__dirname, '../..')

function seedPath() {
  return process.env.MANA_SEED_PATH || path.join(REPO_ROOT, 'mock-api/data/seed.json')
}

function credentialsPath() {
  return (
    process.env.MANA_CREDENTIALS_PATH ||
    path.join(REPO_ROOT, 'auth/api/data/credentials.json')
  )
}

function loadSeed() {
  return JSON.parse(fs.readFileSync(seedPath(), 'utf-8'))
}

function saveSeed(store) {
  fs.writeFileSync(seedPath(), `${JSON.stringify(store, null, 2)}\n`, 'utf-8')
}

function loadCredentials() {
  return JSON.parse(fs.readFileSync(credentialsPath(), 'utf-8'))
}

function saveCredentials(credentials) {
  fs.writeFileSync(credentialsPath(), `${JSON.stringify(credentials, null, 2)}\n`, 'utf-8')
}

function loadUsers() {
  return loadSeed().users || []
}

function getLoginId(entry) {
  return entry.loginId || entry.userId
}

function loadTokenMap(fallback = {}) {
  try {
    const credentials = loadCredentials()
    const map = {}
    for (const entry of credentials) {
      if (entry.token && entry.linkedUserId) {
        map[entry.token] = entry.linkedUserId
      }
    }
    if (Object.keys(map).length > 0) return map
  } catch {
    // fall through
  }
  return { ...fallback }
}

module.exports = {
  REPO_ROOT,
  seedPath,
  credentialsPath,
  loadSeed,
  saveSeed,
  loadCredentials,
  saveCredentials,
  loadUsers,
  getLoginId,
  loadTokenMap,
}
