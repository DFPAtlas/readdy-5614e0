'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
          Legal
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 tracking-tight">
          Privacy Notice
        </h1>

        <div className="mb-8 bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 flex items-center justify-center text-amber-400 mt-0.5 flex-shrink-0">
              <i className="ri-scales-3-line"></i>
            </div>
            <div>
              <h3 className="font-semibold text-amber-300 mb-1">Draft for Legal Review</h3>
              <p className="text-amber-300/70 text-sm leading-relaxed">
                This document is a draft prepared for review by qualified legal counsel. It has not been legally approved and does not constitute legal advice. Data processing purposes, lawful bases, retention periods, international transfer details, and company identity must be verified and completed by your solicitor before publication. Do not publish or rely on this draft as a compliant privacy notice.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>Draft version: 1.0</span>
            <span className="text-white/20">|</span>
            <span>Prepared: August 2026</span>
            <span className="text-white/20">|</span>
            <span className="text-amber-400">Awaiting legal review</span>
          </div>
        </div>
        <div className="space-y-8 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p>GuardianHub ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <p>We collect information you provide directly to us, including account registration details, contact information, and usage data. We also collect data generated through your use of the platform, such as patrol logs, incident reports, and system analytics.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <p>We use your information to provide and improve our services, communicate with you, ensure security and compliance, and comply with legal obligations. We process personal data in accordance with UK GDPR and Data Protection Act 2018.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Security</h2>
            <p>We implement industry-standard security measures including encryption at rest and in transit, access controls, regular security assessments, and disaster recovery procedures. Our infrastructure is hosted on Supabase, which provides database encryption by default. All client data is logically separated through row-level security at the database layer. For further details on our security practices, please refer to our Security page.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Retention</h2>
            <p>We retain your data for as long as your account is active or as needed to provide services. Upon account closure, we retain anonymised data for analytics and delete personal data within 90 days unless legal obligations require longer retention.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
            <p>Under UK GDPR, you have the right to access, rectify, erase, restrict processing, object to processing, and request data portability. To exercise these rights, contact us at privacy@guardianhub.com.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Contact</h2>
            <p>For privacy-related questions, contact our Data Protection Officer at privacy@guardianhub.com or write to: 12th Floor, The Shard, London Bridge Street, London SE1 9SG.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. International Data Transfers</h2>
            <p>Our hosting infrastructure is provided by Supabase, whose servers are located within the European Economic Area or countries recognised as providing adequate data protection. Where transfers to third countries occur, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses. This section must be verified against actual hosting arrangements before publication.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Subprocessors</h2>
            <p>We engage certain third-party service providers to deliver our platform. A current list of subprocessors is maintained and available upon request. We enter into data processing agreements with all subprocessors. This section should be replaced with a link to the live subprocessor list once established.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Cookies and Tracking</h2>
            <p>Our platform uses essential cookies required for authentication and session management. Optional analytics and marketing cookies are only deployed with your explicit consent, which can be managed through our cookie preferences panel. For full details, see our Cookie Notice.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Changes to This Notice</h2>
            <p>We may update this Privacy Notice from time to time. Material changes will be communicated via email or through the platform with at least 30 days notice. Continued use after changes take effect constitutes acceptance of the updated notice.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Contact and Complaints</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-2 mb-4">
              <p className="text-gray-300"><strong className="text-white">Data Protection Officer:</strong> dpo@guardianhub.com</p>
              <p className="text-gray-300"><strong className="text-white">Registered Address:</strong> [Company Registered Address — to be completed]</p>
              <p className="text-gray-300"><strong className="text-white">Supervisory Authority:</strong> Information Commissioner&rsquo;s Office (ICO), Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF</p>
            </div>
            <p>You have the right to lodge a complaint with the ICO or your local supervisory authority if you believe our processing of your personal data infringes applicable data protection law.</p>
          </section>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6 mt-10">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 flex items-center justify-center text-amber-400 mt-0.5 flex-shrink-0">
                <i className="ri-scales-3-line"></i>
              </div>
              <div>
                <h3 className="font-semibold text-amber-300 mb-2">Legal Review Required</h3>
                <p className="text-amber-200/70 text-sm leading-relaxed">
                  This Privacy Notice is an unapproved draft. Before publishing, qualified legal counsel must review and confirm: all data processing purposes and lawful bases, retention periods for each category of personal data, international transfer mechanisms and adequacy determinations, subprocessor disclosures, cookie classifications, and all company identity and registered address details. References to &ldquo;SOC 2&rdquo; or similar certifications have been intentionally omitted as they must only appear if verifiably held.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}