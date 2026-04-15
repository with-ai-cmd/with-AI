#!/usr/bin/env python3
"""
build_slide.py — content.json → HTML slide builder

Usage:
  python3 scripts/build_slide.py --content contents/5-1/5-1-1.json --output outputs/5-1-1.html
  python3 scripts/build_slide.py --content contents/5-1/5-1-1.json  # auto-detect output
  python3 scripts/build_slide.py --content contents/5-1/5-1-1.json --deploy  # build + SCP

Supported designs: chatgpt-ui, gemini-ui, claude-ui, whiteboard
"""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from html import escape

# ─────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent

CHAPTER_OUTPUT_NAMES = {
    1: "第1章 AI概論",
    2: "第2章 生成AIの基礎",
    3: "第3章 プロンプトエンジニアリング",
    4: "第4章 代表的な生成AIツール",
    5: "第5章_ChatGPT",
    6: "第6章_Gemini",
    7: "第7章_Claude",
}

SECTION_LABELS = {
    1: "入門",
    2: "基本操作",
    3: "応用",
    4: "カスタマイズ",
    5: "実践",
    6: "高度な機能",
}

DEPLOY_SSH_KEY = os.path.expanduser("~/Downloads/withai.key")
DEPLOY_HOST = "withai@sv16719.xserver.jp"
DEPLOY_PORT = "10022"
DEPLOY_BASE = "~/with-ai.jp/public_html/gen-ai"


# ─────────────────────────────────────────────
# Template variable replacement
# ─────────────────────────────────────────────
def resolve_var(key: str, data: dict) -> str:
    """Resolve a dotted key like 'registration.url' from updateable/static."""
    # Special computed variables
    if key == "features_count":
        features = data.get("updateable", {}).get("features", [])
        return str(len(features))
    if key == "features":
        features = data.get("updateable", {}).get("features", [])
        return "\n".join(f"- {f}" for f in features)

    # Search in updateable, then static
    for section in ("updateable", "static"):
        obj = data.get(section, {})
        parts = key.split(".")
        cur = obj
        for p in parts:
            if isinstance(cur, dict) and p in cur:
                cur = cur[p]
            else:
                cur = None
                break
        if cur is not None and not isinstance(cur, (dict, list)):
            return str(cur)

    return "{" + key + "}"  # leave unresolved


def replace_vars(text: str, data: dict) -> str:
    """Replace {var} patterns in text."""
    if not isinstance(text, str):
        return text
    return re.sub(r"\{([a-zA-Z_][a-zA-Z0-9_.]*)\}", lambda m: resolve_var(m.group(1), data), text)


def process_value(val, data: dict):
    """Recursively replace vars in strings, lists, dicts."""
    if isinstance(val, str):
        return replace_vars(val, data)
    if isinstance(val, list):
        return [process_value(v, data) for v in val]
    if isinstance(val, dict):
        return {k: process_value(v, data) for k, v in val.items()}
    return val


# ─────────────────────────────────────────────
# Markdown-lite → HTML
# ─────────────────────────────────────────────
def md(text: str) -> str:
    """Convert **bold** and basic markdown to HTML, escape first."""
    t = escape(text)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    return t


def kw_wrap(text: str) -> str:
    """Wrap **bold** as <span class='kw'>."""
    t = escape(text)
    t = re.sub(r"\*\*(.+?)\*\*", r'<span class="kw">\1</span>', t)
    return t


# ═══════════════════════════════════════════════
# Design: chatgpt-ui
# ═══════════════════════════════════════════════

