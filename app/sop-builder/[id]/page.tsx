import SOPDetailPage from './SOPDetailClient';

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export default async function SOPDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SOPDetailPage id={id} />;
}