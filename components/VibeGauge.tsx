import React from 'react';
import { Minus } from 'lucide-react';

interface VibeGaugeProps {
  score: number; // 0 to 100
  label: string;
}

const VibeGauge: React.FC<VibeGaugeProps> = ({ score, label }) => {
  const clampedScore = Math.min(100, Math.max(0, score));
  const position = `${clampedScore}%`;

  return (
    <section className="border border-zinc-900 bg-[rgba(15,15,15,0.9)] px-5 py-5 rounded-sm flex flex-col gap-4 fade-in-slow">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[11px] tracking-[0.26em] uppercase text-muted">
            Sentiment Scale
          </h3>
          <p className="mt-2 text-xs text-muted">
            A single needle tracing where the current vibe sits on a calm spectrum.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs tracking-[0.22em] uppercase text-muted">
            Score
          </div>
          <div className="mt-1 text-base font-medium">
            {score}
            <span className="text-xs text-muted ml-1">/ 100</span>
          </div>
          <div className="mt-1 text-xs text-accent">
            {label}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <div className="relative h-8">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-zinc-800" />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-zinc-700 via-accent/60 to-zinc-700" />

          <div
            className="absolute top-1/2 -translate-y-1/2 h-5 w-px bg-accent transition-all duration-700 ease-out"
            style={{ left: position }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -ml-1.5 h-3 w-3 border border-accent rounded-full bg-black/80 transition-all duration-700 ease-out"
            style={{ left: position }}
          />
        </div>

        <div className="mt-3 flex justify-between text-[10px] tracking-[0.22em] uppercase text-muted">
          <span>Muted</span>
          <span>Neutral</span>
          <span>Elevated</span>
        </div>
      </div>
    </section>
  );
};

export default VibeGauge;