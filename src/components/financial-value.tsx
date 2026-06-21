import { cn } from "@/lib/utils";

interface FinancialValueProps {
  value: number | string | null | undefined;
  sign?: "auto" | "always" | "never";
  className?: string;
  prefix?: string;
  suffix?: string;
  digits?: number;
}

export function FinancialValue({
  value,
  sign = "never",
  className,
  prefix,
  suffix,
  digits = 2,
}: FinancialValueProps) {
  const number = Number(value ?? 0);
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: sign,
  }).format(number);

  return (
    <span className={cn("tabular-finance font-mono", className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
