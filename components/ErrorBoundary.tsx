import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
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
                {this.state.error?.message || 'An unexpected error occurred.'}
              </p>
              <button
                onClick={this.handleRetry}
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

    return this.props.children;
  }
}
