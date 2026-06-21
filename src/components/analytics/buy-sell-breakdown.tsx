import { FinancialValue } from "@/components/financial-value";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BuySellBreakdownProps {
  rows: Array<{
    tradeType: "BUY" | "SELL";
    totalTrades: number;
    wins: number;
    losses: number;
    totalProfit: number;
  }>;
}

export function BuySellBreakdown({ rows }: BuySellBreakdownProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Trades</TableHead>
          <TableHead className="text-right">Wins</TableHead>
          <TableHead className="text-right">Losses</TableHead>
          <TableHead className="text-right">Total P/L</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.tradeType}>
            <TableCell className="font-medium text-foreground">{row.tradeType}</TableCell>
            <TableCell className="text-right tabular-finance font-mono">{row.totalTrades}</TableCell>
            <TableCell className="text-right tabular-finance font-mono text-profit">{row.wins}</TableCell>
            <TableCell className="text-right tabular-finance font-mono text-loss">{row.losses}</TableCell>
            <TableCell className={cnProfit(row.totalProfit)}>
              <FinancialValue value={row.totalProfit} sign="auto" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function cnProfit(value: number) {
  return value >= 0 ? "text-profit" : "text-loss";
}
