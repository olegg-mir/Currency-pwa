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

export function formatConverted(value: Big, language: Language) {
  const number = Number(value.toString());
  if (!Number.isFinite(number)) return value.toPrecision(8);
  const magnitude = Math.abs(number);
  const maximumFractionDigits = magnitude >= 1_000_000 ? 2 : magnitude >= 1 ? 4 : magnitude >= 0.01 ? 6 : 10;
  return new Intl.NumberFormat(language === "ru" ? "ru-RU" : "en-US", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
    useGrouping: true,
  }).format(number);
}
