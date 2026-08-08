import { cache } from "react";
import { countDaysUntil, todayInIndia } from "@/lib/dates/days-until";
import { createAdminSupabase } from "@/lib/supabase/admin-client";
import { createServerSupabase } from "@/lib/supabase/server-client";

export type SubjectSummary = {
  id: string;
  name: string;
  notesCount: number;
  examDate: string | null;
  daysUntilExam: number | null;
};

type SubjectRow = {
  id: string;
  name: string;
  exam_date: string | null;
  documents: { count: number }[];
};

const subjectColumns = "id, name, exam_date, documents(count)";

function toSubjectSummary(row: SubjectRow, today: string): SubjectSummary {
  return {
    id: row.id,
    name: row.name,
    notesCount: row.documents[0]?.count ?? 0,
    examDate: row.exam_date,
    daysUntilExam: row.exam_date ? countDaysUntil(row.exam_date, today) : null,
  };
}

export const listSubjects = cache(async () => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("subjects")
    .select(subjectColumns)
    .order("created_at", { ascending: true })
    .returns<SubjectRow[]>();
  if (error) throw new Error("Could not load subjects");
  const today = todayInIndia();
  return data.map((row) => toSubjectSummary(row, today));
});

export async function findSubject(subjectId: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("subjects")
    .select(subjectColumns)
    .eq("id", subjectId)
    .returns<SubjectRow[]>()
    .maybeSingle();
  if (error) throw new Error("Could not load the subject");
  return data ? toSubjectSummary(data, todayInIndia()) : null;
}

export async function insertSubject(name: string, examDate: string | null) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("subjects")
    .insert({ name, exam_date: examDate })
    .select("id")
    .single();
  return {
    subjectId: data?.id ?? null,
    errorCode: error?.code ?? null,
    errorMessage: error?.message ?? null,
  };
}

export async function updateSubject(
  subjectId: string,
  changes: { name?: string; examDate?: string | null },
) {
  const supabase = await createServerSupabase();
  const { error, count } = await supabase
    .from("subjects")
    .update(
      {
        ...(changes.name !== undefined && { name: changes.name }),
        ...(changes.examDate !== undefined && { exam_date: changes.examDate }),
      },
      { count: "exact" },
    )
    .eq("id", subjectId);
  return { errorCode: error?.code ?? null, isUpdated: !error && count === 1 };
}

export async function removeSubject(studentId: string, subjectId: string) {
  const { error, count } = await createAdminSupabase()
    .from("subjects")
    .delete({ count: "exact" })
    .eq("id", subjectId)
    .eq("user_id", studentId);
  return { isRemoved: !error && count === 1 };
}