CHATGPT_CSS = r"""
:root {
  --bg: #212121;
  --sidebar-bg: #171717;
  --surface: #2F2F2F;
  --text: #ECECEC;
  --text-secondary: #B4B4B4;
  --text-muted: #8E8E8E;
  --accent: #10A37F;
  --border: rgba(255,255,255,0.08);
  --input-bg: #303030;
  --input-border: #424242;
  --code-bg: #0D0D0D;
  --code-header: #262626;
  --user-bubble: #303030;
  --slide-w: 960px;
  --slide-h: 540px;
  --sidebar-w: 200px;
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
body{background:#0D0D0D;font-family:'Inter','Noto Sans JP',system-ui,sans-serif;color:var(--text);display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;overflow:hidden;-webkit-font-smoothing:antialiased}
.slide-wrapper{position:relative;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center}
.progress-bar{position:fixed;top:0;left:0;height:2px;background:var(--accent);transition:width .4s;z-index:100}
.slide{position:absolute;width:var(--slide-w);height:var(--slide-h);max-width:95vw;max-height:90vh;background:var(--bg);border-radius:12px;display:none;flex-direction:row;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.6)}
.slide.active{display:flex;opacity:1;transform:translateX(0);animation:sIn .3s ease both}
@keyframes sIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
.sb{width:var(--sidebar-w);background:var(--sidebar-bg);display:flex;flex-direction:column;padding:10px 8px;flex-shrink:0;border-right:1px solid var(--border)}
.sb-top{display:flex;align-items:center;justify-content:space-between;padding:6px 8px;margin-bottom:6px}
.sb-top-title{font-size:.88rem;font-weight:600;display:flex;align-items:center;gap:6px}
.sb-new{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);cursor:default}
.sb-new svg{width:16px;height:16px;stroke:var(--text-muted);fill:none;stroke-width:2}
.sb-label{font-size:.65rem;font-weight:500;color:var(--text-muted);padding:6px 10px 3px;letter-spacing:.03em}
.sb-item{padding:7px 10px;border-radius:8px;font-size:.78rem;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:default;margin-bottom:1px;display:flex;align-items:center;gap:6px}
.sb-item.active{background:var(--surface);color:var(--text)}
.sb-item svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:1.8;flex-shrink:0}
.sb-bottom{margin-top:auto;border-top:1px solid var(--border);padding-top:8px}
.sb-user{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;font-size:.78rem;color:var(--text-secondary)}
.sb-user-avatar{width:24px;height:24px;border-radius:50%;background:#5E35B1;display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:700;color:#FFF}
.gpt-main{flex:1;display:flex;flex-direction:column;min-width:0}
.topbar{padding:8px 16px;display:flex;align-items:center;flex-shrink:0}
.model-sel{display:flex;align-items:center;gap:4px;padding:6px 12px;border-radius:10px;font-size:.82rem;font-weight:500;color:var(--text);cursor:default;transition:background .15s}
.model-sel:hover{background:var(--surface)}
.model-sel svg{width:14px;height:14px;stroke:var(--text-muted);fill:none;stroke-width:2}
.chat{flex:1;overflow-y:auto;padding:12px 40px;display:flex;flex-direction:column;gap:20px}
.chat::-webkit-scrollbar{width:4px}
.chat::-webkit-scrollbar-thumb{background:#444;border-radius:2px}
.m{display:flex;gap:10px;animation:mIn .3s ease both}
.m.u{justify-content:flex-end}
@keyframes mIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.m.u .bubble{background:var(--user-bubble);padding:10px 16px;border-radius:20px;font-size:.88rem;line-height:1.6;max-width:75%}
.m.a{gap:10px}
.ai-icon{width:28px;height:28px;border-radius:50%;background:var(--sidebar-bg);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
.ai-icon svg{width:18px;height:18px}
.ai-body{max-width:90%;font-size:.88rem;line-height:1.7}
.ai-body strong{font-weight:600;color:#FFF}
.ai-body .kw{color:var(--accent);font-weight:600}
.ai-body ul,.ai-body ol{margin:6px 0 6px 18px;display:flex;flex-direction:column;gap:4px}
.ai-body li{font-size:.86rem;line-height:1.6}
.ai-actions{display:flex;gap:4px;margin-top:6px}
.ai-act{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:default;transition:background .15s}
.ai-act:hover{background:var(--surface)}
.ai-act svg{width:16px;height:16px;stroke:var(--text-muted);fill:none;stroke-width:1.8}
.codeblock{background:var(--code-bg);border-radius:10px;margin:8px 0;overflow:hidden;border:1px solid var(--border)}
.codeblock-head{background:var(--code-header);padding:6px 12px;display:flex;align-items:center;justify-content:space-between;font-size:.72rem;color:var(--text-muted)}
.codeblock-head .copy-btn{background:none;border:none;color:var(--text-muted);font-size:.72rem;cursor:pointer;display:flex;align-items:center;gap:4px;font-family:inherit;transition:color .2s}
.codeblock-head .copy-btn:hover{color:var(--text)}
.codeblock-head .copy-btn.copied{color:var(--accent)}
.codeblock-body{padding:12px 14px;font-family:'Source Code Pro',monospace;font-size:.8rem;line-height:1.6;white-space:pre-wrap;word-break:break-word}
.input-wrap{padding:4px 40px 14px}
.input-box{background:var(--input-bg);border:1px solid var(--input-border);border-radius:24px;padding:8px 8px 8px 16px;display:flex;align-items:center;gap:8px;transition:border-color .2s}
.input-box:hover{border-color:#555}
.input-icons{display:flex;gap:2px}
.input-icon{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:default}
.input-icon svg{width:18px;height:18px;stroke:var(--text-muted);fill:none;stroke-width:1.8}
.input-text{flex:1;font-size:.86rem;color:var(--text-muted);font-family:inherit}
.send-btn{width:32px;height:32px;border-radius:50%;background:var(--text);border:none;display:flex;align-items:center;justify-content:center;cursor:default;opacity:.3}
.send-btn svg{width:16px;height:16px;stroke:var(--sidebar-bg);fill:none;stroke-width:2.5}
.input-hint{text-align:center;font-size:.62rem;color:#555;margin-top:3px}
.welcome{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:20px}
.welcome-icon{width:40px;height:40px;border-radius:50%;background:var(--sidebar-bg);border:1px solid var(--border);display:flex;align-items:center;justify-content:center}
.welcome-icon svg{width:24px;height:24px}
.welcome-title{font-size:1.5rem;font-weight:600;text-align:center}
.welcome-sub{font-size:.85rem;color:var(--text-muted);text-align:center}
.welcome-chips{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:4px}
.welcome-chip{background:transparent;border:1px solid var(--border);border-radius:16px;padding:9px 18px;font-size:.8rem;color:var(--text-secondary);cursor:default;transition:border-color .2s}
.welcome-chip:hover{border-color:var(--accent);color:var(--text)}
.cmp-table{width:100%;border-collapse:collapse;margin:8px 0;font-size:.78rem}
.cmp-table th{background:var(--surface);padding:7px 10px;text-align:left;font-weight:600;color:var(--accent);border-bottom:1px solid var(--border)}
.cmp-table td{padding:6px 10px;border-bottom:1px solid var(--border);vertical-align:top}
.cmp-table tr:last-child td{border-bottom:none}
.gloss-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:6px 0}
.gloss-card{background:var(--surface);border-radius:10px;padding:10px 14px;border:1px solid var(--border)}
.gloss-card .gt{font-weight:600;color:var(--accent);font-size:.82rem;margin-bottom:2px}
.gloss-card .gd{font-size:.74rem;color:var(--text-muted);line-height:1.5}
.ui-hl{position:relative;z-index:10}
.ui-hl::after{content:'';position:absolute;inset:-4px;border:2.5px solid #EF4444;border-radius:inherit;pointer-events:none;z-index:11;animation:hlPulse 2s ease-in-out infinite;box-shadow:0 0 10px rgba(239,68,68,.25)}
.ui-hl[data-label]::before{content:attr(data-label);position:absolute;top:-24px;left:50%;transform:translateX(-50%);background:#EF4444;color:#FFF;font-size:.62rem;font-weight:600;padding:2px 10px;border-radius:4px;white-space:nowrap;z-index:12;font-family:'Noto Sans JP',sans-serif}
@keyframes hlPulse{0%,100%{border-color:#EF4444;box-shadow:0 0 8px rgba(239,68,68,.2)}50%{border-color:#F87171;box-shadow:0 0 14px rgba(239,68,68,.35)}}
.pg{position:absolute;bottom:5px;right:12px;font-size:.6rem;color:#444;z-index:2}
.nav-bar{position:fixed;bottom:0;left:0;right:0;display:flex;align-items:center;justify-content:center;gap:14px;padding:10px 20px;background:var(--sidebar-bg);border-top:1px solid var(--border);z-index:50}
.nav-btn{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:7px 18px;font-family:inherit;font-size:.8rem;font-weight:500;color:var(--text);cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:5px}
.nav-btn:hover{border-color:var(--accent);color:var(--accent)}
.nav-btn:disabled{opacity:.2;cursor:not-allowed}
.nav-btn:disabled:hover{border-color:var(--border);color:var(--text)}
.nav-dots{display:flex;gap:5px;align-items:center}
.nav-dot{width:7px;height:7px;border-radius:50%;background:#3A3A3A;border:none;cursor:pointer;transition:all .2s}
.nav-dot.active{background:var(--accent);width:18px;border-radius:4px}
.nav-dot:hover{background:var(--accent);opacity:.5}
.slide-counter{font-size:.8rem;color:#444;font-weight:500;min-width:45px;text-align:center}
.link-btn{display:inline-flex;align-items:center;gap:6px;margin:8px 0;padding:8px 18px;background:var(--accent);color:#fff;text-decoration:none;border-radius:8px;font-size:.82rem;font-weight:500;transition:opacity .2s}
.link-btn:hover{opacity:.85}
.link-btn svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2}
@media(max-width:768px){.sb{display:none}.slide{border-radius:0;max-width:100vw}.chat{padding:12px 16px}.input-wrap{padding:4px 16px 12px}}
.slide.active .chat .m{animation:mIn .3s ease both}
.slide.active .chat .m:nth-child(2){animation-delay:.06s}
.slide.active .chat .m:nth-child(3){animation-delay:.12s}
.slide.active .chat .m:nth-child(4){animation-delay:.18s}
.slide.active .chat .m:nth-child(5){animation-delay:.24s}
"""

