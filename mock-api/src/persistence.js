/**
 * mock-api の永続化ポリシー。
 *
 * - admin: ユーザー / ライセンス / コンテンツなど管理 CRUD。既定で seed.json に書き戻す
 * - learner: 進捗 / 注釈 / 端末 / セッションなど学習者データ。既定はメモリのみ
 *
 * 環境変数:
 *   MOCK_API_PERSIST_ADMIN=false   … 管理 CRUD も揮発にする（既定: true）
 *   MOCK_API_PERSIST_LEARNER=true  … 学習者データも seed.json に書く（既定: false）
 */

const { saveSeed } = require('@mana/dev-data')

const PERSIST_ADMIN = process.env.MOCK_API_PERSIST_ADMIN !== 'false'
const PERSIST_LEARNER = process.env.MOCK_API_PERSIST_LEARNER === 'true'

function persist(store, tier = 'admin') {
  if (tier === 'admin' && PERSIST_ADMIN) {
    saveSeed(store)
    return true
  }
  if (tier === 'learner' && PERSIST_LEARNER) {
    saveSeed(store)
    return true
  }
  return false
}

module.exports = {
  PERSIST_ADMIN,
  PERSIST_LEARNER,
  persist,
}
