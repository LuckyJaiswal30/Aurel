"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { controlClass } from "@/components/ui/control-styles";
import { FormMessage } from "@/components/ui/form-message";
import { Select } from "@/components/ui/select";
import type { StudentProfile } from "@/lib/db/profiles";
import { idleFormState } from "@/lib/forms/form-state";
import { saveStudyProfile } from "../../profile-actions";
import { SettingsGroup, SettingsRow } from "./SettingsRow";

const controlWidth = "w-full sm:w-60";

const yearOptions = [
  { value: "", label: "Not set" },
  ...Array.from({ length: 8 }, (_, index) => ({
    value: String(index + 1),
    label: `Year ${index + 1}`,
  })),
];
const languageOptions = [
  { value: "english", label: "English" },
  { value: "hindi", label: "हिन्दी (Hindi)" },
  { value: "hinglish", label: "Hinglish" },
];
const levelOptions = [
  { value: "simpler", label: "Simpler, with analogies" },
  { value: "standard", label: "Standard" },
  { value: "deeper", label: "Deeper, more detail" },
];

type StudySettingsProps = {
  profile: StudentProfile;
};

export function StudySettings({ profile }: StudySettingsProps) {
  const [state, formAction, isSaving] = useActionState(
    saveStudyProfile,
    idleFormState,
  );
  const errorFor = (field: string) => state.fieldErrors?.[field]?.[0];
  const valueFor = (field: string, saved: string) =>
    state.values?.[field] ?? saved;

  return (
    <form
      key={JSON.stringify(state.values ?? null)}
      action={formAction}
      noValidate
    >
      <SettingsGroup title="About you">
        <SettingsRow
          label="Course"
          labelFor="settings-course"
          description="For example B.Tech CSE (AI)."
          error={errorFor("course")}
        >
          <input
            id="settings-course"
            name="course"
            aria-invalid={errorFor("course") ? true : undefined}
            defaultValue={valueFor("course", profile.course ?? "")}
            maxLength={80}
            className={`${controlClass} ${controlWidth}`}
          />
        </SettingsRow>
        <SettingsRow
          label="Year"
          labelFor="settings-studyYear"
          error={errorFor("studyYear")}
        >
          <Select
            id="settings-studyYear"
            name="studyYear"
            options={yearOptions}
            defaultValue={valueFor(
              "studyYear",
              profile.studyYear ? String(profile.studyYear) : "",
            )}
            aria-invalid={errorFor("studyYear") ? true : undefined}
            className={controlWidth}
          />
        </SettingsRow>
      </SettingsGroup>
      <SettingsGroup title="How the tutor answers">
        <SettingsRow
          label="Answer language"
          labelFor="settings-preferredLanguage"
          error={errorFor("preferredLanguage")}
        >
          <Select
            id="settings-preferredLanguage"
            name="preferredLanguage"
            options={languageOptions}
            defaultValue={valueFor(
              "preferredLanguage",
              profile.preferredLanguage,
            )}
            aria-invalid={errorFor("preferredLanguage") ? true : undefined}
            className={controlWidth}
          />
        </SettingsRow>
        <SettingsRow
          label="Explanations"
          labelFor="settings-explanationLevel"
          description="The tutor also adjusts this as it learns how you study."
          error={errorFor("explanationLevel")}
        >
          <Select
            id="settings-explanationLevel"
            name="explanationLevel"
            options={levelOptions}
            defaultValue={valueFor(
              "explanationLevel",
              profile.explanationLevel,
            )}
            aria-invalid={errorFor("explanationLevel") ? true : undefined}
            className={controlWidth}
          />
        </SettingsRow>
      </SettingsGroup>
      <div className="flex items-center justify-end gap-4 pt-2">
        <FormMessage
          message={state.message}
          tone={state.status === "success" ? "success" : "error"}
        />
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
