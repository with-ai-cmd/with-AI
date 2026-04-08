"""
nanobanana 2 (gemini-3.1-flash-image-preview) でスライド画像を生成する。

使い方:
    python3 scripts/call_nanobanana.py \
        --prompts-json path/to/image_prompts.json \
        --output-dir path/to/assets/images/

環境変数:
    NANOBANANA_API_KEY — Google AI Studio の APIキー

出力:
    slide_01.png 〜 slide_10.png を output-dir に保存
"""

import argparse
import json
import os
import sys
import time

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("google-genai がインストールされていません。")
    print("インストール: pip3 install google-genai")
    sys.exit(1)

# nanobanana 2 のモデルID
MODEL_ID = "gemini-3.1-flash-image-preview"


def generate_image(client, prompt: str, image_size: str = "2K") -> bytes:
    """nanobanana 2 で画像を生成し、バイナリデータを返す"""
    response = client.models.generate_content(
        model=MODEL_ID,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
            image_config=types.ImageConfig(
                aspect_ratio="16:9",
            ),
        ),
    )

    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            return part.inline_data.data

    raise ValueError("画像が生成されませんでした。レスポンスにテキストのみ含まれています。")


def generate_images(
    prompts_json_path: str,
    output_dir: str,
    client,
    delay: float = 2.0,
):
    """プロンプトJSONから画像を一括生成する"""

    with open(prompts_json_path, "r", encoding="utf-8") as f:
        prompts = json.load(f)

    os.makedirs(output_dir, exist_ok=True)
    generated = []

    for i, item in enumerate(prompts):
        page_num = item.get("page_number", i + 1)
        prompt = item.get("prompt", "")
        filename = f"slide_{page_num:02d}.png"
        filepath = os.path.join(output_dir, filename)

        print(f"[{i + 1}/{len(prompts)}] ページ{page_num}を生成中...")

        try:
            image_data = generate_image(client, prompt)
            with open(filepath, "wb") as f:
                f.write(image_data)
            print(f"  → 保存: {filepath} ({len(image_data)} bytes)")
            generated.append(filepath)
        except Exception as e:
            print(f"  → エラー: {e}")
            print(f"  → スキップしました: ページ{page_num}")

        # レート制限対策
        if i < len(prompts) - 1:
            time.sleep(delay)

    print(f"\n生成完了: {len(generated)}/{len(prompts)} 枚")
    return generated


def main():
    parser = argparse.ArgumentParser(description="nanobanana 2 でスライド画像を生成する")
    parser.add_argument("--prompts-json", required=True, help="画像プロンプトJSONのパス")
    parser.add_argument("--output-dir", required=True, help="画像の出力先ディレクトリ")
    parser.add_argument("--delay", type=float, default=2.0, help="API呼び出し間隔（秒）")
    args = parser.parse_args()

    api_key = os.environ.get("NANOBANANA_API_KEY")
    if not api_key:
        print("エラー: 環境変数 NANOBANANA_API_KEY が設定されていません。")
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    generate_images(
        args.prompts_json,
        args.output_dir,
        client,
        args.delay,
    )


if __name__ == "__main__":
    main()
