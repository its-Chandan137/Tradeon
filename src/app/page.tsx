import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  ShieldCheck,
  WalletCards,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Multi-tenant journal",
    description:
      "Every row is scoped to your Supabase user with RLS policies protecting account, trade, and psychology data.",
    icon: ShieldCheck,
  },
  {
    title: "Account tracking",
    description:
      "Track funded and evaluation accounts, balances, phases, and profit target progress at a glance.",
    icon: WalletCards,
  },
  {
    title: "Trade execution review",
    description:
      "Log trades with screenshots, notes, instrument-aware P/L calculation, and sortable trade history.",
    icon: BarChart3,
  },
  {
    title: "Psychology journal",
    description:
      "Capture confidence, emotional state, setup discipline, mistakes, and lessons learned after each session.",
    icon: BookOpenText,
  },
];

const stats = [
  { value: "4", label: "Linked data domains" },
  { value: "100%", label: "Row-level isolated" },
  { value: "Auto", label: "Instrument-aware P/L" },
  { value: "30d", label: "Signed screenshot URLs" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B0E11]">
      <section className="ambient-hero relative border-b border-border/60 px-4 py-16 sm:px-6 md:px-12 md:py-24 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1">
            <span className="size-1.5 animate-pulse rounded-full bg-gold-bright" />
            <p className="text-gold-bright font-semibold tracking-[0.35em] text-[0.65rem] uppercase">
              Tradeon
            </p>
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground md:text-6xl">
            A premium trading journal for{" "}
            <span className="text-gradient-gold">disciplined execution.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            Track accounts, trades, psychology, and performance analytics in a private multi-user
            SaaS journal built on Next.js and Supabase — engineered for traders who treat their
            craft seriously.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Get started
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign in
              </Button>
            </Link>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/70 bg-border/40 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-surface px-5 py-5">
                <dt className="text-gradient-gold text-2xl font-semibold tabular-finance md:text-3xl">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-xs text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 md:px-12 md:py-20 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-gold-bright font-semibold tracking-[0.28em] text-xs uppercase">
                Capabilities
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Everything a serious trader needs to review.
              </h2>
            </div>
            <TrendingUp className="hidden size-7 text-gold/70 md:block" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card key={feature.title} className="card-sheen transition-colors hover:border-gold/40">
                  <CardHeader>
                    <div className="mb-3 grid size-10 place-items-center rounded-lg bg-gold/15 text-gold-bright ring-1 ring-gold/25 transition-colors group-hover:bg-gold group-hover:text-[#0B0E11]">
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
        </div>
      </section>

      <footer className="border-t border-border/60 px-4 py-10 sm:px-6 md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="grid size-7 place-items-center rounded-md bg-gold text-[#0B0E11]">
              <span className="text-xs font-semibold">T</span>
            </div>
            <span>Tradeon · Trading journal</span>
          </div>
          <p>Built with Next.js &amp; Supabase.</p>
        </div>
      </footer>
    </main>
  );
}
