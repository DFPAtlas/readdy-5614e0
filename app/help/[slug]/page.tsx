import HelpArticleClient from './HelpArticleClient';

export async function generateStaticParams() {
  return [
    { slug: 'getting-started-security-company' },
    { slug: 'set-up-your-first-site' },
    { slug: 'guard-mobile-sos-guide' },
    { slug: 'understanding-location-tracking' },
    { slug: 'check-in-and-geofencing' },
    { slug: 'reporting-incidents' },
    { slug: 'client-portal-overview' },
    { slug: 'billing-and-invoices' },
    { slug: 'timesheet-approvals' },
    { slug: 'configuring-agents' },
    { slug: 'sso-and-mfa' },
    { slug: 'data-subject-requests' },
    { slug: 'troubleshooting-login' },
    { slug: 'reports-and-exports' },
  ];
}

export default async function HelpArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <HelpArticleClient slug={slug} />;
}
