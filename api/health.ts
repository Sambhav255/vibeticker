import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { runtime: 'nodejs' };

export default function handler(req: VercelRequest, res: VercelResponse) {
  const gemini = !!process.env.GEMINI_API_KEY;
  const alpha = !!process.env.ALPHAVANTAGE_API_KEY;
  const news = !!process.env.NEWSAPI_KEY;
  const allSet = gemini && alpha;

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    ok: allSet,
    env: { gemini, alpha, news },
    message: allSet ? 'All required keys are set' : 'Missing keys - check Vercel env vars and redeploy',
  });
}
