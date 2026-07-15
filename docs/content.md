# 下垣内隆太 GitHub Pages プロフィールサイト

## コンテンツ・情報設計仕様書

## 1. 目的

下垣内隆太のプロフィール、学歴、出版、研究、登壇、公開アカウントを整理した個人プロフィールサイトをGitHub Pages上に構築する。

トーン＆マナー、配色、タイポグラフィ、レイアウトなどのビジュアルデザインは別途指定するため、本仕様では扱わない。

---

## 2. 基本方針

* プロフィール情報は簡潔にする。
* 変化しやすい担当業務や関心領域は掲載しない。
* 出版・研究・登壇は、1つの「Activities」一覧に統合する。
* Activitiesは新しいものを上に表示する。
* Activitiesはタイプでフィルタリングできるようにする。
* 本人から提供されるプロフィール写真と書影を使用する。
* 外部サイトの画像を直接参照するホットリンクは使用しない。
* 不明な情報を推測して追加しない。
* 今後、活動情報を簡単に追加できるデータ構造にする。

---

# 3. プロフィール

## 氏名

日本語：

> 下垣内 隆太

英語：

> Ryuta Shimogauchi

## 現職

> 株式会社Elith 取締役CAIO

英語表記が必要な場合：

> Board Director & CAIO, Elith Inc.

## 掲載しない情報

以下はプロフィール本文に掲載しない。

* 現在の担当領域
* Elithへの参画時期
* 使用言語
* 生年月日
* 出身地
* 居住地
* 幼少期を含む個人的な経歴
* 4Sプロフィールへのリンク
* 公開情報から推測した人物像や紹介文
* 本人が指定していない肩書や専門領域

---

# 4. プロフィール写真

プロフィールの近くに本人提供の写真を表示する。

仮のアセットパス：

```text
profile/assets/icon.jpg
```

画像は後日提供されるため、現時点ではプレースホルダーを使用する。

---

# 5. 公開アカウント

プロフィール写真、氏名、役職の近くに、以下の公開アカウントへのリンクを配置する。

| サービス      | 表示名       | URL                                            |
| --------- | --------- | ---------------------------------------------- |
| GitHub    | GitHub    | https://github.com/aRySt0cat                   |
| X         | X         | https://x.com/eta1ia                           |
| LinkedIn  | LinkedIn  | https://www.linkedin.com/in/ryuta-shimogauchi/ |
| Instagram | Instagram | https://www.instagram.com/et_a11a/             |
| YouTube   | YouTube   | https://www.youtube.com/@elithofficial         |

YouTubeは個人チャンネルではなく、株式会社Elithの公式チャンネルである。必要に応じて表示ラベルを次のようにする。

> YouTube — Elith Official

4Sプロフィールは掲載しない。

SlideShareやSpeaker Deckの個別資料は、公開アカウント欄ではなく、該当する登壇情報のリンクとして扱う。

---

# 6. 学歴

学歴には以下を記載する。

* 入学・編入・進学した開始年
* 学校名
* 学部または研究科
* 学科または専攻
* 学位

卒業年・修了年は記載しない。

## 掲載内容

### 2020

**東京大学大学院**

* 情報理工学系研究科
* 電子情報学専攻
* 修士

### 2017

**東京大学**

* 工学部
* 電子情報工学科
* 学士

### 2012

**神戸市立工業高等専門学校**

* 電子工学科
* 準学士

## 表示例

```text
Education

2020
東京大学大学院
情報理工学系研究科 電子情報学専攻
修士

2017
東京大学
工学部 電子情報工学科
学士

2012
神戸市立工業高等専門学校
電子工学科
準学士
```

学校名や専攻名についてLinkedInと差異が生じた場合は、本人のLinkedIn上の表記を優先する。

---

# 7. Activities

出版、研究、登壇を1つの一覧に統合する。

セクション名は、ひとまず次のいずれかとする。

* Activities
* Publications & Talks
* Works & Activities

デザイン上の名称は後から変更できるようにする。

## フィルター

以下のフィルターを用意する。

