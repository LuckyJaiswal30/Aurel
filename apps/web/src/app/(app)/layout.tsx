import { Menu } from "lucide-react";
import { Suspense } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { AccountMenu } from "@/features/account/components/AccountMenu";
import { MobileSidebar } from "@/features/navigation/components/MobileSidebar";
import { Sidebar } from "@/features/navigation/components/Sidebar";
import { SidebarPlaceholder } from "@/features/navigation/components/SidebarPlaceholder";
import { RecentChatList } from "@/features/chat/components/RecentChatList";
import { SubjectNavList } from "@/features/subjects/components/SubjectNavList";
import { getCurrentStudent } from "@/lib/auth/current-student";
import { listRecentConversations } from "@/lib/db/conversations";
import { listSubjects } from "@/lib/db/subjects";

export default function StudyLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell
      sidebar={
        <Suspense fallback={<SidebarPlaceholder />}>
          <StudentSidebar placement="desktop" />
        </Suspense>
      }
      mobileMenu={
        <Suspense
          fallback={
            <Menu aria-hidden="true" className="-ml-2 size-9 p-2 text-muted" />
          }
        >
          <StudentSidebar placement="mobile" />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}

async function StudentSidebar({
  placement,
}: {
  placement: "desktop" | "mobile";
}) {
  const [student, subjects, conversations] = await Promise.all([
    getCurrentStudent(),
    listSubjects(),
    listRecentConversations(),
  ]);
  const sidebar = (
    <Sidebar
      isCollapsible={placement === "desktop"}
      subjectList={<SubjectNavList subjects={subjects} />}
      recentChats={<RecentChatList conversations={conversations} />}
      accountMenu={
        <AccountMenu
          displayName={student.displayName}
          email={student.email}
          profile={student.profile}
          isShortcutEnabled={placement === "desktop"}
        />
      }
    />
  );
  return placement === "desktop" ? (
    sidebar
  ) : (
    <MobileSidebar>{sidebar}</MobileSidebar>
  );
}
