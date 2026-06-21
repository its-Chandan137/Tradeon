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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Instrument</TableHead>
          <TableHead className="text-right">Trades</TableHead>
          <TableHead className="text-right">Wins</TableHead>
          <TableHead className="text-right">Losses</TableHead>
          <TableHead className="text-right">Total P/L</TableHead>
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
              <TableCell className="font-medium text-foreground">{row.instrument}</TableCell>
              <TableCell className="text-right tabular-finance font-mono">{row.totalTrades}</TableCell>
              <TableCell className="text-right tabular-finance font-mono text-profit">{row.wins}</TableCell>
              <TableCell className="text-right tabular-finance font-mono text-loss">{row.losses}</TableCell>
              <TableCell className={cnProfit(row.totalProfit)}>
                <FinancialValue value={row.totalProfit} sign="auto" />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

function cnProfit(value: number) {
  return value >= 0 ? "text-profit" : "text-loss";
}
