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

export function getInstrumentMultiplier(instrument: string): {multiplier: number; isDefaultForex?: boolean} {
  const normalizedInstrument = instrument.trim().toUpperCase();

  // Handle special cases with specific multipliers (not defaults)
  if (normalizedInstrument === "XAUUSD" || normalizedInstrument === "GOLD") {
    return { multiplier: 100, isDefaultForex: false };
  }

  // Indices - standard index multiplier
  const indexInstruments = ["US30", "NAS100", "SPX500", "GER30", "UK100", "US500", "USTECH", "HANGKONG", "FTSE100"];
  if (indexInstruments.includes(normalizedInstrument)) {
    return { multiplier: 1, isDefaultForex: false };
  }

  // Default forex pairs - standard forex lot size (100,000 units)
  const defaultForexInstruments = ["EURUSD", "GBPUSD", "USDJPY", "EURJPY", "GBPJPY",
    "AUDUSD", "USDCAD", "NZDUSD", "EURGBP", "EURCHF", "GBPCHF", "USDCHF",
    "AUDJPY", "CADJPY", "CHFJPY", "NZDJPY", "AUDNZD", "EURAUD", "EURNZD", "GBPAUD", "GBPNZD"];
  if (defaultForexInstruments.includes(normalizedInstrument)) {
    return { multiplier: 100000, isDefaultForex: true };
  }

  // Fallback for any other instruments - assume standard forex sizing
  return { multiplier: 100000, isDefaultForex: true };
}

export function calculateGenericProfitLoss(params: {
  tradeType: "BUY" | "SELL";
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  instrument: string;
}) {
  const multiplierData = getInstrumentMultiplier(params.instrument);
  const multiplier = multiplierData.multiplier;

  let movement: number;

  if (params.tradeType === "BUY") {
    movement = params.exitPrice - params.entryPrice;
  } else {
    movement = params.entryPrice - params.exitPrice;
  }

  return movement * params.lotSize * multiplier;
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

  const riskReward = numerator / denominator;

  return Number.isFinite(riskReward) ? riskReward : null;
}
