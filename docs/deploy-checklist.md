# Deploy checklist

Things local development sets up automatically that a hosted deployment must set up by hand.

- **Captcha on Supabase Auth.** In the hosted project, turn on Authentication > Bot and Abuse Protection > CAPTCHA with Turnstile and a real secret (or `supabase config push` with `[auth.captcha]` and `SUPABASE_AUTH_CAPTCHA_SECRET`). Sign-up and sign-in rely on Supabase to check the token; without this they have no bot check. Then confirm: signing in through the Auth API without a token returns `captcha_failed`.
- **Real Turnstile site key** in `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (the test key always passes).
- **`TRUST_PROXY_IP_HEADERS=true`** only behind a proxy that sets `X-Real-IP` or appends to `X-Forwarded-For`.
- **Chat models:** set `MODEL_PROVIDER=groq` and `GROQ_API_KEY`; a hosted web app cannot reach Ollama on your laptop.
- **Secrets only on the server:** Supabase secret key, knowledge service token, `IP_HASH_SECRET`, Hugging Face token, `GROQ_API_KEY`.
