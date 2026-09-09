import { NextResponse } from "next/server";
import {
  normalizeRates,
  type CoinbaseCryptoPayload,
  type CoinbaseFiatPayload,
  type CoinbaseRatesPayload,
} from "@/lib/normalize-rates";

const COINBASE_API = "https://api.coinbase.com/v2";
const CACHE_SECONDS = 21_600;

async function getJson<T>(path: string, force: boolean): Promise<T> {
  const response = await fetch(`${COINBASE_API}${path}`, {
    headers: { Accept: "application/json" },
    ...(force ? { cache: "no-store" as const } : { next: { revalidate: CACHE_SECONDS } }),
  });
  if (!response.ok) throw new Error(`Coinbase request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export async function GET(request: Request) {
  try {
    const force = new URL(request.url).searchParams.get("force") === "1";
    const [ratePayload, fiatPayload, cryptoPayload] = await Promise.all([
      getJson<CoinbaseRatesPayload>("/exchange-rates?currency=USD", force),
      getJson<CoinbaseFiatPayload>("/currencies", force),
      getJson<CoinbaseCryptoPayload>("/currencies/crypto", force),
    ]);
    const snapshot = normalizeRates(ratePayload, fiatPayload, cryptoPayload);

    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": force ? "private, no-store" : `public, max-age=0, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400`,
      },
    });
  } catch (error) {
    console.error("Rates update failed", error);
    return NextResponse.json({ error: "Rates are temporarily unavailable" }, { status: 502 });
  }
}
