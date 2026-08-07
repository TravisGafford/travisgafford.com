# Going live

Roughly 30 minutes of clicking, then a wait for DNS. Nothing here is
irreversible — your Squarespace site stays up until the very last step, and you
can point the domain back at any time.

---

## Step 1 — Put the code on GitHub

1. Create a free account at [github.com](https://github.com) if you do not have one.
2. Click the **+** in the top right → **New repository**.
3. Name it `travisgafford.com`. Set it to **Public**. Do not check any of the
   "initialize with" boxes.
4. Click **Create repository**.
5. On the next screen, click **uploading an existing file**.
6. Drag in the contents of the `site` folder — everything inside it, not the
   folder itself.
7. Click **Commit changes**.

The `.github` folder is hidden on Windows and Mac. If drag-and-drop misses it,
see "If the .github folder did not upload" at the bottom.

---

## Step 2 — Turn on GitHub Pages

1. In your repo, click **Settings** (top row of tabs).
2. In the left sidebar, click **Pages**.
3. Under "Build and deployment", set **Source** to **GitHub Actions**.

That is it. Go to the **Actions** tab and you should see a build running. When
it finishes (about a minute), your site is live at
`https://YOUR-USERNAME.github.io/travisgafford.com/`.

Look at it. Confirm everything reads correctly before touching DNS.

---

## Step 3 — Tell GitHub about your domain

1. **Settings → Pages**
2. Under "Custom domain", type `www.travisgafford.com`
3. Click **Save**

GitHub will show a DNS check that fails. Expected — you have not changed DNS yet.

---

## Step 4 — Point the domain at GitHub

First find out who runs your DNS. Log in to Squarespace and look under
**Settings → Domains**. Either:

- **The domain is registered at Squarespace** — you will manage DNS there, in
  that same panel, under DNS Settings.
- **The domain is registered elsewhere** (GoDaddy, Namecheap, Google Domains,
  Cloudflare) — make the changes at that registrar instead.

Then create these records, deleting any existing `A` or `CNAME` records for `@`
and `www` that point at Squarespace:

| Type    | Host / Name | Value                     |
| ------- | ----------- | ------------------------- |
| `A`     | `@`         | `185.199.108.153`         |
| `A`     | `@`         | `185.199.109.153`         |
| `A`     | `@`         | `185.199.110.153`         |
| `A`     | `@`         | `185.199.111.153`         |
| `CNAME` | `www`       | `YOUR-USERNAME.github.io` |

Replace `YOUR-USERNAME` with your actual GitHub username. The `CNAME` value ends
in `.github.io` and does **not** include the repository name.

The four `A` records send `travisgafford.com` to GitHub. The `CNAME` sends
`www.travisgafford.com`. Because both are configured, GitHub redirects the bare
domain to the `www` version automatically, so you keep one canonical address
instead of splitting your SEO across two.

DNS changes usually take 15 minutes to a few hours. GitHub allows up to 24.

---

## Step 5 — Turn on HTTPS

Once **Settings → Pages** shows a green check on the DNS status:

1. Check the **Enforce HTTPS** box.

If it is greyed out, GitHub is still issuing the certificate. Wait and come
back — it can take up to 24 hours.

Do not skip this. An unencrypted site gets penalized in search rankings and
shows a "Not secure" warning in browsers.

---

## Step 6 — Cancel Squarespace

Only after the new site is live on your domain and HTTPS is on.

Before you cancel, save anything you want off the old site: blog post text and
any photos in the media gallery you would like to keep. Once the subscription
lapses that content is gone.

If your domain is registered *through* Squarespace, do not let the domain
registration lapse with the site subscription. Either keep the domain
registration active there, or transfer it to a registrar like Cloudflare or
Namecheap first. Losing the domain would undo everything this site is for.

---

## After launch

**Tell Google about the new site.** Go to
[Google Search Console](https://search.google.com/search-console), add
`travisgafford.com` as a property, verify it (a DNS TXT record — the same place
you made the changes above), and submit `https://www.travisgafford.com/sitemap.xml`.
This is the single highest-value thing you can do for ranking on your own name.

**Point your social bios at the new links page.** `travisgafford.com/links`
replaces your Linktree. Update the bio link on YouTube, Twitch, Twitter,
Instagram, TikTok, and Discord, then you can close the Linktree account. Doing
this also puts your own domain in front of every follower, which helps you rank
on your own name in a way `linktr.ee` never could.

**Old links that will break.** Your Squarespace site had these pages:

| Old URL      | Status                                     |
| ------------ | ------------------------------------------ |
| `/blog`      | Still works                                |
| `/contact`   | Still works                                |
| `/media`     | Redirects to `/work`                       |
| `/naspinner` | Gone. Tell me if you want it back          |
| `/support`   | Gone. Tell me if you want it back          |

`/naspinner` and `/support` are not in the new site. If either still matters,
say so and I will add a page or a redirect.

**Pages the new site has:** `/`, `/work/`, `/consulting/`, `/blog/`,
`/contact/`, `/links/`, plus a custom 404 and the `/media` redirect.

**Check the structured data.** Paste `https://www.travisgafford.com` into
[Google's Rich Results Test](https://search.google.com/test/rich-results). It
should identify a Person. That block is what feeds accurate facts about you to
search engines and AI systems.

---

## If something goes wrong

**The site is live but looks unstyled.** The build did not finish. Check the
**Actions** tab for a red X and read the error.

**GitHub says "Domain does not resolve to the GitHub Pages server".** DNS has
not propagated yet, or an old Squarespace record is still present. Wait an hour;
if it persists, re-check that you deleted the old `A` and `CNAME` records.

**You want to go back to Squarespace.** Restore the DNS records Squarespace
gives you under Domains → DNS Settings. It takes effect within the hour. Nothing
about the GitHub setup prevents this.

**If the `.github` folder did not upload.** Web upload skips hidden folders
sometimes. In your repo, click **Add file → Create new file**, and type this as
the filename:

```
.github/workflows/deploy.yml
```

GitHub creates the folders as you type the slashes. Paste in the contents of
`deploy.yml` from your local `site/.github/workflows/` folder and commit.

---

## Cost

GitHub Pages is free for public repositories, with no bandwidth charge at any
traffic level you are realistically going to see. Your only ongoing cost is
domain registration, roughly $20 a year.
