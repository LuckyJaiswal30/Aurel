import { createAdminSupabase } from "@/lib/supabase/admin-client";

export async function consumeUsage(
  limitKey: string,
  action: string,
  windowSeconds: number,
  cost: number,
  maxCount: number,
) {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .rpc("consume_usage", {
      usage_key: limitKey,
      usage_action: action,
      window_seconds: windowSeconds,
      cost,
      max_count: maxCount,
    })
    .single();
  if (error || !data) return { isAllowed: false, resetsAt: null };
  return { isAllowed: data.is_allowed, resetsAt: data.resets_at };
}

export type UsageLimit = {
  key: string;
  windowSeconds: number;
  maxCount: number;
};

export async function consumeUsageTogether(
  action: string,
  limits: UsageLimit[],
  cost: number,
) {
  const { data, error } = await createAdminSupabase()
    .rpc("consume_usage_batch", {
      usage_keys: limits.map((limit) => limit.key),
      usage_action: action,
      window_lengths: limits.map((limit) => limit.windowSeconds),
      cost,
      max_counts: limits.map((limit) => limit.maxCount),
    })
    .single();
  if (error || !data) return { isAllowed: false, deniedIndex: 0 };
  return {
    isAllowed: data.is_allowed,
    deniedIndex: data.denied_index === null ? null : data.denied_index - 1,
  };
}
