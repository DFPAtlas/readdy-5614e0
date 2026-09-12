# Security Headers — GuardianHub Phase 14

GuardianHub is a static export (`output: "export"`). Next.js static hosting does not emit server response headers, so production security headers must be applied at the CDN / hosting edge (Vercel, Cloudflare, CloudFront, etc.). The values below are the recommended baseline.

## Recommended header values

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self), payment=(self)` |
| `X-Frame-Options` | `DENY` (redundant with CSP frame-ancestors, kept for legacy) |
| `Cache-Control` (authenticated routes) | `no-store, max-age=0` |
| `Content-Security-Policy` | see below |

## Content-Security-Policy (recommended baseline)

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https: blob:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.googleapis.com;
frame-src https://js.stripe.com https://www.google.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
```

Notes:
- `'unsafe-inline'` and `'unsafe-eval'` are required by the current Next.js/React and Supabase realtime client; tighten only after testing that auth, realtime and checkout still function.
- `frame-ancestors 'none'` provides clickjacking protection.
- Replace `https://*.googleapis.com` with your exact geocoding/maps origins before enabling.

## Verification

After applying at the edge, verify with:
```bash
curl -sI https://<production-domain>/ | grep -iE 'strict-transport|content-security|x-content-type|referrer-policy|permissions-policy|x-frame'
```
And check the CSP does not break the app: sign in, open the command centre, start checkout, and confirm browser console shows no CSP violations.

## Related protections (implemented in code)

- Safe redirect validation and open-redirect protection: see `lib/redirect.ts`.
- No secrets in URLs; authenticated routes are excluded from `robots.txt` and `sitemap.ts`.
- Error/health responses return safe states only and never provider errors or connection strings.
- User-generated content rendering is sanitised (managed content paths avoid arbitrary HTML/scripts).

## Outstanding (requires hosting config)

- HTTPS-only enforcement (redirect HTTP → HTTPS) at the edge.
- Source maps disabled for production or protected behind auth.
- `Cache-Control: no-store` for authenticated routes (served client-side; verify no sensitive pages are cached by the CDN).