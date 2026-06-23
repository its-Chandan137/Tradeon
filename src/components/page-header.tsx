interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8 flex flex-col justify-between gap-3 sm:gap-4 border-b border-border/70 pb-5 sm:pb-7 animate-fade-in-up md:flex-row md:items-end">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-gold-bright shadow-[0_0_12px_2px_rgba(240,180,41,0.6)]" />
          <p className="text-gold-bright font-semibold tracking-[0.28em] text-[10px] sm:text-xs uppercase">{eyebrow}</p>
        </div>
        <h1 className="mt-2 sm:mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-[2rem]">{title}</h1>
        <p className="mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
