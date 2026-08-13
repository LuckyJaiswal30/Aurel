import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database-types";
import { publicEnv } from "@/lib/public-env";
import { readServerEnv } from "@/lib/server-env";

export function createAdminSupabase() {
  return createClient<Database>(
    publicEnv.supabaseUrl,
    readServerEnv().supabaseSecretKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
