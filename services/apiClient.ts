/**
 * Frontend API client - calls backend routes only. API keys never touch the client.
 */
import { TickerData } from '../types';
import type { TickerSuggestion } from './symbolService';

export type { TickerSuggestion };

const getBaseUrl = () => import.meta.env.VITE_API_URL || '';

const safeParseJson = async (res: Response): Promise<unknown> => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      res.ok
        ? 'Invalid response from server'
        : 'Server error. Add GEMINI_API_KEY, ALPHAVANTAGE_API_KEY, and NEWSAPI_KEY in Vercel → Settings → Environment Variables, then redeploy.'
    );
  }
};

export const analyzeTicker = async (symbol: string): Promise<TickerData> => {
  const base = getBaseUrl();
  const url = `${base}/api/analyze?symbol=${encodeURIComponent(symbol)}`;
  const res = await fetch(url);
  const data = (await safeParseJson(res)) as { error?: string } | TickerData;
  if (!res.ok) {
    throw new Error((data && typeof data === 'object' && 'error' in data ? data.error : null) || 'Failed to fetch data');
  }
  return data as TickerData;
};

export const searchTickers = async (query: string): Promise<TickerSuggestion[]> => {
  const base = getBaseUrl();
  const url = `${base}/api/symbol-search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  try {
    const data = await res.json();
    if (!res.ok) return [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};
