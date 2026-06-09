'use client';

import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 pt-32">
        <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
          <i className="ri-error-warning-line text-blue-400 text-3xl"></i>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8 max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <i className="ri-arrow-left-line"></i>
          Back to home
        </Link>
      </div>
      <Footer />
    </div>
  );
}