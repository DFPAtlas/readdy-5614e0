import OpsShell from '@/app/components/OpsShell';

export default function SitesLayout({ children }: { children: React.ReactNode }) {
  return <OpsShell>{children}</OpsShell>;
}