* All
* Books
* Papers
* Talks

内部的なタイプ値は以下とする。

```text
book
paper
talk
```

## 表示順

`sort_date`の降順で表示する。

* 日付が確定しているものは、ISO 8601形式の年月日を使用する。
* 月までしか分からない場合は`YYYY-MM`を使用する。
* 年しか分からない場合は`YYYY`を使用する。
* 画面上では、精度以上の日付を補完して表示しない。
* 同じ年の論文について、正確な発表日が不明な場合は無理に日単位で並べない。

---

# 8. 書籍の表示ルール

書籍には以下を表示する。

* 書影
* 書名
* 著者
* 出版社
* 発売年月または発売日
* ISBN
* Amazonへのリンク
* 出版社へのリンク

書籍紹介文や本人の担当章は、現時点では掲載しない。

書影は後日本人が提供する。

---

# 9. 書籍データ

## 作ってわかる大規模言語モデルの仕組み

```yaml
id: book-llm-from-scratch-2026
type: book
sort_date: "2026-03-20"
display_date: "2026年3月20日"
title: "作ってわかる大規模言語モデルの仕組み"
authors:
  - "井上 顧基"
  - "下垣内 隆太"
  - "高島 直也"
  - "澤 風吹"
publisher: "日経BP"
isbn: "978-4-296-20525-7"
cover_image: "/assets/books/llm-from-scratch.jpg"
amazon_url: "https://www.amazon.co.jp/dp/4296205250"
publisher_url: "https://bookplus.nikkei.com/atcl/catalog/26/03/09/02514/"
announcement_url: "https://prtimes.jp/main/html/rd/p/000000135.000121022.html"
```

注意：

* 日経BPの個別商品ページURLは、実装時に公式ページを再確認する。
* 個別商品ページが見つからない場合でも、Amazonと出版社サイトへのリンクは掲載する。
* `announcement_url`は必要に応じて非表示にしてよい。

## やさしく学ぶLLMエージェント

### 基本からマルチエージェント構築まで

```yaml
id: book-llm-agent-2025
type: book
sort_date: "2025-02-15"
display_date: "2025年2月15日"
title: "やさしく学ぶLLMエージェント"
subtitle: "基本からマルチエージェント構築まで"
authors:
  - "井上 顧基"
  - "下垣内 隆太"
  - "松山 純大"
  - "成木 太音"
publisher: "オーム社"
isbn: "978-4-274-23316-6"
cover_image: "/assets/books/llm-agent.jpg"
amazon_url: "https://www.amazon.co.jp/dp/4274233162"
publisher_url: "https://www.ohmsha.co.jp/book/9784274233166.html"
```

---

# 10. 論文の表示ルール

論文については、研究概要や本人の貢献内容を掲載せず、著者として参加している成果を一般的な書誌形式で列挙する。

表示する項目：

* 論文タイトル
* 出版年
* 全著者
* 学会・ワークショップ・掲載媒体
* 論文ページへのリンク
* DOIがある場合はDOI

画面上では、`下垣内 隆太`または`Ryuta Shimogauchi`を太字にしてよい。

表示例：

```text
Koki Inoue, Naoya Takashima, ...,
Ryuta Shimogauchi, and Takayoshi Yamashita.
“Non-Monotonicity and Catastrophic Risk of Prompt Interventions
in Adversarial LLM Control.”
ICLR 2026 Workshop ICBINB, 2026.
[Paper]
```

---

# 11. 論文データ

## Non-Monotonicity and Catastrophic Risk of Prompt Interventions in Adversarial LLM Control

```yaml
id: paper-prompt-interventions-2026
type: paper
sort_date: "2026"
display_date: "2026"
title: "Non-Monotonicity and Catastrophic Risk of Prompt Interventions in Adversarial LLM Control"
authors:
  - "Koki Inoue"
  - "Naoya Takashima"
  - "Hayato Fujihara"
  - "Shuya Higuchi"
  - "Kota Shimomura"
  - "Ryuta Shimogauchi"
  - "Takayoshi Yamashita"
venue: "ICLR 2026 Workshop: I Can't Believe It's Not Better (ICBINB)"
year: 2026
paper_url: "https://openreview.net/forum?id=HPw77rwbrb"
doi: null
```

