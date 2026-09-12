'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'Unknown error' };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 text-center">
          <div className="w-10 h-10 flex items-center justify-center bg-red-500/10 rounded-full mx-auto mb-3">
            <i className="ri-error-warning-line text-red-400 text-lg"></i>
          </div>
          <p className="text-sm text-gray-400 font-medium">Something went wrong loading this section</p>
          <p className="text-xs text-gray-500 mt-1">{this.state.errorMessage}</p>
        </div>
      );
    }
    return this.props.children;
  }
}