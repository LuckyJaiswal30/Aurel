"use client";

import {
  CircleUserRound,
  GraduationCap,
  Keyboard,
  Settings2,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { Dialog } from "radix-ui";
import type { StudentProfile } from "@/lib/db/profiles";
import { cn } from "@/lib/class-names";
import { profilePhotoUrl } from "@/lib/images/profile-photo-url";
import { AccountSettings } from "./AccountSettings";
import { GeneralSettings } from "./GeneralSettings";
import { PrivacySettings } from "./PrivacySettings";
import { ShortcutsSettings } from "./ShortcutsSettings";
import { StudySettings } from "./StudySettings";

export type SettingsSection =
  "general" | "account" | "study" | "privacy" | "shortcuts";

const generalSection = {
  id: "general" as const,
  label: "General",
  icon: Settings2,
};

const sections: { id: SettingsSection; label: string; icon: LucideIcon }[] = [
  generalSection,
  { id: "account", label: "Account", icon: CircleUserRound },
  { id: "study", label: "Study profile", icon: GraduationCap },
  { id: "privacy", label: "Privacy", icon: ShieldCheck },
  { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
];

type SettingsDialogProps = {
  section: SettingsSection | null;
  onSectionChange: (section: SettingsSection | null) => void;
  displayName: string;
  email: string;
  profile: StudentProfile;
};

export function SettingsDialog({
  section,
  onSectionChange,
  displayName,
  email,
  profile,
}: SettingsDialogProps) {
  const activeSection =
    sections.find((candidate) => candidate.id === section) ?? generalSection;

  return (
    <Dialog.Root
      open={section !== null}
      onOpenChange={(isOpen) => onSectionChange(isOpen ? "general" : null)}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/35" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-surface outline-none md:inset-auto md:top-1/2 md:left-1/2 md:h-[min(42rem,88dvh)] md:w-[min(56rem,92vw)] md:-translate-x-1/2 md:-translate-y-1/2 md:flex-row md:rounded-panel md:border md:border-line md:shadow-[0_24px_64px_-24px_rgb(0_0_0/0.4)]">
          <Dialog.Title className="sr-only">Settings</Dialog.Title>
          <Dialog.Description className="sr-only">
            Change how Aurel looks and how the tutor knows you.
          </Dialog.Description>
          <nav
            aria-label="Settings sections"
            className="shrink-0 border-b border-line bg-sidebar p-3 md:w-56 md:border-r md:border-b-0 md:px-3 md:pt-6"
          >
            <p
              aria-hidden="true"
              className="hidden h-8 items-center px-2.5 font-serif text-2xl text-text md:flex"
            >
              Settings
            </p>
            <ul className="flex gap-1 overflow-x-auto md:mt-6 md:flex-col md:overflow-visible">
              {sections.map(({ id, label, icon: Icon }) => (
                <li key={id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onSectionChange(id)}
                    aria-current={activeSection.id === id ? "page" : undefined}
                    className={cn(
                      "flex h-9 w-full items-center gap-2.5 rounded-control px-2.5 text-sm whitespace-nowrap text-text hover:bg-hover",
                      activeSection.id === id && "bg-hover font-medium",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4 text-muted" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-8">
            <div className="flex h-8 items-center justify-between gap-4">
              <h2 className="text-lg font-medium text-text">
                {activeSection.label}
              </h2>
              <Dialog.Close
                className="-mr-1.5 flex size-8 items-center justify-center rounded-control text-muted hover:bg-hover hover:text-text"
                aria-label="Close settings"
              >
                <X aria-hidden="true" className="size-5" />
              </Dialog.Close>
            </div>
            <div className="mt-6">
              {activeSection.id === "general" ? <GeneralSettings /> : null}
              {activeSection.id === "account" ? (
                <AccountSettings
                  displayName={displayName}
                  email={email}
                  photoUrl={profilePhotoUrl(profile.avatarPath)}
                />
              ) : null}
              {activeSection.id === "study" ? (
                <StudySettings profile={profile} />
              ) : null}
              {activeSection.id === "privacy" ? <PrivacySettings /> : null}
              {activeSection.id === "shortcuts" ? <ShortcutsSettings /> : null}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
