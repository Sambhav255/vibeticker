import { PricePoint } from '../types.js';

interface AlphaVantageDailyResponse {
  'Time Series (Daily)'?: Record<string, Record<string, string>>;
  'Error Message'?: string;
  Note?: string;
  Information?: string;
}

interface AlphaVantageDigitalDailyResponse {
  'Time Series (Digital Currency Daily)'?: Record<string, Record<string, string>>;
  'Error Message'?: string;
  Note?: string;
  Information?: string;
}

export interface PriceDataResult {
  symbol: string;
  companyName: string;
  currentPrice: number;
  priceChange24h: number;
  percentChange24h: number;
  history: PricePoint[];
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const priceCache = new Map<string, { data: PriceDataResult; expires: number }>();

const getApiKey = () => {
  const key = process.env.ALPHAVANTAGE_API_KEY;
  if (!key) {
    console.warn('ALPHAVANTAGE_API_KEY is not set. Price data will be unavailable.');
  }
  return key;
};

const checkApiError = (json: { Note?: string; 'Error Message'?: string; Information?: string }): void => {
  if (json.Note) {
    throw new Error(
      'Alpha Vantage rate limit exceeded (5 calls/min). Please wait a minute and try again.'
    );
  }
  if (json['Error Message']) {
    throw new Error(json['Error Message'] || 'Alpha Vantage returned an error.');
  }
  if (json.Information) {
    throw new Error(
      json.Information.includes('API key') || json.Information.includes('demo')
        ? 'Alpha Vantage: Please use a valid API key. Get a free key at alphavantage.co/support/#api-key'
        : json.Information
    );
  }
};

const parseDailySeries = (series: Record<string, Record<string, string>>): PricePoint[] => {
  const entries = Object.entries(series)
    .sort(([a], [b]) => (a < b ? -1 : 1)) // ascending by date
    .slice(-7); // last 7 days

  return entries.map(([date, data], index) => {
    const close = parseFloat(
      data['4. close'] ??
        data['5. adjusted close'] ??
        Object.values(data)[0]
    );

    // Derive sentiment from day-over-day price change
    let sentiment = 0;
    if (index > 0) {
      const prevClose = parseFloat(
        entries[index - 1][1]['4. close'] ??
          entries[index - 1][1]['5. adjusted close'] ??
          Object.values(entries[index - 1][1])[0]
      );
      if (!isNaN(prevClose) && prevClose > 0) {
        const change = (close - prevClose) / prevClose;
        // Normalize to -1 to 1 range, capped at reasonable bounds
        sentiment = Math.max(-1, Math.min(1, change * 10));
      }
    }

    return {
      date,
      price: isNaN(close) ? 0 : close,
      sentiment,
    };
  });
};

const parseDigitalSeries = (series: Record<string, Record<string, string>>): PricePoint[] => {
  const entries = Object.entries(series)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-7);

  return entries.map(([date, data], index) => {
    // Alpha Vantage digital: "4a. close (USD)"
    const key = Object.keys(data).find((k) => k.toLowerCase().includes('close'));
    const close = key ? parseFloat(data[key]) : NaN;

    // Derive sentiment from day-over-day price change
    let sentiment = 0;
    if (index > 0) {
      const prevKey = Object.keys(entries[index - 1][1]).find((k) => k.toLowerCase().includes('close'));
      const prevClose = prevKey ? parseFloat(entries[index - 1][1][prevKey]) : NaN;
      if (!isNaN(prevClose) && prevClose > 0) {
        const change = (close - prevClose) / prevClose;
        // Normalize to -1 to 1 range, capped at reasonable bounds
        sentiment = Math.max(-1, Math.min(1, change * 10));
      }
    }

    return {
      date,
      price: isNaN(close) ? 0 : close,
      sentiment,
    };
  });
};

