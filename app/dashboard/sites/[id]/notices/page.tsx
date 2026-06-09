import SiteNoticeBoard from './SiteNoticeBoard';

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export default async function NoticesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SiteNoticeBoard siteId={id} />;
}