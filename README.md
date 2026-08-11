# manabu-kun

B2B 向け PDF 学習プラットフォーム。

## Mock API

ビューア開発用のモック API は [`mock-api/`](mock-api/README.md) にあります。

```bash
cd mock-api && npm install && npm start
# → http://localhost:3001
```

## Viewer（React + PDF.js）

PDF ビューアアプリは [`viewer/`](viewer/README.md) にあります。

```bash
# 1. mock-api を起動
cd mock-api && npm start

# 2. 別ターミナルで viewer を起動
cd viewer && npm install && npm run dev
# → http://localhost:5173
```

## テスト

```bash
cd viewer && npm run test:e2e
```
