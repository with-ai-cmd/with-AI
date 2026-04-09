#!/bin/bash
set -e

# ============================================================
# with-AI セットアップスクリプト
# git clone 後にこのスクリプトを実行すると環境が整う
# Usage: ./setup.sh
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

echo "━━━ with-AI セットアップ開始 ━━━"
echo "リポジトリ: $SCRIPT_DIR"
echo ""

# ------------------------------------------------------------
# 1. パスのプレースホルダーを実際のパスに置換
# ------------------------------------------------------------
echo "[1/7] パスを環境に合わせて書き換え..."

# {{WITHAI_ROOT}} → 実際のリポジトリパスに置換
find "$SCRIPT_DIR" -type f \( -name "*.md" -o -name "*.json" \) ! -path "$SCRIPT_DIR/.git/*" -exec \
    sed -i '' "s|{{WITHAI_ROOT}}|$SCRIPT_DIR|g" {} \;

echo "  完了（全ファイルのパスを $SCRIPT_DIR に設定）"

# ------------------------------------------------------------
# 2. git clean フィルター設定（commit時に自動でプレースホルダーに戻す）
# ------------------------------------------------------------
echo "[2/7] git フィルター設定..."

git -C "$SCRIPT_DIR" config filter.withai-path.clean "sed 's|$SCRIPT_DIR|{{WITHAI_ROOT}}|g'"
git -C "$SCRIPT_DIR" config filter.withai-path.smudge "sed 's|{{WITHAI_ROOT}}|$SCRIPT_DIR|g'"

GITATTRIBUTES="$SCRIPT_DIR/.gitattributes"
if ! grep -q "filter=withai-path" "$GITATTRIBUTES" 2>/dev/null; then
    cat >> "$GITATTRIBUTES" <<'EOF'
*.md filter=withai-path
*.json filter=withai-path
EOF
    echo "  .gitattributes にフィルター追加"
fi

echo "  完了"

# ------------------------------------------------------------
# 3. Claude Code グローバル設定（CLAUDE.md）
# ------------------------------------------------------------
echo "[3/7] グローバル CLAUDE.md を配置..."

if [ -f "$CLAUDE_DIR/CLAUDE.md" ]; then
    echo "  既存の CLAUDE.md をバックアップ → CLAUDE.md.bak"
    cp "$CLAUDE_DIR/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md.bak"
fi
cp "$SCRIPT_DIR/claude-code/CLAUDE.global.md" "$CLAUDE_DIR/CLAUDE.md"
echo "  完了"

# ------------------------------------------------------------
# 4. スラッシュコマンド（~/.claude/commands/）
# ------------------------------------------------------------
echo "[4/7] スラッシュコマンドを配置..."
mkdir -p "$CLAUDE_DIR/commands"

for cmd in "$SCRIPT_DIR/claude-code/commands/"*.md; do
    filename=$(basename "$cmd")
    cp "$cmd" "$CLAUDE_DIR/commands/$filename"
    echo "  /$( echo "$filename" | sed 's/.md$//' )"
done
echo "  完了"

# ------------------------------------------------------------
# 5. Anthropic 公式プラグインをインストール
# ------------------------------------------------------------
echo "[5/7] Anthropic 公式スキルプラグインをインストール..."

if command -v claude &> /dev/null; then
    # マーケットプレース追加（既にあればスキップ）
    claude plugin marketplace add anthropics/skills 2>/dev/null || true

    # 3つのプラグインパッケージをインストール
    for plugin in "document-skills" "example-skills" "claude-api"; do
        echo "  $plugin..."
        claude plugin install "${plugin}@anthropic-agent-skills" 2>/dev/null || echo "  (既にインストール済み)"
    done
    echo "  完了"
else
    echo "  警告: claude コマンドが見つかりません。手動でインストールしてください:"
    echo "    claude plugin marketplace add anthropics/skills"
    echo "    claude plugin install document-skills@anthropic-agent-skills"
    echo "    claude plugin install example-skills@anthropic-agent-skills"
    echo "    claude plugin install claude-api@anthropic-agent-skills"
fi

# ------------------------------------------------------------
# 6. Python / Node.js 依存関係
# ------------------------------------------------------------
echo "[6/7] 依存関係をセットアップ..."

# Python: invoices
if [ -f "$SCRIPT_DIR/company/invoices/requirements.txt" ]; then
    echo "  company/invoices..."
    cd "$SCRIPT_DIR/company/invoices"
    python3 -m venv .venv 2>/dev/null || true
    source .venv/bin/activate 2>/dev/null && pip install -q -r requirements.txt 2>/dev/null && deactivate || echo "  (スキップ)"
fi

# Python: learning-bot
if [ -f "$SCRIPT_DIR/skills/operations/learning-bot/requirements.txt" ]; then
    echo "  skills/operations/learning-bot..."
    cd "$SCRIPT_DIR/skills/operations/learning-bot"
    python3 -m venv .venv 2>/dev/null || true
    source .venv/bin/activate 2>/dev/null && pip install -q -r requirements.txt 2>/dev/null && deactivate || echo "  (スキップ)"
fi

# Node.js: line-notion-server
if [ -f "$SCRIPT_DIR/skills/operations/line-notion-server/package.json" ]; then
    echo "  skills/operations/line-notion-server..."
    cd "$SCRIPT_DIR/skills/operations/line-notion-server"
    npm install --silent 2>/dev/null || echo "  (スキップ: npm が見つかりません)"
fi

cd "$SCRIPT_DIR"
echo "  完了"

# ------------------------------------------------------------
# 7. 環境変数・クレデンシャルの確認
# ------------------------------------------------------------
echo "[7/7] 環境変数・クレデンシャルを確認..."

MISSING=0

if [ ! -f "$SCRIPT_DIR/skills/documents/クロードコード/.env" ]; then
    echo "  未設定: skills/documents/クロードコード/.env"
    MISSING=1
fi

if [ ! -f "$SCRIPT_DIR/skills/operations/line-notion-server/.env" ]; then
    echo "  未設定: skills/operations/line-notion-server/.env"
    MISSING=1
fi

if [ ! -d "$SCRIPT_DIR/skills/credentials" ] || [ -z "$(ls -A "$SCRIPT_DIR/skills/credentials" 2>/dev/null)" ]; then
    echo "  未設定: skills/credentials/ (ga4-service-account.json 等)"
    MISSING=1
fi

if [ $MISSING -eq 0 ]; then
    echo "  全て設定済み"
else
    echo ""
    echo "  上記のファイルは各マシンで手動設定が必要です（APIキーのためGit管理外）。"
fi

# ------------------------------------------------------------
# 完了
# ------------------------------------------------------------
echo ""
echo "━━━ セットアップ完了 ━━━"
echo ""
echo "パス: $SCRIPT_DIR"
echo ""
echo "MCP接続（手動設定が必要）:"
echo "  - Notion: Claude Code の設定で MCP サーバーを追加"
echo "  - Gmail: Claude Code の設定で MCP サーバーを追加"
echo "  - Google Calendar: Claude Code の設定で MCP サーバーを追加"
echo ""
echo "新しいセッションで「秘書」「おはよう」等を試してください。"
