import Link from "next/link";
import { SignupForm } from "@/components/forms/signup-form";

export default function SignupPage() {
  return (
    <main className="grid min-h-screen place-items-center overflow-x-hidden bg-[#0B0E11] px-4 py-12">
      <section className="w-full max-w-md">
        <div className="mb-8 rounded-lg border border-border bg-surface p-6 shadow-terminal sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 grid size-12 place-items-center rounded-lg bg-gold text-[#0B0E11] shadow-glow">
              <span className="font-semibold">T</span>
            </div>
            <p className="text-gold-bright font-semibold tracking-[0.35em] text-xs uppercase">Tradeon</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Create account</h1>
            <p className="mt-2 text-sm text-muted-foreground">Start with a private journal isolated to your Supabase user.</p>
          </div>

          <SignupForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-gold-bright hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
