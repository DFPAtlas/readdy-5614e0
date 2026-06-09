import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';

function LoadingFallback() {
  return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.12),_transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(99,102,241,0.08),_transparent_60%)]"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-shield-check-line text-white text-2xl"></i>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-pacifico)' }}>
            GuardianHub
          </h1>
        </div>

        <div className="bg-[#111827]/80 border border-gray-800/60 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
          <Suspense fallback={<LoadingFallback />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}