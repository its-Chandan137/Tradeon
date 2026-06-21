import Link from "next/link";
import { SignupForm } from "@/components/forms/signup-form";

export default function SignupPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0B0E11] px-4 py-12">
      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-gold-bright font-semibold tracking-[0.35em] text-xs uppercase">Tradeon</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Create account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start with a private journal isolated to your Supabase user.
          </p>
        </div>

        <SignupForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-gold-bright hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
