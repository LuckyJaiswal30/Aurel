import type { Metadata } from "next";
import { Suspense } from "react";
import { PagePlaceholder } from "@/components/ui/page-placeholder";
import { SubjectGrid } from "@/features/subjects/components/SubjectGrid";
import { listSubjects } from "@/lib/db/subjects";

export const metadata: Metadata = { title: "Subjects" };

export default function SubjectsPage() {
  return (
    <Suspense fallback={<PagePlaceholder />}>
      <SubjectsContent />
    </Suspense>
  );
}

async function SubjectsContent() {
  return <SubjectGrid subjects={await listSubjects()} />;
}
