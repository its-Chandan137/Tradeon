"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupAction } from "@/lib/actions/auth";
import { authSchema, type AuthFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLoader } from "@/components/ui/auth-loader";

export function SignupForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showLoader, setShowLoader] = useState(false);
  const router = useRouter();
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
    },
  });

  function onSubmit(values: AuthFormValues) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await signupAction(values);
      if (result?.error) {
        setError(result.error);
        return;
      }

      setMessage(result?.message ?? "Account created. You can sign in now.");
      form.reset();
      setShowLoader(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    });
  }

  return (
    <>
      <AuthLoader show={showLoader} />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            autoComplete="name"
            placeholder="Alex Trader"
            {...form.register("displayName")}
          />
          {form.formState.errors.displayName && (
            <p className="text-sm text-loss">{form.formState.errors.displayName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="trader@example.com"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-loss">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-loss">{form.formState.errors.password.message}</p>
          )}
        </div>

        {error && <p className="rounded-md border border-loss-muted/40 bg-loss-muted/10 p-3 text-sm text-loss">{error}</p>}
        {message && (
          <p className="rounded-md border border-gold-muted/40 bg-gold-muted/10 p-3 text-sm text-gold-bright">
            {message}
          </p>
        )}

        <Button className="w-full" disabled={isPending}>
          {isPending ? "Creating account..." : "Create account"}
        </Button>
      </div>
    </form>
    </>
  );
}
