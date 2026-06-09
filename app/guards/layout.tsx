import OpsShell from '@/app/components/OpsShell';

export default function GuardsLayout({ children }: { children: React.ReactNode }) {
  return <OpsShell>{children}</OpsShell>;
}