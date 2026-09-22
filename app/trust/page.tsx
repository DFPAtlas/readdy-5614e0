'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GlassCard from '../components/GlassCard';
import { supabase } from '@/lib/supabase';

type Sub = { id: string; provider_name: string; service: string; processing_location: string; transfer_countries: string; security_review_status: string };
type Framework = { id: string; name: string; description: string };
type Ai = { id: string; system_name: string; purpose: string; human_involvement: string };

export default function TrustPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [ai, setAi] = useState<Ai[]>([]);

  useEffect(() => {
    (async () => {
      const [s, f, a] = await Promise.all([
        supabase.from('subprocessors').select('id,provider_name,service,processing_location,transfer_countries,security_review_status').eq('is_published', true).order('provider_name'),
        supabase.from('compliance_frameworks').select('id,name,description').eq('is_published', true).order('name'),
        supabase.from('ai_automation_register').select('id,system_name,purpose,human_involvement').eq('is_published', true).order('system_name'),
      ]);
      setSubs(s.data || []);
      setFrameworks(f.data || []);
      setAi(a.data || []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />
      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
              Trust Centre
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              How we protect your data
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              Transparent, evidence-backed information about GuardianHub security, privacy and compliance.
              We only publish verified statements and never claim certifications we do not hold.
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mb-12">
            <p className="text-sm text-gray-300 leading-relaxed">
              GuardianHub does not currently hold ISO 27001, SOC 2, Cyber Essentials or SIA ACS certification.
              Any such badge would only appear after independent verification and approval. This page reflects our
              current posture honestly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              { icon: 'ri-shield-keyhole-line', title: 'Tenant isolation', body: 'Row-level security keeps each customer data separate at the database layer.' },
              { icon: 'ri-lock-2-line', title: 'Encryption', body: 'TLS in transit and encryption at rest. Private storage with signed, short-lived links.' },
              { icon: 'ri-fingerprint-line', title: 'Access controls', body: 'Role-based access with privileged-operator MFA.' },
              { icon: 'ri-database-2-line', title: 'Backups & recovery', body: 'Backups with a documented restore process. Restore drills are required.' },
              { icon: 'ri-alert-line', title: 'Incident response', body: 'Documented response plan with 72-hour breach reporting workflow.' },
              { icon: 'ri-robot-line', title: 'AI transparency', body: 'Every automation system has human review. No high-impact autonomous decisions.' },
            ].map((c) => (
              <GlassCard key={c.title} className="p-6" hover>
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={`${c.icon} text-blue-400 text-lg`}></i>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{c.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{c.body}</p>
              </GlassCard>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Subprocessors</h3>
              {subs.length === 0 ? (
                <p className="text-sm text-gray-500">Subprocessor list unavailable.</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {subs.map((s) => (
                    <div key={s.id} className="py-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-white font-medium">{s.provider_name}</p>
                        <p className="text-xs text-gray-500">{s.service} · {s.processing_location}</p>
                      </div>
                      <span className="text-xs text-gray-500">{s.transfer_countries || 'TBD'}</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">AI & automation</h3>
              {ai.length === 0 ? (
                <p className="text-sm text-gray-500">AI register unavailable.</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {ai.map((a) => (
                    <div key={a.id} className="py-3">
                      <p className="text-sm text-white font-medium">{a.system_name}</p>
                      <p className="text-xs text-gray-500">{a.human_involvement}</p>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

          <GlassCard className="p-8 mb-16">
            <h3 className="text-lg font-semibold text-white mb-4">Compliance frameworks we map to</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {frameworks.map((f) => (
                <div key={f.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-scales-3-line text-blue-400 text-sm"></i>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{f.name}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="grid md:grid-cols-3 gap-6">
            <GlassCard className="p-6">
              <h4 className="text-base font-semibold text-white mb-2">Data subject rights</h4>
              <p className="text-gray-400 text-sm mb-4">Submit an access, erasure or other privacy request.</p>
              <Link href="/privacy/request" className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm font-medium cursor-pointer">
                Make a request <i className="ri-arrow-right-line"></i>
              </Link>
            </GlassCard>
            <GlassCard className="p-6">
              <h4 className="text-base font-semibold text-white mb-2">Responsible disclosure</h4>
              <p className="text-gray-400 text-sm mb-4">Report security vulnerabilities safely.</p>
              <a href="mailto:security@guardianhub.com" className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm font-medium cursor-pointer">
                security@guardianhub.com <i className="ri-mail-line"></i>
              </a>
            </GlassCard>
            <GlassCard className="p-6">
              <h4 className="text-base font-semibold text-white mb-2">Compliance contact</h4>
              <p className="text-gray-400 text-sm mb-4">Questions about our privacy approach.</p>
              <a href="mailto:dpo@guardianhub.com" className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm font-medium cursor-pointer">
                dpo@guardianhub.com <i className="ri-mail-line"></i>
              </a>
            </GlassCard>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}