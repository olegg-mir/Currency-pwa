import type { CurrencyInfo, RateSnapshot } from "./rates";

export type CoinbaseRatesPayload = { data?: { currency?: string; rates?: Record<string, string> } };
export type CoinbaseFiatPayload = { data?: Array<{ id?: string; name?: string }> };
export type CoinbaseCryptoPayload = { data?: Array<{ code?: string; name?: string; sort_index?: number }> };

export function normalizeRates(
  ratePayload: CoinbaseRatesPayload,
  fiatPayload: CoinbaseFiatPayload,
  cryptoPayload: CoinbaseCryptoPayload,
  updatedAt = new Date().toISOString(),
): RateSnapshot {
  const rawRates = ratePayload.data?.rates;
  if (!rawRates || Object.keys(rawRates).length === 0) throw new Error("Coinbase returned no rates");

  const rates: Record<string, string> = { USD: "1" };
  for (const [rawCode, rawRate] of Object.entries(rawRates)) {
    const code = rawCode.toUpperCase();
    if (/^[A-Z0-9]{1,12}$/.test(code) && Number(rawRate) > 0) rates[code] = rawRate;
  }

  const fiatCodes = new Set<string>();
  const fiat: CurrencyInfo[] = [];
  for (const item of fiatPayload.data ?? []) {
    const code = item.id?.toUpperCase();
    if (!code || !item.name || !rates[code]) continue;
    fiatCodes.add(code);
    fiat.push({ code, name: item.name, type: "fiat" });
  }

  const crypto = (cryptoPayload.data ?? [])
    .filter((item) => item.code && item.name && rates[item.code.toUpperCase()])
    .filter((item) => !fiatCodes.has(item.code!.toUpperCase()))
    .sort((a, b) => (a.sort_index ?? 99_999) - (b.sort_index ?? 99_999))
    .map<CurrencyInfo>((item) => ({ code: item.code!.toUpperCase(), name: item.name!, type: "crypto" }));

  fiat.sort((a, b) => a.code.localeCompare(b.code));
  return { base: "USD", updatedAt, currencies: [...fiat, ...crypto], rates };
}
