import Link from "next/link";
import { ArrowRight, BarChart3, BookOpenText, ShieldCheck, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Multi-tenant journal",
    description: "Every row is scoped to your Supabase user with RLS policies protecting account, trade, and psychology data.",
    icon: ShieldCheck,
  },
  {
    title: "Account tracking",
    description: "Track funded and evaluation accounts, balances, phases, and profit target progress.",
    icon: WalletCards,
  },
  {
    title: "Trade execution review",
    description: "Log trades with screenshots, notes, generic P/L calculation, and sortable trade history.",
    icon: BarChart3,
  },
  {
    title: "Psychology journal",
    description: "Capture confidence, emotional state, setup discipline, mistakes, and lessons learned.",
    icon: BookOpenText,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0B0E11]">
      <section className="border-b border-border px-6 py-12 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-gold-bright font-semibold tracking-[0.35em] text-xs uppercase">Tradeon</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            A premium trading journal for disciplined execution.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Track accounts, trades, psychology, and performance analytics in a private multi-user SaaS journal built on Next.js and Supabase.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg">
                Get started
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="mb-3 grid size-10 place-items-center rounded-lg bg-gold text-[#0B0E11]">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
