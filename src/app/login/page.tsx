import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center overflow-x-hidden bg-[#0B0E11] px-4 py-12">
      <section className="w-full max-w-md">
        <div className="mb-8 rounded-lg border border-border bg-surface p-6 shadow-terminal sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 grid size-12 place-items-center rounded-lg bg-gold text-[#0B0E11] shadow-glow">
              <span className="font-semibold">T</span>
            </div>
            <p className="text-gold-bright font-semibold tracking-[0.35em] text-xs uppercase">Tradeon</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Sign in</h1>
            <p className="mt-2 text-sm text-muted-foreground">Access your private trading journal.</p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to Tradeon?{" "}
            <Link href="/signup" className="text-gold-bright hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
