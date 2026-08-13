export const modifierKey = "Mod";

export type Shortcut = { keys: string[]; action: string };

export const studyShortcuts: Shortcut[] = [
  { keys: ["Enter"], action: "Ask the tutor" },
  { keys: ["Shift", "Enter"], action: "New line in your question" },
  { keys: [modifierKey, ","], action: "Open settings" },
];

export function isApplePlatform(platform: string) {
  return /mac|iphone|ipad/i.test(platform);
}

export function isOpenSettingsShortcut(event: KeyboardEvent) {
  return (
    event.key === "," &&
    (event.metaKey || event.ctrlKey) &&
    !event.altKey &&
    !event.shiftKey
  );
}
