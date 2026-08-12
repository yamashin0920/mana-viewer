import { useCallback, useEffect, useState } from 'react'
import { Loader2, Pencil, Plus, Trash2, UserPlus } from 'lucide-react'
import {
  createCredential,
  createUser,
  deleteCredential,
  deleteUser,
  fetchAdminUsers,
  fetchCredentials,
  updateCredential,
  updateUser,
} from '../api/client'
import { Button } from '../components/Button'
import { useAuth } from '../store/authStore'
import type { AdminUser, CredentialAccount, UserRole } from '../types'
import { ROLE_LABELS } from '../types'

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'

export function AccountsPage() {
  const { auth } = useAuth()
  const token = auth!.token

  const [credentials, setCredentials] = useState<CredentialAccount[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showUserForm, setShowUserForm] = useState(false)
  const [showCredForm, setShowCredForm] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [editingCred, setEditingCred] = useState<CredentialAccount | null>(null)

  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'learner' as UserRole })
  const [credForm, setCredForm] = useState({ loginId: '', password: '', linkedUserId: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [credRes, userRes] = await Promise.all([fetchCredentials(token), fetchAdminUsers(token)])
      setCredentials(credRes.data)
      setUsers(userRes.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const usersWithoutCredential = users.filter(
    (u) => !credentials.some((c) => c.linkedUserId === u.id),
  )

  const handleCreateUser = async () => {
    await createUser(token, userForm)
    setShowUserForm(false)
    setUserForm({ name: '', email: '', role: 'learner' })
    await load()
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return
    await updateUser(token, editingUser.id, userForm)
    setEditingUser(null)
    await load()
  }

  const handleDeleteUser = async (user: AdminUser) => {
    if (!confirm(`「${user.name}」を削除しますか？`)) return
    await deleteUser(token, user.id)
    await load()
  }

  const handleCreateCredential = async () => {
    await createCredential(token, credForm)
    setShowCredForm(false)
    setCredForm({ loginId: '', password: '', linkedUserId: '' })
    await load()
  }

  const handleUpdateCredential = async () => {
    if (!editingCred) return
    await updateCredential(token, editingCred.loginId, {
      password: credForm.password || undefined,
      linkedUserId: credForm.linkedUserId || undefined,
      newLoginId: credForm.loginId !== editingCred.loginId ? credForm.loginId : undefined,
    })
    setEditingCred(null)
    await load()
  }

  const handleDeleteCredential = async (cred: CredentialAccount) => {
    if (!confirm(`ログインID「${cred.loginId}」を削除しますか？`)) return
    await deleteCredential(token, cred.loginId)
    await load()
  }

  const startEditUser = (user: AdminUser) => {
    setEditingUser(user)
    setUserForm({ name: user.name, email: user.email, role: user.role })
    setShowUserForm(false)
  }

  const startEditCred = (cred: CredentialAccount) => {
    setEditingCred(cred)
    setCredForm({ loginId: cred.loginId, password: '', linkedUserId: cred.linkedUserId })
    setShowCredForm(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        読み込み中...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Login accounts */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">ログインアカウント</h2>
            <p className="text-sm text-slate-500">ログインIDとパスワード、紐付けユーザーを管理します</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => { setShowCredForm(true); setEditingCred(null); setCredForm({ loginId: '', password: '', linkedUserId: '' }) }}>
            <Plus className="h-3.5 w-3.5" />
            追加
          </Button>
        </div>

        {(showCredForm || editingCred) && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-3 text-sm font-medium">{editingCred ? 'ログインアカウント編集' : '新規ログインアカウント'}</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <input className={inputClass} placeholder="ログインID" value={credForm.loginId} onChange={(e) => setCredForm({ ...credForm, loginId: e.target.value })} />
              <input className={inputClass} type="password" placeholder={editingCred ? 'パスワード（変更時のみ）' : 'パスワード'} value={credForm.password} onChange={(e) => setCredForm({ ...credForm, password: e.target.value })} />
              <select className={inputClass} value={credForm.linkedUserId} onChange={(e) => setCredForm({ ...credForm, linkedUserId: e.target.value })}>
                <option value="">紐付けユーザーを選択</option>
                {(editingCred ? users : usersWithoutCredential).map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({ROLE_LABELS[u.role]})</option>
                ))}
              </select>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="primary" size="sm" onClick={editingCred ? handleUpdateCredential : handleCreateCredential}>
                {editingCred ? '更新' : '作成'}
              </Button>
              <Button size="sm" onClick={() => { setShowCredForm(false); setEditingCred(null) }}>キャンセル</Button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800/50">
                <th className="px-4 py-3 font-medium">ログインID</th>
                <th className="px-4 py-3 font-medium">紐付けユーザー</th>
                <th className="px-4 py-3 font-medium">ロール</th>
                <th className="px-4 py-3 font-medium">ライセンス数</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {credentials.map((cred) => {
                const linkedUser = users.find((u) => u.id === cred.linkedUserId)
                return (
                  <tr key={cred.loginId} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3 font-mono text-xs">{cred.loginId}</td>
                    <td className="px-4 py-3">{linkedUser?.name ?? '—'}</td>
                    <td className="px-4 py-3">{linkedUser ? ROLE_LABELS[linkedUser.role] : '—'}</td>
                    <td className="px-4 py-3">{linkedUser?.licenses?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => startEditCred(cred)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteCredential(cred)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Users */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">ユーザー</h2>
            <p className="text-sm text-slate-500">組織内のユーザーとライセンス割当状況</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => { setShowUserForm(true); setEditingUser(null); setUserForm({ name: '', email: '', role: 'learner' }) }}>
            <UserPlus className="h-3.5 w-3.5" />
            ユーザー追加
          </Button>
        </div>

        {(showUserForm || editingUser) && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-3 text-sm font-medium">{editingUser ? 'ユーザー編集' : '新規ユーザー'}</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <input className={inputClass} placeholder="名前" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
              <input className={inputClass} placeholder="メールアドレス" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
              <select className={inputClass} value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="primary" size="sm" onClick={editingUser ? handleUpdateUser : handleCreateUser}>
                {editingUser ? '更新' : '作成'}
              </Button>
              <Button size="sm" onClick={() => { setShowUserForm(false); setEditingUser(null) }}>キャンセル</Button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800/50">
                <th className="px-4 py-3 font-medium">名前</th>
                <th className="px-4 py-3 font-medium">メール</th>
                <th className="px-4 py-3 font-medium">ロール</th>
                <th className="px-4 py-3 font-medium">割当ライセンス</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3 text-slate-500">{user.email}</td>
                  <td className="px-4 py-3">{ROLE_LABELS[user.role]}</td>
                  <td className="px-4 py-3">
                    {user.licenses && user.licenses.length > 0 ? (
                      <ul className="space-y-0.5">
                        {user.licenses.map((l) => (
                          <li key={l.id} className="text-xs text-slate-600 dark:text-slate-400">{l.contentTitle}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-slate-400">なし</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => startEditUser(user)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(user)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
