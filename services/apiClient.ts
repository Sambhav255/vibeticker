/**
 * Frontend API client - calls backend routes only. API keys never touch the client.
 */
import { TickerData } from '../types';
import type { TickerSuggestion } from './symbolService';

export type { TickerSuggestion };

const getBaseUrl = () => import.meta.env.VITE_API_URL || '';

export const analyzeTicker = async (symbol: string): Promise<TickerData> => {
  const base = getBaseUrl();
  const url = `${base}/api/analyze?symbol=${encodeURIComponent(symbol)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch data');
  }
  return data;
};

export const searchTickers = async (query: string): Promise<TickerSuggestion[]> => {
  const base = getBaseUrl();
  const url = `${base}/api/symbol-search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    return [];
  }
  return Array.isArray(data) ? data : [];
};
