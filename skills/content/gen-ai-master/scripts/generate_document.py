"""
教材ドキュメント生成スクリプト

カリキュラム番号を指定して、Markdown形式の教材ドキュメントを生成する。
リサーチ→文章化→やさしく書き直しの流れはClaudeが担当し、
このスクリプトはファイル保存とディレクトリ管理を行う。

使い方:
    python scripts/generate_document.py --id 1-1-1 --content "教材内容のMarkdown"
"""

import argparse
import json
import os
from pathlib import Path


def get_lesson_info(curriculum_path: str, lesson_id: str) -> dict:
    """カリキュラムJSONからレッスン情報を取得する"""
    with open(curriculum_path, "r", encoding="utf-8") as f:
        curriculum = json.load(f)

    parts = lesson_id.split("-")
    chapter_id = parts[0]
    section_id = f"{parts[0]}-{parts[1]}"

    for chapter in curriculum["chapters"]:
        if chapter["id"] == chapter_id:
            for section in chapter["sections"]:
                if section["id"] == section_id:
                    for lesson in section["lessons"]:
                        if lesson["id"] == lesson_id:
                            return {
                                "lesson": lesson,
                                "section": section,
                                "chapter": chapter,
                            }
    raise ValueError(f"カリキュラム番号 {lesson_id} が見つかりません")


def get_output_dir(base_dir: str, info: dict) -> Path:
    """出力先ディレクトリのパスを生成する"""
    chapter_dir = f"第{info['chapter']['id']}章_{info['chapter']['title']}"
    section_dir = f"{info['section']['id']}_{info['section']['title']}"
    lesson_dir = f"{info['lesson']['id']}_{info['lesson']['title']}"
    return Path(base_dir) / "outputs" / chapter_dir / section_dir / lesson_dir


def save_document(output_dir: Path, content: str, filename: str = "document.md"):
    """Markdownファイルを保存する"""
    output_dir.mkdir(parents=True, exist_ok=True)
    filepath = output_dir / filename
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"保存しました: {filepath}")
    return filepath


def main():
    parser = argparse.ArgumentParser(description="教材ドキュメントを保存する")
    parser.add_argument("--id", required=True, help="カリキュラム番号（例: 1-1-1）")
    parser.add_argument("--content", required=True, help="教材内容（Markdown）")
    parser.add_argument(
        "--base-dir",
        default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        help="gen-ai-masterのルートディレクトリ",
    )
    args = parser.parse_args()

    curriculum_path = os.path.join(args.base_dir, "curriculum", "curriculum.json")
    info = get_lesson_info(curriculum_path, args.id)
    output_dir = get_output_dir(args.base_dir, info)
    save_document(output_dir, args.content)


if __name__ == "__main__":
    main()
