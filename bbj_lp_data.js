/* =========================
   bbj_lp_data.js (SHARED)
   管理データだけ（ロジック無し）
========================= */
window.BBJ_DATA = window.BBJ_DATA || {};

window.BBJ_DATA.settings = {
  feeRate: 0.236,
  taxRate: 0.10,
  taxOnFee: true,
  trafficNonTaxable: true,
  roundMode: 'round'
};

// =========================
// オプション料金マスタ（税別）
// 画像の金額をそのまま固定
// =========================
window.BBJ_DATA.optionMaster = {
  // シッティング割増（1時間）
  "病児保育": { 単位: "時間", 金額: 3000 },
  "産後ケア": { 単位: "時間", 金額: 3000 },
  "障害児対応": { 単位: "時間", 金額: 3000 },

  // 送迎・外出割増（1時間）
  "送迎対応": { 単位: "時間", 金額: 2000 },
  "外出同行": { 単位: "時間", 金額: 2000 },

  // 家庭教師（1時間）
  "検定対策": { 単位: "時間", 金額: 3000 },

  // トラベル割増（1泊）
  "シッター同行（国内）": { 単位: "泊", 金額: 20000 },
  "ナース同行（国内）": { 単位: "泊", 金額: 30000 },
  "ナース同行（海外）": { 単位: "泊", 金額: 50000 },

  // 人数追加（2人以上：1人あたり・1時間）
  "2人以上（1人あたり）": { 単位: "時間", 金額: 5000 },

  // 時間帯（割合）※今回の収入例では使わなくてOK
  "早朝割増": { 単位: "割合", 率: 0.25 },
  "夜間割増": { 単位: "割合", 率: 0.25 },
  "深夜割増": { 単位: "割合", 率: 0.50 },

  // 面談（今回の収入例に入れないなら使わない）
  "対面面談": { 単位: "時間", 金額: 5000 },
  "オンライン面談": { 単位: "回", 金額: 0 }
};

window.BBJ_DATA.incomeExamples = {
  1: { title: 'お子様の病児保育の依頼',
     sub: 'Requesting childcare for a sick child',
      hourly: 10000, people: 1, hours: 3, addonKey: '病児保育', traffic: 500 
    },
  2: { title: 'お子様の家庭教師の依頼',
     sub: 'Requesting a tutor for your child',
      hourly: 10000, people: 1, hours: 1, addonKey: null, traffic: 300 
    },
  3: { title: '助産師の産前産後ケアの依頼',
     sub: 'Requesting midwifery care before and after birth',
      hourly: 12000, people: 1, hours: 3, addonKeys: ['産後ケア','対面面談'], traffic: 1800 
    },
  4: { title: '一泊二日の国内旅行の同行依頼',
     sub: 'Request to accompany a two-day, one-night domestic trip',
      hourly: 10000, people: 1, hours: 5, addonKey: 'シッター同行（国内）', traffic: 4900 
    },
  5: { title: 'スポットサポート(2時間)',
     sub: 'Short-Term Spot Care (2 Hours)',
      hourly: 10000, people: 1, hours: 2, addonKey: '対面面談', traffic: 600 
    }
};

window.BBJ_DATA.workStyle = {
  heading: {
    bg: "Work Style",
    kicker: "あなたに合った",
    title: "働き方や収入が選べます",
    sub: "Choose the work style and income that suits you",
  },

  cards: [

    {
      id: "nurse_to_sitter",
      badge: "看護師からシッターへ",
      color: "aqua",
      photo: "bbj-images/workstyle-person02.webp",
      persona: "20代女性（元看護師）",
      bullets: ["保育歴 4年"],
      days: ["月", "火", "水", "木", "金", "土", "日"],
      activeDays: ["火", "木"],
      note: "（週2日 × 2件 × 1日約2時間）",
      sim: { hourly: 12000, perWeek: 2, hoursPerSupport: 2, supportsPerDay: 2 },
    },
    {
      id: "tokyo_exam",
      badge: "東大卒・難関高受験対応",
      color: "navy",
      photo: "bbj-images/workstyle-person04.webp",
      persona: "30代男性（中学生・高校生）",
      bullets: ["家庭教師 5年"],
      days: ["月", "火", "水", "木", "金", "土", "日"],
      activeDays: ["火", "木", "土"],
      note: "（週3日 × 1日約3時間）",
      sim: { hourly: 14500, perWeek: 3, hoursPerSupport: 3, supportsPerDay: 1 },
    },
    {
      id: "care_and_work",
      badge: "保育士とWワーク",
      color: "peach",
      photo: "bbj-images/workstyle-person01.webp",
      persona: "30代女性（バイリンガル）",
      bullets: ["保育歴 6年"],
      days: ["月", "火", "水", "木", "金", "土", "日"],
      activeDays: ["火", "木", "土"],
      note: "（週3日 × 1日約3時間）",
      sim: { hourly: 10000, perWeek: 3, hoursPerSupport: 3, supportsPerDay: 1 },
    },
    {
      id: "postpartum_sleep",
      badge: "保育士免許保有でWワーク",
      color: "mint",
      photo: "bbj-images/workstyle-person03.webp",
      persona: "20代女性（夜間保育OK）",
      bullets: ["保育歴 5年"],
      days: ["月", "火", "水", "木", "金", "土", "日"],
      activeDays: ["火", "木", "土"],
      note: "（週2日 × 1日約2時間）",
      sim: { hourly: 8000, perWeek: 2, hoursPerSupport: 2, supportsPerDay: 1 },
    },
    {
      id: "travel_bilingual",
      badge: "英才教育や早期教育も対応",
      color: "sand",
      photo: "bbj-images/workstyle-person05.webp",
      persona: "20代女性（幼稚園以下・小学生）",
      bullets: ["家庭教師 ３年"],
      days: ["月", "火", "水", "木", "金", "土", "日"],
      activeDays: ["火", "水", "木"],
      note: "（週3日 × 1日約2時間）",
      sim: { hourly: 13000, perWeek: 3, hoursPerSupport: 2, supportsPerDay: 1 },
    },
    {
      id: "weekend_premium",
      badge: "国内外のカリキュラムに精通",
      color: "royal",
      photo: "bbj-images/workstyle-person06.webp",
      persona: "20代女性（中学生・高校生）",
      bullets: ["家庭教師 ３年"],
      days: ["月", "火", "水", "木", "金", "土", "日"],
      activeDays: ["火", "木"],
      note: "（週2日 × 1日約2時間）",
      sim: { hourly: 12000, perWeek: 2, hoursPerSupport: 2, supportsPerDay: 1 },
    },
  ],

  simulator: {
    defaultCardId: "tokyo_exam",
    monthFactor: 4, // ✅ 4週固定（カード注釈の数字と一致）
    labels: {
      hourly: "時給",
      perWeek: "週",
      times: "回",
      sumPrefix: "1ヶ月の合計（サポート1回",
      sumSuffix: "時間）",
      approx: "およそ",
    },
  },
};
