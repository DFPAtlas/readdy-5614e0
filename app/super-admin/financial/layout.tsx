'use client';

import SuperAdminGate from '../../admin/components/SuperAdminGate';
import AdminShell from '../../admin/components/AdminShell';
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Overview", href: "/super-admin/financial", icon: "ri-dashboard-line" },
  { label: "Invoices", href: "/super-admin/financial/invoices", icon: "ri-file-list-line" },
  { label: "Failed & Overdue", href: "/super-admin/financial/failed", icon: "ri-error-warning-line" },
  { label: "Refunds & Disputes", href: "/super-admin/financial/refunds", icon: "ri-refund-line" },
  { label: "VAT", href: "/super-admin/financial/tax", icon: "ri-government-line" },
];

export default function FinancialLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/super-admin/financial") return pathname === "/super-admin/financial";
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <SuperAdminGate>
      <AdminShell>
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/15 flex items-center justify-center text-emerald-400">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-bank-card-line"></i>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">Financial Control Centre</h1>
            </div>
            <p className="text-sm text-gray-500">Platform billing, revenue, and compliance overview</p>
          </div>

          <div className="flex gap-1 mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isActive(tab.href)
                    ? "bg-emerald-600/15 text-emerald-400 border border-emerald-600/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent"
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={tab.icon}></i>
                </div>
                {tab.label}
              </Link>
            ))}
          </div>

          {children}
        </div>
      </AdminShell>
    </SuperAdminGate>
  );
}