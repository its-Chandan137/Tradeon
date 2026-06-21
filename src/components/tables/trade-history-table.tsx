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

  function SortHeader({ label, column }: { label: string; column: SortKey }) {
    return (
      <button
        type="button"
        className="inline-flex items-center gap-1"
        onClick={() => toggleSort(column)}
      >
        {label}
        <ArrowUpDown className="size-3 text-muted-foreground" />
      </button>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead><SortHeader label="Instrument" column="instrument" /></TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right"><SortHeader label="Entry" column="entry_price" /></TableHead>
          <TableHead className="text-right"><SortHeader label="Exit" column="exit_price" /></TableHead>
          <TableHead className="text-right"><SortHeader label="Lots" column="lot_size" /></TableHead>
          <TableHead className="text-right"><SortHeader label="P/L" column="profit_loss" /></TableHead>
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
              <TableCell className="tabular-finance font-mono text-sm">
                {new Date(trade.trade_date).toLocaleDateString()}
              </TableCell>
              <TableCell className="font-medium text-foreground">{trade.instrument}</TableCell>
              <TableCell>
                <Badge variant={trade.trade_type === "BUY" ? "default" : "secondary"}>
                  {trade.trade_type}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <FinancialValue value={trade.entry_price} digits={5} />
              </TableCell>
              <TableCell className="text-right">
                <FinancialValue value={trade.exit_price} digits={5} />
              </TableCell>
              <TableCell className="text-right">
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
  );
}

function cnTradePnl(value: number) {
  return value >= 0 ? "text-profit" : "text-loss";
}
