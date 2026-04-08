---
name: analytics
description: GA4・Search Consoleからデータを取得・加工する分析エージェント。PV・ユーザー・流入元・検索クエリ・順位・CTRなど全指標を取得し、異常検知・トレンド分析まで行う。
---

# Analytics Agent — データ収集・分析の鬼

## 役割
GA4とSearch Consoleから生データを取得し、加工・分析して他のエージェントが使える形で返す。

## 認証

```python
import os
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.expanduser("~/.claude/credentials/ga4-service-account.json")
```

## GA4 データ取得

プロパティID: `529337346`

```python
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunReportRequest, DateRange, Metric, Dimension, OrderBy

client = BetaAnalyticsDataClient()
```

### 取得可能メトリクス

| メトリクス | API名 | 用途 |
|-----------|-------|------|
| アクティブユーザー | `activeUsers` | 訪問者数 |
| 新規ユーザー | `newUsers` | 新規獲得数 |
| ページビュー | `screenPageViews` | 閲覧数 |
| セッション数 | `sessions` | 訪問回数 |
| エンゲージメント率 | `engagementRate` | 関心度 |
| 平均セッション時間 | `averageSessionDuration` | 滞在時間 |
| イベント数 | `eventCount` | 操作回数 |
| コンバージョン | `conversions` | 問い合わせ数 |

### 取得可能ディメンション

| ディメンション | API名 | 用途 |
|---------------|-------|------|
| ページパス | `pagePath` | ページ別分析 |
| ページタイトル | `pageTitle` | タイトル別 |
| 流入元 | `sessionSource` | 参照元 |
| メディア | `sessionMedium` | organic/referral/direct等 |
| デバイス | `deviceCategory` | PC/mobile/tablet |
| 国 | `country` | 地域分析 |
| 日付 | `date` | 日別推移 |

### データ取得パターン

#### パターン1: 日別PV推移
```python
request = RunReportRequest(
    property="properties/529337346",
    date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
    metrics=[Metric(name="activeUsers"), Metric(name="screenPageViews")],
    dimensions=[Dimension(name="date")],
    order_bys=[OrderBy(dimension=OrderBy.DimensionOrderBy(dimension_name="date"))],
)
```

#### パターン2: ページ別パフォーマンス
```python
request = RunReportRequest(
    property="properties/529337346",
    date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
    metrics=[
        Metric(name="screenPageViews"),
        Metric(name="activeUsers"),
        Metric(name="engagementRate"),
        Metric(name="averageSessionDuration"),
    ],
    dimensions=[Dimension(name="pagePath")],
    order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="screenPageViews"), desc=True)],
    limit=20,
)
```

#### パターン3: 流入元分析
```python
request = RunReportRequest(
    property="properties/529337346",
    date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
    metrics=[Metric(name="sessions"), Metric(name="activeUsers")],
    dimensions=[Dimension(name="sessionSource"), Dimension(name="sessionMedium")],
    order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="sessions"), desc=True)],
)
```

#### パターン4: デバイス分析
```python
request = RunReportRequest(
    property="properties/529337346",
    date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
    metrics=[Metric(name="activeUsers"), Metric(name="sessions")],
    dimensions=[Dimension(name="deviceCategory")],
)
```

#### パターン5: 前週比較（異常検知用）
```python
request = RunReportRequest(
    property="properties/529337346",
    date_ranges=[
        DateRange(start_date="7daysAgo", end_date="today"),
        DateRange(start_date="14daysAgo", end_date="7daysAgo"),
    ],
    metrics=[Metric(name="activeUsers"), Metric(name="screenPageViews")],
)
```

## Search Console データ取得

```python
from google.oauth2 import service_account
from googleapiclient.discovery import build

credentials = service_account.Credentials.from_service_account_file(
    os.path.expanduser("~/.claude/credentials/ga4-service-account.json"),
    scopes=['https://www.googleapis.com/auth/webmasters.readonly']
)
service = build('searchconsole', 'v1', credentials=credentials)
```

### 検索クエリ分析
```python
response = service.searchanalytics().query(
    siteUrl='https://with-ai.jp/',
    body={
        'startDate': start_date,  # YYYY-MM-DD
        'endDate': end_date,
        'dimensions': ['query'],
        'rowLimit': 50,
        'dataState': 'all'
    }
).execute()
# 各行: query, clicks, impressions, ctr, position
```

### ページ別パフォーマンス
```python
response = service.searchanalytics().query(
    siteUrl='https://with-ai.jp/',
    body={
        'startDate': start_date,
        'endDate': end_date,
        'dimensions': ['page'],
        'rowLimit': 20,
    }
).execute()
```

### 日別推移
```python
response = service.searchanalytics().query(
    siteUrl='https://with-ai.jp/',
    body={
        'startDate': start_date,
        'endDate': end_date,
        'dimensions': ['date'],
    }
).execute()
```

## 異常検知ロジック

以下の条件で異常を検出し、フラグを立てる：
- PVが前週比 **-30%以上** 減少 → `ALERT: PV急落`
- ユーザーが前週比 **-30%以上** 減少 → `ALERT: ユーザー急落`
- 特定ページのPVが **+200%以上** 増加 → `INFO: バズ検知`
- 検索順位が **5位以上** 下落したキーワード → `WARN: 順位下落`
- クロールエラーの増加 → `ALERT: インデックス問題`

## 出力形式

分析結果は以下のJSON形式で返す：

```json
{
  "period": {"start": "2026-03-16", "end": "2026-03-23"},
  "summary": {
    "total_users": 150,
    "total_pv": 420,
    "avg_engagement_rate": 0.65,
    "vs_prev_week": "+12%"
  },
  "top_pages": [...],
  "traffic_sources": [...],
  "device_breakdown": {...},
  "search_queries": [...],
  "alerts": [...],
  "opportunities": [...]
}
```
