# Ryuta Shimogauchi — Profile

下垣内隆太の公式プロフィールサイトです。GitHub Pages への静的書き出しに対応しています。

## 更新

活動情報は `src/data/activities.ts` にまとまっています。書籍・論文・登壇の追加は、このファイルへの追記で反映できます。

ページはプロフィール、Activities、Education の順に通常の縦スクロールで読めます。Activities は種別で絞り込め、`#books` `#papers` `#talks` や各活動の `id` へのリンクにも対応しています。学歴は `src/data/profile.ts`、日付表記やリンクの整形は `app/lib/activity.ts` にあります。

演出はすべて表示済みのHTMLの上に重ねています。スクロールと連動する動きは `app/lib/motion.ts` の1つのループで管理し、左余白の年表示（`app/components/Bookmark.tsx`）は各項目の `data-year` から自動で目盛りを作ります。OSの「視差効果を減らす」設定やJavaScriptが動かない環境では、動きのない状態で全文が表示されます。

## ローカル確認

```bash
npm ci
npm run dev
```

GitHub Pages 用の静的書き出しは `npm run build:pages`、通常の検証は `npm test`（データ整形の単体テストは `npm run test:unit`）で実行できます。
