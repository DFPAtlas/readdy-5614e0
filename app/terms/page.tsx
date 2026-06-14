import Link from 'next/link';
import Footer from '../components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="ri-shield-check-line text-white text-lg"></i>
              </div>
              <span className="text-xl font-bold text-gray-900" style={{ fontFamily: "Pacifico, serif" }}>
                GuardWatch
              </span>
            </Link>
            <nav className="flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-blue-600 whitespace-nowrap cursor-pointer">
                Home
              </Link>
              <Link href="/login/control-room" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap cursor-pointer">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Please read these terms carefully before using our security management platform
          </p>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>Last updated: December 15, 2024</span>
              <span>•</span>
              <span>Effective: December 15, 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            
            {/* 1. Acceptance of Terms */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing and using GuardWatch ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p className="text-gray-600">
                These Terms of Service apply to all users of the service, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
              </p>
            </div>

            {/* 2. Use License */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-600 mb-4">
                Permission is granted to temporarily download one copy of GuardWatch per device for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
              <p className="text-gray-600">
                This license shall automatically terminate if you violate any of these restrictions and may be terminated by GuardWatch at any time.
              </p>
            </div>

            {/* 3. Service Description */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Service Description</h2>
              <p className="text-gray-600 mb-4">
                GuardWatch provides a comprehensive security management platform that includes:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Real-time security monitoring and reporting</li>
                <li>Staff management and scheduling tools</li>
                <li>Incident reporting and tracking</li>
                <li>Visitor management systems</li>
                <li>AI-powered security insights</li>
                <li>Mobile applications for security personnel</li>
              </ul>
              <p className="text-gray-600">
                We reserve the right to modify, suspend, or discontinue the service at any time without notice.
              </p>
            </div>

            {/* 4. User Accounts */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Accounts</h2>
              <p className="text-gray-600 mb-4">
                To access certain features of the service, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your password and account</li>
                <li>Promptly update account information to keep it accurate</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
              <p className="text-gray-600">
                You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
            </div>

            {/* 5. Acceptable Use */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Acceptable Use</h2>
              <p className="text-gray-600 mb-4">
                You agree not to use the service:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
                <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                <li>For any obscene or immoral purpose</li>
              </ul>
            </div>

            {/* 6. Privacy Policy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Privacy Policy</h2>
              <p className="text-gray-600 mb-4">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our service. By using our service, you agree to the collection and use of information in accordance with our Privacy Policy.
              </p>
              <p className="text-gray-600">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </div>

            {/* 7. Data Security */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Security</h2>
              <p className="text-gray-600 mb-4">
                We take data security seriously and implement industry-standard security measures including:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>End-to-end encryption for all data transmission</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Secure data centers with 24/7 monitoring</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular data backups and disaster recovery procedures</li>
              </ul>
              <p className="text-gray-600">
                However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>

            {/* 8. Payment Terms */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Payment Terms</h2>
              <p className="text-gray-600 mb-4">
                For paid services, you agree to pay all fees and charges associated with your account. Payment terms include:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>All fees are non-refundable unless otherwise stated</li>
                <li>Subscription fees are billed in advance</li>
                <li>We reserve the right to change pricing with 30 days notice</li>
                <li>Failure to pay may result in service suspension</li>
                <li>You are responsible for all taxes and fees</li>
              </ul>
            </div>

            {/* 9. Limitations of Liability */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitations of Liability</h2>
              <p className="text-gray-600 mb-4">
                In no event shall GuardWatch or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on GuardWatch's website, even if GuardWatch or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
              <p className="text-gray-600">
                Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
              </p>
            </div>

            {/* 10. Governing Law */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
              <p className="text-gray-600 mb-4">
                These terms and conditions are governed by and construed in accordance with the laws of the United Kingdom, and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
              </p>
            </div>

            {/* 11. Changes to Terms */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-600 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
              <p className="text-gray-600">
                What constitutes a material change will be determined at our sole discretion. By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </div>

            {/* 12. Contact Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="space-y-2">
                  <p className="text-gray-700"><strong>Email:</strong> legal@guardwatch.com</p>
                  <p className="text-gray-700"><strong>Phone:</strong> +44 20 1234 5678</p>
                  <p className="text-gray-700"><strong>Address:</strong> 123 Security Street, London, UK SW1A 1AA</p>
                </div>
              </div>
            </div>

            {/* Agreement Notice */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-information-line text-blue-600"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Agreement Notice</h3>
                  <p className="text-blue-700">
                    By using GuardWatch, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}