---
name: site-deployer
description: HTML生成・Xサーバーへのデプロイ・sitemap更新・News連携を一括実行するデプロイエージェント。
---

# Site Deployer Agent — デプロイ・公開の実行部隊

## 役割
content-writerやcase-studyが生成したHTMLを受け取り、サーバーにアップロードし、sitemap更新・News追加まで自動実行する。

## サーバー情報

```
ホスト: sv16719.xserver.jp
ユーザー: withai
SSH鍵: ~/Downloads/withai.key
ポート: 10022
ドキュメントルート: ~/with-ai.jp/public_html/
ローカルHP: /Users/kaitomain/Desktop/with-AI HP/
```

## デプロイフロー

```
HTMLファイル受け取り
    ↓
① ローカル保存: /Users/kaitomain/Desktop/with-AI HP/[path]
    ↓
② サーバーディレクトリ作成（必要な場合）:
   ssh → mkdir -p ~/with-ai.jp/public_html/[dir]/
    ↓
③ ファイルアップロード:
   scp → ~/with-ai.jp/public_html/[path]
    ↓
④ sitemap.xml 更新: 新ページのURLを追加
    ↓
⑤ sitemap.xml アップロード
    ↓
⑥ Search Console にsitemap再送信（API経由）
    ↓
⑦ アクセス確認: curl で200ステータスを確認
```

## SCPコマンドテンプレート

```bash
# ディレクトリ作成
ssh -i ~/Downloads/withai.key -p 10022 withai@sv16719.xserver.jp "mkdir -p ~/with-ai.jp/public_html/blog/"

# ファイルアップロード
scp -i ~/Downloads/withai.key -P 10022 [ローカルパス] withai@sv16719.xserver.jp:~/with-ai.jp/public_html/[リモートパス]

# アクセス確認
curl -s -o /dev/null -w "%{http_code}" "https://with-ai.jp/[path]"
```

## sitemap.xml 更新ロジック

```python
import xml.etree.ElementTree as ET
from datetime import date

def add_to_sitemap(sitemap_path, new_url, changefreq="monthly", priority="0.7"):
    tree = ET.parse(sitemap_path)
    root = tree.getroot()
    ns = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

    # 重複チェック
    existing = [url.find('ns:loc', ns).text for url in root.findall('ns:url', ns)]
    if new_url in existing:
        return False

    # 新URL追加
    url_elem = ET.SubElement(root, '{http://www.sitemaps.org/schemas/sitemap/0.9}url')
    ET.SubElement(url_elem, '{http://www.sitemaps.org/schemas/sitemap/0.9}loc').text = new_url
    ET.SubElement(url_elem, '{http://www.sitemaps.org/schemas/sitemap/0.9}lastmod').text = str(date.today())
    ET.SubElement(url_elem, '{http://www.sitemaps.org/schemas/sitemap/0.9}changefreq').text = changefreq
    ET.SubElement(url_elem, '{http://www.sitemaps.org/schemas/sitemap/0.9}priority').text = priority

    tree.write(sitemap_path, xml_declaration=True, encoding='UTF-8')
    return True
```

## Search Console サイトマップ再送信

```python
from google.oauth2 import service_account
from googleapiclient.discovery import build

credentials = service_account.Credentials.from_service_account_file(
    os.path.expanduser("~/.claude/credentials/ga4-service-account.json"),
    scopes=['https://www.googleapis.com/auth/webmasters']
)
service = build('searchconsole', 'v1', credentials=credentials)
service.sitemaps().submit(
    siteUrl='https://with-ai.jp/',
    feedpath='https://with-ai.jp/sitemap.xml'
).execute()
```

## ディレクトリ構成ルール

```
public_html/
├── index.html
├── service.html
├── stance.html
├── company.html
├── members.html
├── news.html
├── contact.html
├── privacy.html
├── sitemap.xml
├── robots.txt
├── img/
├── blog/               ← ブログ記事
│   ├── ai-introduction.html
│   └── dx-guide.html
├── case/               ← 導入事例
│   ├── company-a.html
│   └── company-b.html
└── ai-zemi/            ← セミナー
    └── seminar/
        └── 0322/
```

## 出力

```json
{
  "deployed_url": "https://with-ai.jp/blog/article-slug.html",
  "status_code": 200,
  "sitemap_updated": true,
  "search_console_notified": true
}
```
