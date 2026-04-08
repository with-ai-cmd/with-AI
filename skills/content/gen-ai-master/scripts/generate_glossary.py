"""
用語集生成スクリプト

セクション単位（例: 1-1）で用語集をMarkdown形式で生成・保存する。

使い方:
    python scripts/generate_glossary.py --section 1-1 --content "用語集のMarkdown"
"""

import argparse
import json
import os
from pathlib import Path


def get_section_info(curriculum_path: str, section_id: str) -> dict:
    """カリキュラムJSONからセクション情報を取得する"""
    with open(curriculum_path, "r", encoding="utf-8") as f:
        curriculum = json.load(f)

    chapter_id = section_id.split("-")[0]

    for chapter in curriculum["chapters"]:
        if chapter["id"] == chapter_id:
            for section in chapter["sections"]:
                if section["id"] == section_id:
                    return {"section": section, "chapter": chapter}
    raise ValueError(f"セクション {section_id} が見つかりません")


def get_section_dir(base_dir: str, info: dict) -> Path:
    """セクションディレクトリのパスを生成する"""
    chapter_dir = f"第{info['chapter']['id']}章_{info['chapter']['title']}"
    section_dir = f"{info['section']['id']}_{info['section']['title']}"
    return Path(base_dir) / "outputs" / chapter_dir / section_dir


def save_glossary(section_dir: Path, content: str, section_id: str):
    """用語集を保存する"""
    section_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{section_id}.用語集.md"
    filepath = section_dir / filename
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"保存しました: {filepath}")
    return filepath


def main():
    parser = argparse.ArgumentParser(description="用語集を保存する")
    parser.add_argument("--section", required=True, help="セクション番号（例: 1-1）")
    parser.add_argument("--content", required=True, help="用語集内容（Markdown）")
    parser.add_argument(
        "--base-dir",
        default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        help="gen-ai-masterのルートディレクトリ",
    )
    args = parser.parse_args()

    curriculum_path = os.path.join(args.base_dir, "curriculum", "curriculum.json")
    info = get_section_info(curriculum_path, args.section)
    section_dir = get_section_dir(args.base_dir, info)
    save_glossary(section_dir, args.content, args.section)


if __name__ == "__main__":
    main()
