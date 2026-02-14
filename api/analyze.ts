import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeTicker } from '../services/geminiService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const symbol = req.query.symbol;
  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  const trimmed = symbol.trim().toUpperCase();
  if (!trimmed) {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  try {
    const data = await analyzeTicker(trimmed);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch data';
    return res.status(500).json({ error: message });
  }
}
