"use client";

import { ChevronsUpDown, Languages, LogOut, Settings } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { useEffect, useRef, useState, useTransition } from "react";
import { menuItemClass, menuPanelClass } from "@/components/ui/menu-styles";
import { ShortcutKeys } from "@/components/ui/shortcut-keys";
import { signOut } from "@/lib/auth/sign-out";
import { cn } from "@/lib/class-names";
import { profilePhotoUrl } from "@/lib/images/profile-photo-url";
import type { StudentProfile } from "@/lib/db/profiles";
import { isOpenSettingsShortcut, modifierKey } from "@/lib/keyboard/shortcuts";
import {
  SettingsDialog,
  type SettingsSection,
} from "./settings/SettingsDialog";
import { StudentAvatar } from "./StudentAvatar";

type AccountMenuProps = {
  displayName: string;
  email: string;
  profile: StudentProfile;
  isShortcutEnabled?: boolean;
};

function describeStudyLine(profile: StudentProfile) {
  if (profile.course && profile.studyYear)
    return `${profile.course}, year ${profile.studyYear}`;
  return (
    profile.course ??
    (profile.studyYear ? `Year ${profile.studyYear}` : "Student")
  );
}

export function AccountMenu({
  displayName,
  email,
  profile,
  isShortcutEnabled = true,
}: AccountMenuProps) {
  const [settingsSection, setSettingsSection] =
    useState<SettingsSection | null>(null);
  const [isSigningOut, startSigningOut] = useTransition();
  const isOpeningSettings = useRef(false);

  useEffect(() => {
    if (!isShortcutEnabled) return;
    function openSettings(event: KeyboardEvent) {
      if (!isOpenSettingsShortcut(event)) return;
      event.preventDefault();
      setSettingsSection("general");
    }
    window.addEventListener("keydown", openSettings);
    return () => window.removeEventListener("keydown", openSettings);
  }, [isShortcutEnabled]);

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          aria-label={`Account menu for ${displayName}`}
          className="flex w-full items-center gap-2.5 rounded-control p-1.5 text-left hover:bg-hover data-[state=open]:bg-hover group-data-[collapsed=true]:justify-center"
        >
          <StudentAvatar
            displayName={displayName}
            photoUrl={profilePhotoUrl(profile.avatarPath)}
          />
          <span className="min-w-0 flex-1 group-data-[collapsed=true]:hidden">
            <span className="block truncate text-sm text-text">
              {displayName}
            </span>
            <span className="block truncate text-xs text-muted">
              {describeStudyLine(profile)}
            </span>
          </span>
          <ChevronsUpDown
            aria-hidden="true"
            className="size-4 text-muted group-data-[collapsed=true]:hidden"
          />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            side="top"
            align="start"
            sideOffset={8}
            collisionPadding={8}
            onCloseAutoFocus={(event) => {
              if (isOpeningSettings.current) event.preventDefault();
              isOpeningSettings.current = false;
            }}
            className={cn(
              menuPanelClass,
              "w-[max(var(--radix-dropdown-menu-trigger-width),14rem)]",
            )}
          >
            <DropdownMenu.Label className="truncate px-2.5 pt-1 pb-1.5 text-xs text-muted">
              {email}
            </DropdownMenu.Label>
            <DropdownMenu.Item
              className={menuItemClass}
              onSelect={() => {
                isOpeningSettings.current = true;
                setSettingsSection("general");
              }}
            >
              <Settings aria-hidden="true" className="size-4 text-muted" />
              Settings
              <ShortcutKeys
                keys={[modifierKey, ","]}
                variant="plain"
                className="ml-auto hidden md:inline"
              />
            </DropdownMenu.Item>
            <DropdownMenu.Item disabled className={menuItemClass}>
              <Languages aria-hidden="true" className="size-4 text-muted" />
              Language
              <span className="ml-auto text-xs text-muted">Hindi soon</span>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1.5 h-px bg-line" />
            <DropdownMenu.Item
              disabled={isSigningOut}
              onSelect={() => startSigningOut(() => signOut())}
              className={menuItemClass}
            >
              <LogOut aria-hidden="true" className="size-4 text-muted" />
              {isSigningOut ? "Signing out…" : "Sign out"}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <SettingsDialog
        section={settingsSection}
        onSectionChange={setSettingsSection}
        displayName={displayName}
        email={email}
        profile={profile}
      />
    </>
  );
}
