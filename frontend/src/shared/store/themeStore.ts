import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type ThemePreference = "dark" | "light";

interface ThemeState {
  theme: ThemePreference;
  toggleTheme: () => void;
  setTheme: (theme: ThemePreference) => void;
}

function applyTheme(theme: ThemePreference) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", theme === "dark");
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      toggleTheme: () =>
        set((state) => {
          const nextTheme = state.theme === "dark" ? "light" : "dark";
          applyTheme(nextTheme);
          return { theme: nextTheme };
        }),
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    {
      name: "trail-explorer-theme",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        applyTheme(state?.theme ?? "dark");
      },
    },
  ),
);

applyTheme("dark");
