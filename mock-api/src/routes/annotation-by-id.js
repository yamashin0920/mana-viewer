const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.put('/:annotationId', authMiddleware, (req, res) => {
  const ann = req.store.annotations.find((a) => a.id === req.params.annotationId);
  if (!ann) return res.status(404).json({ error: 'not_found', message: '注釈が見つかりません' });
  if (ann.userId !== req.user.id) {
    return res.status(403).json({ error: 'forbidden', message: '編集権限がありません' });
  }

  const { color, rects, selectedText, note, page } = req.body || {};
  Object.assign(ann, {
    color: color ?? ann.color,
    rects: rects ?? ann.rects,
    selectedText: selectedText ?? ann.selectedText,
    note: note ?? ann.note,
    page: page ?? ann.page,
    updatedAt: new Date().toISOString(),
  });
  res.json(ann);
});

router.delete('/:annotationId', authMiddleware, (req, res) => {
  const idx = req.store.annotations.findIndex((a) => a.id === req.params.annotationId);
  if (idx === -1) return res.status(404).json({ error: 'not_found', message: '注釈が見つかりません' });
  if (req.store.annotations[idx].userId !== req.user.id) {
    return res.status(403).json({ error: 'forbidden', message: '削除権限がありません' });
  }
  req.store.annotations.splice(idx, 1);
  res.status(204).send();
});

module.exports = router;
