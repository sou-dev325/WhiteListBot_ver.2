# WhitelistBot

Discord から Minecraft サーバーの whitelist 登録を自動化する Bot。

申請チャンネルに投稿されたメッセージを解析し、
DiscordSRV の **console チャンネル**に whitelist コマンドを送信。
送信後に返ってくる **該当ログのみを監視**して成否を判定する。

※ 実務運用を想定し、**同時処理は行わず常に1件ずつ処理**する。

---

## 前提条件

- DiscordSRV を使用していること
- Minecraft サーバーのコンソール出力が  
  Discord の特定チャンネルに流れていること
- whitelist / fwhitelist 実行権限が Bot にあること

---

## できること

- 申請メッセージから MC ID を抽出
- Java / Bedrock（`.`付きID）を自動判定
- 複数の whitelist コマンドを順番に試行
- **コマンド送信後のログのみを監視して成功判定**
- 成功 / 失敗をリアクションで可視化
- メンション希望者のみ通知

---

## できないこと / 制限

- 複数申請の同時処理（必ず直列）
- DiscordSRV 以外のログ取得方式
- ログ文言が大きく変わった環境での自動判定

---

## セットアップ

```bash
npm init -y
npm install discord.js dotenv
