import React from 'react';
import { Circle } from 'lucide-react';

export type TabId = 'overview' | 'signals' | 'method';

interface HeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'signals', label: 'Signals' },
    { id: 'method', label: 'Method' },
  ];

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

        <nav className="flex items-center gap-4 md:gap-6 text-[11px] tracking-[0.22em] uppercase">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'text-accent font-medium'
                  : 'text-muted hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;