import { Suspense } from "react";
import { PagePlaceholder } from "@/components/ui/page-placeholder";
import { NotesPage } from "@/features/notes/components/NotesPage";
import { loadSubjectWithNotes } from "@/features/subjects/load-subject";

export default function SubjectNotesPage({
  params,
}: PageProps<"/subjects/[subjectId]/notes">) {
  return (
    <Suspense fallback={<PagePlaceholder />}>
      <SubjectNotesContent params={params} />
    </Suspense>
  );
}

async function SubjectNotesContent({
  params,
}: Pick<PageProps<"/subjects/[subjectId]/notes">, "params">) {
  const { subject, notes } = await loadSubjectWithNotes(params);
  return <NotesPage subject={subject} notes={notes} />;
}
