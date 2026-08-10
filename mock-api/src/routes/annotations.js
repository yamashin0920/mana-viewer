const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { canAccessContent, uuidv4 } = require('../store');

const router = express.Router();

router.get('/:contentId/annotations', authMiddleware, (req, res) => {
  if (!canAccessContent(req.store, req.user.id, req.params.contentId)) {
    return res.status(403).json({ error: 'forbidden', message: '閲覧ライセンスがありません' });
  }

  const annotations = req.store.annotations.filter(
    (a) => a.contentId === req.params.contentId && a.userId === req.user.id
  );
  res.json({ data: annotations });
});

router.post('/:contentId/annotations', authMiddleware, (req, res) => {
  if (!canAccessContent(req.store, req.user.id, req.params.contentId)) {
    return res.status(403).json({ error: 'forbidden', message: '閲覧ライセンスがありません' });
  }

  const { type, page, color, rects, selectedText, note } = req.body || {};
  const validTypes = ['highlight', 'bookmark', 'note', 'underline'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'invalid_type', message: `type は ${validTypes.join(', ')} のいずれか` });
  }

  const now = new Date().toISOString();
  const annotation = {
    id: uuidv4(),
    userId: req.user.id,
    contentId: req.params.contentId,
    type,
    page,
    color: color || null,
    rects: rects || null,
    selectedText: selectedText || null,
    note: note || null,
    createdAt: now,
    updatedAt: now,
  };
  req.store.annotations.push(annotation);
  res.status(201).json(annotation);
});

router.post('/:contentId/annotations/sync', authMiddleware, (req, res) => {
  if (!canAccessContent(req.store, req.user.id, req.params.contentId)) {
    return res.status(403).json({ error: 'forbidden', message: '閲覧ライセンスがありません' });
  }

  const { items = [], deletedIds = [] } = req.body || {};
  const contentId = req.params.contentId;
  const userId = req.user.id;

  for (const id of deletedIds) {
    req.store.annotations = req.store.annotations.filter((a) => a.id !== id);
  }

  const synced = [];
  for (const item of items) {
    let ann = req.store.annotations.find((a) => a.id === item.id);
    const now = new Date().toISOString();
    if (ann) {
      Object.assign(ann, item, { updatedAt: now });
    } else {
      ann = {
        id: item.id || uuidv4(),
        userId,
        contentId,
        ...item,
        createdAt: item.createdAt || now,
        updatedAt: now,
      };
      req.store.annotations.push(ann);
    }
    synced.push(ann);
  }

  const serverAnnotations = req.store.annotations.filter(
    (a) => a.contentId === contentId && a.userId === userId
  );

  res.json({
    synced,
    serverAnnotations,
    serverTime: new Date().toISOString(),
  });
});

router.put('/annotations/:annotationId', authMiddleware, (req, res) => {
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

router.delete('/annotations/:annotationId', authMiddleware, (req, res) => {
  const idx = req.store.annotations.findIndex((a) => a.id === req.params.annotationId);
  if (idx === -1) return res.status(404).json({ error: 'not_found', message: '注釈が見つかりません' });
  if (req.store.annotations[idx].userId !== req.user.id) {
    return res.status(403).json({ error: 'forbidden', message: '削除権限がありません' });
  }
  req.store.annotations.splice(idx, 1);
  res.status(204).send();
});

module.exports = router;