## 動的な専門知識連携を意識したマルチエージェントシステム

```yaml
id: paper-dynamic-knowledge-jsai-2025
type: paper
sort_date: "2025-05"
display_date: "2025"
title: "動的な専門知識連携を意識したマルチエージェントシステム"
authors:
  - "山本 篤"
  - "成木 太音"
  - "片桐 章彦"
  - "小池 湧大"
  - "飯田 啄巳"
  - "下垣内 隆太"
  - "下村 晃太"
  - "大南 英理"
  - "井上 顧基"
  - "伊藤 修"
venue: "2025年度人工知能学会全国大会（第39回）"
year: 2025
paper_url: "https://www.jstage.jst.go.jp/article/pjsai/JSAI2025/0/JSAI2025_3J5GS501/_article/-char/ja/"
doi: "10.11517/pjsai.JSAI2025.0_3J5GS501"
```

## Dynamic Knowledge Integration in Multi-Agent Systems for Content Inference

```yaml
id: paper-dynamic-knowledge-iclr-2025
type: paper
sort_date: "2025-03"
display_date: "2025"
title: "Dynamic Knowledge Integration in Multi-Agent Systems for Content Inference"
authors:
  - "Atsushi Yamamoto"
  - "Takumi Iida"
  - "Taito Naruki"
  - "Akihiko Katagiri"
  - "Yudai Koike"
  - "Ryuta Shimogauchi"
  - "Kota Shimomura"
  - "Eri Onami"
  - "Koki Inoue"
  - "Osamu Ito"
venue: "ICLR 2025 Workshop on Agentic AI"
year: 2025
paper_url: "https://openreview.net/forum?id=5XNYu4rBe4"
doi: null
```

## How to Extend the Dataset to Account for Traffic Risk Considering the Surrounding Environment

```yaml
id: paper-traffic-risk-dataset-2024
type: paper
sort_date: "2024-09"
display_date: "2024"
title: "How to Extend the Dataset to Account for Traffic Risk Considering the Surrounding Environment"
authors:
  - "Kota Shimomura"
  - "Koki Inoue"
  - "Kazuaki Ohmori"
  - "Ryuta Shimogauchi"
  - "Ryota Mimura"
  - "Atsuya Ishikawa"
  - "Takayuki Kawabuchi"
venue: "2024 IEEE 27th International Conference on Intelligent Transportation Systems (ITSC)"
year: 2024
pages: "2629–2636"
paper_url: "https://ieeexplore.ieee.org/document/10920145/"
doi: "10.1109/ITSC58415.2024.10920145"
```

## 道路環境リスク分析のためのプロンプトエンジニアリングを用いたキャプションデータの生成

```yaml
id: paper-road-risk-caption-2024
type: paper
sort_date: "2024-05-28"
display_date: "2024"
title: "道路環境リスク分析のためのプロンプトエンジニアリングを用いたキャプションデータの生成"
authors:
  - "石川 敦也"
  - "井上 顧基"
  - "下村 晃太"
  - "大森 一祥"
  - "下垣内 隆太"
  - "若林 怜帆人"
  - "三村 崚太"
  - "伊藤 修"
venue: "2024年度人工知能学会全国大会（第38回）"
year: 2024
paper_url: "https://confit.atlas.jp/guide/event/jsai2024/subject/1D5-GS-10-04/detail"
doi: null
```

## GISデータと街路画像を用いたLLMによる交通リスクの説明

```yaml
id: paper-gis-traffic-risk-2024
type: paper
sort_date: "2024-05-28"
display_date: "2024"
title: "GISデータと街路画像を用いたLLMによる交通リスクの説明"
authors:
  - "三村 崚太"
  - "下村 晃太"
  - "石川 敦也"
  - "伊藤 修"
  - "大森 一祥"
  - "下垣内 隆太"
  - "若林 怜帆人"
  - "井上 顧基"
venue: "2024年度人工知能学会全国大会（第38回）"
year: 2024
paper_url: "https://confit.atlas.jp/guide/event/jsai2024/subject/1D5-GS-10-03/detail"
doi: "10.11517/pjsai.jsai2024.0_1d5gs1003"
```

