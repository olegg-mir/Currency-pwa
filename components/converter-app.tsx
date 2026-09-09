"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronDown, Delete, GripVertical, Keyboard, Plus, RefreshCw, Settings, Trash2, WifiOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { AddCurrencySheet } from "./add-currency-sheet";
import { CurrencyIcon } from "./currency-icon";
import { SettingsSheet } from "./settings-sheet";
import { SortableCurrencyRow } from "./sortable-currency-row";
import { isSnapshot, shouldRefresh, type CurrencyInfo, type RateSnapshot } from "@/lib/rates";
import { convertAmount, formatConverted } from "@/lib/conversion";
import { editAmount } from "@/lib/input";
import { defaultPreferences, loadStoredState, savePreferences, saveSnapshot, type Preferences, type ThemePreference } from "@/lib/storage";
import { translate, type TranslationKey } from "@/lib/translations";

const BOOTSTRAP_CURRENCIES: CurrencyInfo[] = [
  { code: "RUB", name: "Russian Ruble", type: "fiat" },
  { code: "EUR", name: "Euro", type: "fiat" },
  { code: "USD", name: "US Dollar", type: "fiat" },
  { code: "GEL", name: "Georgian Lari", type: "fiat" },
  { code: "BTC", name: "Bitcoin", type: "crypto" },
  { code: "ETH", name: "Ethereum", type: "crypto" },
  { code: "USDT", name: "Tether", type: "crypto" },
];

type UpdateState = "idle" | "loading" | "error";

