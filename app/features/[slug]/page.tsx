import FeaturePageContent from '../components/FeaturePageContent';

const allFeatures = [
  'command-centre', 'guard-management', 'rota-scheduling', 'attendance',
  'patrols', 'incidents', 'lone-worker-sos', 'compliance',
  'client-portal', 'reports', 'finance', 'automations', 'integrations',
];

export async function generateStaticParams() {
  return allFeatures.map((slug) => ({ slug }));
}

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <FeaturePageContent slug={slug} />;
}
