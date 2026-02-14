import type { VercelRequest, VercelResponse } from '@vercel/node';
import { searchTickers } from '../services/symbolService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const q = req.query.q;
  if (!q || typeof q !== 'string' || q.trim().length < 2) {
    return res.status(200).json([]);
  }

  try {
    const results = await searchTickers(q.trim());
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate');
    return res.status(200).json(results);
  } catch (err) {
    console.error('Symbol search failed:', err);
    return res.status(200).json([]);
  }
}
