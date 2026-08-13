"use client";

import { useActionState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { controlClass } from "@/components/ui/control-styles";
import { signOutEverywhere } from "@/lib/auth/sign-out";
import { idleFormState } from "@/lib/forms/form-state";
import { saveDisplayName } from "../../profile-actions";
import { ProfilePhotoEditor } from "./ProfilePhotoEditor";
import { SettingsGroup, SettingsRow } from "./SettingsRow";

type AccountSettingsProps = {
  displayName: string;
  email: string;
  photoUrl: string | null;
};

export function AccountSettings({
  displayName,
  email,
  photoUrl,
}: AccountSettingsProps) {
  const [state, formAction, isSaving] = useActionState(
    saveDisplayName,
    idleFormState,
  );
  const [isSigningOut, startSigningOut] = useTransition();
  const nameError = state.fieldErrors?.displayName?.[0];
  const nameNote =
    state.status === "success" ? state.message : "What the tutor calls you.";

  return (
    <>
      <SettingsGroup title="Profile">
        <ProfilePhotoEditor displayName={displayName} photoUrl={photoUrl} />
        <form action={formAction} noValidate>
          <SettingsRow
            label="Name"
            labelFor="settings-display-name"
            description={nameNote}
            error={
              nameError ??
              (state.status === "error" ? state.message : undefined)
            }
          >
            <div className="flex items-center gap-2">
              <input
                id="settings-display-name"
                name="displayName"
                defaultValue={state.values?.displayName ?? displayName}
                maxLength={80}
                aria-invalid={nameError ? true : undefined}
                className={`${controlClass} sm:w-52`}
              />
              <Button type="submit" variant="secondary" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </div>
          </SettingsRow>
        </form>
        <SettingsRow
          label="Email"
          description="Used to sign in. It can't be changed yet."
        >
          <span className="text-sm text-text">{email}</span>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Account">
        <SettingsRow
          label="Sign out of all devices"
          description="Ends every session, including this one."
        >
          <Button
            variant="secondary"
            disabled={isSigningOut}
            onClick={() => startSigningOut(() => signOutEverywhere())}
          >
            {isSigningOut ? "Signing out…" : "Sign out everywhere"}
          </Button>
        </SettingsRow>
        <SettingsRow
          label="Delete account"
          description="Removes your account, subjects, notes and chats for good. Arrives with study memory."
        >
          <Button variant="danger" disabled>
            Delete account
          </Button>
        </SettingsRow>
      </SettingsGroup>
    </>
  );
}
