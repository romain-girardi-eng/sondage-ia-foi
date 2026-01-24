"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
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
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center space-y-6 max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                Une erreur est survenue
              </h2>
              <p className="text-white/60 text-sm">
                Nous sommes désolés, quelque chose s&apos;est mal passé. Veuillez réessayer.
              </p>
            </div>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
