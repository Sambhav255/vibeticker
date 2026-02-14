import React from 'react';
import { NewsItem } from '../types';
import { ExternalLink, Smile, Frown, Meh } from 'lucide-react';

interface NewsFeedProps {
  news: NewsItem[];
}

const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
  return (
    <div className="border border-zinc-900 bg-[rgba(10,10,10,0.95)] px-5 py-5 rounded-sm">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-sm font-medium tracking-[0.18em] uppercase text-muted">
          Signal Feed
        </h3>
        <p className="text-[10px] text-muted tracking-[0.18em] uppercase">
          Headlines by NewsAPI · Sentiment by AI
        </p>
      </div>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {news.map((item, index) => {
          let Icon = Meh;
          let colorClass = "text-muted bg-zinc-900/60 border-zinc-800";
          
          if (item.sentimentLabel === 'Bullish') {
            Icon = Smile;
            colorClass = "text-accent bg-accent/5 border-accent/40";
          } else if (item.sentimentLabel === 'Bearish') {
            Icon = Frown;
            colorClass = "text-accent bg-accent/5 border-accent/40";
          }

          return (
            <div key={index} className="p-4 rounded-sm bg-black/40 border border-zinc-900 hover:border-zinc-700 transition-colors group">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${colorClass}`}>
                      {item.sentimentLabel}
                    </span>
                    <span className="text-xs text-muted">{item.source}</span>
                  </div>
                  <h4 className="text-zinc-100 text-sm font-medium leading-snug group-hover:text-accent transition-colors">
                    {item.headline}
                  </h4>
                  <p className="text-xs text-muted mt-2 line-clamp-2">
                    {item.summary}
                  </p>
                </div>
                
                <div className="flex flex-col items-center gap-1 min-w-[40px]">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-muted hover:text-accent transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open</span>
                  </a>
                  <div className={`mt-1 px-1.5 py-0.5 rounded-full border text-[10px] font-mono ${colorClass}`}>
                    {item.sentimentScore > 0 ? "+" : ""}
                    {item.sentimentScore.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsFeed;