const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { canAccessContent } = require('../store');

const router = express.Router();

function shelfWithItems(store, shelf, userId) {
  const itemRefs = store.bookshelfItems.filter((i) => i.shelfId === shelf.id);
  const items = itemRefs
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((ref) => {
      const content = store.contents.find((c) => c.id === ref.contentId);
      if (!content || !canAccessContent(store, userId, content.id)) return null;
      const prog = store.progress.find((p) => p.userId === userId && p.contentId === content.id);
      return { ...ref, content: { ...content, progress: prog || null } };
    })
    .filter(Boolean);
  return { ...shelf, items };
}

router.get('/', authMiddleware, (req, res) => {
  const shelves = req.store.bookshelves.filter(
    (s) =>
      s.orgId === req.user.orgId &&
      (s.userId === null || s.userId === req.user.id || s.type === 'distributed')
  );
  res.json({
    data: shelves.map((s) => shelfWithItems(req.store, s, req.user.id)),
  });
});

router.get('/:shelfId', authMiddleware, (req, res) => {
  const shelf = req.store.bookshelves.find((s) => s.id === req.params.shelfId);
  if (!shelf) return res.status(404).json({ error: 'not_found', message: '本棚が見つかりません' });
  if (shelf.orgId !== req.user.orgId) {
    return res.status(403).json({ error: 'forbidden', message: 'アクセス権がありません' });
  }
  res.json(shelfWithItems(req.store, shelf, req.user.id));
});

router.get('/:shelfId/items', authMiddleware, (req, res) => {
  const shelf = req.store.bookshelves.find((s) => s.id === req.params.shelfId);
  if (!shelf) return res.status(404).json({ error: 'not_found', message: '本棚が見つかりません' });
  res.json({ data: shelfWithItems(req.store, shelf, req.user.id).items });
});

router.post('/', authMiddleware, (req, res) => {
  const { name } = req.body || {};
  const shelf = {
    id: `shelf-${Date.now()}`,
    orgId: req.user.orgId,
    userId: req.user.id,
    name,
    type: 'custom',
    sortOrder: 99,
    createdAt: new Date().toISOString(),
  };
  req.store.bookshelves.push(shelf);
  res.status(201).json({ ...shelf, items: [] });
});

router.post('/:shelfId/items', authMiddleware, (req, res) => {
  const shelf = req.store.bookshelves.find((s) => s.id === req.params.shelfId);
  if (!shelf) return res.status(404).json({ error: 'not_found', message: '本棚が見つかりません' });
  if (shelf.type === 'distributed') {
    return res.status(403).json({ error: 'forbidden', message: '配布教材棚は変更できません' });
  }

  const { contentId } = req.body || {};
  if (!canAccessContent(req.store, req.user.id, contentId)) {
    return res.status(403).json({ error: 'forbidden', message: 'ライセンスがありません' });
  }

  const exists = req.store.bookshelfItems.some(
    (i) => i.shelfId === shelf.id && i.contentId === contentId
  );
  if (!exists) {
    req.store.bookshelfItems.push({
      shelfId: shelf.id,
      contentId,
      sortOrder: req.store.bookshelfItems.filter((i) => i.shelfId === shelf.id).length,
    });
  }

  res.status(201).json(shelfWithItems(req.store, shelf, req.user.id));
});

router.delete('/:shelfId/items/:contentId', authMiddleware, (req, res) => {
  const shelf = req.store.bookshelves.find((s) => s.id === req.params.shelfId);
  if (!shelf) return res.status(404).json({ error: 'not_found', message: '本棚が見つかりません' });
  if (shelf.type === 'distributed') {
    return res.status(403).json({ error: 'forbidden', message: '配布教材棚は変更できません' });
  }

  req.store.bookshelfItems = req.store.bookshelfItems.filter(
    (i) => !(i.shelfId === shelf.id && i.contentId === req.params.contentId)
  );
  res.status(204).send();
});

module.exports = router;
