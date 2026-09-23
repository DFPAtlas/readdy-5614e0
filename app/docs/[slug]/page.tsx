import DocArticleClient from './DocArticleClient';

export async function generateStaticParams() {
  return [
    { slug: 'quickstart-guide' },
    { slug: 'onboarding-your-team' },
    { slug: 'sites-and-checkpoints' },
    { slug: 'occurrence-book-guide' },
    { slug: 'rota-engine-guide' },
    { slug: 'guard-app-overview' },
    { slug: 'lone-worker-setup' },
    { slug: 'incident-reporting-guard' },
    { slug: 'acs-compliance-dashboard' },
    { slug: 'evidence-vault-guide' },
    { slug: 'subscription-and-billing' },
    { slug: 'api-and-webhooks' },
  ];
}

export default async function DocArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <DocArticleClient slug={slug} />;
}