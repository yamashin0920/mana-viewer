#!/usr/bin/env bash
# マナビューア (mana-viewer) 開発サーバー一括起動（Auth + Mock API + Viewer + Admin）
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$ROOT/.dev"
LOG_DIR="$PID_DIR/logs"
AUTH_API_PORT="${AUTH_API_PORT:-3002}"
AUTH_WEB_PORT="${AUTH_WEB_PORT:-5180}"
ADMIN_WEB_PORT="${ADMIN_WEB_PORT:-5190}"
MOCK_PORT="${MOCK_API_PORT:-3001}"
VIEWER_PORT="${VIEWER_PORT:-5173}"

mkdir -p "$LOG_DIR"

auth_api_pid_file="$PID_DIR/auth-api.pid"
auth_web_pid_file="$PID_DIR/auth-web.pid"
admin_web_pid_file="$PID_DIR/admin-web.pid"
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

kill_port() {
  local port="$1"
  local name="$2"
  if ! command -v lsof >/dev/null 2>&1; then
    return 0
  fi
  local pids
  pids="$(lsof -ti :"$port" 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    echo "ポート ${port} を解放中: ${name}"
    # shellcheck disable=SC2086
    kill $pids 2>/dev/null || true
    sleep 1
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null || true
  fi
}

stop_all_services() {
  stop_pid_file "$auth_web_pid_file" "Auth Web"
  stop_pid_file "$admin_web_pid_file" "Admin Web"
  stop_pid_file "$auth_api_pid_file" "Auth API"
  stop_pid_file "$viewer_pid_file" "Viewer"
  stop_pid_file "$mock_pid_file" "Mock API"
  kill_port "$AUTH_WEB_PORT" "Auth Web"
  kill_port "$ADMIN_WEB_PORT" "Admin Web"
  kill_port "$AUTH_API_PORT" "Auth API"
  kill_port "$VIEWER_PORT" "Viewer"
  kill_port "$MOCK_PORT" "Mock API"
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

wait_for_auth_api() {
  local url="$1"
  local log_file="$2"
  local i
  for i in $(seq 1 30); do
    if curl -sf "$url" | grep -q '"authMode":"credentials-json"'; then
      return 0
    fi
    sleep 0.5
  done
  echo "エラー: Auth API が credentials-json モードで起動しませんでした"
  echo "古いプロセスがポートを占有している可能性があります: $0 --restart"
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
  stop_all_services
  echo "開発サーバーを停止しました。"
  exit 0
fi

if [[ "${1:-}" == "--restart" ]]; then
  stop_all_services
fi

for f in "$auth_api_pid_file" "$auth_web_pid_file" "$admin_web_pid_file" "$mock_pid_file" "$viewer_pid_file"; do
  if is_running "$f"; then
    echo "既存の開発サーバーを再起動します..."
    stop_all_services
    break
  fi
done

# PID ファイルがなくてもポート占有があれば解放する
kill_port "$AUTH_API_PORT" "Auth API"
kill_port "$MOCK_PORT" "Mock API"
kill_port "$AUTH_WEB_PORT" "Auth Web"
kill_port "$ADMIN_WEB_PORT" "Admin Web"
kill_port "$VIEWER_PORT" "Viewer"

ensure_deps "$ROOT/auth/api" "auth-api"
ensure_deps "$ROOT/auth/web" "auth-web"
ensure_deps "$ROOT/admin/web" "admin-web"
ensure_deps "$ROOT/mock-api" "mock-api"
ensure_deps "$ROOT/viewer" "viewer"

echo "Auth API を起動中... (http://localhost:${AUTH_API_PORT})"
(
  cd "$ROOT/auth/api"
  PORT="$AUTH_API_PORT" npm start
) >>"$LOG_DIR/auth-api.log" 2>&1 &
echo $! >"$auth_api_pid_file"
wait_for_auth_api "http://127.0.0.1:${AUTH_API_PORT}/health" "$LOG_DIR/auth-api.log"

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

echo "Admin Web を起動中... (http://localhost:${ADMIN_WEB_PORT})"
(
  cd "$ROOT/admin/web"
  export AUTH_API_PORT="$AUTH_API_PORT"
  export MOCK_API_PORT="$MOCK_PORT"
  export VITE_AUTH_APP_URL="http://localhost:${AUTH_WEB_PORT}"
  export VITE_VIEWER_URL="http://localhost:${VIEWER_PORT}"
  npm run dev -- --host 127.0.0.1 --port "$ADMIN_WEB_PORT"
) >>"$LOG_DIR/admin-web.log" 2>&1 &
echo $! >"$admin_web_pid_file"
wait_for_url "http://127.0.0.1:${ADMIN_WEB_PORT}/accounts" "Admin Web" "$LOG_DIR/admin-web.log"

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
echo "  マナビューア (mana-viewer) 開発環境が起動しました"
echo "=========================================="
echo "  認証 (ログイン): http://localhost:${AUTH_WEB_PORT}/login"
echo "  管理画面:        http://localhost:${ADMIN_WEB_PORT}"
echo "  ビューア:        http://localhost:${VIEWER_PORT}"
echo "  Auth API:        http://localhost:${AUTH_API_PORT}/health"
echo "  Mock API:        http://localhost:${MOCK_PORT}/health"
echo "  ログ:            $LOG_DIR/"
echo ""
echo "  停止:            $0 --stop"
echo "  再起動:          $0 --restart"
echo ""
echo "  ログイン: credentials.json 登録済み ID/PW のみ (demo/demo など)"
echo "  管理画面: admin / admin"
echo "  確認: curl http://localhost:${AUTH_API_PORT}/health"
echo "=========================================="
