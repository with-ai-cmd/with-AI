"""
スライド画像をPDFに結合する。

使い方:
    python scripts/images_to_pdf.py \
        --image-dir path/to/assets/images/ \
        --output path/to/image-slides.pdf

出力:
    slide_01.png 〜 slide_10.png を1つのPDFに結合
"""

import argparse
import glob
import os
import sys

try:
    from PIL import Image
except ImportError:
    print("Pillowがインストールされていません。")
    print("インストール: pip3 install Pillow")
    sys.exit(1)


def images_to_pdf(image_dir: str, output_path: str):
    """画像ファイルをPDFに結合する"""

    # slide_01.png 〜 slide_10.png をソートして取得
    pattern = os.path.join(image_dir, "slide_*.png")
    image_files = sorted(glob.glob(pattern))

    if not image_files:
        print(f"エラー: 画像が見つかりません: {pattern}")
        sys.exit(1)

    print(f"画像ファイル: {len(image_files)}枚")

    # 画像を開いてRGBに変換
    images = []
    for img_path in image_files:
        img = Image.open(img_path).convert("RGB")
        images.append(img)
        print(f"  読み込み: {os.path.basename(img_path)} ({img.size[0]}x{img.size[1]})")

    # 最初の画像をベースに、残りを追加してPDF保存
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    images[0].save(
        output_path,
        "PDF",
        resolution=150.0,
        save_all=True,
        append_images=images[1:],
    )

    print(f"\nPDF生成完了: {output_path}")
    print(f"  ページ数: {len(images)}")


def main():
    parser = argparse.ArgumentParser(description="スライド画像をPDFに結合する")
    parser.add_argument("--image-dir", required=True, help="スライド画像のディレクトリ")
    parser.add_argument("--output", required=True, help="出力PDFのパス")
    args = parser.parse_args()

    images_to_pdf(args.image_dir, args.output)


if __name__ == "__main__":
    main()
