"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { psychologySchema, type PsychologyFormValues } from "@/lib/validations";

export async function createPsychologyEntry(values: PsychologyFormValues) {
  const result = psychologySchema.safeParse(values);

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid psychology entry." };
  }

  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  if (user.error || !user.data.user) {
    return { error: "You must be signed in to log a psychology entry." };
  }

  const { error } = await supabase.from("psychology_journal").insert({
    user_id: user.data.user.id,
    journal_date: result.data.journalDate,
    confidence_level: result.data.confidenceLevel,
    emotion_before: result.data.emotionBefore,
    emotion_after: result.data.emotionAfter,
    followed_setup: result.data.followedSetup,
    mistake_made: result.data.mistakeMade,
    lesson_learned: result.data.lessonLearned,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/psychology");
  revalidatePath("/dashboard/analytics");

  return { success: true };
}
