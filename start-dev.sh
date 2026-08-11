#!/usr/bin/env bash
# manabu-kun 開発サーバー一括起動（Auth + Mock API + Viewer）
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$ROOT/.dev"
LOG_DIR="$PID_DIR/logs"
AUTH_API_PORT="${AUTH_API_PORT:-3002}"
AUTH_WEB_PORT="${AUTH_WEB_PORT:-5180}"
MOCK_PORT="${MOCK_API_PORT:-3001}"
VIEWER_PORT="${VIEWER_PORT:-5173}"

mkdir -p "$LOG_DIR"

auth_api_pid_file="$PID_DIR/auth-api.pid"
auth_web_pid_file="$PID_DIR/auth-web.pid"
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

wait_for_url() {
  local url="$1"
  local name="$2"
  local log_file="$3"
  local i
  for i in $(seq 1 30); do
    if curl -sf "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.5
  done
  echo "エラー: ${name} が起動しませんでした"
  echo "ログ: $log_file"
  tail -20 "$log_file" 2>/dev/null || true
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
  stop_pid_file "$auth_web_pid_file" "Auth Web"
  stop_pid_file "$auth_api_pid_file" "Auth API"
  stop_pid_file "$viewer_pid_file" "Viewer"
  stop_pid_file "$mock_pid_file" "Mock API"
  echo "開発サーバーを停止しました。"
  exit 0
fi

if [[ "${1:-}" == "--restart" ]]; then
  "$0" --stop
fi

for f in "$auth_api_pid_file" "$auth_web_pid_file" "$mock_pid_file" "$viewer_pid_file"; do
  if is_running "$f"; then
    echo "既に起動中です。停止する場合: $0 --stop"
    exit 1
  fi
done

ensure_deps "$ROOT/auth/api" "auth-api"
ensure_deps "$ROOT/auth/web" "auth-web"
ensure_deps "$ROOT/mock-api" "mock-api"
ensure_deps "$ROOT/viewer" "viewer"

echo "Auth API を起動中... (http://localhost:${AUTH_API_PORT})"
(
  cd "$ROOT/auth/api"
  PORT="$AUTH_API_PORT" npm start
) >>"$LOG_DIR/auth-api.log" 2>&1 &
echo $! >"$auth_api_pid_file"
wait_for_url "http://127.0.0.1:${AUTH_API_PORT}/health" "Auth API" "$LOG_DIR/auth-api.log"

echo "Mock API を起動中... (http://localhost:${MOCK_PORT})"
(
  cd "$ROOT/mock-api"
  PORT="$MOCK_PORT" npm start
) >>"$LOG_DIR/mock-api.log" 2>&1 &
echo $! >"$mock_pid_file"
wait_for_url "http://127.0.0.1:${MOCK_PORT}/health" "Mock API" "$LOG_DIR/mock-api.log"

echo "Auth Web を起動中... (http://localhost:${AUTH_WEB_PORT})"
(
  cd "$ROOT/auth/web"
  export AUTH_API_PORT="$AUTH_API_PORT"
  export VITE_VIEWER_URL="http://localhost:${VIEWER_PORT}"
  npm run dev -- --host 127.0.0.1 --port "$AUTH_WEB_PORT"
) >>"$LOG_DIR/auth-web.log" 2>&1 &
echo $! >"$auth_web_pid_file"
wait_for_url "http://127.0.0.1:${AUTH_WEB_PORT}/login" "Auth Web" "$LOG_DIR/auth-web.log"

echo "Viewer を起動中... (http://localhost:${VIEWER_PORT})"
(
  cd "$ROOT/viewer"
  export MOCK_API_PORT="$MOCK_PORT"
  export VITE_AUTH_APP_URL="http://localhost:${AUTH_WEB_PORT}"
  npm run dev -- --host 127.0.0.1 --port "$VIEWER_PORT"
) >>"$LOG_DIR/viewer.log" 2>&1 &
echo $! >"$viewer_pid_file"
wait_for_url "http://127.0.0.1:${VIEWER_PORT}/" "Viewer" "$LOG_DIR/viewer.log"

echo ""
echo "=========================================="
echo "  manabu-kun 開発環境が起動しました"
echo "=========================================="
echo "  認証 (ログイン): http://localhost:${AUTH_WEB_PORT}/login"
echo "  ビューア:        http://localhost:${VIEWER_PORT}"
echo "  Auth API:        http://localhost:${AUTH_API_PORT}/health"
echo "  Mock API:        http://localhost:${MOCK_PORT}/health"
echo "  ログ:            $LOG_DIR/"
echo ""
echo "  停止:            $0 --stop"
echo "=========================================="
