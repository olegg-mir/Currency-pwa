import { NextResponse } from "next/server";
import {
  normalizeRates,
  type CoinbaseCryptoPayload,
  type CoinbaseFiatPayload,
  type CoinbaseRatesPayload,
} from "@/lib/normalize-rates";

const COINBASE_API = "https://api.coinbase.com/v2";
const CACHE_SECONDS = 21_600;

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${COINBASE_API}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: CACHE_SECONDS },
  });
  if (!response.ok) throw new Error(`Coinbase request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export async function GET() {
  try {
    const [ratePayload, fiatPayload, cryptoPayload] = await Promise.all([
      getJson<CoinbaseRatesPayload>("/exchange-rates?currency=USD"),
      getJson<CoinbaseFiatPayload>("/currencies"),
      getJson<CoinbaseCryptoPayload>("/currencies/crypto"),
    ]);
    const snapshot = normalizeRates(ratePayload, fiatPayload, cryptoPayload);

    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": `public, max-age=0, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400`,
      },
    });
  } catch (error) {
    console.error("Rates update failed", error);
    return NextResponse.json({ error: "Rates are temporarily unavailable" }, { status: 502 });
  }
}