SPARKLE_SVG = '<svg style="display:none"><symbol id="sparkle" viewBox="0 0 24 24"><path d="M12 2C12 2 14.5 8.5 16 10C17.5 11.5 22 12 22 12C22 12 17.5 12.5 16 14C14.5 15.5 12 22 12 22C12 22 9.5 15.5 8 14C6.5 12.5 2 12 2 12C2 12 6.5 11.5 8 10C9.5 8.5 12 2 12 2Z" fill="#ECECEC"/></symbol></svg>'

# ─────────────────────────────────────────────
# ChatGPT-UI HTML parts
# ─────────────────────────────────────────────

# SVG icon snippets
SVG_CHAT_ICON = '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke-linecap="round" stroke-linejoin="round"/></svg>'
SVG_PLUS = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>'
SVG_CHEVRON = '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
SVG_ATTACH = '<svg viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke-linecap="round" stroke-linejoin="round"/></svg>'
SVG_SEND = '<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
SVG_COPY = '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>'
SVG_THUMBUP = '<svg viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" stroke-linejoin="round"/></svg>'
SVG_THUMBDN = '<svg viewBox="0 0 24 24"><path d="M10 15V9a3 3 0 013-3l4 9v11H5.72a2 2 0 01-2-1.7l-1.38-9a2 2 0 012-2.3H10z" stroke-linejoin="round"/></svg>'
SVG_EXTERNAL = '<svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke-linecap="round" stroke-linejoin="round"/></svg>'