export function ConverterApp() {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [snapshot, setSnapshot] = useState<RateSnapshot>();
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(true);
  const [updateState, setUpdateState] = useState<UpdateState>("idle");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [manage, setManage] = useState(false);
  const [keypadOpen, setKeypadOpen] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  const t = useCallback((key: TranslationKey) => translate(preferences.language, key), [preferences.language]);

  const setPreference = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  }, []);

  const downloadRates = useCallback(async (announce = false, force = false) => {
    if (preferences.offlineMode || !navigator.onLine) {
      if (announce) toast.info(preferences.offlineMode ? t("offline") : t("networkOffline"));
      return;
    }
    setUpdateState("loading");
    try {
      const endpoint = force ? `/api/rates?force=1&at=${Date.now()}` : "/api/rates";
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) throw new Error(`Rates request failed (${response.status})`);
      const nextSnapshot: unknown = await response.json();
      if (!isSnapshot(nextSnapshot)) throw new Error("Invalid rates response");
      await saveSnapshot(nextSnapshot);
      setSnapshot(nextSnapshot);
      setUpdateState("idle");
      setNow(Date.now());
      if (announce) toast.success(t("ratesUpdated"));
    } catch (error) {
      console.error(error);
      setUpdateState("error");
      if (announce || snapshot) toast.error(t("updateFailed"));
    }
  }, [preferences.offlineMode, snapshot, t]);

  useEffect(() => {
    let active = true;
    void loadStoredState().then(({ preferences: storedPreferences, snapshot: storedSnapshot }) => {
      if (!active) return;
      const nextPreferences = storedPreferences ?? defaultPreferences;
      setPreferences(nextPreferences);
      setSnapshot(storedSnapshot);
      setOnline(navigator.onLine);
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready || !shouldRefresh(snapshot, preferences.offlineMode, online)) return;
    const timer = window.setTimeout(() => { void downloadRates(false); }, 0);
    return () => window.clearTimeout(timer);
  }, [downloadRates, online, preferences.offlineMode, ready, snapshot]);

  useEffect(() => {
    if (!ready) return;
    void savePreferences(preferences);
    localStorage.setItem("currenzy-theme", preferences.theme);
  }, [preferences, ready]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const resolved = preferences.theme === "system" ? (media.matches ? "dark" : "light") : preferences.theme;
      document.documentElement.dataset.theme = resolved;
    };
    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [preferences.theme]);

  useEffect(() => {
    document.documentElement.lang = preferences.language;
  }, [preferences.language]);

  useEffect(() => {
    const setConnected = () => setOnline(true);
    const setDisconnected = () => setOnline(false);
    window.addEventListener("online", setConnected);
    window.addEventListener("offline", setDisconnected);
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      window.removeEventListener("online", setConnected);
      window.removeEventListener("offline", setDisconnected);
      window.clearInterval(timer);
    };
  }, []);

  const handleKey = useCallback((key: string) => {
    setPreferences((current) => ({ ...current, amount: editAmount(current.amount, key) }));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable=true]") || document.querySelector('[role="dialog"]')) return;
      if (/^\d$/.test(event.key)) handleKey(event.key);
      else if (event.key === "." || event.key === ",") handleKey(".");
      else if (event.key === "Backspace" || event.key === "Delete") handleKey("backspace");
      else if (event.key === "Escape") handleKey("clear");
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  const currencyByCode = useMemo(() => {
    const map = new Map<string, CurrencyInfo>();
    for (const currency of BOOTSTRAP_CURRENCIES) map.set(currency.code, currency);
    for (const currency of snapshot?.currencies ?? []) map.set(currency.code, currency);
    return map;
  }, [snapshot]);

  const activeCurrency = currencyByCode.get(preferences.active) ?? BOOTSTRAP_CURRENCIES[0];
  const secondaryCurrencies = preferences.secondary.map((code) => currencyByCode.get(code)).filter((item): item is CurrencyInfo => Boolean(item));
  const selectedCodes = useMemo(() => new Set([preferences.active, ...preferences.secondary]), [preferences.active, preferences.secondary]);
  const convertedValue = useCallback((code: string) => {
    if (!snapshot) return "—";
    const converted = convertAmount(preferences.amount, preferences.active, code, snapshot.rates);
    return converted ? formatConverted(converted, preferences.language, preferences.decimalPlaces) : "—";
  }, [preferences.active, preferences.amount, preferences.decimalPlaces, preferences.language, snapshot]);

  const promoteCurrency = useCallback((code: string) => {
    setPreferences((current) => ({
      ...current,
      active: code,
      secondary: current.secondary.map((item) => item === code ? current.active : item),
    }));
  }, []);

  const removeSecondary = useCallback((code: string) => {
    if (preferences.secondary.length < 2) { toast.info(t("minCurrencies")); return; }
    setPreferences((current) => ({ ...current, secondary: current.secondary.filter((item) => item !== code) }));
  }, [preferences.secondary.length, t]);

  const removeActive = useCallback(() => {
    if (preferences.secondary.length < 2) { toast.info(t("minCurrencies")); return; }
    setPreferences((current) => ({
      ...current,
      active: current.secondary[0],
      secondary: current.secondary.slice(1),
    }));
  }, [preferences.secondary.length, t]);

  const moveSecondary = useCallback((code: string, direction: -1 | 1) => {
    setPreferences((current) => {
      const index = current.secondary.indexOf(code);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.secondary.length) return current;
      return { ...current, secondary: arrayMove(current.secondary, index, nextIndex) };
    });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = useCallback((event: DragEndEvent) => {
    if (!event.over || event.active.id === event.over.id) return;
    setPreferences((current) => ({
      ...current,
      secondary: arrayMove(current.secondary, current.secondary.indexOf(String(event.active.id)), current.secondary.indexOf(String(event.over!.id))),
    }));
  }, []);

  const addCurrency = useCallback((code: string) => {
    setPreferences((current) => current.secondary.includes(code) || current.active === code ? current : { ...current, secondary: [...current.secondary, code] });
  }, []);

  const refresh = useCallback(() => {
    if (preferences.offlineMode || !online) { void downloadRates(true); return; }
    void downloadRates(true, true);
  }, [downloadRates, online, preferences.offlineMode]);

  const amountLength = preferences.amount.length;
  const amountSize = amountLength > 14 ? "xlong" : amountLength > 10 ? "long" : amountLength > 7 ? "medium" : "short";

  const statusLabel = useMemo(() => {
    if (preferences.offlineMode || !online) return t("offline");
    if (updateState === "loading") return t("loadingRates");
    if (!snapshot) return updateState === "error" ? t("updateFailed") : t("loadingRates");
    const minutes = Math.max(0, Math.floor((now - Date.parse(snapshot.updatedAt)) / 60_000));
    if (minutes < 1) return t("updatedJustNow");
    if (minutes < 60) return translate(preferences.language, "updatedMinutes", minutes);
    return translate(preferences.language, "updatedHours", Math.floor(minutes / 60));
  }, [now, online, preferences.language, preferences.offlineMode, snapshot, t, updateState]);

  return (
    <main className="app-shell">
      <section className="converter" aria-label={t("converter")}>
        <header className="topbar">
          <div><p className="eyebrow">{t("converter")}</p><h1>{t("appName")}</h1></div>
          <div className="top-actions">
            <button className="icon-button" onClick={() => setAddOpen(true)} aria-label={t("addCurrency")}><Plus size={22} /></button>
            <button className={`icon-button ${updateState === "loading" ? "is-loading" : ""}`} onClick={refresh} aria-label={t("refresh")}><RefreshCw size={20} /></button>
            <button className="icon-button" onClick={() => setSettingsOpen(true)} aria-label={t("settings")}><Settings size={20} /></button>
          </div>
        </header>

        <div className="source-card" key={activeCurrency.code}>
          <div className="source-meta">
            <CurrencyIcon key={activeCurrency.code} code={activeCurrency.code} type={activeCurrency.type} size="large" />
            <div><strong>{activeCurrency.code}</strong><span>{activeCurrency.name}</span></div>
            {manage ? <button className="source-remove" onClick={removeActive} aria-label={`${t("delete")}: ${activeCurrency.code}`}><Trash2 size={19} /></button> : null}
          </div>
          <output className={`source-amount amount-${amountSize}`} aria-live="polite">{preferences.amount}</output>
          <div className="rate-status">
            {preferences.offlineMode || !online ? <WifiOff size={14} /> : <span className={`status-dot ${updateState === "error" ? "error" : ""}`} />}
            {statusLabel}
          </div>
        </div>

        {!snapshot && ready && (preferences.offlineMode || !online) ? <div className="offline-banner"><WifiOff size={18} />{t("offlineNoRates")}</div> : null}

        <div className="list-heading">
          <span>{t("convertedAmounts")}</span>
          <button className="manage-button" onClick={() => setManage((value) => !value)}><GripVertical size={16} />{manage ? t("done") : t("manage")}</button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={preferences.secondary} strategy={verticalListSortingStrategy}>
            <div className="currency-list">
              {secondaryCurrencies.map((currency, index) => (
                <div key={currency.code}>
                  <SortableCurrencyRow
                    currency={currency}
                    value={convertedValue(currency.code)}
                    manage={manage}
                    canMoveUp={index > 0}
                    canMoveDown={index < secondaryCurrencies.length - 1}
                    onSelect={() => promoteCurrency(currency.code)}
                    onRemove={() => removeSecondary(currency.code)}
                    onMove={(direction) => moveSecondary(currency.code, direction)}
                    labels={{ remove: t("delete"), reorder: t("reorder"), moveUp: t("moveUp"), moveDown: t("moveDown") }}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className={`keypad-wrap ${keypadOpen ? "" : "is-collapsed"}`}>
          <div className="keypad-toolbar">
            <button className="keypad-toggle" onClick={() => setKeypadOpen((value) => !value)} aria-expanded={keypadOpen}>
              {keypadOpen ? <ChevronDown size={18} /> : <Keyboard size={18} />}
              {keypadOpen ? t("hideKeypad") : t("showKeypad")}
            </button>
            {keypadOpen ? <button className="clear-button" onClick={() => handleKey("clear")}>{t("clear")}</button> : null}
          </div>
          {keypadOpen ? (
            <div className="keypad" aria-label="Numeric keypad">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((key) => (
                <button key={key} onClick={() => handleKey(key)} aria-label={key === "." ? t("decimal") : key}>{key}</button>
              ))}
              <button onClick={() => handleKey("backspace")} aria-label={t("backspace")}><Delete size={23} /></button>
            </div>
          ) : null}
        </div>
      </section>

      <AddCurrencySheet open={addOpen} onOpenChange={setAddOpen} currencies={snapshot?.currencies ?? BOOTSTRAP_CURRENCIES} selected={selectedCodes} onAdd={addCurrency} t={t} />
      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        language={preferences.language}
        onLanguageChange={(language) => setPreference("language", language)}
        theme={preferences.theme}
        onThemeChange={(theme: ThemePreference) => setPreference("theme", theme)}
        offlineMode={preferences.offlineMode}
        onOfflineModeChange={(offline) => setPreference("offlineMode", offline)}
        decimalPlaces={preferences.decimalPlaces}
        onDecimalPlacesChange={(decimalPlaces) => setPreference("decimalPlaces", decimalPlaces)}
        t={t}
      />
      <Toaster position="top-center" richColors />
    </main>
  );
}
