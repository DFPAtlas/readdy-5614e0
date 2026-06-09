import GuardPatrolScanPage from './GuardPatrolScanPage';

export async function generateStaticParams() {
  return [{ checkpoint_code: 'ABC123' }, { checkpoint_code: 'XYZ789' }, { checkpoint_code: 'DEF456' }];
}

export default async function Page({ params }: { params: Promise<{ checkpoint_code: string }> }) {
  const { checkpoint_code } = await params;
  return <GuardPatrolScanPage checkpointCode={checkpoint_code} />;
}