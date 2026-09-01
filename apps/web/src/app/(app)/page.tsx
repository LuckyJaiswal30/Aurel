import { Suspense } from "react";
import { PagePlaceholder } from "@/components/ui/page-placeholder";
import { StudyHome } from "@/features/chat/components/StudyHome";
import { getCurrentStudent } from "@/lib/auth/current-student";
import { listSubjects } from "@/lib/db/subjects";

export default function HomePage() {
  return (
    <Suspense fallback={<PagePlaceholder />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const [student, subjects] = await Promise.all([
    getCurrentStudent(),
    listSubjects(),
  ]);
  return (
    <StudyHome
      displayName={student.displayName.split(" ")[0] ?? student.displayName}
      subjects={subjects}
    />
  );
}
