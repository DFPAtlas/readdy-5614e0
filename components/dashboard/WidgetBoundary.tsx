'use client';

import React from 'react';
import WidgetFallback from './WidgetFallback';
import { widgetErrorLogger } from '@/lib/widgetErrorLogger';

interface WidgetBoundaryProps {
  widgetName: string;
  pagePath: string;
  clientId?: string | null;
  userId?: string | null;
  fallbackTitle?: string;
  locked?: boolean;
  lockedFeature?: string;
  children: React.ReactNode;
}

interface WidgetBoundaryState {
  hasError: boolean;
  errorMessage: string;
  errorStack: string | null;
  retryKey: number;
}

export default class WidgetBoundary extends React.Component<
  WidgetBoundaryProps,
  WidgetBoundaryState
> {
  constructor(props: WidgetBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
      errorStack: null,
      retryKey: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<WidgetBoundaryState> {
    return {
      hasError: true,
      errorMessage: error.message || 'Unknown error',
      errorStack: error.stack || null,
    };
  }

  componentDidCatch(error: Error) {
    widgetErrorLogger({
      widget_name: this.props.widgetName,
      page_path: this.props.pagePath,
      client_id: this.props.clientId || null,
      user_id: this.props.userId || null,
      error_message: error.message || 'Unknown render error',
      stack: error.stack || null,
      timestamp: new Date().toISOString(),
    });
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      errorMessage: '',
      errorStack: null,
      retryKey: prev.retryKey + 1,
    }));
  };

  render() {
    if (this.props.locked) {
      return (
        <WidgetFallback
          state="locked"
          lockedFeature={this.props.lockedFeature || this.props.widgetName}
        />
      );
    }

    if (this.state.hasError) {
      return (
        <WidgetFallback
          state="error"
          title={this.props.fallbackTitle || this.props.widgetName}
          message={this.state.errorMessage}
          onRetry={this.handleRetry}
        />
      );
    }

    return (
      <React.Fragment key={this.state.retryKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}