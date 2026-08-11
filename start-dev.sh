#!/usr/bin/env bash
# manabu-kun 開発サーバー一括起動（Mock API + Viewer）
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$ROOT/.dev"
LOG_DIR="$PID_DIR/logs"
MOCK_PORT="${MOCK_API_PORT:-3001}"
VIEWER_PORT="${VIEWER_PORT:-5173}"

mkdir -p "$LOG_DIR"

mock_pid_file="$PID_DIR/mock-api.pid"
viewer_pid_file="$PID_DIR/viewer.pid"

is_running() {
  local pid_file="$1"
  [[ -f "$pid_file" ]] || return 1
  local pid
  pid="$(cat "$pid_file")"
  kill -0 "$pid" 2>/dev/null
}

stop_pid_file() {
  local pid_file="$1"
  local name="$2"
  if is_running "$pid_file"; then
    local pid
    pid="$(cat "$pid_file")"
    echo "停止中: $name (PID $pid)"
    kill "$pid" 2>/dev/null || true
    sleep 1
    kill -9 "$pid" 2>/dev/null || true
  fi
  rm -f "$pid_file"
}

wait_for_mock_api() {
  local i
  for i in $(seq 1 30); do
    if curl -sf "http://127.0.0.1:${MOCK_PORT}/health" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.5
  done
  echo "エラー: Mock API が起動しませんでした（ポート ${MOCK_PORT}）"
  echo "ログ: $LOG_DIR/mock-api.log"
  tail -20 "$LOG_DIR/mock-api.log" 2>/dev/null || true
  exit 1
}

ensure_deps() {
  local dir="$1"
  local name="$2"
  if [[ ! -d "$dir/node_modules" ]]; then
    echo "[$name] npm install を実行中..."
    (cd "$dir" && npm install)
  fi
}

if [[ "${1:-}" == "--stop" ]]; then
  stop_pid_file "$mock_pid_file" "Mock API"
  stop_pid_file "$viewer_pid_file" "Viewer"
  echo "開発サーバーを停止しました。"
  exit 0
fi

if [[ "${1:-}" == "--restart" ]]; then
  "$0" --stop
fi

if is_running "$mock_pid_file" || is_running "$viewer_pid_file"; then
  echo "既に起動中です。停止する場合: $0 --stop"
  exit 1
fi

if ss -tln 2>/dev/null | grep -q ":${MOCK_PORT} " || \
   ss -tln 2>/dev/null | grep -q ":${MOCK_PORT}$"; then
  if ! curl -sf "http://127.0.0.1:${MOCK_PORT}/health" >/dev/null 2>&1; then
    echo "警告: ポート ${MOCK_PORT} は使用中ですが Mock API は応答しません。"
    echo "  Cursor のポート転送などを停止するか、別ポートで起動してください:"
    echo "  MOCK_API_PORT=3002 $0"
    exit 1
  fi
  echo "Mock API は既にポート ${MOCK_PORT} で応答しています（スキップ）"
  MOCK_ALREADY_RUNNING=1
else
  MOCK_ALREADY_RUNNING=0
fi

ensure_deps "$ROOT/mock-api" "mock-api"
ensure_deps "$ROOT/viewer" "viewer"

if [[ "$MOCK_ALREADY_RUNNING" -eq 0 ]]; then
  echo "Mock API を起動中... (http://localhost:${MOCK_PORT})"
  (
    cd "$ROOT/mock-api"
    PORT="$MOCK_PORT" npm start
  ) >>"$LOG_DIR/mock-api.log" 2>&1 &
  echo $! >"$mock_pid_file"
  wait_for_mock_api
  echo "Mock API 起動完了"
fi

echo "Viewer を起動中... (http://localhost:${VIEWER_PORT})"
(
  cd "$ROOT/viewer"
  export MOCK_API_PORT="$MOCK_PORT"
  npm run dev -- --host 127.0.0.1 --port "$VIEWER_PORT"
) >>"$LOG_DIR/viewer.log" 2>&1 &
echo $! >"$viewer_pid_file"

sleep 2
if ! is_running "$viewer_pid_file"; then
  echo "エラー: Viewer の起動に失敗しました"
  echo "ログ: $LOG_DIR/viewer.log"
  tail -30 "$LOG_DIR/viewer.log" 2>/dev/null || true
  exit 1
fi

echo ""
echo "=========================================="
echo "  manabu-kun 開発環境が起動しました"
echo "=========================================="
echo "  ビューア:   http://localhost:${VIEWER_PORT}"
echo "  Mock API:   http://localhost:${MOCK_PORT}/health"
echo "  ログ:       $LOG_DIR/"
echo ""
echo "  停止:       $0 --stop"
echo "  ログ確認:   tail -f $LOG_DIR/viewer.log"
echo "=========================================="
