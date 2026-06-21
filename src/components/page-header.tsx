interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
      <div>
        <p className="text-gold-bright font-semibold tracking-[0.28em] text-xs uppercase">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
