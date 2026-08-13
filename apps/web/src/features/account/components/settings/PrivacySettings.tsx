import Link from "next/link";
import { Dialog } from "radix-ui";
import { DeleteAllChatsRow } from "./DeleteAllChatsRow";
import { SettingsGroup, SettingsRow } from "./SettingsRow";

export function PrivacySettings() {
  return (
    <>
      <SettingsGroup title="Your study material">
        <SettingsRow
          label="Who can see your notes"
          description="Only you. Every subject, note and chat is locked to your account."
        />
        <SettingsRow
          label="Personal documents"
          description="Upload study material only. ID cards, bank papers and similar files are refused."
        />
        <SettingsRow
          label="Personal details in notes"
          description="Phone numbers, emails and ID numbers inside your notes are hidden before they are stored for search."
        />
        <SettingsRow
          label="Where answers come from"
          description="In a subject, your notes first, and the answer says when it uses anything else. In a general chat, the tutor's own knowledge, and Wikipedia when needed."
        />
        <SettingsRow
          label="More about privacy"
          description="How Aurel stores and protects what you upload."
        >
          <Dialog.Close asChild>
            <Link
              href="/help#privacy"
              className="text-sm font-medium text-ink underline-offset-4 hover:underline"
            >
              Read more
            </Link>
          </Dialog.Close>
        </SettingsRow>
      </SettingsGroup>
      <SettingsGroup title="Your chats">
        <DeleteAllChatsRow />
      </SettingsGroup>
    </>
  );
}
