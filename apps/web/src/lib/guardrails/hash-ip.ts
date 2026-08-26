import { createHmac } from "node:crypto";
import { readServerEnv } from "@/lib/server-env";

export function readClientIp(headers: Headers) {
  if (process.env.TRUST_PROXY_IP_HEADERS !== "true") return null;
  const platformIp = headers.get("x-real-ip")?.trim();
  const forwarded = headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  return platformIp || forwarded || null;
}

export function hashIp(ipAddress: string) {
  return createHmac("sha256", readServerEnv().ipHashSecret)
    .update(ipAddress)
    .digest("hex");
}