---

# 12. 登壇の表示ルール

登壇には以下を表示する。

* 登壇タイトル
* イベント名
* 開催年月日または開催年月
* スライドへのリンク
* イベントページへのリンク
* 動画がある場合は動画へのリンク

リンクが存在しない項目は、空のボタンや無効なリンクを表示しない。

データ上は次のフィールドを持たせる。

```yaml
type: talk
title:
event:
sort_date:
display_date:
slides_url:
event_url:
video_url:
```

---

# 13. 登壇データ

## 「AIを自由に使わせる」は失敗の元！ルールと安全対策でAI活用が加速する

```yaml
id: talk-ipros-ai-2026
type: talk
sort_date: "2026-07-29"
display_date: "2026年7月29日"
title: "「AIを自由に使わせる」は失敗の元！ルールと安全対策でAI活用が加速する"
event: "イプロスAI 2026 夏"
slides_url: null
event_url: "https://expo.ipros.jp/event/16373/module/booth/439076/421527"
video_url: null
```

## AIエージェントは何に使うべきか

```yaml
id: talk-ai-agent-wandb-2025
type: talk
sort_date: "2025-02-19"
display_date: "2025年2月19日"
title: "AIエージェントは何に使うべきか"
event: "AIエージェントLT会 ― AIエージェントの最先端に迫る ―"
slides_url: null
event_url: "https://wandb.connpass.com/event/343838/"
video_url: null
```

補足：

公開スライドの正式URLが確認できた場合は、次の資料を`slides_url`へ設定する。

> 【W&B ミートアップ#19】AIエージェントは何に使うべきか
> ― エージェント周りの分類の整理と利用すべき場面 ―

## LLM開発のこれから

### 学習から利活用への移行とエージェントの台頭

```yaml
id: talk-jdla-llm-2024
type: talk
sort_date: "2024-12"
display_date: "2024年12月"
title: "LLM開発のこれから ― 学習から利活用への移行とエージェントの台頭"
event: "JDLA座談会"
slides_url: "https://www.slideshare.net/slideshow/elith-llm/274341805"
event_url: null
video_url: null
verification_required:
  - "正式なイベント名称"
  - "正確な開催日"
```

この登壇については、スライドは確認できているが、正式イベント名と開催日の一次情報を実装前に再確認する。

## 生成AIのビジネス導入現場から学ぶ、生成AIの使い分けと使い方

```yaml
id: talk-deloitte-generative-ai-2024
type: talk
sort_date: "2024-12-16"
display_date: "2024年12月16日"
title: "生成AIのビジネス導入現場から学ぶ、生成AIの使い分けと使い方"
event: "生成AIのビジネス導入におけるスタートアップ連携"
slides_url: null
event_url: "https://tohmatsu.smartseminar.jp/public/seminar/view/56283"
video_url: null
```

## LLMに医療知識をつけるには

```yaml
id: talk-medical-llm-2024
type: talk
sort_date: "2024-03-29"
display_date: "2024年3月29日"
title: "LLMに医療知識をつけるには"
event: "放射線治療と生成系AIの専門家が語る医療系LLMの未来"
slides_url: null
event_url: "https://elith.connpass.com/event/311289/"
video_url: null
```

---

# 14. 推奨データ構造

活動情報は、コンポーネントへ直接ハードコードせず、1つのデータファイルで管理する。

候補：

```text
/src/data/activities.yaml
```

または：

```text
/src/data/activities.json
```

共通スキーマ：

```yaml
- id: string
  type: book | paper | talk
  sort_date: string
  display_date: string
  title: string

  authors: []
  publisher: null
  isbn: null
  cover_image: null
  amazon_url: null
  publisher_url: null

  venue: null
  year: null
  pages: null
  paper_url: null
  doi: null

  event: null
  slides_url: null
  event_url: null
  video_url: null
```

