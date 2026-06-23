import { FinancialValue } from "@/components/financial-value";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InstrumentBreakdownProps {
  rows: Array<{
    instrument: string;
    totalTrades: number;
    wins: number;
    losses: number;
    totalProfit: number;
  }>;
}

export function InstrumentBreakdown({ rows }: InstrumentBreakdownProps) {
  return (
    <div className="relative overflow-x-auto rounded-lg border border-border">
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-8 bg-gradient-to-r from-[#0B0E11] to-transparent" />
      <Table className="min-w-[560px]">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Instrument</TableHead>
            <TableHead className="whitespace-nowrap text-right">Trades</TableHead>
            <TableHead className="whitespace-nowrap text-right">Wins</TableHead>
            <TableHead className="whitespace-nowrap text-right">Losses</TableHead>
            <TableHead className="whitespace-nowrap text-right">Total P/L</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                No instrument data yet.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.instrument}>
                <TableCell className="whitespace-nowrap font-medium text-foreground">{row.instrument}</TableCell>
                <TableCell className="whitespace-nowrap text-right tabular-finance font-mono">{row.totalTrades}</TableCell>
                <TableCell className="whitespace-nowrap text-right tabular-finance font-mono text-profit">{row.wins}</TableCell>
                <TableCell className="whitespace-nowrap text-right tabular-finance font-mono text-loss">{row.losses}</TableCell>
                <TableCell className={cnProfit(row.totalProfit)}>
                  <FinancialValue value={row.totalProfit} sign="auto" />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function cnProfit(value: number) {
  return value >= 0 ? "text-profit" : "text-loss";
}
