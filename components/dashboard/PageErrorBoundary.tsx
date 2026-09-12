'use client';

import React from 'react';
import Link from 'next/link';

interface PageErrorBoundaryProps {
  pageName: string;
  children: React.ReactNode;
}

interface PageErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export default class PageErrorBoundary extends React.Component<
  PageErrorBoundaryProps,
  PageErrorBoundaryState
> {
  constructor(props: PageErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
    return { hasError: true, errorMessage: error.message || 'Unknown error' };
  }

  componentDidCatch(error: Error) {
    console.error(`[PageErrorBoundary:${this.props.pageName}]`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <i className="ri-error-warning-line text-2xl text-red-400"></i>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">
              {this.props.pageName} couldn&apos;t load
            </h2>
            <p className="text-sm text-gray-400 mb-1">
              Something went wrong while loading this page.
            </p>
            <p className="text-xs text-gray-600 mb-5 break-all">
              {this.state.errorMessage}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, errorMessage: '' })}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                Try Again
              </button>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-sm text-gray-400 hover:text-white transition-all cursor-pointer whitespace-nowrap"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}