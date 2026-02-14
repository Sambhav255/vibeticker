export interface PricePoint {
  date: string;
  price: number;
  sentiment: number; // -1 to 1
}

export interface NewsItem {
  headline: string;
  source: string;
  sentimentScore: number; // -1 to 1
  sentimentLabel: 'Bullish' | 'Bearish' | 'Neutral';
  summary: string;
  url: string; // Fake URL for demo purposes or real if available
}

export interface TickerData {
  symbol: string;
  companyName: string;
  currentPrice: number;
  priceChange24h: number;
  percentChange24h: number;
  overallVibeScore: number; // 0 to 100 (0 = Extreme Fear, 100 = Extreme Greed)
  vibeLabel: string; // e.g., "Extreme Fear", "Neutral", "Greed"
  correlationScore: number; // 0 to 1, how closely price follows sentiment
  history: PricePoint[];
  news: NewsItem[];
  topKeywords: string[];
}

export enum FetchStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}