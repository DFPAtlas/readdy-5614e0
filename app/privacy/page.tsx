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
          Privacy Policy
        </h1>
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
            <p>We implement industry-standard security measures including encryption at rest and in transit, access controls, regular security audits, and disaster recovery procedures. All data is stored in SOC 2 Type II certified facilities.</p>
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
        </div>
      </div>
      <Footer />
    </div>
  );
}