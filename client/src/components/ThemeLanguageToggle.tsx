import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n, type Language } from "@/contexts/i18nContext";
import { Moon, Sun, Globe } from "lucide-react";
import { InstallButton } from "./InstallButton"; // Import InstallButton

interface ThemeLanguageToggleProps {
  isAppInstalled: boolean;
  handleInstallClick: () => void;
}

export function ThemeLanguageToggle({
  isAppInstalled,
  handleInstallClick,
}: ThemeLanguageToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();

  const languages: { code: Language; name: string }[] = [
    { code: "de", name: "Deutsch" },
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
    { code: "it", name: "Italiano" },
  ];

  return (
    <div className="flex gap-2">
      {/* Theme Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        title={theme === "light" ? t("theme.dark") : t("theme.light")}
        className="rounded-lg"
      >
        {theme === "light" ? (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-lg"
            title={t("nav.language")}
          >
            <Globe className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Select language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t("nav.language")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={language === lang.code ? "bg-accent" : ""}
            >
              {lang.name}
              {language === lang.code && (
                <span className="ml-2 text-primary font-bold">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Install Button */}
      {!isAppInstalled && (
        <InstallButton
          onInstall={handleInstallClick}
        />
      )}
    </div>
  );
}
