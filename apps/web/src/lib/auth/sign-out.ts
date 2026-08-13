"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server-client";

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

export async function signOutEverywhere() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut({ scope: "global" });
  redirect("/sign-in");
}
