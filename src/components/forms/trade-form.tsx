"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTrade } from "@/lib/actions/trades";
import { createClient } from "@/lib/supabase/client";
import { calculateRiskReward } from "@/lib/utils";
import { tradeSchema, type TradeFormValues } from "@/lib/validations";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const commonInstruments = ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD", "US30", "NAS100", "BTCUSD", "ETHUSD"];

interface TradeFormProps {
  accounts: Array<{
    id: string;
    account_name: string;
  }>;
}

export function TradeForm({ accounts }: TradeFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [knownInstruments, setKnownInstruments] = useState(commonInstruments);
  const [customInstrument, setCustomInstrument] = useState("");

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      tradeDate: new Date().toISOString().slice(0, 10),
      accountId: "",
      instrument: "",
      tradeType: "BUY",
      entryPrice: undefined,
      exitPrice: undefined,
      lotSize: undefined,
      stopLoss: undefined,
      takeProfit: undefined,
      screenshotUrl: null,
      notes: null,
    },
  });

  const watch = form.watch();
  const riskReward = useMemo(() => {
    const entryPrice = Number(watch.entryPrice);
    const stopLoss = Number(watch.stopLoss);
    const takeProfit = Number(watch.takeProfit);

    if (!entryPrice || !stopLoss || !takeProfit) {
      return null;
    }

    return calculateRiskReward({
      tradeType: watch.tradeType,
      entryPrice,
      stopLoss,
      takeProfit,
    });
  }, [watch.entryPrice, watch.stopLoss, watch.takeProfit, watch.tradeType]);

  useEffect(() => {
    if (!knownInstruments.includes(customInstrument)) {
      form.setValue("instrument", customInstrument);
    }
  }, [customInstrument, form, knownInstruments]);

  async function uploadScreenshot(file: File) {
    const supabase = createClient();
    const user = await supabase.auth.getUser();

    if (user.error || !user.data.user) {
      throw new Error("You must be signed in to upload a screenshot.");
    }

    const extension = file.name.split(".").pop() ?? "png";
    const path = `${user.data.user.id}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("trade-screenshots")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data, error: signedUrlError } = await supabase.storage
      .from("trade-screenshots")
      .createSignedUrl(path, 60 * 60 * 24 * 30);

    if (signedUrlError) {
      throw signedUrlError;
    }

    form.setValue("screenshotUrl", data.signedUrl);
  }

  function onSubmit(values: TradeFormValues) {
    setError(null);
    startTransition(async () => {
      const result = await createTrade(values);

      if (result?.error) {
        setError(result.error);
        return;
      }

      form.reset({
        tradeDate: new Date().toISOString().slice(0, 10),
        accountId: "",
        instrument: "",
        tradeType: "BUY",
        entryPrice: undefined,
        exitPrice: undefined,
        lotSize: undefined,
        stopLoss: undefined,
        takeProfit: undefined,
        screenshotUrl: null,
        notes: null,
      });
      setScreenshotName(null);
      setCustomInstrument("");
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tradeDate">Trade date</Label>
          <Input id="tradeDate" type="date" {...form.register("tradeDate")} />
          {form.formState.errors.tradeDate && (
            <p className="text-sm text-loss">{form.formState.errors.tradeDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountId">Account</Label>
          <Select value={form.watch("accountId")} onValueChange={(value) => form.setValue("accountId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.account_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.accountId && (
            <p className="text-sm text-loss">{form.formState.errors.accountId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tradeType">Trade type</Label>
          <Select
            value={form.watch("tradeType")}
            onValueChange={(value) => form.setValue("tradeType", value as "BUY" | "SELL")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BUY">BUY</SelectItem>
              <SelectItem value="SELL">SELL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instrument">Instrument</Label>
          <div className="flex gap-2">
            <Select value={form.watch("instrument")} onValueChange={(value) => form.setValue("instrument", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select instrument" />
              </SelectTrigger>
              <SelectContent>
                {knownInstruments.map((instrument) => (
                  <SelectItem key={instrument} value={instrument}>
                    {instrument}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              disabled={!customInstrument}
              onClick={() => {
                if (!knownInstruments.includes(customInstrument)) {
                  setKnownInstruments((items) => [...items, customInstrument]);
                }
                form.setValue("instrument", customInstrument);
                setCustomInstrument("");
              }}
            >
              Add
            </Button>
          </div>
          <Input
            value={customInstrument}
            onChange={(event) => setCustomInstrument(event.target.value.toUpperCase())}
            placeholder="Add new"
          />
          {form.formState.errors.instrument && (
            <p className="text-sm text-loss">{form.formState.errors.instrument.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="entryPrice">Entry price</Label>
          <Input
            id="entryPrice"
            type="number"
            step="0.000001"
            {...form.register("entryPrice", { valueAsNumber: true })}
          />
          {form.formState.errors.entryPrice && (
            <p className="text-sm text-loss">{form.formState.errors.entryPrice.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="exitPrice">Exit price</Label>
          <Input
            id="exitPrice"
            type="number"
            step="0.000001"
            {...form.register("exitPrice", { valueAsNumber: true })}
          />
          {form.formState.errors.exitPrice && (
            <p className="text-sm text-loss">{form.formState.errors.exitPrice.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lotSize">Lot size</Label>
          <Input
            id="lotSize"
            type="number"
            step="0.000001"
            {...form.register("lotSize", { valueAsNumber: true })}
          />
          {form.formState.errors.lotSize && (
            <p className="text-sm text-loss">{form.formState.errors.lotSize.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stopLoss">Stop loss</Label>
          <Input
            id="stopLoss"
            type="number"
            step="0.000001"
            {...form.register("stopLoss", { valueAsNumber: true })}
          />
          {form.formState.errors.stopLoss && (
            <p className="text-sm text-loss">{form.formState.errors.stopLoss.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="takeProfit">Take profit</Label>
          <Input
            id="takeProfit"
            type="number"
            step="0.000001"
            {...form.register("takeProfit", { valueAsNumber: true })}
          />
          {form.formState.errors.takeProfit && (
            <p className="text-sm text-loss">{form.formState.errors.takeProfit.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="screenshot">Screenshot</Label>
          <Input
            id="screenshot"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }

              setIsUploading(true);
              setError(null);

              try {
                await uploadScreenshot(file);
                setScreenshotName(file.name);
              } catch (uploadError) {
                setError(uploadError instanceof Error ? uploadError.message : "Screenshot upload failed.");
              } finally {
                setIsUploading(false);
              }
            }}
          />
          {screenshotName && (
            <Badge variant="secondary" className="mt-2">
              {screenshotName}
            </Badge>
          )}
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Setup, execution notes, market context..."
            {...form.register("notes")}
          />
          {form.formState.errors.notes && (
            <p className="text-sm text-loss">{form.formState.errors.notes.message}</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface-raised p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Live risk/reward</p>
            <p className="tabular-finance text-2xl font-semibold text-gold-bright">
              {riskReward === null ? "—" : `${riskReward.toFixed(2)}R`}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Formula: BUY {(watch.takeProfit ?? 0)} − entry ÷ entry − SL · SELL inverse
          </div>
        </div>
      </div>

      {error && <p className="rounded-md border border-loss-muted/40 bg-loss-muted/10 p-3 text-sm text-loss">{error}</p>}

      <Button type="submit" disabled={isPending || isUploading || accounts.length === 0}>
        {isPending ? "Saving trade..." : isUploading ? "Uploading screenshot..." : "Log trade"}
      </Button>
    </form>
  );
}
