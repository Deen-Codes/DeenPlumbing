# Deen Plumbing — Deployment Guide

A static website (HTML/CSS/JS + images). No build step, no server.
Goal: **GitHub → Render (hosting) → Cloudflare (domain + email)** on `deenplumbing.co.uk`.

---

## Before you start
- A GitHub account
- A Render account (sign in with GitHub — free)
- The `deenplumbing.co.uk` domain added to your Cloudflare account
- This folder (`_DeenPlumbing`) with all the site files

> Tidy-up (optional): the duplicate image files in the **root** of this folder
> (`boiler.png`, `bathroom.png`, `D Logo.png`, etc.) are NOT used by the site —
> the live images live in the **`images/`** folder. You can delete the root copies
> to keep the repo small. Keep everything inside `images/`.

---

## 1) Put the site on GitHub
**Option A — GitHub Desktop (easiest)**
1. Install GitHub Desktop → File → **Add Local Repository** → choose this folder.
2. It'll offer to create a repository — name it `deen-plumbing`, keep it Private or Public.
3. Click **Commit to main**, then **Publish repository**.

**Option B — command line**
```bash
cd _DeenPlumbing
git init
git add .
git commit -m "Deen Plumbing website"
git branch -M main
git remote add origin https://github.com/<your-username>/deen-plumbing.git
git push -u origin main
```

---

## 2) Deploy on Render
1. Render dashboard → **New +** → **Static Site**.
2. Connect your GitHub and pick the `deen-plumbing` repo.
3. Settings:
   - **Build Command:** leave blank
   - **Publish Directory:** `.`  (a single dot = the repo root)
4. Click **Create Static Site**. Render builds and gives you a URL like
   `https://deen-plumbing.onrender.com` — check the site works there first.

(There's a `render.yaml` in the repo, so you can also use **New + → Blueprint** and
Render will read the settings automatically.)

---

## 3) Point deenplumbing.co.uk at Render (via Cloudflare)
1. In Render → your static site → **Settings → Custom Domains → Add Custom Domain**.
   - Add `deenplumbing.co.uk` **and** `www.deenplumbing.co.uk`.
   - Render shows you the exact DNS target (a hostname like `deen-plumbing.onrender.com`).
2. In **Cloudflare → deenplumbing.co.uk → DNS → Records**, add:
   - **CNAME** | Name: `@`   | Target: `deen-plumbing.onrender.com` | Proxy: **Proxied (orange cloud)**
   - **CNAME** | Name: `www` | Target: `deen-plumbing.onrender.com` | Proxy: **Proxied**
   (Cloudflare flattens the `@` CNAME automatically, so the apex domain works.)
3. In **Cloudflare → SSL/TLS → Overview**, set encryption mode to **Full**.
4. Back in Render, wait until the custom domain shows **Verified / Certificate Issued**
   (can take a few minutes up to an hour).

Done — `https://deenplumbing.co.uk` now serves the site.

---

## 4) Email to your Gmail (free, via Cloudflare Email Routing)
This forwards anything sent to your domain address into your normal Gmail inbox.
1. **Cloudflare → deenplumbing.co.uk → Email → Email Routing → Get started.**
2. Cloudflare auto-adds the required MX + TXT records — click to accept them.
3. **Destination addresses** → add your Gmail → confirm the verification email Google sends you.
4. **Routing rules** → Custom address:
   - `deen@deenplumbing.co.uk`  →  forward to your Gmail
   - (optional) enable **Catch-all** → your Gmail, so anything @deenplumbing.co.uk reaches you.

That's it — emails to `deen@deenplumbing.co.uk` land in Gmail. (To *send* from that
address too, you'd add it in Gmail → Settings → Accounts → "Send mail as", but that
needs an SMTP provider; not required just to receive council/admin email.)

---

## Updating the site later
Edit the files, then in GitHub Desktop **Commit → Push** (or `git add . && git commit -m "update" && git push`).
Render redeploys automatically within a minute.
