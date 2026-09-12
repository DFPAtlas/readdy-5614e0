const TOP_LEVEL_ROUTES = [
  'pricing', 'dashboard', 'login', 'checkout', 'contact', 'about',
  'demo', 'platform', 'solutions', 'signup', 'admin', 'client', 'guard',
  'rotas', 'sites', 'guards', 'sops', 'incidents', 'reports',
  'occurrence-book', 'sop-builder', 'guard-dashboard', 'ops',
  'notifications', 'not-found', 'forgot-password', 'reset-password',
  'privacy', 'terms', 'cookies', 'gdpr', 'recovery', '403', '404',
  'loading', 'error', 'super-admin', 'setup-super-admin',
];

export function getAppBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  const pathname = window.location.pathname;
  const segments = pathname.split('/').filter(Boolean);

  let baseSegments = [...segments];
  for (let i = segments.length - 1; i >= 0; i--) {
    if (TOP_LEVEL_ROUTES.includes(segments[i])) {
      baseSegments = segments.slice(0, i);
      break;
    }
  }

  const basePath = baseSegments.length > 0 ? '/' + baseSegments.join('/') : '';
  return `${window.location.origin}${basePath}`;
}