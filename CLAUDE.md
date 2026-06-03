# VoiceInk 開発メモ

## プロジェクト概要
音声録音 → Groq Whisper 文字起こし → Claude AI整形 → 入力欄に挿入
- Web PWA（Vercel デプロイ）
- Chrome 拡張機能（Manifest V3）

## 将来対応予定：マルチユーザー化

現在は個人利用のみだが、将来的に**複数人に配布する**ことを想定している。

その際の課題：
- 辞書（dictEntries）は現在 `chrome.storage.sync` に保存されており、拡張機能IDに紐づく
- ユーザーごとに辞書の内容が異なるため、共有できない
- 配布時は各ユーザーが自分の辞書を持てる仕組みが必要

対応案（将来）：
- Chrome Web Store に公開して自動更新に対応する
- ユーザーアカウント連携（Googleアカウント等）で辞書をクラウド同期
- もしくは辞書のエクスポート/インポートで移行できるようにする（← 実装済み）

## 拡張機能の更新手順（データを消さない方法）
1. GitHub から ZIP をダウンロード・解凍
2. **既存の extension フォルダのファイルを上書き**（新しいフォルダを追加しない）
3. `chrome://extensions` で「更新」ボタン
→ chrome.storage.sync のデータ（辞書・APIキー等）は保持される

## 技術スタック
- Web: React + Vite + TypeScript + Tailwind CSS + vite-plugin-pwa
- 拡張機能: Vanilla JS + Manifest V3
- STT: Groq API（whisper-large-v3）
- AI整形: Anthropic Claude API（claude-sonnet-4-5）
- デプロイ: Vercel（自動デプロイ）
