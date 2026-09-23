import SolutionPageContent from '../components/SolutionPageContent';

const allSolutions = [
  'security-guarding', 'mobile-patrol', 'event-security', 'corporate-security',
  'retail-security', 'construction-security', 'keyholding-alarm-response',
];

export async function generateStaticParams() {
  return allSolutions.map((slug) => ({ slug }));
}

export default function SolutionPage({ params }: { params: { slug: string } }) {
  return <SolutionPageContent slug={params.slug} />;
}