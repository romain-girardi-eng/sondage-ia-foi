import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/eng',
        destination: '/en',
      },
      {
        source: '/eng/:path*',
        destination: '/en/:path*',
      },
    ];
  },
  async headers() {
    // Static, non-conflicting security headers. X-Frame-Options and the
    // Content-Security-Policy are owned exclusively by middleware.ts (which
    // needs a per-request nonce for CSP script-src) — do not re-add them here,
    // two CSPs / X-Frame-Options values enforce as their intersection and the
    // weaker one wins. X-XSS-Protection is legacy and actively harmful in
    // modern browsers, so it is dropped rather than moved.
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },
};

export default nextConfig;
