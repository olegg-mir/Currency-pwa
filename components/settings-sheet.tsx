"use client";

import { Languages, MoonStar, WifiOff } from "lucide-react";
import type { Language, TranslationKey } from "@/lib/translations";
import type { ThemePreference } from "@/lib/storage";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

type SettingsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  offlineMode: boolean;
  onOfflineModeChange: (offline: boolean) => void;
  t: (key: TranslationKey) => string;
};

export function SettingsSheet(props: SettingsSheetProps) {
  const { open, onOpenChange, language, onLanguageChange, theme, onThemeChange, offlineMode, onOfflineModeChange, t } = props;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="app-sheet settings-sheet" showCloseButton={false}>
        <div className="sheet-grabber" />
        <SheetHeader className="sheet-header">
          <SheetTitle>{t("settings")}</SheetTitle>
          <SheetDescription className="sr-only">{t("settings")}</SheetDescription>
          <button className="text-button" onClick={() => onOpenChange(false)}>{t("done")}</button>
        </SheetHeader>

        <section className="setting-section">
          <div className="setting-label"><MoonStar size={20} /><span>{t("appearance")}</span></div>
          <div className="segmented-control">
            {(["system", "light", "dark"] as const).map((option) => (
              <button key={option} className={theme === option ? "selected" : ""} onClick={() => onThemeChange(option)}>{t(option)}</button>
            ))}
          </div>
        </section>

        <section className="setting-section">
          <div className="setting-label"><Languages size={20} /><span>{t("language")}</span></div>
          <div className="segmented-control two">
            {(["en", "ru"] as const).map((option) => (
              <button key={option} className={language === option ? "selected" : ""} onClick={() => onLanguageChange(option)}>{t(option === "en" ? "english" : "russian")}</button>
            ))}
          </div>
        </section>

        <section className="offline-setting">
          <div className="setting-label"><WifiOff size={20} /><span><strong>{t("offlineMode")}</strong><small>{t("offlineDescription")}</small></span></div>
          <Switch checked={offlineMode} onCheckedChange={onOfflineModeChange} aria-label={t("offlineMode")} />
        </section>
      </SheetContent>
    </Sheet>
  );
}
