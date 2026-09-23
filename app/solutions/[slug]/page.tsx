import SolutionPageContent from '../components/SolutionPageContent';

const allSolutions = [
  'security-guarding', 'mobile-patrol', 'event-security', 'corporate-security',
  'retail-security', 'construction-security', 'keyholding-alarm-response',
];

export async function generateStaticParams() {
  return allSolutions.map((slug) => ({ slug }));
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SolutionPageContent slug={slug} />;
}