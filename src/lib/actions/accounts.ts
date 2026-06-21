"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { accountSchema, type AccountFormValues } from "@/lib/validations";

export async function createAccount(values: AccountFormValues) {
  const result = accountSchema.safeParse(values);

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid account data." };
  }

  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  if (user.error || !user.data.user) {
    return { error: "You must be signed in to create an account." };
  }

  const { error } = await supabase.from("accounts").insert({
    user_id: user.data.user.id,
    account_name: result.data.accountName,
    starting_balance: result.data.startingBalance,
    current_balance: result.data.currentBalance,
    phase: result.data.phase,
    profit_target: result.data.profitTarget,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/overview");

  return { success: true };
}

export async function updateAccount(
  accountId: string,
  values: AccountFormValues,
) {
  const result = accountSchema.safeParse(values);

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid account data." };
  }

  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  if (user.error || !user.data.user) {
    return { error: "You must be signed in to update an account." };
  }

  const { error } = await supabase
    .from("accounts")
    .update({
      account_name: result.data.accountName,
      starting_balance: result.data.startingBalance,
      current_balance: result.data.currentBalance,
      phase: result.data.phase,
      profit_target: result.data.profitTarget,
    })
    .eq("id", accountId)
    .eq("user_id", user.data.user.id)
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/overview");

  return { success: true };
}

export async function deleteAccount(accountId: string) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  if (user.error || !user.data.user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", accountId)
    .eq("user_id", user.data.user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/overview");

  return { success: true };
}
