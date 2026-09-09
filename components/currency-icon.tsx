"use client";

import Image from "next/image";
import { useState } from "react";
import { FIAT_COUNTRY, colorForCode } from "@/lib/currency-icons";
import type { CurrencyKind } from "@/lib/rates";

type CurrencyIconProps = {
  code: string;
  type: CurrencyKind;
  size?: "small" | "large";
};

export function CurrencyIcon({ code, type, size = "small" }: CurrencyIconProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const country = type === "fiat" ? FIAT_COUNTRY[code] : undefined;
  const cryptoPath = `/icons/crypto/${code.toLowerCase()}.svg`;
  const dimensions = size === "large" ? 52 : 44;

  if (country) {
    return (
      <span className={`currency-avatar ${size}`} aria-hidden="true">
        <span className={`fi fi-${country}`} />
      </span>
    );
  }

  if (type === "crypto" && !imageFailed) {
    return (
      <span className={`currency-avatar ${size}`} aria-hidden="true">
        <Image
          src={cryptoPath}
          alt=""
          width={dimensions}
          height={dimensions}
          onError={() => setImageFailed(true)}
        />
      </span>
    );
  }

  return (
    <span
      className={`currency-avatar monogram ${size}`}
      style={{ backgroundColor: colorForCode(code) }}
      aria-hidden="true"
    >
      {code.slice(0, 3)}
    </span>
  );
}
