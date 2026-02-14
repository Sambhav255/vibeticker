import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const gemini = !!process.env.GEMINI_API_KEY;
  const alpha = !!process.env.ALPHAVANTAGE_API_KEY;
  const news = !!process.env.NEWSAPI_KEY;
  const allSet = gemini && alpha;

  const payload: Record<string, unknown> = {
    ok: allSet,
    env: { gemini, alpha, news },
    message: allSet ? 'All required keys are set' : 'Missing keys - check Vercel env vars and redeploy',
  };

  // ?debug=1 returns extra diagnostic info (no secrets)
  if (req.query.debug === '1') {
    payload._debug = {
      onVercel: !!process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV || null,
      hint: !allSet ? 'Redeploy after adding env vars. Env vars only apply to new deployments.' : null,
    };
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(payload);
}