def chatgpt_sidebar(meta: dict) -> str:
    """Generate the sidebar HTML."""
    chapter_title = meta.get("chapter_title", "ChatGPT")
    lesson_title = meta.get("title", "")
    chapter = meta.get("chapter", 5)
    return f'''<div class="sb">
    <div class="sb-top"><span class="sb-top-title"><svg width="18" height="18"><use href="#sparkle"/></svg>{escape(chapter_title)}</span><div class="sb-new">{SVG_PLUS}</div></div>
    <div class="sb-label">{chapter}章 {escape(chapter_title)}</div>
    <div class="sb-item active">{SVG_CHAT_ICON}{escape(lesson_title)}</div>
    <div class="sb-bottom"><div class="sb-user"><div class="sb-user-avatar">U</div>User</div></div>
  </div>'''


def chatgpt_topbar() -> str:
    return f'<div class="topbar"><div class="model-sel">ChatGPT {SVG_CHEVRON}</div></div>'


def chatgpt_input_bar(placeholder: str = "Message ChatGPT...") -> str:
    return f'''<div class="input-wrap"><div class="input-box"><div class="input-icons"><div class="input-icon">{SVG_ATTACH}</div></div><span class="input-text">{escape(placeholder)}</span><div class="send-btn">{SVG_SEND}</div></div><div class="input-hint">ChatGPT can make mistakes. Check important info.</div></div>'''


def ai_actions_html() -> str:
    return f'''<div class="ai-actions"><div class="ai-act">{SVG_COPY}</div><div class="ai-act">{SVG_THUMBUP}</div><div class="ai-act">{SVG_THUMBDN}</div></div>'''


def ai_message(body_html: str) -> str:
    return f'''<div class="m a"><div class="ai-icon"><svg width="18" height="18"><use href="#sparkle"/></svg></div><div><div class="ai-body">{body_html}</div>{ai_actions_html()}</div></div>'''


def user_message(text: str) -> str:
    return f'<div class="m u"><div class="bubble">{md(text)}</div></div>'


def code_block(title: str, content: str) -> str:
    escaped_content = escape(content)
    return f'''<div class="codeblock"><div class="codeblock-head"><span>{escape(title)}</span><button class="copy-btn" onclick="copyCode(this)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy</button></div><div class="codeblock-body">{escaped_content}</div></div>'''


# ─────────────────────────────────────────────
# Slide type renderers (chatgpt-ui)
# ─────────────────────────────────────────────

def render_cover_chatgpt(slide: dict, meta: dict, idx: int, total: int) -> str:
    title = slide.get("title", "")
    subtitle = slide.get("subtitle", "")
    chips = []
    # Generate chips from goals or default question prompts
    default_chips = ["始め方を教えて", "何ができるの？", "無料で使える？", "使い方を教えて"]
    for c in default_chips:
        chips.append(f'<div class="welcome-chip">{escape(c)}</div>')

    sb = chatgpt_sidebar(meta)
    return f'''<div class="slide{' active' if idx == 0 else ''}" data-slide="{idx + 1}">
  {sb}
  <div class="gpt-main">
    {chatgpt_topbar()}
    <div class="welcome">
      <div class="welcome-icon"><svg width="24" height="24"><use href="#sparkle"/></svg></div>
      <div class="welcome-title">{md(title)}</div>
      <div class="welcome-sub">{md(subtitle)}</div>
      <div class="welcome-chips">{''.join(chips)}</div>
    </div>
    {chatgpt_input_bar("ChatGPTについて質問してみよう...")}
    <div class="pg">{idx + 1}/{total}</div>
  </div>
</div>'''


