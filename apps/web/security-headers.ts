const isDevelopment = process.env.NODE_ENV === "development";

const turnstileOrigin = "https://challenges.cloudflare.com";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${turnstileOrigin}${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  `connect-src 'self'${isDevelopment ? " ws:" : ""}`,
  `frame-src ${turnstileOrigin}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
].join("; ");

export const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(self), microphone=(self), geolocation=(), payment=(), usb=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];
