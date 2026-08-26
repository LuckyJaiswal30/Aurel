export const guardMessages = {
  suspended:
    "Your account is paused because of repeated attempts to misuse the tutor. If this is a mistake, contact the person who gave you access.",
  cooldown: (minutes: number) =>
    `Let's take a short break. You can ask again in ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`,
  tooLong:
    "That's a long message. Ask one question at a time, in under 4,000 characters.",
  tooFast: "You're asking quickly. Wait a moment, then try again.",
  dailyLimit: "You've reached today's question limit. It resets at midnight.",
  care: "I'm really sorry you're feeling this way. You don't have to handle it alone. Please talk to someone now: Tele-MANAS is free, confidential and open all day and night on 14416 (or 1-800-891-4416). If you are in immediate danger, call 112. I'm here to help with your studies whenever you're ready.",
  blocked:
    "I can't help with that. I'm here to help you study, so let's get back to your subjects.",
  strikeWarning:
    "Repeated attempts like this will pause your account for a while.",
  offTopic: (subjectName: string | null) =>
    subjectName
      ? `I'm your study buddy, so I'll skip that one. Shall we get back to ${subjectName}?`
      : "I'm your study buddy, so I'll skip that one. Ask me anything about your subjects.",
  unclear:
    "Could you tell me a little more? Which topic or part of your notes is this about?",
  checkFailed:
    "I couldn't check that question just now. Please try again in a moment.",
};
