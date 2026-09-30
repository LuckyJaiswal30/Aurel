# Aurel

A study tutor for one student: upload your notes, ask questions, and get answers that cite the page they came from. Everything runs on your Mac with free, local tools.

## Start it (every day)

You need four things running: Docker (for the database), Ollama (for the AI models), the knowledge service and the web app.

1. **Open Docker Desktop** and wait until it says it's running.
2. **Open the Ollama app.** It sits in the menu bar; nothing else to do.
3. **Start the database.** In Terminal, in this folder:

   ```bash
   supabase start
   ```

   Wait for it to print the local URLs (takes about a minute).

4. **Start the knowledge service** (reads notes and searches them). In a second Terminal tab, in this folder:

   ```bash
   pnpm knowledge:dev
   ```

   Wait for `Application startup complete`. Leave this tab open.

5. **Start the web app.** In a third Terminal tab, in this folder:

   ```bash
   pnpm dev
   ```

   Wait for `Ready`. Leave this tab open.

6. **Open http://localhost:3000** and sign in. The test account's email and password are `TEST_STUDENT_EMAIL` and `TEST_STUDENT_PASSWORD` in `apps/web/.env.local`, or create your own account (the confirmation email shows up at http://127.0.0.1:54324).

The first question after starting is slow, because the models have to load into memory.

## Stop it

- Press `Ctrl + C` in the two Terminal tabs running `pnpm knowledge:dev` and `pnpm dev`.
- Then run `supabase stop`. Your data is kept for next time.
- You can quit Ollama and Docker Desktop if you want the memory back.

## If something goes wrong

| What you see                                    | What to do                                                    |
| ----------------------------------------------- | ------------------------------------------------------------- |
| `supabase start` says Docker isn't running      | Open Docker Desktop, wait, try again                          |
| Sign-in says the bot check failed               | Reload the page so the check runs again                       |
| Answers fail with "couldn't finish in time"     | Close other heavy apps; the Mac is short of memory. Ask again |
| Styles look broken after changing `globals.css` | Stop `pnpm dev` with `Ctrl + C` and start it again            |
| Notes stay on "Reading"                         | Check the `pnpm knowledge:dev` tab is still running           |

## First-time setup on a new Mac

Only needed once. Install Docker Desktop, the Ollama app, Homebrew, then:

```bash
brew install supabase/tap/supabase pnpm
curl -LsSf https://astral.sh/uv/install.sh | sh
pnpm install
cd services/knowledge && uv sync && cd ../..
ollama pull qwen3.5:9b && ollama pull gemma4:12b && ollama pull qwen3.5:4b && ollama pull qwen3.5:2b && ollama pull llama-guard3:1b
ollama/create-models.sh
supabase start
```

Then copy `apps/web/.env.example` to `apps/web/.env.local` and `services/knowledge/.env.example` to `services/knowledge/.env`, and fill in the values (`supabase status -o env` prints the database keys; the Hugging Face token is needed once to download Llama Prompt Guard 2). Copy `supabase/.env.example` to `supabase/.env` for the sign-in captcha.

The models need about 25 GB of disk space.

To skip Ollama and use Groq's free hosted models instead, create a key at console.groq.com and set `MODEL_PROVIDER=groq` and `GROQ_API_KEY` in `apps/web/.env.local`. Free Groq has small per-minute limits, so it suits a demo, not heavy use.

## More

- Before putting it online: `docs/deploy-checklist.md`
