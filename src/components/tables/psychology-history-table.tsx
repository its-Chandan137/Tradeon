import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PsychologyHistoryTableProps {
  entries: Array<{
    id: string;
    journal_date: string;
    confidence_level: number;
    emotion_before: string;
    emotion_after: string;
    followed_setup: boolean;
    mistake_made: string | null;
    lesson_learned: string | null;
    created_at: string;
  }>;
}

export function PsychologyHistoryTable({ entries }: PsychologyHistoryTableProps) {
  return (
    <div className="relative overflow-x-auto rounded-lg border border-border">
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-12 bg-gradient-to-l from-[#0B0E11] to-transparent md:w-8" />
      <Table className="min-w-[600px] sm:min-w-[720px]">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap text-xs">Date</TableHead>
            <TableHead className="whitespace-nowrap text-xs">Confidence</TableHead>
            <TableHead className="whitespace-nowrap text-xs">Before</TableHead>
            <TableHead className="whitespace-nowrap text-xs">After</TableHead>
            <TableHead className="whitespace-nowrap text-xs">Followed setup</TableHead>
            <TableHead className="whitespace-nowrap text-xs">Mistake</TableHead>
            <TableHead className="whitespace-nowrap text-xs">Lesson</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                No psychology entries yet.
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="whitespace-nowrap tabular-finance font-mono text-xs sm:text-sm">
                  {new Date(entry.journal_date).toLocaleDateString()}
                </TableCell>
                <TableCell className="whitespace-nowrap tabular-finance font-mono text-xs sm:text-sm">{entry.confidence_level}/10</TableCell>
                <TableCell className="whitespace-nowrap text-xs sm:text-sm">{entry.emotion_before}</TableCell>
                <TableCell className="whitespace-nowrap text-xs sm:text-sm">{entry.emotion_after}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge variant={entry.followed_setup ? "profit" : "loss"} className="text-xs">
                    {entry.followed_setup ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap max-w-32 sm:max-w-64 truncate text-xs sm:text-sm">{entry.mistake_made ?? "—"}</TableCell>
                <TableCell className="whitespace-nowrap max-w-40 sm:max-w-80 truncate text-xs sm:text-sm">{entry.lesson_learned ?? "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
