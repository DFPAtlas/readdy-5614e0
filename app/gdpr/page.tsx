'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
          Legal
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 tracking-tight">
          GDPR Compliance
        </h1>
        <div className="space-y-8 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Our Commitment</h2>
            <p>GuardianHub is fully committed to compliance with the General Data Protection Regulation (GDPR) and the UK Data Protection Act 2018. We process personal data lawfully, fairly, and transparently.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Legal Basis for Processing</h2>
            <p>We process personal data based on: (a) performance of a contract, (b) compliance with legal obligations, (c) legitimate interests, and (d) consent where required. The specific basis depends on the nature of the data and processing activity.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data Processing Agreement</h2>
            <p>For enterprise clients, we provide a Data Processing Agreement (DPA) that covers roles and responsibilities, subprocessor management, security measures, breach notification, and data subject request handling procedures.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">International Transfers</h2>
            <p>GuardianHub stores and processes data within the UK and European Economic Area (EEA). Where international transfers are necessary, we rely on Standard Contractual Clauses (SCCs) and adequacy decisions to ensure compliant data flows.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Your Rights</h2>
            <p>You have the right to: access your data, request correction, request erasure ("right to be forgotten"), restrict processing, object to processing, data portability, and not be subject to automated decision-making. Submit requests to dpo@guardianhub.com.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Breach Notification</h2>
            <p>In the unlikely event of a personal data breach, we will notify affected users and relevant supervisory authorities within 72 hours as required by GDPR Article 33.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}