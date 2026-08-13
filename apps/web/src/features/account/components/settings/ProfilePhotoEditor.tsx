"use client";

import { Pencil } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { makeProfilePhoto } from "@/lib/images/make-profile-photo";
import {
  removeProfilePhoto,
  uploadProfilePhoto,
} from "../../profile-photo-actions";
import { StudentAvatar } from "../StudentAvatar";
import { SettingsRow } from "./SettingsRow";

type ProfilePhotoEditorProps = {
  displayName: string;
  photoUrl: string | null;
};

export function ProfilePhotoEditor({
  displayName,
  photoUrl,
}: ProfilePhotoEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [isSaving, startSaving] = useTransition();

  function choosePhoto(file: File | undefined) {
    if (!file) return;
    startSaving(async () => {
      try {
        const body = new FormData();
        body.append("photo", await makeProfilePhoto(file));
        setMessage((await uploadProfilePhoto(body)).message);
      } catch {
        setMessage("That file couldn't be read as a photo.");
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <SettingsRow
      label="Photo"
      description={
        isSaving
          ? "Saving…"
          : message ||
            "Hover over your photo and click the pencil to change it."
      }
    >
      <div className="flex items-center gap-3">
        {photoUrl ? (
          <Button
            variant="ghost"
            disabled={isSaving}
            onClick={() =>
              startSaving(async () =>
                setMessage((await removeProfilePhoto()).message),
              )
            }
          >
            Remove
          </Button>
        ) : null}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isSaving}
          aria-label={photoUrl ? "Change profile photo" : "Add a profile photo"}
          title={photoUrl ? "Change photo" : "Add a photo"}
          className="group/photo relative rounded-full disabled:opacity-60"
        >
          <StudentAvatar
            displayName={displayName}
            photoUrl={photoUrl}
            size="large"
          />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover/photo:opacity-100 group-focus-visible/photo:opacity-100">
            <Pencil aria-hidden="true" className="size-4" />
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          tabIndex={-1}
          aria-hidden="true"
          className="hidden"
          onChange={(event) => choosePhoto(event.target.files?.[0])}
        />
      </div>
    </SettingsRow>
  );
}
