const publicPages = ["/sign-in", "/sign-up", "/check-email"];
const publicPrefixes = ["/auth/"];
const signedOutOnlyPages = ["/sign-in", "/sign-up"];
const internalOrigin = "http://aurel.internal";

export function isPublicPath(pathname: string) {
  return (
    publicPages.includes(pathname) ||
    publicPrefixes.some((prefix) => pathname.startsWith(prefix))
  );
}

export function isSignedOutOnlyPath(pathname: string) {
  return signedOutOnlyPages.includes(pathname);
}

export function toSafeRedirectPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/")) return "/";
  const resolved = new URL(value, internalOrigin);
  if (resolved.origin !== internalOrigin) return "/";
  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}
