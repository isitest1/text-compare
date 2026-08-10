# SETUP.md — セットアップ手順書

このドキュメントは、`text-compare` を devcontainer で開発し、Cloudflare Pages に公開するまでの手順をまとめたものです。アプリ本体は Claude Code が CLAUDE.md に従って作成します。

## 前提

- Docker Desktop がインストール済みであること
- Visual Studio Code と「Dev Containers」拡張機能がインストール済みであること
- Cloudflare アカウントを持っていること
- GitHub アカウントを持っていること

## 1. devcontainer で開く

1. このフォルダーを VS Code で開きます。
2. コマンドパレット（`F1`）から「Dev Containers: Reopen in Container」を選びます。
3. コンテナーのビルドが終わると、`postCreateCommand` により `wrangler`・`http-server` と依存関係が自動でインストールされます。

## 2. アプリの実装

Claude Code に CLAUDE.md の内容を実装してもらいます。`public/index.html`・`public/styles.css`・`public/app.js` が生成されます。

## 3. ローカルで動作確認

```bash
npm run dev
```

ブラウザーで `http://localhost:8080` を開き、左右にテキストを貼り付けて「比較する」を押すと、差分がハイライト表示されます。

## 4. GitHub プライベートリポジトリの作成

devcontainer には GitHub CLI（`gh`）が入っています。認証後、次のコマンドでプライベートリポジトリを作成し、初回プッシュまで一括で行えます。

```bash
gh auth login
gh repo create text-compare --private --source=. --remote=origin --push
```

> Claude Code で開発する場合は、CLAUDE.md の指示に従い、コミット・プッシュは自発的に実行されます。

## 5. Cloudflare Pages へのデプロイ

### 方法A：GitHub 連携（推奨・自動デプロイ）

1. Cloudflare ダッシュボード →「Workers & Pages」→「Create application」→「Pages」→「Connect to Git」。
2. 作成した `text-compare` リポジトリを選択します。
3. ビルド設定は次のとおりです。
   - Framework preset: `None`
   - Build command: 空欄
   - Build output directory: `public`
4. 「Save and Deploy」を押すと公開されます。以後は `main` への push ごとに自動デプロイされます。

### 方法B：Wrangler で直接デプロイ

```bash
npx wrangler login
npm run deploy
```

初回に Cloudflare 側でプロジェクト `text-compare` が作成され、`https://text-compare.pages.dev` などのURLで公開されます。

## 6. カスタムドメイン（任意）

Cloudflare Pages のプロジェクト設定 →「Custom domains」から、任意のドメインを割り当てられます。

## トラブルシューティング

- ハイライトが表示されない場合：ネットワークが遮断されていると CDN（jsDelivr）の `diff` ライブラリが読み込めません。オフライン運用が必要な場合は `diff.min.js` をダウンロードして `public/` に置き、`index.html` の読み込み先をローカルパスに変更してください。
- `wrangler` が認証エラーになる場合：`npx wrangler logout` 後に再度 `npx wrangler login` を実行してください。
