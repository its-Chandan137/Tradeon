import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null | undefined) {
  const number = typeof value === "number" ? value : Number(value ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

export function formatNumber(value: number | string | null | undefined, digits = 2) {
  const number = typeof value === "number" ? value : Number(value ?? 0);

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(number);
}

export function calculateGenericProfitLoss(params: {
  tradeType: "BUY" | "SELL";
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
}) {
  const movement =
    params.tradeType === "BUY"
      ? params.exitPrice - params.entryPrice
      : params.entryPrice - params.exitPrice;

  return movement * params.lotSize;
}

export function calculateRiskReward(params: {
  tradeType: "BUY" | "SELL";
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
}) {
  const denominator =
    params.tradeType === "BUY"
      ? params.entryPrice - params.stopLoss
      : params.stopLoss - params.entryPrice;

  if (denominator === 0) {
    return null;
  }

  const numerator =
    params.tradeType === "BUY"
      ? params.takeProfit - params.entryPrice
      : params.entryPrice - params.takeProfit;

  return numerator / denominator;
}
