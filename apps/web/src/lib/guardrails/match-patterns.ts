const ruleWords =
  "(instructions?|rules|prompts?|guidelines|polic(y|ies)|programming|filters)";

const attackPatterns = [
  new RegExp(
    `\\b(ignore|disregard|forget|override|bypass)\\s+(all\\s+)?(of\\s+)?(the\\s+)?(your|previous|prior|above|earlier|system|original|initial)\\s+(\\w+\\s+)?${ruleWords}\\b`,
  ),
  /\byour\s+(system|developer|hidden|initial|secret|original)\s+(prompt|message|instructions?)\b/,
  new RegExp(
    `\\b(reveal|show|print|repeat|leak|tell me|output|give me|what are)\\b.{0,20}\\byour\\s+(system\\s+)?(${ruleWords.slice(1, -1)}|canary|secret (check )?word)\\b`,
  ),
  /\b(secret|hidden)\s+(check\s+)?word\b.{0,30}\b(your|hidden|system)\b/,
  /\b(jailbreak|jail\s*break|dan mode|do anything now|developer mode|god mode|unfiltered mode)\b/,
  /\byou are (now )?dan\b/,
  /\b(pretend|act|roleplay|role-play)\b.{0,40}\b(unrestricted|uncensored|jailbroken|unfiltered)\b/,
  /\b(ai|assistant|model|chatbot|bot)\s+(with\s+no|without(\s+any)?)\s+(rules|limits|restrictions|filters)\b/,
  /\byou (are|have) no (rules|restrictions|limits|filters)\b/,
  /\b(apne\s+)?(saare\s+|sabhi\s+)?(instructions?|rules|niyam)\s+(ko\s+)?(ignore|bhool|bhul)\s*(karo|kar do|jao|ja)\b/,
  /(पिछले|सारे|सभी|अपने)\s+(निर्देश|नियम).{0,20}(भूल|अनदेखा|इग्नोर)/,
];

const firstPerson = "(i|i'm|im|i am|i've|ive|me|my)";
const distress =
  "(suicid(e|al)|kill(ing)? myself|end(ing)? (my life|it all)|want(ed)? to die|hurt(ing)? myself|cut(ting)? myself|self[- ]?harm(ing)?|no reason to live|don'?t want to (live|be alive))";

const carePatterns = [
  new RegExp(`\\b${firstPerson}\\b.{0,40}\\b${distress}`),
  /\b(kill|hurt|cut) myself\b/,
  /\b(khudkushi|aatmhatya|atmahatya)\b.{0,30}\b(karna|karunga|karungi|chahta|chahti|soch)/,
  /\b(marna chahta|marna chahti|mar jaana chahta|mar jaana chahti|jeena nahi chahta|jeena nahi chahti|zindagi khatam kar)/,
  /(आत्महत्या|ख़ुदकुशी|खुदकुशी).{0,20}(करना|करूँगा|करूंगी|चाहता|चाहती|सोच)/,
  /(मरना चाहता|मरना चाहती|जीना नहीं चाहता|जीना नहीं चाहती)/,
];

function matchesAny(patterns: RegExp[], texts: string[]) {
  return texts.some((text) => patterns.some((pattern) => pattern.test(text)));
}

export function looksLikeAttack(texts: string[]) {
  return matchesAny(attackPatterns, texts);
}

export function needsCare(texts: string[]) {
  return matchesAny(carePatterns, texts);
}
