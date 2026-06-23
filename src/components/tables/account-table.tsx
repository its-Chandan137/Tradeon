"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteAccount } from "@/lib/actions/accounts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AccountForm } from "@/components/forms/account-form";
import { FinancialValue } from "@/components/financial-value";

interface AccountTableProps {
  accounts: Array<{
    id: string;
    account_name: string;
    starting_balance: number;
    current_balance: number;
    phase: "Phase 1" | "Phase 2" | "Funded";
    profit_target: number;
    created_at: string;
  }>;
}

export function AccountTable({ accounts }: AccountTableProps) {
  const [selected, setSelected] = useState<AccountTableProps["accounts"][number] | null>(null);
  const [isPending, startTransition] = useTransition();

  function onDelete(accountId: string) {
    if (!confirm("Delete this trading account?")) {
      return;
    }

    startTransition(async () => {
      await deleteAccount(accountId);
    });
  }

  return (
    <>
      <div className="relative overflow-x-auto rounded-lg border border-border">
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-12 bg-gradient-to-l from-[#0B0E11] to-transparent md:w-8" />
        <Table className="min-w-[600px] sm:min-w-[720px]">
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Name</TableHead>
            <TableHead className="text-xs">Phase</TableHead>
            <TableHead className="text-right text-xs">Starting</TableHead>
            <TableHead className="text-right text-xs">Current</TableHead>
            <TableHead className="text-right text-xs">Target</TableHead>
            <TableHead className="text-right text-xs">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                No accounts yet. Create your first trading account.
              </TableCell>
            </TableRow>
          ) : (
            accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium text-foreground text-xs sm:text-sm">{account.account_name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">{account.phase}</Badge>
                </TableCell>
                <TableCell className="text-right text-xs sm:text-sm">
                  <FinancialValue value={account.starting_balance} />
                </TableCell>
                <TableCell className="text-right text-xs sm:text-sm">
                  <FinancialValue value={account.current_balance} />
                </TableCell>
                <TableCell className="text-right text-gold-bright text-xs sm:text-sm">
                  <FinancialValue value={account.profit_target} />
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelected(account)}>
                        <Pencil className="size-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit account</DialogTitle>
                      </DialogHeader>
                      {selected && (
                        <AccountForm
                          account={{
                            id: selected.id,
                            accountName: selected.account_name,
                            startingBalance: Number(selected.starting_balance),
                            currentBalance: Number(selected.current_balance),
                            phase: selected.phase,
                            profitTarget: Number(selected.profit_target),
                          }}
                          onSaved={() => setSelected(null)}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button variant="destructive" size="sm" disabled={isPending} onClick={() => onDelete(account.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        </Table>
      </div>
    </>
  );
}
