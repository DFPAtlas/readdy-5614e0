import SiteDetailClient from './SiteDetailClient';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '610ca42f-b26c-4429-8a58-f7887a0f2354' },
    { id: 'aa8ddc0d-55e2-4ecb-9129-6fed49f02bba' },
    { id: 'cb5f9a20-c840-4cb2-a683-71f6b1715605' },
    { id: '03daa967-6d36-4c82-ae9a-7e79b51782e9' },
  ];
}

export default async function ClientSiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SiteDetailClient siteId={id} />;
}