def render_goal_chatgpt(slide: dict, meta: dict, idx: int, total: int) -> str:
    goals = slide.get("goals", [])
    conclusion = slide.get("conclusion", "")
    goals_html = "".join(f'<li><span class="kw">{md(g)}</span></li>' for g in goals)
    body = f'<strong>このレッスンのゴール</strong>は以下の{len(goals)}つです：<ul>{goals_html}</ul>'
    if conclusion:
        body += f'<br>{md(conclusion)}'
    sb = chatgpt_sidebar(meta)
    return f'''<div class="slide{' active' if idx == 0 else ''}" data-slide="{idx + 1}">
  {sb}
  <div class="gpt-main">
    {chatgpt_topbar()}
    <div class="chat">
      {user_message("このレッスンで何を学ぶの？")}
      {ai_message(body)}
    </div>
    {chatgpt_input_bar()}
    <div class="pg">{idx + 1}/{total}</div>
  </div>
</div>'''


def _build_ai_response_body(resp) -> str:
    """Build AI response body HTML from the ai_response dict."""
    parts = []

    if isinstance(resp, str):
        return md(resp)

    # intro
    if "intro" in resp:
        parts.append(md(resp["intro"]))

    # body
    if "body" in resp:
        parts.append(f'<br><br>{md(resp["body"])}')

    # analogy
    if "analogy" in resp:
        parts.append(f'<br><br>{md(resp["analogy"])}')

    # fact
    if "fact" in resp:
        parts.append(f'<br><br>{md(resp["fact"])}')

    # list (features as markdown list)
    if "list" in resp:
        items = resp["list"]
        if isinstance(items, str):
            # Parse markdown-style list
            lines = [l.strip().lstrip("- ") for l in items.strip().split("\n") if l.strip()]
            ol_items = "".join(f"<li>{md(l)}</li>" for l in lines)
            parts.append(f"<ol>{ol_items}</ol>")
        elif isinstance(items, list):
            ol_items = "".join(f"<li>{md(i)}</li>" for i in items)
            parts.append(f"<ol>{ol_items}</ol>")

    # steps
    if "steps" in resp:
        steps_html = "".join(f'<li><span class="kw">{md(s)}</span></li>' for s in resp["steps"])
        parts.append(f"<ol>{steps_html}</ol>")

    # points (for chat_with_highlight)
    if "points" in resp:
        points_html = "".join(f"<li>{md(p)}</li>" for p in resp["points"])
        parts.append(f"<ul>{points_html}</ul>")

    # note
    if "note" in resp:
        parts.append(f'<br><br>{md(resp["note"])}')

    # prompt_example
    if "prompt_example" in resp:
        pe = resp["prompt_example"]
        text = pe.get("text", "") if isinstance(pe, dict) else str(pe)
        parts.append(code_block("はじめてのプロンプト", text))

    # link
    if "link" in resp:
        link = resp["link"]
        url = link.get("url", "#")
        display = link.get("display", url)
        label = link.get("label", display)
        parts.append(f'<a class="link-btn" href="{escape(url)}" target="_blank" rel="noopener">{SVG_EXTERNAL} {escape(label)}</a>')

    return "".join(parts)


def render_chat_chatgpt(slide: dict, meta: dict, idx: int, total: int) -> str:
    user_msg = slide.get("user_message", "")
    ai_resp = slide.get("ai_response", {})
    body_html = _build_ai_response_body(ai_resp)

    sb = chatgpt_sidebar(meta)
    return f'''<div class="slide{' active' if idx == 0 else ''}" data-slide="{idx + 1}">
  {sb}
  <div class="gpt-main">
    {chatgpt_topbar()}
    <div class="chat">
      {user_message(user_msg)}
      {ai_message(body_html)}
    </div>
    {chatgpt_input_bar()}
    <div class="pg">{idx + 1}/{total}</div>
  </div>
</div>'''


