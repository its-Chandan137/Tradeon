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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Confidence</TableHead>
          <TableHead>Before</TableHead>
          <TableHead>After</TableHead>
          <TableHead>Followed setup</TableHead>
          <TableHead>Mistake</TableHead>
          <TableHead>Lesson</TableHead>
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
              <TableCell className="tabular-finance font-mono text-sm">
                {new Date(entry.journal_date).toLocaleDateString()}
              </TableCell>
              <TableCell className="tabular-finance font-mono">{entry.confidence_level}/10</TableCell>
              <TableCell>{entry.emotion_before}</TableCell>
              <TableCell>{entry.emotion_after}</TableCell>
              <TableCell>
                <Badge variant={entry.followed_setup ? "profit" : "loss"}>
                  {entry.followed_setup ? "Yes" : "No"}
                </Badge>
              </TableCell>
              <TableCell className="max-w-48 truncate">{entry.mistake_made ?? "—"}</TableCell>
              <TableCell className="max-w-64 truncate">{entry.lesson_learned ?? "—"}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