使用しないフィールドは省略してよい。

---

# 15. 活動一覧の挙動

* 初期表示は`All`。
* `sort_date`の降順で表示する。
* フィルター操作でページ遷移や再読み込みを発生させない。
* URLクエリまたはハッシュでフィルター状態を保持してもよい。
* 各カードや項目にはタイプが分かるラベルを付ける。
* Booksのみ書影を表示する。
* Papersは書影やサムネイルを必須にしない。
* Talksはイベントロゴや主催者ロゴを勝手に取得して使用しない。
* 外部リンクは新しいタブで開く。
* 外部リンクには適切な`rel`属性を付与する。
* DOIがある場合は、論文ページとは別にDOIリンクを表示してよい。
* 本人名は著者一覧の中で視覚的に強調してよい。

---

# 16. 画像アセット

後日、以下の画像が提供される。

```text
/assets/images/profile/ryuta-shimogauchi.jpg
/assets/images/books/llm-from-scratch.jpg
/assets/images/books/llm-agent.jpg
```

画像が未提供の間は、以下のいずれかとする。

* シンプルなプレースホルダーを表示する
* 画像領域自体を非表示にする

Amazonや出版社サイトの画像URLを直接参照しない。

---

# 17. SEO・メタデータ用テキスト

## ページタイトル

```text
下垣内 隆太 | Ryuta Shimogauchi
```

## description

```text
株式会社Elith 取締役CAIO、下垣内隆太の公式プロフィール。学歴、書籍、研究論文、登壇実績、公開アカウントを掲載しています。
```

## Open Graph title

```text
下垣内 隆太 | Ryuta Shimogauchi
```

## Open Graph description

```text
株式会社Elith 取締役CAIO、下垣内隆太のプロフィールと活動実績。
```

プロフィール写真の提供後は、その写真をOpen Graph画像に使ってよい。

---

# 18. 構造化データ

可能であれば、JSON-LDの`Person`を設定する。

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "下垣内 隆太",
  "alternateName": "Ryuta Shimogauchi",
  "jobTitle": "取締役CAIO",
  "worksFor": {
    "@type": "Organization",
    "name": "株式会社Elith",
    "url": "https://www.elith.ai/"
  },
  "sameAs": [
    "https://github.com/aRySt0cat",
    "https://x.com/eta1ia",
    "https://www.linkedin.com/in/ryuta-shimogauchi/",
    "https://www.instagram.com/et_a11a/",
    "https://www.youtube.com/@elithofficial"
  ]
}
```

本人の担当領域、使用言語、生年月日、所在地などは構造化データにも追加しない。

---

# 19. 実装時に確認が必要な項目

以下は実装前または公開前に確認する。

1. プロフィール写真のファイル名とトリミング方法
2. 2冊の正式な書影ファイル
3. 日経BPの書籍個別商品ページURL
4. W&B登壇資料の正式なSpeaker Deck URL
5. JDLA座談会の正式イベント名
6. JDLA座談会の正確な開催日
7. 新たに追加すべき出版・論文・登壇がないか
8. 学位を「学士」「修士」とするか、「学士（工学）」などの正式表記にするか

未確認項目は推測で埋めず、現在の値または`null`を保持する。

---

# 20. 完成条件

以下を満たした状態を初期完成とする。

* 氏名、役職、写真、公開アカウントがページ上部にある
* 学歴が開始年、学校名、学科・専攻、学位付きで掲載されている
* Books、Papers、Talksが1つのActivities一覧に統合されている
* All、Books、Papers、Talksでフィルタリングできる
* 新しい活動が上に表示される
* 書籍に書影、Amazon、出版社へのリンクがある
* 論文にタイトル、著者、学会、年、論文リンクがある
* 登壇にタイトル、イベント名、時期、利用可能なリンクがある
* 担当領域、言語、参画時期、4Sプロフィールが掲載されていない
* 活動情報をデータファイルへの追記だけで追加できる
* 未確認情報が推測で補われていない

