'use client';


import { ReactNode, Component, ErrorInfo } from 'react';
import Link from 'next/link';
import { AlertCircle, Home, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 pt-28 pb-16">
          <div className="max-w-lg w-full">
            {/* Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-lg rounded-full"></div>
                <div className="relative bg-red-500/10 border border-red-500/30 rounded-full p-6">
                  <AlertCircle width={48} height={48} className="text-red-500" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h1 className="font-display text-4xl font-bold mb-4">Something Went Wrong</h1>
              <p className="text-muted-foreground font-body text-lg mb-4">
                An unexpected error occurred. Please try refreshing the page.
              </p>

              {/* Error Details (Development Only) */}
              {this.state.error && (
                <div className="mt-6 p-4 bg-red-950/20 border border-red-500/30 rounded-lg text-left">
                  <p className="text-xs text-red-400 font-mono break-all">
                    {this.state.error.message || 'Unknown error'}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-body font-semibold"
              >
                <RotateCcw width={18} height={18} />
                Refresh Page
              </button>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-foreground rounded-lg hover:bg-white/20 transition-colors font-body font-semibold"
              >
                <Home width={18} height={18} />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
