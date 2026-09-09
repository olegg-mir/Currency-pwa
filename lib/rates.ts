export const RATE_TTL_MS = 6 * 60 * 60 * 1000;

export type CurrencyKind = "fiat" | "crypto";

export type CurrencyInfo = {
  code: string;
  name: string;
  type: CurrencyKind;
};

export type RateSnapshot = {
  base: "USD";
  updatedAt: string;
  currencies: CurrencyInfo[];
  rates: Record<string, string>;
};

export function isSnapshot(value: unknown): value is RateSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<RateSnapshot>;
  return (
    snapshot.base === "USD" &&
    typeof snapshot.updatedAt === "string" && Number.isFinite(Date.parse(snapshot.updatedAt)) &&
    Array.isArray(snapshot.currencies) && snapshot.currencies.every((currency) => (
      Boolean(currency) && typeof currency === "object" &&
      typeof currency.code === "string" && typeof currency.name === "string" &&
      (currency.type === "fiat" || currency.type === "crypto")
    )) &&
    Boolean(snapshot.rates) &&
    typeof snapshot.rates === "object" &&
    Object.entries(snapshot.rates as Record<string, unknown>).every(([code, rate]) => (
      /^[A-Z0-9]{1,12}$/.test(code) && typeof rate === "string" && Number(rate) > 0
    ))
  );
}

export function isSnapshotStale(snapshot: RateSnapshot, now = Date.now()) {
  const updatedAt = Date.parse(snapshot.updatedAt);
  return !Number.isFinite(updatedAt) || now - updatedAt >= RATE_TTL_MS;
}

export function shouldRefresh(snapshot: RateSnapshot | undefined, offlineMode: boolean, online: boolean, now = Date.now()) {
  return !offlineMode && online && (!snapshot || isSnapshotStale(snapshot, now));
}
