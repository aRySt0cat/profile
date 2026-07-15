export type ActivityType = "book" | "paper" | "talk";

export type Activity = {
  id: string;
  type: ActivityType;
  sort_date: string;
  display_date: string;
  title: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  isbn?: string;
  cover_image?: string;
  amazon_url?: string;
  publisher_url?: string;
  announcement_url?: string;
  venue?: string;
  year?: number;
  pages?: string;
  paper_url?: string;
  doi?: string;
  event?: string;
  slides_url?: string;
  event_url?: string;
  video_url?: string;
};

const activityData: Activity[] = [
  {
    id: "talk-ipros-ai-2026",
    type: "talk",
    sort_date: "2026-07-29",
    display_date: "2026年7月29日",
    title: "「AIを自由に使わせる」は失敗の元！ルールと安全対策でAI活用が加速する",
    event: "イプロスAI 2026 夏",
    event_url: "https://expo.ipros.jp/event/16373/module/booth/439076/421527",
  },
  {
    id: "book-llm-from-scratch-2026",
    type: "book",
    sort_date: "2026-03-20",
    display_date: "2026年3月20日",
    title: "作ってわかる大規模言語モデルの仕組み",
    authors: ["井上 顧基", "下垣内 隆太", "高島 直也", "澤 風吹"],
    publisher: "日経BP",
    isbn: "978-4-296-20525-7",
    cover_image: "assets/books/llm-from-scratch.webp",
    amazon_url: "https://www.amazon.co.jp/dp/4296205250",
    publisher_url: "https://bookplus.nikkei.com/atcl/catalog/26/03/09/02514/",
    announcement_url: "https://prtimes.jp/main/html/rd/p/000000135.000121022.html",
  },
  {
    id: "paper-prompt-interventions-2026",
    type: "paper",
    sort_date: "2026",
    display_date: "2026",
    title: "Non-Monotonicity and Catastrophic Risk of Prompt Interventions in Adversarial LLM Control",
    authors: [
      "Koki Inoue",
      "Naoya Takashima",
      "Hayato Fujihara",
      "Shuya Higuchi",
      "Kota Shimomura",
      "Ryuta Shimogauchi",
      "Takayoshi Yamashita",
    ],
    venue: "ICLR 2026 Workshop: I Can't Believe It's Not Better (ICBINB)",
    year: 2026,
    paper_url: "https://openreview.net/forum?id=HPw77rwbrb",
  },
  {
    id: "paper-dynamic-knowledge-jsai-2025",
    type: "paper",
    sort_date: "2025-05",
    display_date: "2025",
    title: "動的な専門知識連携を意識したマルチエージェントシステム",
    authors: [
      "山本 篤",
      "成木 太音",
      "片桐 章彦",
      "小池 湧大",
      "飯田 啄巳",
      "下垣内 隆太",
      "下村 晃太",
      "大南 英理",
      "井上 顧基",
      "伊藤 修",
    ],
    venue: "2025年度人工知能学会全国大会（第39回）",
    year: 2025,
    paper_url: "https://www.jstage.jst.go.jp/article/pjsai/JSAI2025/0/JSAI2025_3J5GS501/_article/-char/ja/",
    doi: "10.11517/pjsai.JSAI2025.0_3J5GS501",
  },
  {
    id: "paper-dynamic-knowledge-iclr-2025",
    type: "paper",
    sort_date: "2025-03",
    display_date: "2025",
    title: "Dynamic Knowledge Integration in Multi-Agent Systems for Content Inference",
    authors: [
      "Atsushi Yamamoto",
      "Takumi Iida",
      "Taito Naruki",
      "Akihiko Katagiri",
      "Yudai Koike",
      "Ryuta Shimogauchi",
      "Kota Shimomura",
      "Eri Onami",
      "Koki Inoue",
      "Osamu Ito",
    ],
    venue: "ICLR 2025 Workshop on Agentic AI",
    year: 2025,
    paper_url: "https://openreview.net/forum?id=5XNYu4rBe4",
  },
  {
    id: "talk-ai-agent-wandb-2025",
    type: "talk",
    sort_date: "2025-02-19",
    display_date: "2025年2月19日",
    title: "AIエージェントは何に使うべきか",
    event: "AIエージェントLT会 ― AIエージェントの最先端に迫る ―",
    slides_url: "https://speakerdeck.com/elith/w-and-b-mitoatupu-number-19-ai-ezientohahe-nishi-ubekika-ezientozhou-rinofen-lei-nozheng-li-toli-yong-subekichang-mian",
    event_url: "https://wandb.connpass.com/event/343838/",
  },
  {
    id: "book-llm-agent-2025",
    type: "book",
    sort_date: "2025-02-15",
    display_date: "2025年2月15日",
    title: "やさしく学ぶLLMエージェント",
    subtitle: "基本からマルチエージェント構築まで",
    authors: ["井上 顧基", "下垣内 隆太", "松山 純大", "成木 太音"],
    publisher: "オーム社",
    isbn: "978-4-274-23316-6",
    cover_image: "assets/books/llm-agent.webp",
    amazon_url: "https://www.amazon.co.jp/dp/4274233162",
    publisher_url: "https://www.ohmsha.co.jp/book/9784274233166.html",
  },
  {
    id: "talk-deloitte-generative-ai-2024",
    type: "talk",
    sort_date: "2024-12-16",
    display_date: "2024年12月16日",
    title: "生成AIのビジネス導入現場から学ぶ、生成AIの使い分けと使い方",
    event: "生成AIのビジネス導入におけるスタートアップ連携",
    event_url: "https://tohmatsu.smartseminar.jp/public/seminar/view/56283",
  },
  {
    id: "talk-jdla-llm-2024",
    type: "talk",
    sort_date: "2024-12",
    display_date: "2024年12月",
    title: "LLM開発のこれから ― 学習から利活用への移行とエージェントの台頭",
    event: "JDLA座談会",
    slides_url: "https://www.slideshare.net/slideshow/elith-llm/274341805",
  },
  {
    id: "paper-traffic-risk-dataset-2024",
    type: "paper",
    sort_date: "2024-09",
    display_date: "2024",
    title: "How to Extend the Dataset to Account for Traffic Risk Considering the Surrounding Environment",
    authors: [
      "Kota Shimomura",
      "Koki Inoue",
      "Kazuaki Ohmori",
      "Ryuta Shimogauchi",
      "Ryota Mimura",
      "Atsuya Ishikawa",
      "Takayuki Kawabuchi",
    ],
    venue: "2024 IEEE 27th International Conference on Intelligent Transportation Systems (ITSC)",
    year: 2024,
    pages: "2629–2636",
    paper_url: "https://ieeexplore.ieee.org/document/10920145/",
    doi: "10.1109/ITSC58415.2024.10920145",
  },
  {
    id: "paper-road-risk-caption-2024",
    type: "paper",
    sort_date: "2024-05-28",
    display_date: "2024",
    title: "道路環境リスク分析のためのプロンプトエンジニアリングを用いたキャプションデータの生成",
    authors: [
      "石川 敦也",
      "井上 顧基",
      "下村 晃太",
      "大森 一祥",
      "下垣内 隆太",
      "若林 怜帆人",
      "三村 崚太",
      "伊藤 修",
    ],
    venue: "2024年度人工知能学会全国大会（第38回）",
    year: 2024,
    paper_url: "https://confit.atlas.jp/guide/event/jsai2024/subject/1D5-GS-10-04/detail",
  },
  {
    id: "paper-gis-traffic-risk-2024",
    type: "paper",
    sort_date: "2024-05-28",
    display_date: "2024",
    title: "GISデータと街路画像を用いたLLMによる交通リスクの説明",
    authors: [
      "三村 崚太",
      "下村 晃太",
      "石川 敦也",
      "伊藤 修",
      "大森 一祥",
      "下垣内 隆太",
      "若林 怜帆人",
      "井上 顧基",
    ],
    venue: "2024年度人工知能学会全国大会（第38回）",
    year: 2024,
    paper_url: "https://confit.atlas.jp/guide/event/jsai2024/subject/1D5-GS-10-03/detail",
    doi: "10.11517/pjsai.jsai2024.0_1d5gs1003",
  },
  {
    id: "talk-medical-llm-2024",
    type: "talk",
    sort_date: "2024-03-29",
    display_date: "2024年3月29日",
    title: "LLMに医療知識をつけるには",
    event: "放射線治療と生成系AIの専門家が語る医療系LLMの未来",
    event_url: "https://elith.connpass.com/event/311289/",
  },
];

export const activities = activityData.sort((a, b) =>
  b.sort_date.localeCompare(a.sort_date),
);
