#!/bin/bash
# ============================================================
# with-AI 自動同期スクリプト
# Claude Code のフックから呼ばれ、Git経由で2台のMacを同期する
# Usage: ./sync.sh [pull|push]
# ============================================================

set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
MEMORY_SRC="$CLAUDE_DIR/projects/-Users-$(whoami)/memory"
MEMORY_REPO="$REPO_DIR/claude-code/memory"

cd "$REPO_DIR"

# ------------------------------------------------------------
# pull: GitHubから最新を取得 → メモリを反映
# ------------------------------------------------------------
sync_pull() {
    echo "[sync] pull 開始..."

    # リモートから最新を取得（コンフリクト時は手元を優先）
    git pull --rebase=false origin main 2>/dev/null || {
        echo "[sync] マージコンフリクト発生 — 手元の変更を優先します"
        git checkout --ours . 2>/dev/null || true
        git add -A 2>/dev/null || true
        git commit -m "auto-sync: resolve conflict (local priority)" 2>/dev/null || true
    }

    # リポジトリのメモリ → ローカルの .claude/memory にコピー
    if [ -d "$MEMORY_REPO" ]; then
        mkdir -p "$MEMORY_SRC"
        cp "$MEMORY_REPO"/*.md "$MEMORY_SRC/" 2>/dev/null || true
        echo "[sync] メモリを反映しました"
    fi

    echo "[sync] pull 完了"
}

# ------------------------------------------------------------
# push: ローカルの変更をGitHubにアップ
# ------------------------------------------------------------
sync_push() {
    echo "[sync] push 開始..."

    # ローカルのメモリ → リポジトリにコピー
    if [ -d "$MEMORY_SRC" ]; then
        mkdir -p "$MEMORY_REPO"
        cp "$MEMORY_SRC"/*.md "$MEMORY_REPO/" 2>/dev/null || true
    fi

    # 変更があればコミット＆プッシュ
    cd "$REPO_DIR"
    git add -A

    if ! git diff --cached --quiet; then
        HOSTNAME=$(hostname -s)
        git commit -m "auto-sync: ${HOSTNAME} $(date '+%Y-%m-%d %H:%M')"
        git push origin main
        echo "[sync] プッシュしました"
    else
        echo "[sync] 変更なし — スキップ"
    fi

    echo "[sync] push 完了"
}

# ------------------------------------------------------------
# メイン
# ------------------------------------------------------------
case "${1:-}" in
    pull)  sync_pull ;;
    push)  sync_push ;;
    *)
        echo "Usage: $0 [pull|push]"
        echo "  pull  — GitHubから最新を取得してメモリを反映"
        echo "  push  — ローカルの変更をGitHubにアップ"
        exit 1
        ;;
esac
