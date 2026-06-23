import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-[#0B0E11]",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gold text-[#0B0E11] shadow-sm",
        secondary: "border-border bg-surface-raised text-foreground",
        outline: "text-foreground border-border",
        profit: "border-transparent bg-profit-green/15 text-profit-green",
        loss: "border-transparent bg-loss-muted/20 text-loss",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
