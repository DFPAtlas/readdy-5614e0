'use client';

import { useState, useEffect, lazy, Suspense } from 'react';

const LoginModal = lazy(() => import('@/app/components/LoginModal'));

function LoginModalFallback() {
  return null;
}

export default function LoginModalWrapper() {
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const handler = () => setLoginOpen(true);
    window.addEventListener('openLoginModal', handler);
    return () => window.removeEventListener('openLoginModal', handler);
  }, []);

  return (
    <Suspense fallback={<LoginModalFallback />}>
      {loginOpen && <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />}
    </Suspense>
  );
}