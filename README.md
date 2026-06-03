# VoiceInk

AI音声ディクテーションWebアプリ。音声を録音してGroq（Whisper）でテキスト化し、Claude APIで文章整形します。MacBook（ブラウザ）とiPhone（ホーム画面追加）の両方で使えるPWA対応。

## セットアップ

```bash
# 1. 依存関係のインストール
npm install

# 2. 環境変数の設定
cp .env.example .env
# .env を編集して APIキーを設定

# 3. 開発サーバー起動
npm run dev
```

## APIキーの取得

### Groq API（文字起こし）
1. https://console.groq.com にアクセス
2. アカウント作成 → API Keys → Create API Key
3. `.env` の `VITE_GROQ_API_KEY` に設定

### Anthropic API（AI整形）
1. https://console.anthropic.com にアクセス
2. アカウント作成 → API Keys → Create Key
3. `.env` の `VITE_ANTHROPIC_API_KEY` に設定

## コスト目安

- **Groq**: 無料枠あり（audio 2時間/月）、超過後も非常に安価
- **Claude Sonnet**: 約50円/月（個人の日常使い程度）

## iPhoneホーム画面への追加

1. SafariでアプリのURLを開く（HTTPSが必要）
2. 画面下部の共有ボタン（□↑）をタップ
3. 「ホーム画面に追加」を選択
4. 名前を確認して「追加」

## Vercelへのデプロイ

```bash
# Vercel CLIでデプロイ
npx vercel

# 環境変数を設定
vercel env add VITE_GROQ_API_KEY
vercel env add VITE_ANTHROPIC_API_KEY

# 本番デプロイ
npx vercel --prod
```

または Vercel ダッシュボード（vercel.com）から GitHub リポジトリを連携し、
Environment Variables に `VITE_GROQ_API_KEY` と `VITE_ANTHROPIC_API_KEY` を追加してください。

## 注意事項

- APIキーはブラウザから直接送信されます（個人利用想定）
- iOSのSafariではHTTPS環境でのみマイクが使用できます（localhost は可）
- 本番環境ではVercel等のHTTPSホスティングを使用してください
