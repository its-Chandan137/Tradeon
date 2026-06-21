"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPsychologyEntry } from "@/lib/actions/psychology";
import { psychologySchema, type PsychologyFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const emotions = [
  "Focused",
  "Confident",
  "Calm",
  "Hesitant",
  "Anxious",
  "Frustrated",
  "Greedy",
  "Fearful",
  "Overconfident",
  "Neutral",
];

export function PsychologyForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<PsychologyFormValues>({
    resolver: zodResolver(psychologySchema),
    defaultValues: {
      journalDate: new Date().toISOString().slice(0, 10),
      confidenceLevel: 7,
      emotionBefore: "",
      emotionAfter: "",
      followedSetup: false,
      mistakeMade: null,
      lessonLearned: null,
    },
  });

  function onSubmit(values: PsychologyFormValues) {
    setError(null);
    startTransition(async () => {
      const result = await createPsychologyEntry(values);

      if (result?.error) {
        setError(result.error);
        return;
      }

      form.reset({
        journalDate: new Date().toISOString().slice(0, 10),
        confidenceLevel: 7,
        emotionBefore: "",
        emotionAfter: "",
        followedSetup: false,
        mistakeMade: null,
        lessonLearned: null,
      });
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="journalDate">Journal date</Label>
          <Input id="journalDate" type="date" {...form.register("journalDate")} />
          {form.formState.errors.journalDate && (
            <p className="text-sm text-loss">{form.formState.errors.journalDate.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <Label>Confidence level: {form.watch("confidenceLevel")}/10</Label>
          <Slider
            min={1}
            max={10}
            step={1}
            value={[form.watch("confidenceLevel")]}
            onValueChange={([value]) => form.setValue("confidenceLevel", value)}
          />
          {form.formState.errors.confidenceLevel && (
            <p className="text-sm text-loss">{form.formState.errors.confidenceLevel.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="emotionBefore">Emotion before</Label>
          <Select
            value={form.watch("emotionBefore")}
            onValueChange={(value) => form.setValue("emotionBefore", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select emotion" />
            </SelectTrigger>
            <SelectContent>
              {emotions.map((emotion) => (
                <SelectItem key={emotion} value={emotion}>
                  {emotion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.emotionBefore && (
            <p className="text-sm text-loss">{form.formState.errors.emotionBefore.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="emotionAfter">Emotion after</Label>
          <Select
            value={form.watch("emotionAfter")}
            onValueChange={(value) => form.setValue("emotionAfter", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select emotion" />
            </SelectTrigger>
            <SelectContent>
              {emotions.map((emotion) => (
                <SelectItem key={emotion} value={emotion}>
                  {emotion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.emotionAfter && (
            <p className="text-sm text-loss">{form.formState.errors.emotionAfter.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between rounded-md border border-border bg-surface-raised p-4">
          <div>
            <p className="font-medium">Followed setup</p>
            <p className="text-sm text-muted-foreground">Mark yes only if you executed the planned setup.</p>
          </div>
          <Switch
            checked={form.watch("followedSetup")}
            onCheckedChange={(checked) => form.setValue("followedSetup", checked)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="mistakeMade">Mistake made</Label>
          <Textarea
            id="mistakeMade"
            placeholder="What, if anything, went wrong?"
            {...form.register("mistakeMade")}
          />
          {form.formState.errors.mistakeMade && (
            <p className="text-sm text-loss">{form.formState.errors.mistakeMade.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="lessonLearned">Lesson learned</Label>
          <Textarea
            id="lessonLearned"
            placeholder="What should you reinforce next session?"
            {...form.register("lessonLearned")}
          />
          {form.formState.errors.lessonLearned && (
            <p className="text-sm text-loss">{form.formState.errors.lessonLearned.message}</p>
          )}
        </div>
      </div>

      {error && <p className="rounded-md border border-loss-muted/40 bg-loss-muted/10 p-3 text-sm text-loss">{error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save psychology entry"}
      </Button>
    </form>
  );
}
