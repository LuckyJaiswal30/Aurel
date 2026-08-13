import { NextResponse, type NextRequest } from "next/server";
import { isPublicPath, isSignedOutOnlyPath } from "@/lib/auth/route-access";
import { refreshSession } from "@/lib/supabase/refresh-session";

export async function proxy(request: NextRequest) {
  const { response, isSignedIn } = await refreshSession(request);
  const { pathname } = request.nextUrl;

  if (!isSignedIn && !isPublicPath(pathname)) {
    return redirectWithCookies(request, response, "/sign-in");
  }
  if (isSignedIn && isSignedOutOnlyPath(pathname)) {
    return redirectWithCookies(request, response, "/");
  }
  return response;
}

function redirectWithCookies(
  request: NextRequest,
  sessionResponse: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  sessionResponse.cookies
    .getAll()
    .forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: [
    "/((?!api/notes$|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
