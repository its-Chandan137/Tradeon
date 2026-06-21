"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAccount, updateAccount } from "@/lib/actions/accounts";
import { accountSchema, type AccountFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AccountFormProps {
  account?: {
    id: string;
    accountName: string;
    startingBalance: number;
    currentBalance: number;
    phase: "Phase 1" | "Phase 2" | "Funded";
    profitTarget: number;
  } | null;
  onSaved?: () => void;
}

export function AccountForm({ account, onSaved }: AccountFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      accountName: account?.accountName ?? "",
      startingBalance: Number(account?.startingBalance ?? 0),
      currentBalance: Number(account?.currentBalance ?? 0),
      phase: account?.phase ?? "Phase 1",
      profitTarget: Number(account?.profitTarget ?? 0),
    },
  });

  useEffect(() => {
    form.reset({
      accountName: account?.accountName ?? "",
      startingBalance: account?.startingBalance ?? 0,
      currentBalance: account?.currentBalance ?? 0,
      phase: account?.phase ?? "Phase 1",
      profitTarget: account?.profitTarget ?? 0,
    });
  }, [account, form]);

  function onSubmit(values: AccountFormValues) {
    setError(null);
    startTransition(async () => {
      const result = account
        ? await updateAccount(account.id, values)
        : await createAccount(values);

      if (result?.error) {
        setError(result.error);
        return;
      }

      form.reset({
        accountName: "",
        startingBalance: 0,
        currentBalance: 0,
        phase: "Phase 1",
        profitTarget: 0,
      });
      onSaved?.();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="accountName">Account name</Label>
          <Input id="accountName" placeholder="Prop Firm A" {...form.register("accountName")} />
          {form.formState.errors.accountName && (
            <p className="text-sm text-loss">{form.formState.errors.accountName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phase">Phase</Label>
          <Select
            value={form.watch("phase")}
            onValueChange={(value) => form.setValue("phase", value as AccountFormValues["phase"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select phase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Phase 1">Phase 1</SelectItem>
              <SelectItem value="Phase 2">Phase 2</SelectItem>
              <SelectItem value="Funded">Funded</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.phase && (
            <p className="text-sm text-loss">{form.formState.errors.phase.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="startingBalance">Starting balance</Label>
          <Input
            id="startingBalance"
            type="number"
            step="0.01"
            min="0"
            {...form.register("startingBalance", { valueAsNumber: true })}
          />
          {form.formState.errors.startingBalance && (
            <p className="text-sm text-loss">{form.formState.errors.startingBalance.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentBalance">Current balance</Label>
          <Input
            id="currentBalance"
            type="number"
            step="0.01"
            min="0"
            {...form.register("currentBalance", { valueAsNumber: true })}
          />
          {form.formState.errors.currentBalance && (
            <p className="text-sm text-loss">{form.formState.errors.currentBalance.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="profitTarget">Profit target</Label>
          <Input
            id="profitTarget"
            type="number"
            step="0.01"
            min="0"
            {...form.register("profitTarget", { valueAsNumber: true })}
          />
          {form.formState.errors.profitTarget && (
            <p className="text-sm text-loss">{form.formState.errors.profitTarget.message}</p>
          )}
        </div>
      </div>

      {error && <p className="rounded-md border border-loss-muted/40 bg-loss-muted/10 p-3 text-sm text-loss">{error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : account ? "Update account" : "Create account"}
      </Button>
    </form>
  );
}
