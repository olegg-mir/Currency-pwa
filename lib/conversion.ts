import Big from "big.js";
import type { Language } from "./translations";

export function convertAmount(amount: string, from: string, to: string, rates: Record<string, string>) {
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) return undefined;
  try {
    const value = !amount || amount === "." ? new Big(0) : new Big(amount);
    return value.times(toRate).div(fromRate);
  } catch {
    return undefined;
  }
}

export function formatConverted(value: Big, language: Language, decimalPlaces = 2) {
  const number = Number(value.toString());
  if (!Number.isFinite(number)) return value.toFixed(decimalPlaces);
  return new Intl.NumberFormat(language === "ru" ? "ru-RU" : "en-US", {
    maximumFractionDigits: decimalPlaces,
    minimumFractionDigits: 0,
    useGrouping: true,
  }).format(number);
}
