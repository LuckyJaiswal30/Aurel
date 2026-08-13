"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  readThemeChoice,
  saveThemeChoice,
  type ThemeChoice,
} from "@/lib/theme/theme";
import { SettingsGroup, SettingsRow } from "./SettingsRow";

const themeOptions = [
  {
    value: "system" as const,
    label: "Match my device",
    icon: <Monitor aria-hidden="true" className="size-3.5" />,
  },
  {
    value: "light" as const,
    label: "Light",
    icon: <Sun aria-hidden="true" className="size-3.5" />,
  },
  {
    value: "dark" as const,
    label: "Dark",
    icon: <Moon aria-hidden="true" className="size-3.5" />,
  },
];

export function GeneralSettings() {
  const [theme, setTheme] = useState<ThemeChoice>(readThemeChoice);

  function chooseTheme(choice: ThemeChoice) {
    saveThemeChoice(choice);
    setTheme(choice);
  }

  return (
    <>
      <SettingsGroup title="Appearance">
        <SettingsRow
          label="Theme"
          description="Match your device, or keep Aurel light or dark."
        >
          <SegmentedControl
            label="Theme"
            value={theme}
            options={themeOptions}
            onChange={chooseTheme}
            isIconOnly
          />
        </SettingsRow>
      </SettingsGroup>
      <SettingsGroup title="Language">
        <SettingsRow
          label="Screens"
          description="Hindi screens are on the way. For answers in Hindi or Hinglish, set Answer language under Study profile."
        >
          <span className="text-sm text-muted">English</span>
        </SettingsRow>
      </SettingsGroup>
    </>
  );
}
