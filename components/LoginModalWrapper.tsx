'use client';

import { useState, useEffect } from 'react';
import LoginModal from '@/app/components/LoginModal';

export default function LoginModalWrapper() {
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const handler = () => setLoginOpen(true);
    window.addEventListener('openLoginModal', handler);
    return () => window.removeEventListener('openLoginModal', handler);
  }, []);

  return <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />;
}