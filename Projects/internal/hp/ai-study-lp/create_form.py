#!/usr/bin/env python3
"""Google Forms API でAI勉強会の申し込みフォームを作成する"""

import json
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# clasp の認証情報を再利用
with open('/Users/kaitomain/.clasprc.json') as f:
    data = json.load(f)

token_data = data['tokens']['default']

creds = Credentials(
    token=token_data.get('access_token'),
    refresh_token=token_data.get('refresh_token'),
    token_uri='https://oauth2.googleapis.com/token',
    client_id=token_data.get('client_id'),
    client_secret=token_data.get('client_secret'),
    scopes=['https://www.googleapis.com/auth/forms.body']
)

# Forms API
service = build('forms', 'v1', credentials=creds)

# Step 1: フォーム作成（タイトルのみ）
form_body = {
    'info': {
        'title': '社長のためのAI勉強会 参加申し込み',
        'documentTitle': '社長のためのAI勉強会 参加申し込み'
    }
}

form = service.forms().create(body=form_body).execute()
form_id = form['formId']
print(f'Form created: {form_id}')

# Step 2: 質問を追加
update_body = {
    'requests': [
        # フォームの説明
        {
            'updateFormInfo': {
                'info': {
                    'title': '社長のためのAI勉強会 参加申し込み',
                    'description': (
                        '社長のためのAI勉強会へのお申し込みありがとうございます。\n'
                        '以下の項目をご入力の上、送信してください。\n\n'
                        '【初回開催】2026年4月21日(月) 21:00〜22:00\n'
                        '【テーマ】話題の「Claude Code」で何ができるのか？\n'
                        '【参加費】無料'
                    )
                },
                'updateMask': 'description'
            }
        },
        # Q1: お名前
        {
            'createItem': {
                'item': {
                    'title': 'お名前',
                    'description': 'フルネームをご記入ください',
                    'questionItem': {
                        'question': {
                            'required': True,
                            'textQuestion': {
                                'paragraph': False
                            }
                        }
                    }
                },
                'location': {'index': 0}
            }
        },
        # Q2: メールアドレス
        {
            'createItem': {
                'item': {
                    'title': 'メールアドレス',
                    'description': '開催案内をお送りします',
                    'questionItem': {
                        'question': {
                            'required': True,
                            'textQuestion': {
                                'paragraph': False
                            }
                        }
                    }
                },
                'location': {'index': 1}
            }
        },
        # Q3: 会社名
        {
            'createItem': {
                'item': {
                    'title': '会社名',
                    'questionItem': {
                        'question': {
                            'required': True,
                            'textQuestion': {
                                'paragraph': False
                            }
                        }
                    }
                },
                'location': {'index': 2}
            }
        },
        # Q4: 役職
        {
            'createItem': {
                'item': {
                    'title': '役職',
                    'description': '例: 代表取締役、CEO、取締役 など',
                    'questionItem': {
                        'question': {
                            'required': True,
                            'textQuestion': {
                                'paragraph': False
                            }
                        }
                    }
                },
                'location': {'index': 3}
            }
        },
        # Q5: 電話番号
        {
            'createItem': {
                'item': {
                    'title': '電話番号',
                    'description': 'ハイフンなしで入力してください（任意）',
                    'questionItem': {
                        'question': {
                            'required': False,
                            'textQuestion': {
                                'paragraph': False
                            }
                        }
                    }
                },
                'location': {'index': 4}
            }
        },
        # Q6: 参加希望日
        {
            'createItem': {
                'item': {
                    'title': '参加希望日',
                    'questionItem': {
                        'question': {
                            'required': True,
                            'choiceQuestion': {
                                'type': 'CHECKBOX',
                                'options': [
                                    {'value': '2026年4月21日(月) 21:00〜22:00「Claude Codeで何ができるのか？」'}
                                ]
                            }
                        }
                    }
                },
                'location': {'index': 5}
            }
        },
        # Q7: AI活用状況
        {
            'createItem': {
                'item': {
                    'title': '現在のAI活用状況を教えてください',
                    'questionItem': {
                        'question': {
                            'required': True,
                            'choiceQuestion': {
                                'type': 'RADIO',
                                'options': [
                                    {'value': 'まだAIを使ったことがない'},
                                    {'value': 'ChatGPTなどを少し試したことがある'},
                                    {'value': '業務で日常的にAIを活用している'},
                                    {'value': '自社でAI導入を検討中'}
                                ]
                            }
                        }
                    }
                },
                'location': {'index': 6}
            }
        },
        # Q8: 聞きたいこと
        {
            'createItem': {
                'item': {
                    'title': 'AIについて聞きたいこと・知りたいこと',
                    'description': '勉強会で取り上げてほしいテーマや質問があればご自由にご記入ください',
                    'questionItem': {
                        'question': {
                            'required': False,
                            'textQuestion': {
                                'paragraph': True
                            }
                        }
                    }
                },
                'location': {'index': 7}
            }
        },
        # Q9: 知ったきっかけ
        {
            'createItem': {
                'item': {
                    'title': 'この勉強会を何で知りましたか？',
                    'questionItem': {
                        'question': {
                            'required': False,
                            'choiceQuestion': {
                                'type': 'RADIO',
                                'options': [
                                    {'value': 'SNS（X / Instagram / Facebook）'},
                                    {'value': '知人からの紹介'},
                                    {'value': 'Web検索'},
                                    {'value': 'その他'}
                                ]
                            }
                        }
                    }
                },
                'location': {'index': 8}
            }
        }
    ]
}

service.forms().batchUpdate(formId=form_id, body=update_body).execute()

# 結果出力
public_url = f'https://docs.google.com/forms/d/{form_id}/viewform'
embed_url = f'https://docs.google.com/forms/d/{form_id}/viewform?embedded=true'
edit_url = f'https://docs.google.com/forms/d/{form_id}/edit'

print()
print('=== フォーム作成完了 ===')
print(f'公開URL: {public_url}')
print(f'編集URL: {edit_url}')
print(f'埋め込みURL: {embed_url}')
print(f'FORM_ID: {form_id}')
