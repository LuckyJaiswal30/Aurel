import { ShortcutKeys } from "@/components/ui/shortcut-keys";
import { studyShortcuts } from "@/lib/keyboard/shortcuts";
import { SettingsGroup, SettingsRow } from "./SettingsRow";

export function ShortcutsSettings() {
  return (
    <SettingsGroup title="Keyboard shortcuts">
      {studyShortcuts.map((shortcut) => (
        <SettingsRow key={shortcut.action} label={shortcut.action}>
          <ShortcutKeys keys={shortcut.keys} />
        </SettingsRow>
      ))}
    </SettingsGroup>
  );
}
