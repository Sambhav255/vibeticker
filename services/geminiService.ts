import { GoogleGenAI, Type } from "@google/genai";
import { TickerData, NewsItem } from '../types';
import { fetchNewsArticles, convertToNewsItems } from './newsService';
import { fetchPriceData } from './priceService';

// Initialize Gemini Client - apiKey from server env (never exposed to client)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Analyzes sentiment of real news articles using Gemini
 */
const analyzeNewsSentiment = async (newsItems: Omit<NewsItem, 'sentimentScore' | 'sentimentLabel'>[]): Promise<NewsItem[]> => {
  if (newsItems.length === 0) {
    return [];
  }

  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze the sentiment of these financial news articles. For each article, provide:
    1. A sentiment score from -1.0 (very bearish) to 1.0 (very bullish)
    2. A sentiment label: "Bullish", "Bearish", or "Neutral"
    
    Articles to analyze:
    ${newsItems.map((item, i) => `${i + 1}. "${item.headline}" - ${item.summary}`).join('\n')}
    
    Return ONLY a JSON array with objects containing: sentimentScore (number), sentimentLabel (string).
    The array should have the same order as the articles provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sentimentScore: { type: Type.NUMBER },
              sentimentLabel: { type: Type.STRING, enum: ["Bullish", "Bearish", "Neutral"] }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No sentiment analysis returned");

    const sentimentData = JSON.parse(text) as Array<{ sentimentScore: number; sentimentLabel: 'Bullish' | 'Bearish' | 'Neutral' }>;
    
    // Combine news items with sentiment analysis
    return newsItems.map((item, index) => ({
      ...item,
      sentimentScore: sentimentData[index]?.sentimentScore ?? 0,
      sentimentLabel: sentimentData[index]?.sentimentLabel ?? 'Neutral'
    }));
  } catch (error) {
    console.error("Sentiment analysis failed:", error);
    // Return news items with neutral sentiment as fallback
    return newsItems.map(item => ({
      ...item,
      sentimentScore: 0,
      sentimentLabel: 'Neutral' as const
    }));
  }
};

export const analyzeTicker = async (symbol: string): Promise<TickerData> => {
  const model = "gemini-3-flash-preview";

  // Step 0: Fetch real price data from Alpha Vantage
  const priceData = await fetchPriceData(symbol);

  // Step 1: Fetch real news articles
  const newsArticles = await fetchNewsArticles(symbol);
  const newsItemsWithoutSentiment = convertToNewsItems(newsArticles);
  
  // Step 2: Analyze sentiment of real news articles
  const analyzedNews = await analyzeNewsSentiment(newsItemsWithoutSentiment);

  // Step 3: Calculate overall vibe score from real news sentiment
  const averageSentiment = analyzedNews.length > 0
    ? analyzedNews.reduce((sum, item) => sum + item.sentimentScore, 0) / analyzedNews.length
    : 0;
  
  // Convert sentiment (-1 to 1) to vibe score (0 to 100)
  const overallVibeScore = Math.round(50 + (averageSentiment * 50));
  const vibeLabel = overallVibeScore >= 60 ? 'Optimistic' : overallVibeScore <= 40 ? 'Cautious' : 'Neutral';

  // Step 4: Extract keywords from real news headlines
  const allText = analyzedNews.map(n => `${n.headline} ${n.summary}`).join(' ');
  const words = allText.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const wordFreq: Record<string, number> = {};
  words.forEach(word => {
    if (!['this', 'that', 'with', 'from', 'they', 'have', 'been', 'will', 'would', 'could', 'should'].includes(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  const topKeywords = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

  // Step 5: Derive a simple correlation estimate between price direction and news sentiment
  const history = priceData.history;
  let correlationScore = 0.5;
  if (history.length > 1) {
    const first = history[0];
    const last = history[history.length - 1];
    const priceChange = last.price - first.price;
    const priceDirection = priceChange === 0 ? 0 : priceChange > 0 ? 1 : -1;
    const sentimentDirection =
      averageSentiment === 0 ? 0 : averageSentiment > 0 ? 1 : -1;

    const aligned = priceDirection === sentimentDirection && priceDirection !== 0;
    const magnitude = Math.min(1, Math.abs(averageSentiment));

    correlationScore = aligned ? 0.5 + 0.5 * magnitude : 0.5 - 0.5 * magnitude;
    correlationScore = Math.max(0, Math.min(1, correlationScore));
  }

  // Combine real price data with real news + AI sentiment
  const data: TickerData = {
    symbol: priceData.symbol || symbol,
    companyName: priceData.companyName || symbol,
    currentPrice: priceData.currentPrice,
    priceChange24h: priceData.priceChange24h,
    percentChange24h: priceData.percentChange24h,
    overallVibeScore,
    vibeLabel,
    correlationScore,
    history: priceData.history,
    news:
      analyzedNews.length > 0
        ? analyzedNews
        : [
            {
              headline: `No recent news found for ${symbol}`,
              source: 'VibeTicker',
              sentimentScore: 0,
              sentimentLabel: 'Neutral' as const,
              summary: 'Please check back later for news updates.',
              url: '#',
            },
          ],
    topKeywords: topKeywords.length > 0 ? topKeywords : [symbol],
  };

  return data;
};