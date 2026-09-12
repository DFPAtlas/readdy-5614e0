'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useAutomationControl } from '@/lib/useAutomationControl';
import AgentControlClient from './AgentControlClient';
import { DashboardPageSkeleton } from '@/app/components/PageSkeleton';

export default function AgentControlPage() {
  const { profile, company } = useAuth();
  const companyId = profile?.company_id || null;
  const { loading, ...control } = useAutomationControl(companyId);
  const isSuperAdmin = profile?.role === 'super_admin';

  if (loading) {
    return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <DashboardPageSkeleton />
      </div>
    );
  }

  return (
    <AgentControlClient
      {...control}
      isSuperAdmin={isSuperAdmin}
      companyName={company?.name || 'Your Company'}
    />
  );
}