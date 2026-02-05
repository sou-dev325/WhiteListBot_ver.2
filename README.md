# WhitelistBot

Discord から Minecraft サーバーの whitelist 登録を自動化する Bot。

申請チャンネルに投稿されたメッセージを解析し、
DiscordSRV の console チャンネルに whitelist コマンドを送信。
送信後に返ってくる 該当ログのみを監視 して成否を判定する。

※ 実務運用を想定し、同時処理は行わず常に1件ずつ処理する。

---

## 前提条件

- DiscordSRV を使用していること
- Minecraft サーバーのコンソール出力が Discord の特定チャンネルに流れていること
- whitelist / fwhitelist 実行権限が Bot にあること
- Node.js v18 以上
- Discord Bot に MESSAGE CONTENT INTENT が有効であること

---

## できること

- 申請メッセージから MC ID を抽出
- Java / Bedrock（.付き ID）を自動判定
- 複数の whitelist コマンドを順番に試行
- コマンド送信後のログのみを監視して成功判定
- 成功 / 失敗をリアクションで可視化
- メンション希望者のみ通知

---

## できないこと / 制限

- 複数申請の同時処理（必ず直列処理）
- DiscordSRV 以外のログ取得方式
- サーバーログ文言が大きく変わった環境での自動判定
- whitelist 状態の永続管理（DB 等）

---

## セットアップ

1. プロジェクト初期化  
   npm init -y

2. 依存関係のインストール  
   npm install discord.js dotenv

---

## 環境変数

プロジェクト直下に .env を作成する。

DISCORD_TOKEN=xxxxxxxxxxxxxxxxxxxx  
REQUEST_CHANNEL_ID=xxxxxxxxxxxxxxxx  
CONSOLE_CHANNEL_ID=xxxxxxxxxxxxxxxx  
NOTIFICATION_CHANNEL_ID=xxxxxxxxxxxxxxxx  

---

## ファイル構成

.
├── index.js
└── .env

---

## 起動

node index.js

---

## 申請メッセージ例

ユーザー名: Steve  
メンション: 希望

---

## 申請ルール

- ID（ユーザー名）は必須
- メンションは「希望 / 要望 / 不要」
- フォーマットが崩れている場合は自動で拒否される

---

## 動き方（詳細）

1. 申請チャンネルのメッセージを監視
2. 申請内容をパース
3. 内部キューに追加
4. 処理中でなければ即実行
5. コンソールチャンネルに whitelist コマンドを送信
6. 送信後に流れてきたログのみを監視
7. 成功ログを検出したら承認
8. timeout した場合は失敗
9. 次の申請を処理

---

## 実行されるコマンド

fwhitelist add ID  
fwhitelist add .ID  
whitelist add .ID  
whitelist add ID  

※ Bedrock 判定時は . 付き ID を優先

---

## 成功判定について

成功と判定されるログ条件：

- 対象の MC ID が含まれている
- whitelist または ホワイトリスト に関連する文言が含まれている

※ 他の申請ログを誤検知しないよう、  
コマンド送信後にのみログ監視を行う。

---

## エラー時の挙動

- timeout した場合は失敗
- 申請者に失敗通知を送信
- 元メッセージに ❌ リアクションを付与

---

## 想定用途

- 個人〜中規模 Minecraft サーバー
- 無人 whitelist 運用
- DiscordSRV 前提環境

---

## ライセンス

特に制限なし。
改造・再配布・業務利用すべて自由。
