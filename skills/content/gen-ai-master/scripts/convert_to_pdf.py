"""
Markdown → PDF 変換スクリプト

MarkdownファイルをPDFに変換する。
NotebookLMのソースファイルとして使えるよう、読みやすいフォーマットで出力。

使い方:
    python scripts/convert_to_pdf.py --input outputs/.../document.md --output outputs/.../document.pdf

必要なライブラリ:
    pip install markdown weasyprint
    または
    pip install fpdf2
"""

import argparse
import os
import sys


def convert_with_fpdf(input_path: str, output_path: str):
    """fpdf2を使ったPDF変換（軽量・依存少ない）"""
    try:
        from fpdf import FPDF
    except ImportError:
        print("fpdf2がインストールされていません。")
        print("インストール: pip install fpdf2")
        sys.exit(1)

    with open(input_path, "r", encoding="utf-8") as f:
        content = f.read()

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_margins(15, 15, 15)
    pdf.add_page()

    # 日本語フォント設定（Noto Sans JPを埋め込み - Google Drive等でも文字化けしない）
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    font_path = os.path.join(project_dir, "fonts", "NotoSansJP-Regular.ttf")
    if os.path.exists(font_path):
        pdf.add_font("NotoSansJP", "", font_path)
        pdf.set_font("NotoSansJP", size=11)
    else:
        # フォールバック: macOSシステムフォント（ローカル閲覧のみ対応）
        font_path_sys = "/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc"
        if os.path.exists(font_path_sys):
            pdf.add_font("Hiragino", "", font_path_sys, uni=True)
            pdf.set_font("Hiragino", size=11)
            print("警告: Noto Sans JPが見つかりません。ヒラギノで代替しますが、Google Driveでは文字化けする可能性があります。")
        else:
            print("警告: 日本語フォントが見つかりません。英語フォントで出力します。")
            pdf.set_font("Helvetica", size=11)

    # 利用可能な幅を計算
    content_w = pdf.w - pdf.l_margin - pdf.r_margin

    # Markdownの簡易パース
    for line in content.split("\n"):
        stripped = line.strip()
        if stripped.startswith("# "):
            pdf.set_font_size(18)
            pdf.set_x(pdf.l_margin)
            pdf.cell(content_w, 12, stripped[2:], new_x="LMARGIN", new_y="NEXT")
            pdf.set_font_size(11)
        elif stripped.startswith("## "):
            pdf.set_font_size(15)
            pdf.set_x(pdf.l_margin)
            pdf.cell(content_w, 10, stripped[3:], new_x="LMARGIN", new_y="NEXT")
            pdf.set_font_size(11)
        elif stripped.startswith("### "):
            pdf.set_font_size(13)
            pdf.set_x(pdf.l_margin)
            pdf.cell(content_w, 9, stripped[4:], new_x="LMARGIN", new_y="NEXT")
            pdf.set_font_size(11)
        elif stripped.startswith("- "):
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(content_w, 7, f"  • {stripped[2:]}")
        elif stripped.startswith("|"):
            if "---" in stripped:
                continue
            cells = [c.strip() for c in stripped.split("|") if c.strip()]
            row_text = "  |  ".join(cells)
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(content_w, 7, row_text)
        elif stripped.startswith("> "):
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(content_w, 7, f"    {stripped[2:]}")
        elif stripped == "---":
            pdf.ln(3)
        elif stripped == "":
            pdf.ln(4)
        else:
            clean = stripped.replace("**", "")
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(content_w, 7, clean)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    pdf.output(output_path)
    print(f"PDF生成完了: {output_path}")


def main():
    parser = argparse.ArgumentParser(description="MarkdownをPDFに変換する")
    parser.add_argument("--input", required=True, help="入力Markdownファイルのパス")
    parser.add_argument("--output", required=True, help="出力PDFファイルのパス")
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"エラー: ファイルが見つかりません: {args.input}")
        sys.exit(1)

    convert_with_fpdf(args.input, args.output)


if __name__ == "__main__":
    main()
