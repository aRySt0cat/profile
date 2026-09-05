# Ryuta Shimogauchi — Profile

下垣内隆太の公式プロフィールサイトです。GitHub Pages への静的書き出しに対応しています。

## 更新

活動情報は `src/data/activities.ts` にまとまっています。書籍・論文・登壇の追加は、このファイルへの追記で反映できます。

スクロールに合わせて白い本のページをめくり、プロフィール・学歴・全活動を同じ紙面で表示します。Activitiesは目次から各詳細へ移動でき、詳細から目次へ戻れます。活動フィルターに応じて目次とページ数も変わります。時間軸の定義は `app/lib/narrative.ts`、3Dの演出は `app/components/PaperSculpture.tsx` にあります。Blenderの編集用データは `assets/sculpture/` に保存しています。

「一覧で読む」で通常の文章表示に切り替えられます。動きを減らすOS設定やWebGLが利用できない場合も、文章表示になります。長いページの本文は紙面内でスクロールでき、キーボードでも操作できます。

## ローカル確認

```bash
npm ci
npm run dev
```

GitHub Pages 用の静的書き出しは `npm run build:pages`、通常の検証は `npm test` で実行できます。
