import type { ReactNode } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="min-h-screen bg-background text-text font-sans flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <AlertTriangle className="w-16 h-16 text-amber-500/80" />
        </div>
        <div>
          <h1 className="text-xl font-serifDisplay text-text mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-muted mb-4">
            {error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={resetErrorBoundary}
            className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-zinc-800 rounded-sm text-sm hover:bg-zinc-800/80 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback} onReset={() => {}}>
      {children}
    </ReactErrorBoundary>
  );
}
