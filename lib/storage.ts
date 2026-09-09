import { openDB } from "idb";
import type { Language } from "./translations";
import type { RateSnapshot } from "./rates";

export type ThemePreference = "system" | "light" | "dark";

export type Preferences = {
  active: string;
  secondary: string[];
  amount: string;
  language: Language;
  theme: ThemePreference;
  offlineMode: boolean;
  decimalPlaces: number;
};

export const defaultPreferences: Preferences = {
  active: "RUB",
  secondary: ["EUR", "USD", "GEL", "BTC", "ETH", "USDT"],
  amount: "1",
  language: "en",
  theme: "system",
  offlineMode: false,
  decimalPlaces: 2,
};

export function normalizePreferences(value: unknown): Preferences | undefined {
  if (!value || typeof value !== "object") return undefined;
  const stored = value as Partial<Preferences>;
  const decimalPlaces = Number.isInteger(stored.decimalPlaces) && Number(stored.decimalPlaces) >= 0 && Number(stored.decimalPlaces) <= 10
    ? Number(stored.decimalPlaces)
    : defaultPreferences.decimalPlaces;
  return { ...defaultPreferences, ...stored, decimalPlaces };
}

let database: ReturnType<typeof openDB> | undefined;

function getDatabase() {
  database ??= openDB("currenzy", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("app")) db.createObjectStore("app");
    },
  });
  return database;
}

export async function loadStoredState() {
  const db = await getDatabase();
  const [storedPreferences, snapshot] = await Promise.all([
    db.get("app", "preferences") as Promise<unknown>,
    db.get("app", "snapshot") as Promise<RateSnapshot | undefined>,
  ]);
  return { preferences: normalizePreferences(storedPreferences), snapshot };
}

export async function savePreferences(preferences: Preferences) {
  const db = await getDatabase();
  await db.put("app", preferences, "preferences");
}

export async function saveSnapshot(snapshot: RateSnapshot) {
  const db = await getDatabase();
  await db.put("app", snapshot, "snapshot");
}
