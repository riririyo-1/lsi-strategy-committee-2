// RSS Sourcesの定義（rss_feeds.yamlに基づく）
export interface RSSSource {
  id: string;
  name: string;
  category: string;
  recommended?: boolean;
}

export const RSS_SOURCES: RSSSource[] = [
  // 国内メディア
  { id: "eetimes", name: "EE Times Japan", category: "国内メディア", recommended: true },
  { id: "itmedia", name: "ITmedia", category: "国内メディア", recommended: true },
  { id: "nhk", name: "NHK", category: "国内メディア", recommended: true },
  { id: "mynavi_techplus", name: "マイナビ Tech+", category: "国内メディア", recommended: true },
  { id: "nikkei_xtech", name: "日経XTECH", category: "国内メディア", recommended: false },
  { id: "gigazine", name: "GIGAZINE", category: "国内メディア", recommended: false },
  { id: "science_potal", name: "Science Portal", category: "国内メディア", recommended: false },
  { id: "wired_jp", name: "WIRED.jp", category: "国内メディア", recommended: false },
  
  // 海外テックメディア
  { id: "techcrunch", name: "TechCrunch", category: "海外テックメディア", recommended: true },
  { id: "wired", name: "WIRED", category: "海外テックメディア", recommended: false },
  { id: "the_verge", name: "The Verge", category: "海外テックメディア", recommended: false },
  { id: "ars_technica", name: "Ars Technica", category: "海外テックメディア", recommended: false },
  { id: "engadget", name: "Engadget", category: "海外テックメディア", recommended: false },
  { id: "mit_technology_review", name: "MIT Technology Review", category: "海外テックメディア", recommended: false },
  { id: "semiconductor_today", name: "Semiconductor Today", category: "海外テックメディア", recommended: false },
  
  // 金融・ビジネスメディア
  { id: "bloomberg", name: "Bloomberg", category: "金融・ビジネス", recommended: false },
  { id: "financial_times", name: "Financial Times", category: "金融・ビジネス", recommended: false },
  { id: "forbes", name: "Forbes", category: "金融・ビジネス", recommended: false },
  { id: "fortune", name: "Fortune", category: "金融・ビジネス", recommended: false },
  { id: "the_information", name: "The Information", category: "金融・ビジネス", recommended: false },
  
  // 主要報道機関
  { id: "new_york_times", name: "New York Times", category: "主要報道機関", recommended: false },
  { id: "the_guardian", name: "The Guardian", category: "主要報道機関", recommended: false },
  { id: "bbc", name: "BBC", category: "主要報道機関", recommended: false },
  { id: "cnbc", name: "CNBC", category: "主要報道機関", recommended: false },
  { id: "npr", name: "NPR", category: "主要報道機関", recommended: false },
  { id: "cbs_news", name: "CBS News", category: "主要報道機関", recommended: false }
];

// カテゴリ別にソースをグループ化
export const RSS_SOURCES_BY_CATEGORY = RSS_SOURCES.reduce((acc, source) => {
  if (!acc[source.category]) {
    acc[source.category] = [];
  }
  acc[source.category].push(source);
  return acc;
}, {} as { [key: string]: RSSSource[] });

// 推奨ソースのIDリスト
export const RECOMMENDED_SOURCE_IDS = RSS_SOURCES.filter(s => s.recommended).map(s => s.id);

// IDから名前へのマッピング
export const SOURCE_ID_TO_NAME = RSS_SOURCES.reduce((acc, source) => {
  acc[source.id] = source.name;
  return acc;
}, {} as { [key: string]: string });

// 名前からIDへのマッピング（後方互換性用）
export const SOURCE_NAME_TO_ID = RSS_SOURCES.reduce((acc, source) => {
  acc[source.name] = source.id;
  return acc;
}, {} as { [key: string]: string });