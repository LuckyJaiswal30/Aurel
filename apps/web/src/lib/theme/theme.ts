export const themeChoices = ["system", "light", "dark"] as const;
export type ThemeChoice = (typeof themeChoices)[number];

export const themeCookieName = "aurel-theme";

export const applySavedThemeScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${themeCookieName}=(light|dark)/);if(m)document.documentElement.setAttribute("data-theme",m[1])}catch(e){}})()`;

export function readThemeChoice(): ThemeChoice {
  const theme = document.documentElement.getAttribute("data-theme");
  return theme === "light" || theme === "dark" ? theme : "system";
}

export function saveThemeChoice(theme: ThemeChoice) {
  const root = document.documentElement;
  if (theme === "system") {
    root.removeAttribute("data-theme");
    document.cookie = `${themeCookieName}=; path=/; max-age=0; SameSite=Lax`;
    return;
  }
  root.setAttribute("data-theme", theme);
  document.cookie = `${themeCookieName}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}
