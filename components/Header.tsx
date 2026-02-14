import React from 'react';
import { Circle } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-zinc-900/80 bg-black/40 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full border border-zinc-800 flex items-center justify-center">
            <Circle className="w-3.5 h-3.5 text-accent" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-serifDisplay tracking-tight">
              VibeTicker
            </h1>
            <p className="text-[11px] tracking-[0.22em] uppercase text-muted">
              Market Pulse Engine
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-[11px] tracking-[0.22em] uppercase text-muted">
          <span className="hover:text-zinc-200 transition-colors cursor-default">
            Overview
          </span>
          <span className="hover:text-zinc-200 transition-colors cursor-default">
            Signals
          </span>
          <span className="hover:text-zinc-200 transition-colors cursor-default">
            Method
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;