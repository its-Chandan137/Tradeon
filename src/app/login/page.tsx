import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0B0E11] px-4 py-12">
      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-gold-bright font-semibold tracking-[0.35em] text-xs uppercase">Tradeon</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Access your private trading journal.
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to Tradeon?{" "}
          <Link href="/signup" className="text-gold-bright hover:underline">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
