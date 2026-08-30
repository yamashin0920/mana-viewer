function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {})
    if (!result.success) {
      const first = result.error.issues[0]
      return res.status(400).json({
        error: 'validation_error',
        message: first?.message || '入力内容が不正です',
        issues: result.error.issues,
      })
    }
    req.body = result.data
    next()
  }
}

module.exports = { validateBody }