def render_chat_highlight_chatgpt(slide: dict, meta: dict, idx: int, total: int) -> str:
    """Same as chat but with highlight annotations on UI elements."""
    user_msg = slide.get("user_message", "")
    ai_resp = slide.get("ai_response", {})
    highlights = slide.get("highlights", [])
    body_html = _build_ai_response_body(ai_resp)

    sb = chatgpt_sidebar(meta)

    # Build highlight class attributes for known targets
    hl_map = {}
    for h in highlights:
        hl_map[h.get("target", "")] = h.get("label", "")

    # Apply highlights to known targets via data attributes
    topbar_hl = ""
    input_hl = ""
    if "model-selector" in hl_map:
        topbar_hl = f' class="ui-hl" data-label="{escape(hl_map["model-selector"])}"'
    if "input-bar" in hl_map:
        input_hl = f' class="ui-hl" data-label="{escape(hl_map["input-bar"])}"'

    topbar_html = f'<div class="topbar"><div class="model-sel"{topbar_hl}>ChatGPT {SVG_CHEVRON}</div></div>'

    input_bar = chatgpt_input_bar()
    if input_hl:
        input_bar = input_bar.replace('<div class="input-box">', f'<div class="input-box"{input_hl}>', 1)

    return f'''<div class="slide{' active' if idx == 0 else ''}" data-slide="{idx + 1}">
  {sb}
  <div class="gpt-main">
    {topbar_html}
    <div class="chat">
      {user_message(user_msg)}
      {ai_message(body_html)}
    </div>
    {input_bar}
    <div class="pg">{idx + 1}/{total}</div>
  </div>
</div>'''


def render_summary_chatgpt(slide: dict, meta: dict, idx: int, total: int) -> str:
    points = slide.get("points", [])
    next_label = slide.get("next", "")

    items_html = "".join(f'<li>{md(p)}</li>' for p in points)
    body = f"<strong>このレッスンのまとめ</strong>：<ul>{items_html}</ul>"
    if next_label:
        body += f'<br><br><span class="kw">{md(next_label)}</span>'

    sb = chatgpt_sidebar(meta)
    return f'''<div class="slide{' active' if idx == 0 else ''}" data-slide="{idx + 1}">
  {sb}
  <div class="gpt-main">
    {chatgpt_topbar()}
    <div class="chat">
      {user_message("今日のまとめを教えて")}
      {ai_message(body)}
    </div>
    {chatgpt_input_bar()}
    <div class="pg">{idx + 1}/{total}</div>
  </div>
</div>'''


def render_glossary_chatgpt(slide: dict, meta: dict, idx: int, total: int) -> str:
    terms = slide.get("terms", [])
    cards = "".join(
        f'<div class="gloss-card"><div class="gt">{md(t["term"])}</div><div class="gd">{md(t["definition"])}</div></div>'
        for t in terms
    )
    body = f'<strong>用語集</strong>：<div class="gloss-grid">{cards}</div>'

    sb = chatgpt_sidebar(meta)
    return f'''<div class="slide{' active' if idx == 0 else ''}" data-slide="{idx + 1}">
  {sb}
  <div class="gpt-main">
    {chatgpt_topbar()}
    <div class="chat">
      {user_message("用語をまとめて教えて")}
      {ai_message(body)}
    </div>
    {chatgpt_input_bar()}
    <div class="pg">{idx + 1}/{total}</div>
  </div>
</div>'''


def render_table_chatgpt(slide: dict, meta: dict, idx: int, total: int) -> str:
    user_msg = slide.get("user_message", "")
    headers = slide.get("headers", [])
    rows = slide.get("rows", [])

    th = "".join(f"<th>{md(h)}</th>" for h in headers)
    tr = ""
    for row in rows:
        cells = "".join(f"<td>{md(c)}</td>" for c in row)
        tr += f"<tr>{cells}</tr>"

    body = f'<table class="cmp-table"><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table>'

    sb = chatgpt_sidebar(meta)
    return f'''<div class="slide{' active' if idx == 0 else ''}" data-slide="{idx + 1}">
  {sb}
  <div class="gpt-main">
    {chatgpt_topbar()}
    <div class="chat">
      {user_message(user_msg or "比較表を見せて")}
      {ai_message(body)}
    </div>
    {chatgpt_input_bar()}
    <div class="pg">{idx + 1}/{total}</div>
  </div>
</div>'''


def render_registration_chatgpt(slide: dict, meta: dict, idx: int, total: int) -> str:
    links = slide.get("links", [])
    links_html = ""
    for lnk in links:
        url = lnk.get("url", "#")
        label = lnk.get("label", url)
        links_html += f'<a class="link-btn" href="{escape(url)}" target="_blank" rel="noopener">{SVG_EXTERNAL} {escape(label)}</a> '

    body = md(slide.get("intro", "以下のリンクから登録できます：")) + "<br><br>" + links_html

    sb = chatgpt_sidebar(meta)
    return f'''<div class="slide{' active' if idx == 0 else ''}" data-slide="{idx + 1}">
  {sb}
  <div class="gpt-main">
    {chatgpt_topbar()}
    <div class="chat">
      {user_message(slide.get("user_message", "登録方法を教えて"))}
      {ai_message(body)}
    </div>
    {chatgpt_input_bar()}
    <div class="pg">{idx + 1}/{total}</div>
  </div>
</div>'''


