import { redirect } from "next/navigation";
import { cache } from "react";
import { findProfile, type StudentProfile } from "@/lib/db/profiles";
import { createServerSupabase } from "@/lib/supabase/server-client";

export type CurrentStudent = {
  id: string;
  email: string;
  displayName: string;
  profile: StudentProfile;
};

export const findStudentId = cache(async (): Promise<string | null> => {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.sub ?? null;
});

export const requireStudentId = cache(async (): Promise<string> => {
  const studentId = await findStudentId();
  if (!studentId) redirect("/sign-in");
  return studentId;
});

export const findCurrentStudent = cache(
  async (): Promise<CurrentStudent | null> => {
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    if (!claims?.sub) return null;

    const email = typeof claims.email === "string" ? claims.email : "";
    const profile = (await findProfile(claims.sub)) ?? {
      displayName: null,
      course: null,
      studyYear: null,
      preferredLanguage: "english",
      explanationLevel: "standard",
      avatarPath: null,
    };
    return {
      id: claims.sub,
      email,
      displayName: profile.displayName ?? (email.split("@")[0] || "Student"),
      profile,
    };
  },
);

export const getCurrentStudent = cache(async (): Promise<CurrentStudent> => {
  const student = await findCurrentStudent();
  if (!student) redirect("/sign-in");
  return student;
});
