import { NewsItem } from '../types.js';

interface NewsAPIArticle {
  title: string;
  description: string;
  url: string;
  source: { name: string };
  publishedAt: string;
}

interface NewsAPIResponse {
  status: string;
  articles: NewsAPIArticle[];
}

/**
 * Fetches real news articles related to a ticker symbol from NewsAPI.
 * Only called server-side (from API routes) - no CORS proxy needed.
 */
export const fetchNewsArticles = async (symbol: string): Promise<NewsAPIArticle[]> => {
  const apiKey = process.env.NEWSAPI_KEY;
  
  if (!apiKey || apiKey === 'your_newsapi_key_here') {
    console.warn('NEWSAPI_KEY not configured. News articles will not be fetched.');
    return [];
  }

  try {
    const query = encodeURIComponent(symbol);
    const newsApiUrl = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&language=en&pageSize=10&apiKey=${apiKey}`;
    
    const response = await fetch(newsApiUrl);
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data: NewsAPIResponse = await response.json();
    
    if (data.status === 'ok' && data.articles) {
      // Filter out articles with missing required fields
      return data.articles.filter(
        article => article.title && article.url && article.source?.name
      );
    }
    
    return [];
  } catch (error) {
    console.error('Failed to fetch news from NewsAPI:', error);
    // Return empty array on error - the app will show a fallback message
    return [];
  }
};

/**
 * Converts NewsAPI articles to NewsItem format
 */
export const convertToNewsItems = (articles: NewsAPIArticle[]): Omit<NewsItem, 'sentimentScore' | 'sentimentLabel'>[] => {
  return articles.slice(0, 5).map(article => ({
    headline: article.title || 'No title',
    source: article.source?.name || 'Unknown',
    summary: article.description || article.title || '',
    url: article.url || '#',
  }));
};
