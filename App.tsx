import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import PriceChart from './components/PriceChart';
import VibeGauge from './components/VibeGauge';
import NewsFeed from './components/NewsFeed';
import { analyzeTicker, checkHealth } from './services/apiClient';
import { TickerData, FetchStatus } from './types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<FetchStatus>(FetchStatus.IDLE);
  const [data, setData] = useState<TickerData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setStatus(FetchStatus.LOADING);
      setError(null);
      try {
        const health = await checkHealth();
        if (cancelled) return;
        if (!health.ok) {
          const missing = [
            !health.env.gemini && 'GEMINI_API_KEY',
            !health.env.alpha && 'ALPHAVANTAGE_API_KEY',
          ].filter(Boolean);
          setError(
            `Missing required API keys: ${missing.join(', ')}. Add them in Vercel → Settings → Environment Variables, then redeploy. NEWSAPI_KEY is optional.`
          );
          setStatus(FetchStatus.ERROR);
          return;
        }
        const result = await analyzeTicker('AAPL');
        if (cancelled) return;
        setData(result);
        setStatus(FetchStatus.SUCCESS);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to fetch data. Please try again.';
        setError(message);
        setStatus(FetchStatus.ERROR);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const handleSearch = async (symbol: string) => {
    setStatus(FetchStatus.LOADING);
    setError(null);
    try {
      const result = await analyzeTicker(symbol);
      setData(result);
      setStatus(FetchStatus.SUCCESS);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data. Please try again.';
      setError(message);
      setStatus(FetchStatus.ERROR);
    }
  };

  const buildSignalSummary = (payload: TickerData) => {
    const { symbol, percentChange24h, overallVibeScore, correlationScore } = payload;

    const direction =
      percentChange24h > 0
        ? 'drifting higher'
        : percentChange24h < 0
        ? 'easing lower'
        : 'trading flat';

    const tone =
      overallVibeScore >= 60
        ? 'optimistic'
        : overallVibeScore <= 40
        ? 'cautious'
        : 'balanced';

    const correlation =
      correlationScore > 0.7
        ? 'closely tracking'
        : correlationScore < 0.3
        ? 'largely decoupled from'
        : 'moderately aligned with';

    return `${symbol} is ${direction} with ${tone} positioning, ${correlation} recent news flow.`;
  };

  return (
    <div className="min-h-screen bg-background text-text font-sans selection:bg-blue-500/30">
      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10 app-noise">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-serifDisplay tracking-tight mb-3">
            Market&nbsp;Pulse
          </h2>
          <p className="text-muted max-w-xl mx-auto text-sm md:text-base">
            A calm, editorial view of how price and sentiment move together across the market.
          </p>
        </div>

        <SearchBar onSearch={handleSearch} isLoading={status === FetchStatus.LOADING} />

        {status === FetchStatus.ERROR && (
          <div className="max-w-lg mx-auto p-4 mb-8 border border-zinc-900 bg-red-950/40 text-red-200 text-center text-sm">
            {error}
          </div>
        )}

        {status === FetchStatus.SUCCESS && data && (
          <div className="space-y-8 fade-in-slow">
            {/* Signal Card */}
            <section className="border border-zinc-900 bg-[rgba(12,12,12,0.95)] px-6 py-5 rounded-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <div className="text-[11px] tracking-[0.22em] uppercase text-muted">
                  Market Signal
                </div>
                <div>
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-2xl md:text-3xl font-serifDisplay">
                      {data.symbol}
                    </h2>
                    <span className="text-xs text-muted truncate max-w-[180px]">
                      {data.companyName}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-6 text-sm">
                    <div className="space-y-1">
                      <div className="text-[10px] tracking-[0.26em] uppercase text-muted">
                        Price
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-sm md:text-base">
                          ${data.currentPrice.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-medium text-accent">
                          {data.percentChange24h >= 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {data.percentChange24h >= 0 ? '+' : ''}{data.percentChange24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] tracking-[0.26em] uppercase text-muted">
                        Correlation
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {data.correlationScore.toFixed(2)}
                        </span>
                        <div className="h-px w-16 bg-zinc-800 relative overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-accent"
                            style={{ width: `${data.correlationScore * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] tracking-[0.26em] uppercase text-muted">
                        Sentiment
                      </div>
                      <div className="text-sm font-medium">
                        {data.vibeLabel}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="max-w-md text-xs md:text-sm leading-relaxed text-muted">
                {buildSignalSummary(data)}
              </p>
            </section>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Chart */}
              <div className="lg:col-span-2">
                <PriceChart data={data.history} symbol={data.symbol} />
              </div>

              {/* Right Column: Gauge */}
              <div className="lg:col-span-1">
                <VibeGauge score={data.overallVibeScore} label={data.vibeLabel} />
              </div>

              {/* Bottom: News Feed */}
              <div className="lg:col-span-3">
                <NewsFeed news={data.news} />
              </div>
            </div>

          </div>
        )}

        {/* Disclaimer Footer */}
        <footer className="mt-16 pt-8 border-t border-zinc-900">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <p className="text-[11px] text-muted tracking-[0.12em] uppercase leading-relaxed">
              Data provided for informational purposes only. Not investment or trading advice.
            </p>
            <p className="text-[10px] text-muted/80 leading-relaxed">
              Prices sourced from Alpha Vantage. News headlines from NewsAPI. Sentiment analysis and scores are AI-generated and may be inaccurate. Data may be delayed or contain errors. Use at your own risk.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;