interface AlphaVantageSymbolMatch {
  '1. symbol': string;
  '2. name': string;
  '4. region'?: string;
  '5. marketOpen'?: string;
  '8. currency'?: string;
}

interface AlphaVantageSymbolSearchResponse {
  bestMatches?: AlphaVantageSymbolMatch[];
  Note?: string;
  'Error Message'?: string;
}

export interface TickerSuggestion {
  symbol: string;
  name: string;
  region?: string;
  currency?: string;
}

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
const searchCache = new Map<string, { results: TickerSuggestion[]; expires: number }>();

const getApiKey = () => {
  const key = process.env.ALPHAVANTAGE_API_KEY;
  if (!key) {
    console.warn('ALPHAVANTAGE_API_KEY is not set. Symbol search will be unavailable.');
  }
  return key;
};

export const searchTickers = async (query: string): Promise<TickerSuggestion[]> => {
  const apiKey = getApiKey();
  const normalizedQuery = query.trim().toLowerCase();

  if (!apiKey || normalizedQuery.length < 2) {
    return [];
  }

  // Return cached results if valid
  const cached = searchCache.get(normalizedQuery);
  if (cached && cached.expires > Date.now()) {
    return cached.results;
  }

  try {
    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(
      query.trim()
    )}&apikey=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.error('Alpha Vantage symbol search failed:', res.status, res.statusText);
      return [];
    }

    const data = (await res.json()) as AlphaVantageSymbolSearchResponse;

    // Rate limit or API error - return empty, don't throw (search failure is non-blocking)
    if (data.Note || data['Error Message']) {
      return [];
    }

    const matches = data.bestMatches ?? [];
    const results = matches.slice(0, 6).map((m) => ({
      symbol: m['1. symbol'],
      name: m['2. name'],
      region: m['4. region'],
      currency: m['8. currency'],
    }));

    searchCache.set(normalizedQuery, {
      results,
      expires: Date.now() + CACHE_TTL_MS,
    });

    return results;
  } catch (error) {
    console.error('Error during Alpha Vantage symbol search:', error);
    return [];
  }
};

