import { createAdminSupabase } from "@/lib/supabase/admin-client";

export type Restrictions = {
  cooldownUntil: string | null;
  dailyLimit: number | null;
  isSuspended: boolean;
};

export type GuardrailEvent = {
  layer: number;
  outcome: "redirected" | "hinted" | "blocked" | "care";
  category: string;
  isStrike: boolean;
};

export async function readRestrictions(
  studentId: string,
): Promise<Restrictions> {
  const { data, error } = await createAdminSupabase()
    .rpc("read_guardrail_state", { student_id: studentId })
    .single();
  if (error || !data) throw new Error("Could not read restrictions");
  return {
    cooldownUntil: data.cooldown_until,
    dailyLimit: data.daily_limit,
    isSuspended: data.is_suspended,
  };
}

export async function recordGuardrailEvent(
  studentId: string,
  event: GuardrailEvent,
) {
  const { data, error } = await createAdminSupabase()
    .rpc("record_guardrail_event", {
      student_id: studentId,
      event_layer: event.layer,
      event_outcome: event.outcome,
      event_category: event.category,
      counts_as_strike: event.isStrike,
    })
    .single();
  if (error || !data) throw new Error("Could not record the guardrail event");
  return {
    strikesToday: data.strikes_today,
    cooldownUntil: data.cooldown_until,
    isSuspended: data.is_suspended,
  };
}
