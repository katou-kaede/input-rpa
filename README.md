# RPA Challenger Pro 🤖

ExcelやCSVのデータを読み取り、ブラウザ操作を自動化するWails製のRPAツールです。  
要素の位置が動的に変化する[自動化テスト用サイト](https://www.rpachallenge.com/)にて、7項目×10ラウンドの入力を約5秒で完了しています。

## 🚀 機能
- **ファイル選択**: Excel/CSVファイルをUIから簡単選択
- **進捗表示**: リアルタイムな処理状況のプログレスバー表示
- **自動ブラウザ操作**: Playwrightを使用した高速・確実な自動化

## 🛠 開発環境の構築

このプロジェクトをローカルで実行・開発するには、以下のセットアップが必要です。

### 1. 前提条件
- [Go](https://go.dev/) (1.21以上推奨)
- [Node.js](https://nodejs.org/) (LTS推奨)
- [Wails CLI](https://wails.io/docs/gettingstarted/installation)

```bash
# Wails CLIのインストール
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```


### 2. リポジトリのクローンと依存関係の解決
```bash
git clone <あなたのリポジトリURL>
cd <プロジェクト名>

# Goの依存関係を解決
go mod tidy

# フロントエンドの依存関係をインストール
cd frontend
npm install
cd ..
```

### 3. Playwrightのブラウザインストール
初回起動時に自動でセットアップされます

```bash
# 手動でのブラウザインストールコマンド
go run github.com/playwright-community/playwright-go/cmd/playwright@latest install --with-deps chromium
```


## 💻 実行とビルド
### 開発モード
コードの変更をリアルタイムで反映しながら実行します。
```bash
wails dev
```

### 本番用ビルド (exe化)
```bash
wails build
```