"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FinancialValue } from "@/components/financial-value";

interface TradeHistoryTableProps {
  trades: Array<{
    id: string;
    trade_date: string;
    instrument: string;
    trade_type: "BUY" | "SELL";
    entry_price: number;
    exit_price: number;
    lot_size: number;
    stop_loss: number;
    take_profit: number;
    profit_loss: number;
    screenshot_url: string | null;
    notes: string | null;
    created_at: string;
  }>;
}

type SortKey = keyof TradeHistoryTableProps["trades"][number];

function SortHeader({
  label,
  column,
  sortKey,
  sortDirection,
  onSort,
}: {
  label: string;
  column: SortKey;
  sortKey: SortKey;
  sortDirection: "asc" | "desc";
  onSort: (key: SortKey) => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1"
      onClick={() => onSort(column)}
    >
      {label}
      <ArrowUpDown className={cnSortIcon(sortKey, column, sortDirection)} />
    </button>
  );
}

export function TradeHistoryTable({ trades }: TradeHistoryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [trades, sortDirection, sortKey]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((value) => (value === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("desc");
  }

  return (
    <div className="relative overflow-x-auto rounded-lg border border-border">
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-12 bg-gradient-to-l from-[#0B0E11] to-transparent md:w-8" />
      <Table className="min-w-[600px] sm:min-w-[680px]">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap text-xs">Date</TableHead>
            <TableHead className="whitespace-nowrap text-xs">
              <SortHeader label="Instrument" column="instrument" sortKey={sortKey} sortDirection={sortDirection} onSort={toggleSort} />
            </TableHead>
            <TableHead className="whitespace-nowrap text-xs">Type</TableHead>
            <TableHead className="whitespace-nowrap text-right text-xs">
              <SortHeader label="Entry" column="entry_price" sortKey={sortKey} sortDirection={sortDirection} onSort={toggleSort} />
            </TableHead>
            <TableHead className="whitespace-nowrap text-right text-xs">
              <SortHeader label="Exit" column="exit_price" sortKey={sortKey} sortDirection={sortDirection} onSort={toggleSort} />
            </TableHead>
            <TableHead className="whitespace-nowrap text-right text-xs">
              <SortHeader label="Lots" column="lot_size" sortKey={sortKey} sortDirection={sortDirection} onSort={toggleSort} />
            </TableHead>
            <TableHead className="whitespace-nowrap text-right text-xs">
              <SortHeader label="P/L" column="profit_loss" sortKey={sortKey} sortDirection={sortDirection} onSort={toggleSort} />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTrades.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                No trades logged yet.
              </TableCell>
            </TableRow>
          ) : (
            sortedTrades.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell className="whitespace-nowrap tabular-finance font-mono text-xs sm:text-sm">
                  {new Date(trade.trade_date).toLocaleDateString()}
                </TableCell>
                <TableCell className="whitespace-nowrap font-medium text-foreground text-xs sm:text-sm">{trade.instrument}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge variant={trade.trade_type === "BUY" ? "default" : "secondary"} className="text-xs">
                    {trade.trade_type}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-right text-xs sm:text-sm">
                  <FinancialValue value={trade.entry_price} digits={5} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-right text-xs sm:text-sm">
                  <FinancialValue value={trade.exit_price} digits={5} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-right text-xs sm:text-sm">
                  <FinancialValue value={trade.lot_size} digits={3} />
                </TableCell>
                <TableCell className={cnTradePnl(trade.profit_loss)}>
                  <FinancialValue value={trade.profit_loss} sign="auto" />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function cnTradePnl(value: number) {
  return value >= 0 ? "text-profit" : "text-loss";
}

function cnSortIcon(sortKey: SortKey, column: SortKey, sortDirection: "asc" | "desc") {
  if (sortKey !== column) {
    return "size-3 text-muted-foreground";
  }

  return ["size-3", sortDirection === "asc" ? "rotate-180" : ""].join(" ");
}
