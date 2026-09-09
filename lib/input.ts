export type InputKey = string | "clear" | "backspace";

export function editAmount(amount: string, key: InputKey) {
  if (key === "clear") return "0";
  if (key === "backspace") return amount.length <= 1 ? "0" : amount.slice(0, -1);
  if (key === ".") return amount.includes(".") ? amount : `${amount}.`;
  if (!/^\d$/.test(key)) return amount;
  const significantDigits = amount.replace(/[^0-9]/g, "").replace(/^0+/, "").length;
  if (significantDigits >= 18) return amount;
  return amount === "0" ? key : `${amount}${key}`;
}
