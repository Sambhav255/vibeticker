import React, { useEffect, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { searchTickers, type TickerSuggestion } from '../services/apiClient';

interface SearchBarProps {
  onSearch: (symbol: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<TickerSuggestion[]>([]);
  const [isSearchingSymbols, setIsSearchingSymbols] = useState(false);

  useEffect(() => {
    if (!input.trim() || input.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const handle = setTimeout(async () => {
      setIsSearchingSymbols(true);
      const results = await searchTickers(input.trim());
      setSuggestions(results);
      setIsSearchingSymbols(false);
    }, 450);

    return () => clearTimeout(handle);
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim().toUpperCase());
      setSuggestions([]);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-10 group">
      <form onSubmit={handleSubmit}>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-accent animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-muted group-focus-within:text-accent transition-colors" />
          )}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="block w-full pl-11 pr-4 py-4 bg-transparent border border-zinc-800 rounded-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors text-sm md:text-base"
          placeholder="Search by company, asset, or ticker (e.g., Apple, BTC, TSLA)"
          disabled={isLoading}
        />
      </form>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute z-40 mt-1 w-full border border-zinc-900 bg-black/95 rounded-sm shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.symbol}
              type="button"
              onClick={() => {
                setInput(s.symbol);
                setSuggestions([]);
                onSearch(s.symbol.toUpperCase());
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-900/80 transition-colors flex items-center justify-between gap-3"
            >
              <div>
                <div className="text-zinc-100 font-medium">{s.symbol}</div>
                <div className="text-[11px] text-muted truncate">
                  {s.name}
                </div>
              </div>
              <div className="text-[10px] text-muted text-right">
                {s.region && <div>{s.region}</div>}
                {s.currency && <div>{s.currency}</div>}
              </div>
            </button>
          ))}
          {isSearchingSymbols && (
            <div className="px-4 py-2 text-[11px] text-muted border-t border-zinc-900">
              Searching tickers…
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;