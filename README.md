# Contract Obligation Hub

契約締結後の義務管理・案件追跡システム

---

## Why（なぜ必要か）

契約管理ツールのほとんどは「ドラフト比較」「電子署名」に集中しています。しかし、**実務の負荷が最も高いのは締結後**です。

- 更新期限の監視
- 義務条項の履行確認
- 証拠書類の収集と完全性確認
- 例外・逸脱案件の管理
- 監査対応・証跡整備

これらは今でも担当者のスプレッドシートやメール管理に依存しており、**処理の遅延・属人化・ミス**が発生し続けています。

---

## Problem（解決する課題）

| 課題 | 影響 |
|------|------|
| 更新期限の見落とし | 契約失効・再交渉コスト |
| 証拠書類の紛失・不足 | 監査指摘・コンプライアンス違反 |
| 例外案件の属人的管理 | 担当者交代時のナレッジ消失 |
| 複数部門間の情報分断 | 判断遅延・再確認コスト |
| 監査証跡の不在 | 事後説明不能 |

---

## Solution（解決方法）

Contract Obligation Hub は、**ケース（Case）中心の業務管理プラットフォーム**として以下を提供します：

1. **案件ボード**: 全契約案件をステータス別に一覧表示。例外・期限超過を即座に識別
2. **必要条件管理**: 各案件に必要な書類・審査を登録し、充足状況をリアルタイム追跡
3. **証拠管理**: 提出済み証拠の確認・却下・ステータス更新を担当者が操作
4. **タスク管理**: 期限付きタスクを担当者に割り当て、進捗を追跡
5. **ステータス遷移**: 案件のライフサイクルを可視化・制御
6. **監査証跡**: すべてのアクションが時系列で記録され、後追い確認が可能

---

## How to use（使い方）

### セットアップ

```bash
# 依存パッケージのインストール
npm install

# Prismaクライアント生成
npx prisma generate

# データベースのマイグレーション（初回）
node -e "
const Database = require('better-sqlite3');
const fs = require('fs');
const db = new Database('./prisma/dev.db');
const sql = fs.readFileSync('./prisma/migrations/20260306042908_init/migration.sql', 'utf8');
const statements = sql.split(';').filter(s => s.trim().length > 0);
for (const stmt of statements) { try { db.exec(stmt + ';'); } catch(e) {} }
db.close();
console.log('Migration complete');
"

# デモデータ投入（任意）
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

# 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

### 基本的な操作フロー

1. **案件を起票する** - 右上の「＋ 新規起票」から案件を登録
2. **必要条件を登録する** - 案件詳細の「必要条件」タブから条件を追加
3. **証拠を登録・確認する** - 各条件に証拠書類を紐づけてステータス管理
4. **ステータスを進める** - ヘッダーのアクションボタンで案件フローを前進
5. **タスクを割り当てる** - 担当者・期限付きタスクを登録して進捗管理
6. **監査証跡を確認する** - 全アクションの履歴を時系列で確認

---

## Screenshots

### ダッシュボード（案件一覧）

![ダッシュボード](https://github.com/user-attachments/assets/786584f0-4a16-4dcd-9bdf-0bbb222c4b24)

案件の総数・例外件数・審査中件数をひと目で把握。ステータスフィルタと検索で絞り込みが可能。

---

### 案件詳細

![案件詳細](https://github.com/user-attachments/assets/6bee5c4b-f83d-42eb-b864-0dfce6b42ce9)

案件のステータス・必要条件の充足状況（プログレスバー）・次のアクションボタンを一画面で確認。

---

### 必要条件・証拠管理

![必要条件管理](https://github.com/user-attachments/assets/af5e6ba1-0bab-4378-9a74-2e13005ac562)

必要条件ごとに証拠書類を登録し、充足状況をリアルタイムで追跡。

---

### 監査証跡

![監査証跡](https://github.com/user-attachments/assets/3ab414b5-0a02-4c0c-b843-3ec98e91d476)

全アクションがイベント種別・実行者・タイムスタンプ付きで記録。監査対応・事後説明に活用できる。

---

### 新規案件起票

![新規案件起票](https://github.com/user-attachments/assets/7fa6a750-9e7f-4449-aae4-dc58925a38a3)

最小限の入力（案件名・契約種別・相手先・担当者）で案件を起票できる。

---

## フォルダ構成

```
contract-obligation-hub/
├── prisma/
│   ├── schema.prisma          # データモデル定義
│   ├── seed.ts                # デモデータ投入スクリプト
│   └── migrations/            # DBマイグレーション
├── src/
│   ├── app/
│   │   ├── layout.tsx         # 共通レイアウト（ヘッダー含む）
│   │   ├── page.tsx           # ダッシュボード（案件一覧）
│   │   ├── cases/
│   │   │   ├── new/page.tsx   # 新規案件起票フォーム
│   │   │   └── [id]/page.tsx  # 案件詳細（要件・証拠・タスク・監査）
│   │   └── api/
│   │       ├── cases/         # 案件 CRUD API
│   │       └── tasks/         # タスク API
│   ├── lib/
│   │   ├── prisma.ts          # Prismaクライアント（シングルトン）
│   │   └── constants.ts       # ステータス定義・ラベル・カラー
│   └── generated/prisma/      # 生成されたPrismaクライアント（自動生成）
├── docs/                      # 仕様書
├── prisma.config.ts           # Prisma設定
└── package.json
```

---

## 技術スタック

| 分類 | 技術 |
|------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 |
| ORM | Prisma v7 |
| データベース | SQLite (better-sqlite3) |
| ランタイム | Node.js 24 |

---

## ドメインモデル

```
Case（案件）
  ├── Requirement（必要条件）
  │     └── Evidence（証拠）
  ├── Task（タスク）
  └── AuditRecord（監査記録）
```

### 案件ステータス遷移

```
下書き → 受付確認済 → 証拠収集中 → 審査中 → 承認済 → 完了
                                        ↓         ↓
                                     例外対応中   却下
                                        ↓
                                    証拠収集中（再）→ 再審査
```
