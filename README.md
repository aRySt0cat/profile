# Ryuta Shimogauchi — Profile

下垣内隆太の公式プロフィールサイトです。GitHub Pages への静的書き出しに対応しています。

## 更新

活動情報は `src/data/activities.ts` にまとまっています。書籍・論文・登壇の追加は、このファイルへの追記で反映できます。

ページはプロフィール、Activities、Education の順に通常の縦スクロールで読めます。Activities は種別で絞り込め、`#books` `#papers` `#talks` や各活動の `id` へのリンクにも対応しています。学歴は `src/data/profile.ts`、日付表記やリンクの整形は `app/lib/activity.ts` にあります。

演出はすべて表示済みのHTMLの上に重ねています。スクロールと連動する動きは `app/lib/motion.ts` の1つのループで管理し、左余白の年表示（`app/components/Bookmark.tsx`）は各項目の `data-year` から自動で目盛りを作ります。OSの「視差効果を減らす」設定やJavaScriptが動かない環境では、動きのない状態で全文が表示されます。

## 登壇スライド（Slidev）

Slidev で作ったスライドは、登壇の項目に `deck` を書くと `/talks/<slug>/` のページで再生できます。プロフィールの「Slides」とタイトルからこのページへ移動します。

```ts
deck: {
  slug: "ml15min-116",                          // URL: /talks/ml15min-116/
  repo: "aRySt0cat/ml-15-min-slide-20260926",   // スライドのリポジトリ
  ref: "4a4888b24f9c7d5b9595267daf8805b9522577c0", // 公開するコミット（40桁）
},
```

`npm run slides` が各リポジトリを `ref` のコミットで取得してビルドし、`public/slides/<slug>/` に出力します（`npm run slides -- ml15min-116` で1件だけ）。スライドを直したら、リポジトリ側でコミットしてから `ref` を更新してください。

- スライド内の `/images/...` のような絶対パスは、サブディレクトリでも読み込めるよう自動で相対パスに直します。スライド側の変更は不要です。
- 発表者ノートは公開しません。公開する場合は `deck` に `notes: true` を加えます。
- 取得したリポジトリと依存関係は `.slides-cache/` に保存し、次回から再利用します。

公開時は GitHub Actions がスライドのリポジトリを読む必要があります。スライドのリポジトリが非公開の場合は、そのリポジトリの Contents を読み取れる fine-grained personal access token を作り、このリポジトリの Secrets に `SLIDES_REPO_TOKEN` として登録してください。未登録のまま push すると、ビルドが止まり公開は更新されません。

## ローカル確認

```bash
npm ci
npm run dev
```

スライドのページを確認するときは、先に `npm run slides` を一度実行してください。

GitHub Pages 用の静的書き出しは `npm run build:pages`（スライドのビルドを含みます）、通常の検証は `npm test`（データ整形の単体テストは `npm run test:unit`）で実行できます。