export const fetchPriceData = async (symbol: string): Promise<PriceDataResult> => {
  const apiKey = getApiKey();
  const normalizedSymbol = symbol.trim().toUpperCase();

  const empty: PriceDataResult = {
    symbol: normalizedSymbol,
    companyName: normalizedSymbol,
    currentPrice: 0,
    priceChange24h: 0,
    percentChange24h: 0,
    history: [],
  };

  if (!apiKey) {
    throw new Error('Alpha Vantage API key is not configured.');
  }

  // Return cached data if valid
  const cached = priceCache.get(normalizedSymbol);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const knownCrypto = ['BTC', 'ETH', 'XRP', 'DOGE', 'ADA', 'SOL', 'AVAX', 'MATIC', 'LINK', 'DOT', 'UNI', 'LTC', 'BCH', 'ATOM', 'XLM', 'ALGO', 'VET', 'FIL', 'TRX', 'ETC', 'XMR', 'APE', 'SHIB', 'NEAR', 'AAVE', 'GRT', 'ICP', 'AXS', 'SAND', 'MANA', 'CRV', 'MKR', 'SNX', 'COMP', 'YFI', 'BAT', 'ZEC', 'DASH', 'EOS', 'XTZ', 'THETA', 'FTM', 'HBAR', 'ONE', 'CELO', 'KAVA', 'ZIL', 'ENJ', 'CHZ', 'FLOW', 'AR', 'RUNE', 'KSM'];

  try {
    let history: PricePoint[] | null = null;

    // Try crypto endpoint first for known crypto symbols (saves 1 API call)
    if (knownCrypto.includes(normalizedSymbol)) {
      const digitalUrl = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${encodeURIComponent(
        normalizedSymbol
      )}&market=USD&apikey=${apiKey}`;
      const res = await fetch(digitalUrl);
      const digitalJson = (await res.json()) as AlphaVantageDigitalDailyResponse;
      checkApiError(digitalJson);
      if (digitalJson['Time Series (Digital Currency Daily)']) {
        history = parseDigitalSeries(digitalJson['Time Series (Digital Currency Daily)']);
      }
    }

    // Otherwise, or if crypto returned nothing, try equity/ETF
    if (!history) {
      const dailyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(
        normalizedSymbol
      )}&apikey=${apiKey}`;
      const res = await fetch(dailyUrl);
      const json = (await res.json()) as AlphaVantageDailyResponse;
      checkApiError(json);
      if (json['Time Series (Daily)']) {
        history = parseDailySeries(json['Time Series (Daily)']);
      }
    }

    // If equity failed but symbol looks like crypto (3–4 letters), try crypto as fallback
    if (!history && /^[A-Z]{3,5}$/.test(normalizedSymbol)) {
      const digitalUrl = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${encodeURIComponent(
        normalizedSymbol
      )}&market=USD&apikey=${apiKey}`;
      const res = await fetch(digitalUrl);
      const digitalJson = (await res.json()) as AlphaVantageDigitalDailyResponse;
      checkApiError(digitalJson);
      if (digitalJson['Time Series (Digital Currency Daily)']) {
        history = parseDigitalSeries(digitalJson['Time Series (Digital Currency Daily)']);
      }
    }

    if (!history || history.length === 0) {
      throw new Error(
        `No price data found for ${normalizedSymbol}. The symbol may not be supported. Try a different ticker.`
      );
    }

    const last = history[history.length - 1];
    const prev = history.length > 1 ? history[history.length - 2] : last;

    const currentPrice = last.price;
    const priceChange24h = currentPrice - prev.price;
    const percentChange24h =
      prev.price !== 0 ? (priceChange24h / prev.price) * 100 : 0;

    const result: PriceDataResult = {
      symbol: normalizedSymbol,
      companyName: normalizedSymbol,
      currentPrice,
      priceChange24h,
      percentChange24h,
      history,
    };

    // Cache successful result
    priceCache.set(normalizedSymbol, {
      data: result,
      expires: Date.now() + CACHE_TTL_MS,
    });

    return result;
  } catch (error) {
    if (error instanceof Error) throw error;
    console.error('Failed to fetch price data from Alpha Vantage:', error);
    throw new Error('Could not fetch price data. Please try again.');
  }
};