# ─────────────────────────────────────────────
# Slide dispatcher
# ─────────────────────────────────────────────

CHATGPT_RENDERERS = {
    "cover": render_cover_chatgpt,
    "goal": render_goal_chatgpt,
    "chat": render_chat_chatgpt,
    "chat_with_highlight": render_chat_highlight_chatgpt,
    "summary": render_summary_chatgpt,
    "glossary": render_glossary_chatgpt,
    "table": render_table_chatgpt,
    "registration": render_registration_chatgpt,
}

# Alias renderers for future designs — they reuse chatgpt for now
DESIGN_RENDERERS = {
    "chatgpt-ui": CHATGPT_RENDERERS,
    "gemini-ui": CHATGPT_RENDERERS,   # TODO: implement gemini design
    "claude-ui": CHATGPT_RENDERERS,   # TODO: implement claude design
    "whiteboard": CHATGPT_RENDERERS,  # TODO: implement whiteboard design
}

DESIGN_CSS = {
    "chatgpt-ui": CHATGPT_CSS,
    "gemini-ui": CHATGPT_CSS,    # TODO
    "claude-ui": CHATGPT_CSS,    # TODO
    "whiteboard": CHATGPT_CSS,   # TODO
}


# ─────────────────────────────────────────────
# Navigation JS
# ─────────────────────────────────────────────

NAV_JS = r"""
const slides=document.querySelectorAll('.slide'),total=slides.length;
let cur=0;
const dc=document.getElementById('navDots');
for(let i=0;i<total;i++){const d=document.createElement('button');d.className='nav-dot'+(i===0?' active':'');d.onclick=()=>go(i);dc.appendChild(d)}
function prev(){go(cur-1)}
function next(){go(cur+1)}
function go(i){
  if(i<0||i>=total||i===cur)return;
  slides[cur].classList.remove('active');
  slides[cur].style.display='none';
  cur=i;
  slides[cur].style.display='';
  slides[cur].classList.add('active');
  updateUI();
}
function updateUI(){
  document.getElementById('slideCounter').textContent=(cur+1)+' / '+total;
  document.getElementById('progressBar').style.width=((cur+1)/total*100)+'%';
  document.getElementById('prevBtn').disabled=cur===0;
  document.getElementById('nextBtn').disabled=cur===total-1;
  document.querySelectorAll('.nav-dot').forEach(function(d,i){d.classList.toggle('active',i===cur)});
}
document.addEventListener('keydown',function(e){
  if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();next()}
  if(e.key==='ArrowLeft'){e.preventDefault();prev()}
});
let tx=0;
document.addEventListener('touchstart',function(e){tx=e.touches[0].clientX});
document.addEventListener('touchend',function(e){var d=tx-e.changedTouches[0].clientX;if(Math.abs(d)>50){d>0?next():prev()}});
function copyCode(btn){
  var b=btn.closest('.codeblock');
  var t=b.querySelector('.codeblock-body').textContent.trim();
  navigator.clipboard.writeText(t).then(function(){
    btn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>Copied!';
    btn.classList.add('copied');
    setTimeout(function(){
      btn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy';
      btn.classList.remove('copied');
    },1500);
  });
}
updateUI();
"""


# ─────────────────────────────────────────────
# Build full HTML
# ─────────────────────────────────────────────

def build_html(data: dict) -> str:
    meta = data["_meta"]
    design = meta.get("design", "chatgpt-ui")
    lesson = meta.get("lesson", "")
    title = meta.get("title", "Slide")
    chapter_title = meta.get("chapter_title", "")

    renderers = DESIGN_RENDERERS.get(design, CHATGPT_RENDERERS)
    css = DESIGN_CSS.get(design, CHATGPT_CSS)

    slides_data = data.get("slides", [])
    total = len(slides_data)

    # Render each slide
    slides_html = []
    for i, slide in enumerate(slides_data):
        stype = slide.get("type", "chat")
        renderer = renderers.get(stype)
        if renderer is None:
            # Fallback: render as chat if type is unknown
            renderer = renderers.get("chat", render_chat_chatgpt)
        slides_html.append(renderer(slide, meta, i, total))

    slides_joined = "\n\n".join(slides_html)

    # Nav bar
    nav_bar = f'''<nav class="nav-bar">
  <button class="nav-btn" id="prevBtn" onclick="prev()" disabled><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>前へ</button>
  <div class="nav-dots" id="navDots"></div>
  <span class="slide-counter" id="slideCounter">1 / {total}</span>
  <button class="nav-btn" id="nextBtn" onclick="next()">次へ<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2L10 7L5 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
</nav>'''

    return f'''<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{escape(lesson)}. {escape(title)} — {escape(chapter_title)} Slide</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Sans+JP:wght@400;500;700&family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet">
<style>
{css}
</style>
</head>
<body>
<div class="progress-bar" id="progressBar" style="width:{100/total:.0f}%"></div>
<div class="slide-wrapper" id="slideWrapper">

{SPARKLE_SVG}

{slides_joined}

</div>

{nav_bar}

<script>
{NAV_JS}
</script>
</body>
</html>'''


