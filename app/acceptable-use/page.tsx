'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">Legal</span>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Acceptable Use Policy</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: August 2026</p>

        <div className="mb-8 bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 flex items-center justify-center text-amber-400 mt-0.5 flex-shrink-0"><i className="ri-information-line"></i></div>
            <p className="text-amber-300/70 text-xs leading-relaxed">This is a draft for professional review. It has not been legally approved. Consult qualified legal counsel before publishing.</p>
          </div>
        </div>

        <div className="space-y-8 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Purpose</h2>
            <p>This Acceptable Use Policy sets out the rules for using GuardianHub and its related services. By using GuardianHub, you agree to follow these rules. We may update this policy from time to time.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Lawful Use</h2>
            <p className="mb-3">You must not use GuardianHub:</p>
            <ul className="list-disc list-inside space-y-2 ml-1">
              <li>For any unlawful purpose or to facilitate unlawful activity</li>
              <li>To violate any applicable laws, regulations, or industry codes</li>
              <li>To infringe the intellectual property rights of GuardianHub or any third party</li>
              <li>To harass, abuse, threaten, defame, or discriminate against any person</li>
              <li>To transmit or store material that is obscene, offensive, or otherwise objectionable</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Security</h2>
            <p className="mb-3">You must not:</p>
            <ul className="list-disc list-inside space-y-2 ml-1">
              <li>Attempt to gain unauthorised access to GuardianHub systems, data, or accounts</li>
              <li>Probe, scan, or test the vulnerability of GuardianHub without prior written authorisation</li>
              <li>Interfere with or disrupt GuardianHub services, servers, or networks</li>
              <li>Introduce malware, viruses, or any malicious code</li>
              <li>Attempt to bypass or disable any security, authentication, or access control measures</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data and Privacy</h2>
            <p className="mb-3">You must:</p>
            <ul className="list-disc list-inside space-y-2 ml-1">
              <li>Only collect, store, and process personal data in compliance with applicable data protection laws</li>
              <li>Obtain necessary consents before uploading personal data to GuardianHub</li>
              <li>Not use GuardianHub to store or process sensitive personal data beyond what is necessary for security operations</li>
              <li>Not attempt to access, view, or extract data belonging to other GuardianHub customers</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Account Responsibility</h2>
            <p>You are responsible for all activity occurring under your account. You must maintain the confidentiality of your credentials, use strong passwords, enable multi-factor authentication where available, and promptly notify us of any unauthorised account use.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Fair Use</h2>
            <p>You must not use GuardianHub in a way that unreasonably degrades service for other users, including excessive API calls, automated scraping, or resource-intensive operations that exceed normal usage patterns for your subscription tier.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Reporting Violations</h2>
            <p>If you become aware of any violation of this policy, please report it immediately to compliance@guardianhub.com. We will investigate all reports and take appropriate action.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Consequences</h2>
            <p>Violation of this policy may result in account suspension, termination, or legal action. We reserve the right to investigate violations and cooperate with law enforcement where appropriate.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}