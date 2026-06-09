'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
          Legal
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 tracking-tight">
          Cookie Policy
        </h1>
        <div className="space-y-8 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">What Are Cookies</h2>
            <p>Cookies are small text files placed on your device when you visit our website. They help us provide and improve our services by remembering your preferences, analysing how our site is used, and enabling core functionality.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">How We Use Cookies</h2>
            <p>We use strictly necessary cookies for authentication and security. We use analytics cookies to understand how visitors interact with our website. We do not use cookies for third-party advertising or tracking.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Types of Cookies</h2>
            <ul className="space-y-3">
              <li><strong className="text-white">Essential:</strong> Required for the platform to function. Cannot be disabled.</li>
              <li><strong className="text-white">Functional:</strong> Remember your preferences and settings.</li>
              <li><strong className="text-white">Analytics:</strong> Help us improve the platform by understanding usage patterns.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Managing Cookies</h2>
            <p>You can manage cookie preferences through your browser settings. Disabling certain cookies may affect the functionality of the platform. For the best experience, we recommend allowing functional and analytics cookies.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Changes to This Policy</h2>
            <p>We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated effective date.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}