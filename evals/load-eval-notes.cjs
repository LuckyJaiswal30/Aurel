// Creates the test student from apps/web/.env.local, adds the eval subjects and uploads evals/notes
// through the running app, then waits until both notes are ready. Writes evals/.eval-ids.json.
const { createRequire } = require("node:module");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const webRequire = createRequire(path.join(root, "apps/web/package.json"));
const { createClient } = webRequire("@supabase/supabase-js");
const { createServerClient } = webRequire("@supabase/ssr");

const env = process.env;
const appUrl = env.EVAL_APP_URL ?? "http://localhost:3000";
const subjects = [
  ["artificial-intelligence", "Artificial Intelligence"],
  ["machine-learning", "Machine Learning"],
];

async function findOrCreateStudent(admin) {
  const created = await admin.auth.admin.createUser({
    email: env.TEST_STUDENT_EMAIL,
    password: env.TEST_STUDENT_PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: "Asha" },
  });
  if (created.data.user) return created.data.user.id;
  const { data } = await admin.auth.admin.listUsers();
  return data.users.find((user) => user.email === env.TEST_STUDENT_EMAIL).id;
}

async function signInCookie() {
  const jar = new Map();
  const client = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => [...jar].map(([name, value]) => ({ name, value })),
        setAll: (cookies) =>
          cookies.forEach(({ name, value }) => jar.set(name, value)),
      },
    },
  );
  const { error } = await client.auth.signInWithPassword({
    email: env.TEST_STUDENT_EMAIL,
    password: env.TEST_STUDENT_PASSWORD,
    options: { captchaToken: "XXXX.DUMMY.TOKEN.XXXX" },
  });
  if (error) throw error;
  return [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
}

async function main() {
  const admin = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SECRET_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
  const studentId = await findOrCreateStudent(admin);
  const cookie = await signInCookie();
  const ids = { studentId, subjects: {} };

  for (const [slug, name] of subjects) {
    const existing = await admin
      .from("subjects")
      .select("id")
      .eq("user_id", studentId)
      .eq("name", name)
      .maybeSingle();
    ids.subjects[slug] =
      existing.data?.id ??
      (
        await admin
          .from("subjects")
          .insert({ user_id: studentId, name })
          .select("id")
          .single()
      ).data.id;
    const form = new FormData();
    form.set("subjectId", ids.subjects[slug]);
    form.set(
      "file",
      new File(
        [fs.readFileSync(path.join(root, "evals/notes", `${slug}.md`))],
        `${slug}.md`,
        { type: "text/markdown" },
      ),
    );
    const response = await fetch(`${appUrl}/api/notes`, {
      method: "POST",
      body: form,
      headers: { cookie },
    });
    console.log(`${slug}: upload ${response.status}`);
  }
  fs.writeFileSync(
    path.join(root, "evals/.eval-ids.json"),
    JSON.stringify(ids, null, 2),
  );

  const started = Date.now();
  for (;;) {
    const { data } = await admin
      .from("documents")
      .select("file_name, status, status_detail")
      .eq("user_id", studentId);
    const summary = data
      .map((note) => `${note.file_name}: ${note.status}`)
      .join(", ");
    console.log(`${Math.round((Date.now() - started) / 1000)}s ${summary}`);
    if (
      data.length > 0 &&
      data.every((note) =>
        ["ready", "failed", "rejected", "held_for_confirmation"].includes(
          note.status,
        ),
      )
    )
      break;
    await new Promise((resolve) => setTimeout(resolve, 15000));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
