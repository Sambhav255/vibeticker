/**
 * Frontend API client - calls backend routes only. API keys never touch the client.
 */
import { TickerData } from '../types';
import type { TickerSuggestion } from './symbolService';

export type { TickerSuggestion };

const getBaseUrl = () => import.meta.env.VITE_API_URL || '';

const ENV_VARS_MSG =
  'Add GEMINI_API_KEY, ALPHAVANTAGE_API_KEY, and NEWSAPI_KEY in Vercel → Settings → Environment Variables, then redeploy.';

export type HealthResult = {
  ok: boolean;
  env: { gemini: boolean; alpha: boolean; news: boolean };
  message?: string;
};

export const checkHealth = async (): Promise<HealthResult> => {
  const base = getBaseUrl();
  const isLocal = import.meta.env.DEV && (typeof window === 'undefined' || window.location?.hostname === 'localhost');
  try {
    const res = await fetch(`${base}/api/health`);
    const text = await res.text();
    try {
      const data = text ? JSON.parse(text) : {};
      return data as HealthResult;
    } catch {
      const msg = isLocal
        ? 'Backend not reachable. Run `npm run dev` and ensure port 4001 is free.'
        : 'Could not reach API. ' + ENV_VARS_MSG;
      throw new Error(msg);
    }
  } catch (err) {
    if (err instanceof Error && (err.message.includes('Could not reach') || err.message.includes('Backend not reachable'))) throw err;
    const msg = isLocal
      ? 'Backend not reachable. Run `npm run dev` and ensure port 4001 is free.'
      : 'Could not reach API. ' + ENV_VARS_MSG;
    throw new Error(msg);
  }
};

const safeParseJson = async (res: Response, parseErrorMsg?: string): Promise<unknown> => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    const base = res.ok ? 'Invalid response from server' : (parseErrorMsg ?? ENV_VARS_MSG);
    const statusHint = !res.ok ? ` (HTTP ${res.status})` : '';
    throw new Error(base + statusHint);
  }
};

const ANALYZE_FAIL_MSG =
  'Analysis failed. The API may be rate-limited (Alpha Vantage: 5 calls/min) or temporarily unavailable.';

export const analyzeTicker = async (symbol: string): Promise<TickerData> => {
  const base = getBaseUrl();
  const url = `${base}/api/analyze?symbol=${encodeURIComponent(symbol)}`;
  const res = await fetch(url);
  const data = (await safeParseJson(res, ANALYZE_FAIL_MSG)) as { error?: string } | TickerData;
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
