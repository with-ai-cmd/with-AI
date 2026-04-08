"""
教材(document.md)から10ページ分のスライド構成を設計する。

使い方:
    python scripts/build_slide_structure.py \
        --document path/to/document.md \
        --lesson-id 1-1-1 \
        --lesson-title "AIの定義とは" \
        --chapter-title "第1章 AIの基礎知識" \
        --section-title "1-1 AIの定義" \
        --output path/to/slide_structure.json

出力:
    10ページ分のスライド構成を定義したJSON
"""

import argparse
import json
import os
import re
import sys


def parse_document(doc_path: str) -> dict:
    """教材Markdownを解析し、構造化データにする"""
    with open(doc_path, "r", encoding="utf-8") as f:
        content = f.read()

    sections = []
    current_section = {"title": "", "content": ""}

    for line in content.split("\n"):
        # ##見出しでセクション分割
        if re.match(r"^##\s+", line):
            if current_section["title"]:
                sections.append(current_section)
            current_section = {"title": line.lstrip("# ").strip(), "content": ""}
        else:
            current_section["content"] += line + "\n"

    if current_section["title"]:
        sections.append(current_section)

    # 太字テキストを重要ポイントとして抽出
    key_points = re.findall(r"\*\*(.+?)\*\*", content)

    return {
        "sections": sections,
        "key_points": key_points,
        "full_text": content,
    }


def build_structure(
    parsed_doc: dict,
    lesson_id: str,
    lesson_title: str,
    chapter_title: str,
    section_title: str,
) -> list:
    """10ページ分のスライド構成を生成する"""
    sections = parsed_doc["sections"]
    key_points = parsed_doc["key_points"]

    pages = []

    # ページ1: 表紙
    pages.append({
        "page_number": 1,
        "role": "表紙",
        "title": f"{lesson_id} {lesson_title}",
        "key_points": [],
        "visual_concept": "AI・テクノロジーを象徴する抽象的なグラフィック",
        "color_mood": "ダーク、先進的",
        "section_number": section_title,
        "chapter_name": chapter_title,
    })

    # ページ2: 導入
    # 「ひとことで言うと」を探す
    summary = ""
    for s in sections:
        if "ひとことで言うと" in s["title"] or "ひとことで言うと" in s["content"]:
            summary = s["content"].strip()[:200]
            break

    pages.append({
        "page_number": 2,
        "role": "導入",
        "title": "この章で学ぶこと",
        "key_points": [s["title"] for s in sections[:5] if s["title"]],
        "visual_concept": "学習・発見を表すイラスト",
        "color_mood": "明るい、親しみやすい",
        "one_line_summary": summary or f"{lesson_title}について学びます",
    })

    # ページ3-8: 本編（教材のセクションを最大6ページに分配）
    content_sections = [s for s in sections if s["title"]]
    # セクションを6ページに振り分け
    pages_per_section = max(1, min(6, len(content_sections)))
    chunk_size = max(1, len(content_sections) // pages_per_section)

    visual_concepts = [
        "概念を図解するイラスト",
        "仕組みを表すフローチャート",
        "比較を表す図",
        "具体例を表すシーン",
        "関連性を表すネットワーク図",
        "発展を表すタイムライン",
    ]

    for i in range(6):
        idx_start = i * chunk_size
        idx_end = min((i + 1) * chunk_size, len(content_sections))
        chunk = content_sections[idx_start:idx_end] if idx_start < len(content_sections) else []

        if chunk:
            title = chunk[0]["title"]
            # チャンク内のコンテンツから要点を抽出
            chunk_text = " ".join([c["content"] for c in chunk])
            chunk_points = re.findall(r"\*\*(.+?)\*\*", chunk_text)[:5]
            if not chunk_points:
                # 太字がなければ最初の数行を使う
                lines = [l.strip() for l in chunk_text.split("\n") if l.strip() and not l.startswith("#")]
                chunk_points = lines[:4]
        else:
            title = f"{lesson_title} — ポイント{i + 1}"
            chunk_points = []

        pages.append({
            "page_number": i + 3,
            "role": "本編",
            "title": title,
            "key_points": chunk_points[:5],
            "visual_concept": visual_concepts[i % len(visual_concepts)],
            "color_mood": "プロフェッショナル、クリーン",
        })

    # ページ9: まとめ
    summary_points = key_points[:5] if key_points else [s["title"] for s in sections[:5]]
    pages.append({
        "page_number": 9,
        "role": "まとめ",
        "title": "まとめ",
        "key_points": summary_points,
        "visual_concept": "達成・完了を表すイラスト",
        "color_mood": "ポジティブ、達成感",
    })

    # ページ10: 用語集
    # 太字キーワードから用語集を作成
    glossary_terms = key_points[:5] if key_points else []
    pages.append({
        "page_number": 10,
        "role": "用語集",
        "title": "用語集",
        "key_points": glossary_terms,
        "visual_concept": "辞書・リファレンスのイメージ",
        "color_mood": "落ち着いた、整理された",
    })

    return pages


def main():
    parser = argparse.ArgumentParser(description="教材から10P分のスライド構成を設計する")
    parser.add_argument("--document", required=True, help="教材(document.md)のパス")
    parser.add_argument("--lesson-id", required=True, help="レッスンID（例: 1-1-1）")
    parser.add_argument("--lesson-title", required=True, help="レッスンタイトル")
    parser.add_argument("--chapter-title", required=True, help="章タイトル（例: 第1章 AIの基礎知識）")
    parser.add_argument("--section-title", required=True, help="セクションタイトル（例: 1-1 AIの定義）")
    parser.add_argument("--output", required=True, help="出力JSONのパス")
    args = parser.parse_args()

    if not os.path.exists(args.document):
        print(f"エラー: 教材が見つかりません: {args.document}")
        print("先に /gen-ai で教材を生成してください。")
        sys.exit(1)

    parsed = parse_document(args.document)
    structure = build_structure(
        parsed,
        args.lesson_id,
        args.lesson_title,
        args.chapter_title,
        args.section_title,
    )

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(structure, f, ensure_ascii=False, indent=2)

    print(f"スライド構成を保存しました: {args.output}")
    print(f"  ページ数: {len(structure)}")
    for page in structure:
        print(f"  P{page['page_number']}: [{page['role']}] {page['title']}")


if __name__ == "__main__":
    main()
