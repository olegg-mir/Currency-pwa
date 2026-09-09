"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Check, Plus, Search } from "lucide-react";
import type { CurrencyInfo, CurrencyKind } from "@/lib/rates";
import type { TranslationKey } from "@/lib/translations";
import { CurrencyIcon } from "./currency-icon";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AddCurrencySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currencies: CurrencyInfo[];
  selected: Set<string>;
  onAdd: (code: string) => void;
  t: (key: TranslationKey) => string;
};

export function AddCurrencySheet({ open, onOpenChange, currencies, selected, onAdd, t }: AddCurrencySheetProps) {
  const [kind, setKind] = useState<CurrencyKind>("fiat");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const visibleCurrencies = useMemo(() => currencies.filter((currency) => {
    if (currency.type !== kind) return false;
    return !deferredQuery || currency.code.toLowerCase().includes(deferredQuery) || currency.name.toLowerCase().includes(deferredQuery);
  }), [currencies, deferredQuery, kind]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="app-sheet currency-picker" showCloseButton={false}>
        <div className="sheet-grabber" />
        <SheetHeader className="sheet-header">
          <SheetTitle>{t("addCurrency")}</SheetTitle>
          <SheetDescription className="sr-only">{t("searchCurrencies")}</SheetDescription>
          <button className="text-button" onClick={() => onOpenChange(false)}>{t("done")}</button>
        </SheetHeader>
        <Tabs value={kind} onValueChange={(value) => setKind(value as CurrencyKind)}>
          <TabsList className="kind-tabs">
            <TabsTrigger value="fiat">{t("fiat")}</TabsTrigger>
            <TabsTrigger value="crypto">{t("crypto")}</TabsTrigger>
          </TabsList>
        </Tabs>
        <label className="search-field">
          <Search size={19} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchCurrencies")} autoComplete="off" />
        </label>
        <div className="catalog-list">
          {visibleCurrencies.length ? visibleCurrencies.map((currency) => {
            const isSelected = selected.has(currency.code);
            return (
              <button key={currency.code} className="catalog-row" disabled={isSelected} onClick={() => onAdd(currency.code)}>
                <CurrencyIcon code={currency.code} type={currency.type} />
                <span><strong>{currency.code}</strong><small>{currency.name}</small></span>
                {isSelected ? <Check size={20} /> : <Plus size={20} />}
              </button>
            );
          }) : <p className="empty-catalog">{t("noResults")}</p>}
        </div>
      </SheetContent>
    </Sheet>
  );
}
