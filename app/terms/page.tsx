'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
          Legal
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 tracking-tight">
          Terms of Service
        </h1>

        <div className="mb-8 bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 flex items-center justify-center text-amber-400 mt-0.5 flex-shrink-0">
              <i className="ri-scales-3-line"></i>
            </div>
            <div>
              <h3 className="font-semibold text-amber-300 mb-1">Draft for Legal Review</h3>
              <p className="text-amber-300/70 text-sm leading-relaxed">
                This document is a draft prepared for review by qualified legal counsel. It has not been legally approved and does not constitute legal advice. Company identity, governing law, jurisdiction, and other details must be verified and completed by your solicitor before publication. Do not publish or rely on this draft as a binding agreement.
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

        <div className="space-y-10 text-gray-400 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p className="mb-3">By accessing and using GuardianHub (&ldquo;the Service&rdquo;), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
            <p>These Terms apply to all users of the Service, including browsers, customers, merchants, and contributors of content.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Service Description</h2>
            <p className="mb-3">GuardianHub provides an AI-powered security operations management platform including:</p>
            <ul className="list-disc list-inside space-y-2 ml-1">
              <li>Real-time patrol monitoring and checkpoint scanning</li>
              <li>Incident reporting, investigation and evidence management</li>
              <li>AI-assisted staff scheduling and rota management</li>
              <li>ACS compliance assessment and evidence gathering</li>
              <li>Lone worker protection with automated check-ins</li>
              <li>Guard welfare and wellbeing monitoring</li>
              <li>Visitor management and occurrence booking</li>
              <li>Client reporting and SLA tracking</li>
            </ul>
            <p className="mt-3">We reserve the right to modify, enhance, or discontinue features at any time. Material changes to the Service will be communicated with reasonable notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. User Accounts</h2>
            <p className="mb-3">To access certain features, you must create an account. You agree to:</p>
            <ul className="list-disc list-inside space-y-2 ml-1">
              <li>Provide accurate, current, and complete registration information</li>
              <li>Maintain the security and confidentiality of your account credentials</li>
              <li>Accept responsibility for all activities occurring under your account</li>
              <li>Notify us immediately of any unauthorised account use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree not to use the Service:</p>
            <ul className="list-disc list-inside space-y-2 ml-1">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any applicable laws, regulations, or ordinances</li>
              <li>To infringe upon intellectual property rights of GuardianHub or others</li>
              <li>To harass, abuse, harm, defame, or discriminate against others</li>
              <li>To submit false or misleading information</li>
              <li>To transmit viruses, malware, or malicious code</li>
              <li>To attempt unauthorised access to any part of the Service</li>
              <li>To interfere with or disrupt the Service or its infrastructure</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Intellectual Property</h2>
            <p className="mb-3">GuardianHub and its licensors own all rights, title, and interest in the Service, including all related intellectual property rights. These Terms do not grant you any right, title, or interest in the Service beyond the limited license to use it as permitted herein.</p>
            <p>You retain ownership of the data you upload to the Service. By uploading data, you grant GuardianHub a limited license to use that data solely for the purpose of providing the Service to you.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Subscription and Payment</h2>
            <p className="mb-3">For paid subscription plans, you agree to pay all fees as described at the time of purchase. Key payment terms:</p>
            <ul className="list-disc list-inside space-y-2 ml-1">
              <li>Subscription fees are billed in advance on a monthly or annual basis</li>
              <li>Payments are processed securely through Stripe</li>
              <li>All fees are stated in GBP and are non-refundable unless otherwise specified</li>
              <li>We may change pricing with at least 30 days&rsquo; advance notice</li>
              <li>Failure to maintain valid payment may result in service suspension</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Privacy and Data Protection</h2>
            <p className="mb-3">Your privacy is fundamental to our operations. Our collection and use of personal data is governed by our Privacy Notice. By using the Service, you consent to data processing as described in those documents.</p>
            <p>We implement appropriate technical and organisational measures to protect your data against unauthorised access, alteration, disclosure, or destruction.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Third-Party Services</h2>
            <p>The Service may integrate with or link to third-party services. GuardianHub is not responsible for the content, privacy practices, or functionality of third-party services. Use of third-party integrations is at your own discretion and subject to their respective terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Limitation of Liability</h2>
            <p className="mb-3">To the maximum extent permitted by applicable law, GuardianHub and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service, including loss of profits, data, or business interruption.</p>
            <p>Our total liability for any claim arising from these Terms shall not exceed the amount paid by you to GuardianHub in the twelve months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Indemnification</h2>
            <p>You agree to indemnify and hold harmless GuardianHub and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or your violation of these Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Termination</h2>
            <p className="mb-3">We may suspend or terminate your access to the Service at any time, with or without cause, with reasonable notice where practical. Upon termination, your right to use the Service ceases immediately.</p>
            <p>Provisions relating to intellectual property, limitation of liability, and indemnification shall survive termination.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. Material changes will be communicated via email or through the Service with at least 30 days&rsquo; notice. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Governing Law</h2>
            <p>These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">14. Contact Information</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-2">
              <p className="text-gray-300"><strong className="text-white">Email:</strong> legal@guardianhub.com</p>
              <p className="text-gray-300"><strong className="text-white">Phone:</strong> +44 20 7123 4567</p>
              <p className="text-gray-300"><strong className="text-white">Address:</strong> 12th Floor, The Shard, 32 London Bridge Street, London SE1 9SG</p>
            </div>
          </section>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 flex items-center justify-center text-amber-400 mt-0.5 flex-shrink-0">
                <i className="ri-scales-3-line"></i>
              </div>
              <div>
                <h3 className="font-semibold text-amber-300 mb-2">Legal Review Required</h3>
                <p className="text-amber-200/70 text-sm leading-relaxed">
                  This Terms of Service document is an unapproved draft. Before publishing, please have qualified legal counsel review and confirm: governing law and jurisdiction clauses, limitation of liability provisions, data processing references, subscription and payment terms, and all company identity and contact details. [Company Legal Name] and registered address must be inserted where placeholder references appear.
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