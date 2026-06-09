import ClientUsersClient from './ClientUsersClient';

export async function generateStaticParams() {
  return [{ clientId: '1' }, { clientId: '2' }, { clientId: '3' }];
}

export default async function ClientUsersPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  return <ClientUsersClient clientId={clientId} />;
}