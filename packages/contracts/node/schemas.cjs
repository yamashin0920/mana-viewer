const { z } = require('zod')

const userRoleSchema = z.enum(['learner', 'instructor', 'org_admin', 'content_admin'])

const createUserSchema = z.object({
  name: z.string().trim().min(1, '名前は必須です'),
  email: z.string().trim().email('メールアドレスの形式が不正です'),
  role: userRoleSchema.default('learner'),
  externalId: z.string().nullable().optional(),
})

const updateUserSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
  role: userRoleSchema.optional(),
  externalId: z.string().nullable().optional(),
})

const createLicenseSchema = z.object({
  contentId: z.string().trim().min(1, 'コンテンツは必須です'),
  seatCount: z.number().int().min(1, '席数は1以上である必要があります'),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
  allowOffline: z.boolean().optional(),
  status: z.enum(['active', 'expired', 'revoked']).optional(),
  assignedUserIds: z.array(z.string()).optional(),
})

const createContentSchema = z.object({
  title: z.string().trim().min(1, 'タイトルは必須です'),
  coverTitle: z.string().optional(),
  author: z.string().optional(),
  isbn: z.string().optional(),
  description: z.string().optional(),
  coverUrl: z.string().optional(),
  pageCount: z.number().int().min(1).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  version: z.string().optional(),
  status: z.enum(['published', 'draft', 'archived']).optional(),
  policy: z
    .object({
      allowPrint: z.boolean().optional(),
      allowOffline: z.boolean().optional(),
      offlineDays: z.number().int().min(1).optional(),
      maxDevices: z.number().int().min(1).optional(),
      watermarkText: z.string().optional(),
    })
    .optional(),
})

const createCredentialSchema = z.object({
  loginId: z.string().trim().min(1, 'ログインIDは必須です'),
  password: z.string().min(1, 'パスワードは必須です'),
  linkedUserId: z.string().trim().min(1, '紐付けユーザーは必須です'),
})

const updateLicenseSchema = z.object({
  seatCount: z.number().int().min(1).optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
  allowOffline: z.boolean().optional(),
  status: z.enum(['active', 'expired', 'revoked']).optional(),
  assignedUserIds: z.array(z.string()).optional(),
})

const updateUserLicensesSchema = z.object({
  licenseIds: z.array(z.string()),
})

const assignLicenseSchema = z.object({
  userIds: z.array(z.string()).default([]),
  action: z.enum(['add', 'remove']).optional(),
})

const updateContentSchema = createContentSchema.partial()

const updateCredentialSchema = z.object({
  password: z.string().min(1).optional(),
  linkedUserId: z.string().trim().min(1).optional(),
  newLoginId: z.string().trim().min(1).optional(),
})

module.exports = {
  userRoleSchema,
  createUserSchema,
  updateUserSchema,
  createLicenseSchema,
  updateLicenseSchema,
  updateUserLicensesSchema,
  assignLicenseSchema,
  createContentSchema,
  updateContentSchema,
  createCredentialSchema,
  updateCredentialSchema,
}