# ─────────────────────────────────────────────
# Output path auto-detection
# ─────────────────────────────────────────────

def auto_output_path(meta: dict) -> Path:
    """Generate output path from meta: outputs/第5章_ChatGPT/1.入門/1-1.スライド.html"""
    chapter = meta.get("chapter", 0)
    lesson = meta.get("lesson", "0-0-0")  # e.g. "5-1-1"
    parts = lesson.split("-")
    section_num = int(parts[1]) if len(parts) > 1 else 1
    sub_num = int(parts[2]) if len(parts) > 2 else 1

    chapter_dir = CHAPTER_OUTPUT_NAMES.get(chapter, f"第{chapter}章")
    section_label = SECTION_LABELS.get(section_num, f"セクション{section_num}")
    section_dir = f"{section_num}.{section_label}"
    filename = f"{section_num}-{sub_num}.スライド.html"

    return PROJECT_ROOT / "outputs" / chapter_dir / section_dir / filename


# ─────────────────────────────────────────────
# Deploy via SCP
# ─────────────────────────────────────────────

def deploy(output_path: Path, lesson_id: str):
    """SCP the file to the production server."""
    remote_dir = f"{DEPLOY_BASE}/{lesson_id}"
    remote_path = f"{remote_dir}/index.html"

    # Create remote directory
    mkdir_cmd = [
        "ssh", "-i", DEPLOY_SSH_KEY, "-p", DEPLOY_PORT,
        DEPLOY_HOST, f"mkdir -p {remote_dir}"
    ]
    print(f"  Creating remote dir: {remote_dir}")
    subprocess.run(mkdir_cmd, check=True)

    # SCP upload
    scp_cmd = [
        "scp", "-i", DEPLOY_SSH_KEY, "-P", DEPLOY_PORT,
        str(output_path), f"{DEPLOY_HOST}:{remote_path}"
    ]
    print(f"  Uploading to: {remote_path}")
    subprocess.run(scp_cmd, check=True)
    print(f"  Deployed: https://with-ai.jp/gen-ai/{lesson_id}/")


# ─────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Build HTML slides from content.json"
    )
    parser.add_argument(
        "--content", required=True,
        help="Path to content.json (relative to project root or absolute)"
    )
    parser.add_argument(
        "--output",
        help="Output HTML path (auto-detected if omitted)"
    )
    parser.add_argument(
        "--deploy", action="store_true",
        help="Also upload the file to the production server"
    )
    args = parser.parse_args()

    # Resolve content path
    content_path = Path(args.content)
    if not content_path.is_absolute():
        content_path = PROJECT_ROOT / content_path

    if not content_path.exists():
        print(f"Error: content file not found: {content_path}", file=sys.stderr)
        sys.exit(1)

    # Load and process content
    print(f"Reading: {content_path}")
    with open(content_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Replace template variables in the entire data tree (except _meta)
    meta = data["_meta"]
    data_processed = {
        "_meta": meta,
        **{k: process_value(v, data) for k, v in data.items() if k != "_meta"}
    }

    # Build HTML
    html = build_html(data_processed)

    # Determine output path
    if args.output:
        output_path = Path(args.output)
        if not output_path.is_absolute():
            output_path = PROJECT_ROOT / output_path
    else:
        output_path = auto_output_path(meta)

    # Write
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)

    slide_count = len(data_processed.get("slides", []))
    print(f"Built: {output_path}")
    print(f"  Design: {meta.get('design', '?')}")
    print(f"  Slides: {slide_count}")
    print(f"  Size:   {len(html):,} bytes")

    # Deploy
    if args.deploy:
        lesson_id = meta.get("lesson", "").replace(".", "-")
        print(f"\nDeploying {lesson_id}...")
        deploy(output_path, lesson_id)

    return 0


if __name__ == "__main__":
    sys.exit(main())
