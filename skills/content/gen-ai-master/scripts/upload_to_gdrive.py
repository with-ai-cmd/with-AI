"""
Google ドライブ自動保存スクリプト

完成したPDFファイルをGoogleドライブの指定フォルダに保存する。

使い方:
    python scripts/upload_to_gdrive.py \
        --file outputs/.../document.pdf \
        --drive-folder "Gen AI Master/第1章_AIの基礎知識/1-1_AIの定義/教材"

    python scripts/upload_to_gdrive.py \
        --file outputs/.../presentation.pdf \
        --drive-folder "Gen AI Master/第1章_AIの基礎知識/1-1_AIの定義/スライド"

必要な準備:
    1. Google Cloud Console で Google Drive API を有効化
    2. OAuth 2.0 クライアントIDを作成し、credentials.json を取得
    3. credentials.json をこのスクリプトと同じディレクトリに配置
    4. pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib

初回実行時にブラウザ認証が開きます。
"""

import argparse
import os
import sys


def get_drive_service():
    """Google Drive APIサービスを取得する"""
    try:
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from google.auth.transport.requests import Request
        from googleapiclient.discovery import build
    except ImportError:
        print("Google API ライブラリがインストールされていません。")
        print("インストール: pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib")
        sys.exit(1)

    SCOPES = ["https://www.googleapis.com/auth/drive.file"]
    creds = None
    token_path = os.path.join(os.path.dirname(__file__), "token.json")
    creds_path = os.path.join(os.path.dirname(__file__), "credentials.json")

    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(creds_path):
                print(f"エラー: {creds_path} が見つかりません。")
                print("Google Cloud Console からOAuth 2.0クライアントIDのJSONをダウンロードしてください。")
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(creds_path, SCOPES)
            creds = flow.run_local_server(port=0)

        with open(token_path, "w") as token:
            token.write(creds.to_json())

    return build("drive", "v3", credentials=creds)


def find_or_create_folder(service, folder_name: str, parent_id: str = None) -> str:
    """フォルダを検索し、なければ作成する"""
    query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    if parent_id:
        query += f" and '{parent_id}' in parents"

    results = service.files().list(q=query, fields="files(id, name)").execute()
    files = results.get("files", [])

    if files:
        return files[0]["id"]

    metadata = {
        "name": folder_name,
        "mimeType": "application/vnd.google-apps.folder",
    }
    if parent_id:
        metadata["parents"] = [parent_id]

    folder = service.files().create(body=metadata, fields="id").execute()
    print(f"フォルダ作成: {folder_name}")
    return folder["id"]


def upload_file(service, file_path: str, folder_id: str):
    """ファイルをアップロードする"""
    from googleapiclient.http import MediaFileUpload

    file_name = os.path.basename(file_path)
    media = MediaFileUpload(file_path, resumable=True)
    metadata = {"name": file_name, "parents": [folder_id]}

    # 既存ファイルがあれば更新
    query = f"name='{file_name}' and '{folder_id}' in parents and trashed=false"
    results = service.files().list(q=query, fields="files(id)").execute()
    existing = results.get("files", [])

    if existing:
        service.files().update(
            fileId=existing[0]["id"], media_body=media
        ).execute()
        print(f"更新しました: {file_name}")
    else:
        service.files().create(body=metadata, media_body=media, fields="id").execute()
        print(f"アップロードしました: {file_name}")


def main():
    parser = argparse.ArgumentParser(description="PDFをGoogleドライブに保存する")
    parser.add_argument("--file", required=True, help="アップロードするファイルのパス")
    parser.add_argument(
        "--drive-folder",
        required=True,
        help="Googleドライブの保存先フォルダパス（/区切り）",
    )
    args = parser.parse_args()

    if not os.path.exists(args.file):
        print(f"エラー: ファイルが見つかりません: {args.file}")
        sys.exit(1)

    service = get_drive_service()

    # フォルダを階層的に作成
    folder_parts = args.drive_folder.strip("/").split("/")
    parent_id = None
    for folder_name in folder_parts:
        parent_id = find_or_create_folder(service, folder_name, parent_id)

    upload_file(service, args.file, parent_id)


if __name__ == "__main__":
    main()
