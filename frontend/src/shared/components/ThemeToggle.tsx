import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/shared/store/themeStore";

function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === "dark";

  return (
    <Button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="border-black/10 bg-white/70 text-[#0B1511] hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
      size="icon"
      type="button"
      variant="outline"
      onClick={toggleTheme}
    >
      {isDark ? (
        <Moon aria-hidden="true" className="size-4" />
      ) : (
        <Sun aria-hidden="true" className="size-4" />
      )}
    </Button>
  );
}

export { ThemeToggle };
