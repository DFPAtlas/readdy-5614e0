import SupportTicketDetailClient from './SupportTicketDetailClient';

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export default function SupportTicketPage({ params }: { params: { id: string } }) {
  return <SupportTicketDetailClient ticketId={params.id} />;
}