"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useWatch, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X, Loader2, Sparkles, Check } from "lucide-react";
import Tesseract from "tesseract.js";
import { createTrade } from "@/lib/actions/trades";
import { createClient } from "@/lib/supabase/client";
import { calculateGenericProfitLoss, calculateRiskReward, formatCurrency, getInstrumentMultiplier, cn } from "@/lib/utils";
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

function hasNumber(value: number | undefined) {
  return Number.isFinite(value) && value !== 0;
}

function isUsingDefaultMultiplier(instrument: string | undefined) {
  if (!instrument) {
    return false;
  }

  const normalizedInstrument = instrument.trim().toUpperCase();
  const knownDefaultForexInstruments = ["EURUSD", "GBPUSD", "USDJPY", "EURJPY", "GBPJPY",
    "AUDUSD", "USDCAD", "NZDUSD", "EURGBP", "EURCHF", "GBPCHF", "USDCHF",
    "AUDJPY", "CADJPY", "CHFJPY", "NZDJPY", "AUDNZD", "EURAUD", "EURNZD", "GBPAUD", "GBPNZD"];

  const { multiplier } = getInstrumentMultiplier(normalizedInstrument);
  return multiplier === 100000 && !knownDefaultForexInstruments.includes(normalizedInstrument);
}

export function TradeForm({ accounts }: TradeFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [screenshotPreviewUrl, setScreenshotPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [knownInstruments, setKnownInstruments] = useState(commonInstruments);
  const [customInstrument, setCustomInstrument] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedFields, setExtractedFields] = useState<Set<string>>(new Set());
  const [extractionSummary, setExtractionSummary] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "uploading" | "saving" | "success">("idle");

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

  const accountId = useWatch({ control: form.control, name: "accountId" });
  const instrument = useWatch({ control: form.control, name: "instrument" }) ?? customInstrument;
  const tradeType = useWatch({ control: form.control, name: "tradeType" }) as TradeFormValues["tradeType"];
  const entryPrice = useWatch({ control: form.control, name: "entryPrice" });
  const exitPrice = useWatch({ control: form.control, name: "exitPrice" });
  const lotSize = useWatch({ control: form.control, name: "lotSize" });
  const stopLoss = useWatch({ control: form.control, name: "stopLoss" });
  const takeProfit = useWatch({ control: form.control, name: "takeProfit" });
  const liveProfitLoss = useMemo(() => {
    if (!instrument || !hasNumber(entryPrice) || !hasNumber(exitPrice) || !hasNumber(lotSize)) {
      return null;
    }

    return calculateGenericProfitLoss({
      tradeType,
      entryPrice,
      exitPrice,
      lotSize,
      instrument,
    });
  }, [entryPrice, exitPrice, instrument, lotSize, tradeType]);

  const riskRewardPreview = useMemo(() => {
    const numericEntryPrice = Number(entryPrice);
    const numericStopLoss = Number(stopLoss);
    const numericTakeProfit = Number(takeProfit);

    if (!hasNumber(numericEntryPrice) ||
      !hasNumber(numericStopLoss) ||
      !hasNumber(numericTakeProfit) ||
      !hasNumber(lotSize) ||
      !instrument
    ) {
      return null;
    }

    const riskReward = calculateRiskReward({
      tradeType,
      entryPrice: numericEntryPrice,
      stopLoss: numericStopLoss,
      takeProfit: numericTakeProfit,
    });

    if (riskReward === null) {
      return null;
    }

    const multiplierData = getInstrumentMultiplier(instrument);
    const multiplier = multiplierData.multiplier;
    const riskDistance = tradeType === "BUY" ? numericEntryPrice - numericStopLoss : numericStopLoss - numericEntryPrice;
    const rewardDistance = tradeType === "BUY" ? numericTakeProfit - numericEntryPrice : numericEntryPrice - numericTakeProfit;

    if (!Number.isFinite(riskDistance) || !Number.isFinite(rewardDistance)) {
      return null;
    }

    return {
      riskReward,
      risk: Number((riskDistance * lotSize * multiplier).toFixed(2)),
      reward: Number((rewardDistance * lotSize * multiplier).toFixed(2)),
    };
  }, [entryPrice, instrument, lotSize, stopLoss, takeProfit, tradeType]);

  useEffect(() => {
    if (!knownInstruments.includes(customInstrument)) {
      form.setValue("instrument", customInstrument);
    }
  }, [customInstrument, form, knownInstruments]);

  useEffect(() => {
    return () => {
      if (screenshotPreviewUrl) {
        URL.revokeObjectURL(screenshotPreviewUrl);
      }
    };
  }, [screenshotPreviewUrl]);

  async function uploadScreenshotToDrive(file: File, userId: string, instrument: string, tradeType: string, tradeDate: string): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);
      formData.append("instrument", instrument);
      formData.append("tradeType", tradeType);
      formData.append("tradeDate", tradeDate);

      const response = await fetch("/api/upload-screenshot", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        console.warn("Google Drive upload failed:", error.error);
        return null;
      }

      const data = await response.json();
      return data.screenshotUrl;
    } catch (error) {
      console.warn("Google Drive upload error:", error);
      return null;
    }
  }

  async function uploadScreenshotToSupabase(file: File): Promise<string> {
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

    return data.signedUrl;
  }

  function handleScreenshotChange(file: File | undefined) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (screenshotPreviewUrl) {
      URL.revokeObjectURL(screenshotPreviewUrl);
    }

    setScreenshotFile(file);
    setScreenshotPreviewUrl(URL.createObjectURL(file));
    setScreenshotName(file.name);
    setError(null);
  }

  function removeScreenshot() {
    setScreenshotFile(null);
    form.setValue("screenshotUrl", null);
    setScreenshotName(null);
    setExtractedFields(new Set());
    setExtractionSummary(null);

    if (screenshotPreviewUrl) {
      URL.revokeObjectURL(screenshotPreviewUrl);
      setScreenshotPreviewUrl(null);
    }
  }

  async function extractDataFromScreenshot() {
    if (!screenshotFile) return;

    setIsExtracting(true);
    setExtractionSummary(null);

    try {
      // PHASE 3: Replace Tesseract.js with a vision model API call (e.g. Claude vision) for higher accuracy extraction.
      const result = await Tesseract.recognize(screenshotFile, "eng", {
        logger: (m) => console.log(m),
      });

      const text = result.data.text;
      console.log("OCR Result:", text);

      const extracted = new Set<string>();

      // Extract instrument (known pairs)
      const instrumentPattern = /\b(EURUSD|GBPUSD|USDJPY|XAUUSD|US30|NAS100|BTCUSD|ETHUSD|EURJPY|GBPJPY|AUDUSD|USDCAD|NZDUSD|EURGBP|EURCHF|GBPCHF|USDCHF|AUDJPY|CADJPY|CHFJPY|NZDJPY|AUDNZD|EURAUD|EURNZD|GBPAUD|GBPNZD)\b/i;
      const instrumentMatch = text.match(instrumentPattern);
      if (instrumentMatch) {
        form.setValue("instrument", instrumentMatch[0].toUpperCase());
        extracted.add("instrument");
      }

      // Extract trade type
      const buyMatch = text.match(/\bBUY\b/i);
      const sellMatch = text.match(/\bSELL\b/i);
      if (buyMatch && !sellMatch) {
        form.setValue("tradeType", "BUY");
        extracted.add("tradeType");
      } else if (sellMatch && !buyMatch) {
        form.setValue("tradeType", "SELL");
        extracted.add("tradeType");
      }

      // Extract entry price
      const entryPattern = /(?:Entry|Open|Price)\s*[:\s]*([\d.]+)/i;
      const entryMatch = text.match(entryPattern);
      if (entryMatch) {
        form.setValue("entryPrice", parseFloat(entryMatch[1]));
        extracted.add("entryPrice");
      }

      // Extract exit price
      const exitPattern = /(?:Close|Exit|TP Hit|SL Hit)\s*[:\s]*([\d.]+)/i;
      const exitMatch = text.match(exitPattern);
      if (exitMatch) {
        form.setValue("exitPrice", parseFloat(exitMatch[1]));
        extracted.add("exitPrice");
      }

      // Extract stop loss
      const slPattern = /(?:SL|Stop Loss)\s*[:\s]*([\d.]+)/i;
      const slMatch = text.match(slPattern);
      if (slMatch) {
        form.setValue("stopLoss", parseFloat(slMatch[1]));
        extracted.add("stopLoss");
      }

      // Extract take profit
      const tpPattern = /(?:TP|Take Profit)\s*[:\s]*([\d.]+)/i;
      const tpMatch = text.match(tpPattern);
      if (tpMatch) {
        form.setValue("takeProfit", parseFloat(tpMatch[1]));
        extracted.add("takeProfit");
      }

      // Extract lot size
      const lotPattern = /(?:Lots|Volume|Size)\s*[:\s]*([\d.]+)/i;
      const lotMatch = text.match(lotPattern);
      if (lotMatch) {
        form.setValue("lotSize", parseFloat(lotMatch[1]));
        extracted.add("lotSize");
      }

      setExtractedFields(extracted);
      setExtractionSummary(`Extracted ${extracted.size} of 7 fields — please review and complete the rest.`);
    } catch (error) {
      console.error("OCR extraction error:", error);
      setError("Failed to extract data from screenshot.");
    } finally {
      setIsExtracting(false);
    }
  }

  async function onSubmit(values: TradeFormValues) {
    setError(null);
    
    try {
      let screenshotUrl = values.screenshotUrl;

      // Upload screenshot if present
      if (screenshotFile) {
        setSubmitState("uploading");
        const supabase = createClient();
        const user = await supabase.auth.getUser();

        if (!user.error && user.data.user) {
          // Try Google Drive first
          const driveUrl = await uploadScreenshotToDrive(
            screenshotFile,
            user.data.user.id,
            values.instrument,
            values.tradeType,
            values.tradeDate
          );

          if (driveUrl) {
            screenshotUrl = driveUrl;
          } else {
            // Fallback to Supabase Storage
            console.warn("Google Drive upload failed, falling back to Supabase Storage");
            screenshotUrl = await uploadScreenshotToSupabase(screenshotFile);
          }
        }
      }

      // Create trade with screenshot URL
      setSubmitState("saving");
      const result = await createTrade({ ...values, screenshotUrl });

      if (result?.error) {
        setError(result.error);
        setSubmitState("idle");
        return;
      }

      // Success state
      setSubmitState("success");
      
      // Send email notification in background (don't await to avoid blocking)
      const supabase = createClient();
      const user = await supabase.auth.getUser();
      if (!user.error && user.data.user?.email) {
        fetch("/api/send-trade-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: user.data.user.email,
            trade: {
              instrument: values.instrument,
              trade_type: values.tradeType,
              entry_price: values.entryPrice,
              exit_price: values.exitPrice,
              lot_size: values.lotSize,
              profit_loss: calculateGenericProfitLoss({
                tradeType: values.tradeType,
                entryPrice: values.entryPrice,
                exitPrice: values.exitPrice,
                lotSize: values.lotSize,
                instrument: values.instrument,
              }),
              trade_date: values.tradeDate,
              screenshot_url: screenshotUrl,
              notes: values.notes,
            },
          }),
        }).catch((err) => {
          // Silent failure - don't show error to user
          console.error("Email send failed:", err);
        });
      }

      // Reset form after success delay
      setTimeout(() => {
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
        setScreenshotFile(null);
        setScreenshotName(null);
        setScreenshotPreviewUrl(null);
        setCustomInstrument("");
        setExtractedFields(new Set());
        setExtractionSummary(null);
        setSubmitState("idle");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save trade");
      setSubmitState("idle");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {/* Screenshot upload moved to the top as a prominent focal point */}
      <div className="rounded-lg border border-border bg-surface-raised p-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Label className="text-sm sm:text-base">Trade screenshot</Label>
            <p className="text-xs sm:text-sm text-muted-foreground">Attach the execution screenshot before logging the trade.</p>
          </div>
          {screenshotName && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="w-fit gap-2">
                <span className="max-w-48 truncate">{screenshotName}</span>
                <button
                  type="button"
                  onClick={removeScreenshot}
                  className="rounded-full p-1 hover:bg-surface-muted transition-colors"
                  aria-label="Remove screenshot"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            </div>
          )}
        </div>

        <label
          htmlFor="screenshot"
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleScreenshotChange(event.dataTransfer.files?.[0]);
          }}
          onClick={() => {
            const fileInput = document.getElementById('screenshot') as HTMLInputElement;
            fileInput?.click();
          }}
          className={`cursor-pointer ${cnDropzone(isDragging)} transition-all duration-200 ${screenshotPreviewUrl ? 'ring-2 ring-gold/50' : ''}`}
        >
          <input
            id="screenshot"
            className="sr-only"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => handleScreenshotChange(event.target.files?.[0])}
          />
          {screenshotPreviewUrl ? (
            <div className="relative w-full group">
              <img
                src={screenshotPreviewUrl}
                alt="Selected trade screenshot preview"
                className="h-64 w-full rounded-lg object-contain bg-surface-muted p-2 transition-transform duration-200 group-hover:scale-[1.02]"
              />
              <div className="pointer-events-none absolute inset-0 rounded-lg border border-gold/40" />
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
              <div className="grid size-16 place-items-center rounded-full border-2 border-dashed border-gold/40 bg-gold/10 text-gold-bright transition-colors duration-200">
                <Upload className="size-8" />
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg text-foreground">Drag & Drop your screenshot here</p>
                <p className="text-sm sm:text-base text-muted-foreground">or click anywhere in this zone to choose a PNG, JPG, or WebP image</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-green-500"></span>
                  Large preview area
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-blue-500"></span>
                  Click anywhere to browse
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground italic">⚠️ Note: No OCR or auto-data extraction implemented yet. Image is uploaded as-is to storage.</p>
            </div>
          )}
        </label>

        {screenshotPreviewUrl && (
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={extractDataFromScreenshot}
              disabled={isExtracting}
              className="gap-2 text-sm"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Extract data from screenshot
                </>
              )}
            </Button>
          </div>
        )}

        {extractionSummary && (
          <div className="mt-3 rounded-md border border-gold/40 bg-gold/10 p-3 text-xs sm:text-sm text-gold-bright">
            {extractionSummary}
          </div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="tradeDate" className="text-sm">Trade date</Label>
          <Input id="tradeDate" type="date" {...form.register("tradeDate")} className="text-sm" />
          {form.formState.errors.tradeDate && (
            <p className="text-sm text-loss">{form.formState.errors.tradeDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="instrument" className="text-sm">Instrument</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Select value={instrument ?? ""} onValueChange={(value) => form.setValue("instrument", value)}>
                <SelectTrigger className={extractedFields.has("instrument") ? "border-amber-500 ring-1 ring-amber-500" : ""}>
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
              {extractedFields.has("instrument") && (
                <Badge className="absolute -top-2 -right-2 z-10 bg-amber-500 text-xs">Auto-filled</Badge>
              )}
            </div>
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
            className="text-sm"
          />
          {form.formState.errors.instrument && (
            <p className="text-sm text-loss">{form.formState.errors.instrument.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tradeType" className="text-sm">Trade type</Label>
          <div className="relative">
            <Select
              value={tradeType}
              onValueChange={(value) => form.setValue("tradeType", value as "BUY" | "SELL")}
            >
              <SelectTrigger className={extractedFields.has("tradeType") ? "border-amber-500 ring-1 ring-amber-500" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUY">BUY</SelectItem>
                <SelectItem value="SELL">SELL</SelectItem>
              </SelectContent>
            </Select>
            {extractedFields.has("tradeType") && (
              <Badge className="absolute -top-2 -right-2 z-10 bg-amber-500 text-xs">Auto-filled</Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="entryPrice" className="text-sm">Entry price</Label>
          <div className="relative">
            <Input
              id="entryPrice"
              type="number"
              step="0.000001"
              {...form.register("entryPrice", { valueAsNumber: true })}
              className={extractedFields.has("entryPrice") ? "border-amber-500 ring-1 ring-amber-500" : "text-sm"}
            />
            {extractedFields.has("entryPrice") && (
              <Badge className="absolute -top-2 -right-2 z-10 bg-amber-500 text-xs">Auto-filled</Badge>
            )}
          </div>
          {form.formState.errors.entryPrice && (
            <p className="text-sm text-loss">{form.formState.errors.entryPrice.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="exitPrice" className="text-sm">Exit price</Label>
          <div className="relative">
            <Input
              id="exitPrice"
              type="number"
              step="0.000001"
              {...form.register("exitPrice", { valueAsNumber: true })}
              className={extractedFields.has("exitPrice") ? "border-amber-500 ring-1 ring-amber-500" : "text-sm"}
            />
            {extractedFields.has("exitPrice") && (
              <Badge className="absolute -top-2 -right-2 z-10 bg-amber-500 text-xs">Auto-filled</Badge>
            )}
          </div>
          {form.formState.errors.exitPrice && (
            <p className="text-sm text-loss">{form.formState.errors.exitPrice.message}</p>
          )}
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="notes" className="text-sm">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Setup, execution notes, market context..."
            {...form.register("notes")}
            className="text-sm"
          />
          {form.formState.errors.notes && (
            <p className="text-sm text-loss">{form.formState.errors.notes.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lotSize" className="text-sm">Lot size</Label>
          <div className="relative">
            <Input
              id="lotSize"
              type="number"
              step="0.000001"
              {...form.register("lotSize", { valueAsNumber: true })}
              className={extractedFields.has("lotSize") ? "border-amber-500 ring-1 ring-amber-500" : "text-sm"}
            />
            {extractedFields.has("lotSize") && (
              <Badge className="absolute -top-2 -right-2 z-10 bg-amber-500 text-xs">Auto-filled</Badge>
            )}
          </div>
          {form.formState.errors.lotSize && (
            <p className="text-sm text-loss">{form.formState.errors.lotSize.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stopLoss" className="text-sm">Stop loss</Label>
          <div className="relative">
            <Input
              id="stopLoss"
              type="number"
              step="0.000001"
              {...form.register("stopLoss", { valueAsNumber: true })}
              className={extractedFields.has("stopLoss") ? "border-amber-500 ring-1 ring-amber-500" : "text-sm"}
            />
            {extractedFields.has("stopLoss") && (
              <Badge className="absolute -top-2 -right-2 z-10 bg-amber-500 text-xs">Auto-filled</Badge>
            )}
          </div>
          {form.formState.errors.stopLoss && (
            <p className="text-sm text-loss">{form.formState.errors.stopLoss.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="takeProfit" className="text-sm">Take profit</Label>
          <div className="relative">
            <Input
              id="takeProfit"
              type="number"
              step="0.000001"
              {...form.register("takeProfit", { valueAsNumber: true })}
              className={extractedFields.has("takeProfit") ? "border-amber-500 ring-1 ring-amber-500" : "text-sm"}
            />
            {extractedFields.has("takeProfit") && (
              <Badge className="absolute -top-2 -right-2 z-10 bg-amber-500 text-xs">Auto-filled</Badge>
            )}
          </div>
          {form.formState.errors.takeProfit && (
            <p className="text-sm text-loss">{form.formState.errors.takeProfit.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface-raised p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Live P/L preview</p>
              <p className="tabular-finance text-xl font-semibold text-gold-bright sm:text-2xl">
                {liveProfitLoss === null ? "—" : formatCurrency(liveProfitLoss)}
              </p>
            </div>
            {isUsingDefaultMultiplier(instrument) && (
              <p className="text-[10px] text-muted-foreground hidden sm:block">Using default forex multiplier — verify for this instrument</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface-raised p-4">
          <div>
            <p className="text-xs text-muted-foreground">Live risk/reward</p>
            <p className="tabular-finance text-xl font-semibold text-gold-bright sm:text-2xl">
              {riskRewardPreview === null ? "—" : `${riskRewardPreview.riskReward.toFixed(2)}R`}
            </p>
          </div>
        </div>
      </div>

      {error && <p className="rounded-md border border-loss-muted/40 bg-loss-muted/10 p-3 text-xs sm:text-sm text-loss">{error}</p>}

      <Button 
        type="submit" 
        disabled={submitState !== "idle" || accounts.length === 0} 
        className={cn(
          "w-full sm:w-auto text-sm",
          submitState === "success" && "bg-green-600 hover:bg-green-700"
        )}
      >
        {submitState === "uploading" && (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Uploading screenshot...
          </>
        )}
        {submitState === "saving" && (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Saving trade...
          </>
        )}
        {submitState === "success" && (
          <>
            <Check className="mr-2 size-4" />
            Trade saved ✓
          </>
        )}
        {submitState === "idle" && "Log trade"}
      </Button>
    </form>
  );
}

function cnDropzone(isDragging: boolean) {
  return [
    "mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-[#0B0E11] p-4 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E11]",
    isDragging ? "border-gold-bright bg-gold/10" : "border-border hover:border-gold/70 hover:bg-gold/5",
  ].join(" ");
}