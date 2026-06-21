"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { authSchema, type AuthFormValues } from "@/lib/validations";

export async function loginAction(values: AuthFormValues) {
  const result = authSchema.safeParse(values);

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid form data." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard/overview");
}

export async function signupAction(values: AuthFormValues) {
  const result = authSchema.safeParse(values);

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid form data." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        display_name: result.data.displayName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message:
      "Account created. Check your email to confirm your address, then sign in.",
  };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
