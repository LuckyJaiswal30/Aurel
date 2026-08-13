import { NextResponse, type NextRequest } from "next/server";
import { toSafeRedirectPath } from "@/lib/auth/route-access";
import { createServerSupabase } from "@/lib/supabase/server-client";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = toSafeRedirectPath(request.nextUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(nextPath, request.url));
  }
  return NextResponse.redirect(new URL("/sign-in?link=expired", request.url));
}
