"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";
import type { CurrencyInfo } from "@/lib/rates";
import { CurrencyIcon } from "./currency-icon";

type SortableCurrencyRowProps = {
  currency: CurrencyInfo;
  value: string;
  manage: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  labels: { remove: string; reorder: string; moveUp: string; moveDown: string };
};

export function SortableCurrencyRow({
  currency,
  value,
  manage,
  canMoveUp,
  canMoveDown,
  onSelect,
  onRemove,
  onMove,
  labels,
}: SortableCurrencyRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: currency.code,
    disabled: !manage,
  });

  return (
    <div
      ref={setNodeRef}
      className={`currency-row ${manage ? "is-managing" : ""} ${isDragging ? "is-dragging" : ""}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-currency={currency.code}
    >
      {manage ? (
        <button className="drag-handle" aria-label={`${labels.reorder}: ${currency.code}`} {...attributes} {...listeners}>
          <GripVertical size={20} />
        </button>
      ) : null}
      <button className="currency-main" onClick={onSelect} disabled={manage} aria-label={`${currency.name}, ${value}`}>
        <CurrencyIcon code={currency.code} type={currency.type} />
        <span className="currency-copy">
          <strong>{currency.code}</strong>
          <span>{currency.name}</span>
        </span>
        <span className="row-value">{value}</span>
      </button>
      {manage ? (
        <div className="row-management">
          <button disabled={!canMoveUp} onClick={() => onMove(-1)} aria-label={`${labels.moveUp}: ${currency.code}`}><ChevronUp size={18} /></button>
          <button disabled={!canMoveDown} onClick={() => onMove(1)} aria-label={`${labels.moveDown}: ${currency.code}`}><ChevronDown size={18} /></button>
          <button className="remove-button" onClick={onRemove} aria-label={`${labels.remove}: ${currency.code}`}><Trash2 size={18} /></button>
        </div>
      ) : null}
    </div>
  );
}
