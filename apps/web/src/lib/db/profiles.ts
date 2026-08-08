import type { Database } from "@/lib/db/database-types";
import { createServerSupabase } from "@/lib/supabase/server-client";

export type AnswerLanguage = Database["public"]["Enums"]["answer_language"];
export type ExplanationLevel = Database["public"]["Enums"]["explanation_level"];

export type StudentProfile = {
  displayName: string | null;
  course: string | null;
  studyYear: number | null;
  preferredLanguage: AnswerLanguage;
  explanationLevel: ExplanationLevel;
  avatarPath: string | null;
};

export async function findProfile(
  studentId: string,
): Promise<StudentProfile | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "display_name, course, study_year, preferred_language, explanation_level, avatar_path",
    )
    .eq("id", studentId)
    .maybeSingle();
  if (error) throw new Error("Could not load the profile");
  if (!data) return null;
  return {
    displayName: data.display_name,
    course: data.course,
    studyYear: data.study_year,
    preferredLanguage: data.preferred_language,
    explanationLevel: data.explanation_level,
    avatarPath: data.avatar_path,
  };
}

export async function updateProfile(
  studentId: string,
  changes: Partial<Omit<StudentProfile, "avatarPath">>,
) {
  const supabase = await createServerSupabase();
  const { error, count } = await supabase
    .from("profiles")
    .update(
      {
        ...(changes.displayName !== undefined && {
          display_name: changes.displayName,
        }),
        ...(changes.course !== undefined && { course: changes.course }),
        ...(changes.studyYear !== undefined && {
          study_year: changes.studyYear,
        }),
        ...(changes.preferredLanguage !== undefined && {
          preferred_language: changes.preferredLanguage,
        }),
        ...(changes.explanationLevel !== undefined && {
          explanation_level: changes.explanationLevel,
        }),
      },
      { count: "exact" },
    )
    .eq("id", studentId);
  return { isUpdated: !error && count === 1 };
}
