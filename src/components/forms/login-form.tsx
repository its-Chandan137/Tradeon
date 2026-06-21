"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginAction } from "@/lib/actions/auth";
import { authSchema, type AuthFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: AuthFormValues) {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(values);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-lg border border-border bg-surface p-6 shadow-terminal">
      <div className="space-y-4">
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
            autoComplete="current-password"
            placeholder="••••••••"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-loss">{form.formState.errors.password.message}</p>
          )}
        </div>

        {error && <p className="rounded-md border border-loss-muted/40 bg-loss-muted/10 p-3 text-sm text-loss">{error}</p>}

        <Button className="w-full" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </div>
    </form>
  );
}
