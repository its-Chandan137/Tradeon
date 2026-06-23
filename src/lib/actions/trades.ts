"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tradeSchema, type TradeFormValues } from "@/lib/validations";
import { calculateGenericProfitLoss } from "@/lib/utils";

export async function createTrade(values: TradeFormValues) {
  const result = tradeSchema.safeParse(values);

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid trade data." };
  }

  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  if (user.error || !user.data.user) {
    return { error: "You must be signed in to log a trade." };
  }

  const account = await supabase
    .from("accounts")
    .select("id")
    .eq("id", result.data.accountId)
    .eq("user_id", user.data.user.id)
    .single();

  if (account.error || !account.data) {
    return { error: "Select a valid account from your accounts." };
  }

  const profitLoss = calculateGenericProfitLoss({
    tradeType: result.data.tradeType,
    entryPrice: result.data.entryPrice,
    exitPrice: result.data.exitPrice,
    lotSize: result.data.lotSize,
    instrument: result.data.instrument,
  });

  const { error } = await supabase.from("trades").insert({
    user_id: user.data.user.id,
    account_id: result.data.accountId,
    trade_date: result.data.tradeDate,
    instrument: result.data.instrument,
    trade_type: result.data.tradeType,
    entry_price: result.data.entryPrice,
    exit_price: result.data.exitPrice,
    lot_size: result.data.lotSize,
    stop_loss: result.data.stopLoss,
    take_profit: result.data.takeProfit,
    profit_loss: profitLoss,
    screenshot_url: result.data.screenshotUrl,
    notes: result.data.notes,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/trades");
  revalidatePath("/dashboard/overview");
  revalidatePath("/dashboard/analytics");

  return { success: true };
}
