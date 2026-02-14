import './env.js';
import express from 'express';
import { analyzeTicker } from '../services/geminiService';
import { searchTickers } from '../services/symbolService';

const app = express();
const PORT = 3001;

app.get('/api/analyze', async (req, res) => {
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
    return res.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch data';
    return res.status(500).json({ error: message });
  }
});

app.get('/api/symbol-search', async (req, res) => {
  const q = req.query.q;
  if (!q || typeof q !== 'string' || q.trim().length < 2) {
    return res.json([]);
  }
  try {
    const results = await searchTickers(q.trim());
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate');
    return res.json(results);
  } catch (err) {
    console.error('Symbol search failed:', err);
    return res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
