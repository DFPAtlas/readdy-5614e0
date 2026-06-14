'use client';

import { supabase } from '@/lib/supabase';

interface WidgetErrorLog {
  widget_name: string;
  page_path: string;
  client_id: string | null;
  user_id: string | null;
  error_message: string;
  stack: string | null;
  timestamp: string;
}

export function widgetErrorLogger(log: WidgetErrorLog): void {
  const entry = {
    agent_key: `widget:${log.widget_name}`,
    client_id: log.client_id,
    user_id: log.user_id,
    status: 'failed',
    request_payload: {
      widget_name: log.widget_name,
      page_path: log.page_path,
      timestamp: log.timestamp,
    },
    error_message: log.error_message + (log.stack ? ` | Stack: ${log.stack}` : ''),
    source: 'widget_boundary',
    requested_page: log.page_path,
    requested_feature: log.widget_name,
  };

  supabase
    .from('agent_execution_logs')
    .insert(entry)
    .then(() => {})
    .catch(() => {});

  if (typeof console !== 'undefined') {
    try {
      console.error(
        `[WidgetBoundary] ${log.widget_name} on ${log.page_path}: ${log.error_message}` +
        (log.stack ? `\n${log.stack}` : '')
      );
    } catch {}
  }
}