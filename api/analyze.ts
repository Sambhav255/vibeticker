import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeTicker } from '../services/geminiService';

export const config = { maxDuration: 60 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sendJson = (status: number, data: object) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(status).json(data);
  };

  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      return sendJson(405, { error: 'Method not allowed' });
    }

    const symbol = req.query.symbol;
    if (!symbol || typeof symbol !== 'string') {
      return sendJson(400, { error: 'Symbol is required' });
    }

    const trimmed = symbol.trim().toUpperCase();
    if (!trimmed) {
      return sendJson(400, { error: 'Symbol is required' });
    }

    const data = await analyzeTicker(trimmed);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return sendJson(200, data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch data';
    return sendJson(500, { error: message });
  }
}
