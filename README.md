
# VibeTicker | Market Pulse

Sentiment vs price: a calm, editorial view of how markets and news flow move together.

## Prerequisites

- Node.js 18+
- API keys (see below)

## Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure API keys**
   - Copy `.env.example` to `.env.local`
   - Add your keys to `.env.local` (never commit this file)

3. **Run the app**
   ```bash
   npm run dev
   ```
   Starts the frontend (Vite) and the local API server on port 4001. Open the URL shown in the terminal (usually http://localhost:5173 or http://localhost:5174).

   Or use **Vercel CLI** to mirror production:
   ```bash
   npx vercel dev
   ```

## API Keys

| Key | Required | Get it |
|-----|----------|--------|
| `GEMINI_API_KEY` | Yes | [Google AI Studio](https://aistudio.google.com/apikey) |
| `ALPHAVANTAGE_API_KEY` | Yes | [Alpha Vantage](https://www.alphavantage.co/support/#api-key) |
| `NEWSAPI_KEY` | No | [NewsAPI](https://newsapi.org/) |

**Security:** API keys are used only in server-side API routes. They are never exposed to the client.

## Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Project Settings → Environment Variables:
   - `GEMINI_API_KEY`
   - `ALPHAVANTAGE_API_KEY`
   - `NEWSAPI_KEY` (optional)

4. Deploy

**Rotate your API keys** if they were ever committed or exposed. Create new keys in each provider's dashboard and update your env vars.

## Data Sources

- **Price Data**: Alpha Vantage (stocks, ETFs, crypto)
- **News**: NewsAPI (when configured)
- **Sentiment**: Google Gemini AI

*Data for informational purposes only. Not investment advice.*
