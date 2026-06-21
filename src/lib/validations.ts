import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  displayName: z.string().min(1, "Display name is required.").optional(),
});

export const accountSchema = z.object({
  accountName: z.string().min(2, "Account name must be at least 2 characters."),
  startingBalance: z.number().nonnegative("Starting balance must be non-negative."),
  currentBalance: z.number().nonnegative("Current balance must be non-negative."),
  phase: z.enum(["Phase 1", "Phase 2", "Funded"]),
  profitTarget: z.number().nonnegative("Profit target must be non-negative."),
});

export const tradeSchema = z.object({
  tradeDate: z.string(),
  accountId: z.string().uuid("Select an account."),
  instrument: z.string().min(2, "Instrument is required."),
  tradeType: z.enum(["BUY", "SELL"]),
  entryPrice: z.number().positive("Entry price must be positive."),
  exitPrice: z.number().positive("Exit price must be positive."),
  lotSize: z.number().positive("Lot size must be positive."),
  stopLoss: z.number().positive("Stop loss must be positive."),
  takeProfit: z.number().positive("Take profit must be positive."),
  screenshotUrl: z.string().nullable(),
  notes: z.string().max(2000, "Notes must be under 2000 characters.").nullable(),
});

export const psychologySchema = z.object({
  journalDate: z.string(),
  confidenceLevel: z.number().int().min(1).max(10),
  emotionBefore: z.string().min(1, "Emotion before is required."),
  emotionAfter: z.string().min(1, "Emotion after is required."),
  followedSetup: z.boolean(),
  mistakeMade: z.string().max(1000, "Mistake must be under 1000 characters.").nullable(),
  lessonLearned: z.string().max(2000, "Lesson must be under 2000 characters.").nullable(),
});

export type AuthFormValues = z.infer<typeof authSchema>;
export type AccountFormValues = z.infer<typeof accountSchema>;
export type TradeFormValues = z.infer<typeof tradeSchema>;
export type PsychologyFormValues = z.infer<typeof psychologySchema>;
