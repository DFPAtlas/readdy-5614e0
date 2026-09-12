import FeaturePageContent from './components/FeaturePageContent';

const allFeatures = [
  'command-centre', 'guard-management', 'rota-scheduling', 'attendance',
  'patrols', 'incidents', 'lone-worker-sos', 'compliance',
  'client-portal', 'reports', 'finance', 'automations', 'integrations',
];

export async function generateStaticParams() {
  return allFeatures.map((slug) => ({ slug }));
}

export default function FeaturePage({ params }: { params: { slug: string } }) {
  return <FeaturePageContent slug={params.slug} />;
}