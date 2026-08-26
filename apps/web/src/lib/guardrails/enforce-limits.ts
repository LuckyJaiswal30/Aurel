import { readRestrictions } from "@/lib/db/guardrails";
import { consumeUsageTogether, type UsageLimit } from "@/lib/db/usage";
import { guardMessages } from "./guard-messages";
import { hashIp } from "./hash-ip";

const questionAction = "chat_message";
const minute = 60;
const day = 86_400;
const limits = {
  studentPerMinute: 6,
  studentPerDay: 150,
  ipPerMinute: 20,
  ipPerDay: 600,
};

export type LimitResult =
  { isAllowed: true } | { isAllowed: false; message: string };

function minutesUntil(isoTime: string) {
  return Math.max(1, Math.ceil((Date.parse(isoTime) - Date.now()) / 60_000));
}

function questionLimits(
  studentId: string,
  ipAddress: string | null,
  dailyLimit: number,
): UsageLimit[] {
  const studentKey = `user:${studentId}`;
  const studentLimits = [
    {
      key: studentKey,
      windowSeconds: minute,
      maxCount: limits.studentPerMinute,
    },
    { key: studentKey, windowSeconds: day, maxCount: dailyLimit },
  ];
  if (!ipAddress) return studentLimits;
  const ipKey = `ip:${hashIp(ipAddress)}`;
  return [
    ...studentLimits,
    { key: ipKey, windowSeconds: minute, maxCount: limits.ipPerMinute },
    { key: ipKey, windowSeconds: day, maxCount: limits.ipPerDay },
  ];
}

export async function enforceLimits(
  studentId: string,
  ipAddress: string | null,
): Promise<LimitResult> {
  const restrictions = await readRestrictions(studentId);
  if (restrictions.isSuspended)
    return { isAllowed: false, message: guardMessages.suspended };
  if (
    restrictions.cooldownUntil &&
    Date.parse(restrictions.cooldownUntil) > Date.now()
  )
    return {
      isAllowed: false,
      message: guardMessages.cooldown(minutesUntil(restrictions.cooldownUntil)),
    };

  const usageLimits = questionLimits(
    studentId,
    ipAddress,
    restrictions.dailyLimit ?? limits.studentPerDay,
  );
  const usage = await consumeUsageTogether(questionAction, usageLimits, 1);
  if (usage.isAllowed) return { isAllowed: true };
  const denied = usageLimits[usage.deniedIndex ?? 0];
  return {
    isAllowed: false,
    message:
      denied?.windowSeconds === minute
        ? guardMessages.tooFast
        : guardMessages.dailyLimit,
  };
}

export async function chargeExtraForMisuse(studentId: string) {
  await consumeUsageTogether(
    questionAction,
    [
      {
        key: `user:${studentId}`,
        windowSeconds: day,
        maxCount: limits.studentPerDay * 2,
      },
    ],
    2,
  );
}
