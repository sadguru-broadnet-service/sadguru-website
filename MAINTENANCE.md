# Sadguru Broadnet website: maintenance guide

How the site is built, how to change it, and what to do when something goes wrong.

- **Live site:** https://sadgurubroadnetservices.netlify.app/ (Netlify project name: `sadgurubroadnetservices`)
- **Code:** private GitHub repo `sadguru-website`, owned by the Sadguru account. The maintainer is a collaborator.
- **Hosting:** Netlify, connected to that repo. Every push to `main` goes live automatically in about 30 seconds.

---

## 1. What's in the folder

| File | What it is |
|---|---|
| `index.html` | The whole homepage: all text, phone numbers, links, reviews, map |
| `css/styles.css` | All styling (colours, fonts, layout) |
| `js/main.js` | Mobile menu, nav highlighting, contact form sending |
| `thank-you.html` | Shown after a form is sent when the visitor has JavaScript off |
| `404.html` | Shown for any link that doesn't exist |
| `images/` | Logo, icon, social-share image (`og-image.jpg`), WhatsApp QR (`whatsapp-qr.svg`) |
| `netlify.toml` | Netlify settings: security headers, caching, blocks `/.claude/` from being served |
| `robots.txt`, `sitemap.xml` | For search engines |
| `.claude/` | Local preview server for the maintainer's computer only. Never served online |

There is no build step and no framework. What's in the folder is exactly what goes live.

## 2. Common edits (all in `index.html` unless noted)

Search the file for the old value and replace **every** occurrence.

- **Phone / WhatsApp number:** appears in `tel:` links, `wa.me/` links, the visible text, and the structured data (`"telephone"`). If the WhatsApp number changes, the QR code must be regenerated too: `images/whatsapp-qr.svg` encodes `https://wa.me/917498158140`.
- **Email:** `mailto:` links, visible text, and `"email"` in the structured data near the top.
- **Areas served:** the `<ul class="area-list">` list near the bottom, plus `"areaServed"` in the structured data.
- **Reviews:** the `<figure class="review">` blocks. Copy one block to add a review. Use real reviews only, copied word for word.
- **Services:** the `<article class="service">` blocks.

After editing, bump the version number on the CSS/JS links (`styles.css?v=3` → `?v=4`) **only if you changed those files**. Browsers cache them for a week.

## 3. Making a change safely

### Preview on your computer first
1. Open the folder in Claude Code (desktop app).
2. Ask Claude to "start the site preview". It uses `.claude/launch.json`, which runs `.claude/serve.ps1` on http://localhost:8080. No Python or Node needed.
3. Check the change at phone and desktop widths.

### Small fix: publish straight away
```bash
git add -A
git commit -m "Describe what changed"
git push
```
Netlify deploys automatically. Check the live site after about a minute.

### Bigger change: preview online before it goes live
```bash
git switch -c my-change
git add -A
git commit -m "Describe the change"
git push -u origin my-change
```
On GitHub, open a Pull Request from `my-change`. Netlify posts a **Deploy Preview** link on it, which is a private copy of the site with the change. Share it with the client if needed. When happy, merge the Pull Request and it goes live.

## 4. When something goes wrong

**First, stop the damage: roll back (takes 10 seconds).**
Netlify → the site → **Deploys** → click the last deploy that was fine → **Publish deploy**. The site instantly goes back to that version. Then fix the problem without pressure and push again. The next push becomes the live version.

**Then find the cause.**
| Symptom | Likely cause / fix |
|---|---|
| Site down / UptimeRobot alert | Check https://www.netlifystatus.com. If Netlify is fine, check the latest deploy in Netlify → Deploys for errors |
| "Deploy failed" email | Open the deploy log in Netlify. Usually a typo in `netlify.toml` |
| Form shows "did not go through" | Netlify → Site configuration → Forms: is form detection still enabled? Has the monthly limit (100 on free plan) been hit? |
| Enquiries not arriving by email | Check the Gmail spam folder. Check Netlify → Notifications → Form submission notifications still lists the address |
| Map or fonts not showing | Google service hiccup, usually temporary. The site still works without them |
| Wrong text/number on the site | Edit `index.html` (section 2), push |

**Undo a specific change in the code history:**
```bash
git log --oneline
git revert <commit-id>
git push
```
Nothing is ever lost. Every version stays in Git history and in Netlify's deploy list.

## 5. Accounts and settings (keep this list up to date)

| Service | Owner login | Maintainer access | Purpose |
|---|---|---|---|
| GitHub | sadguruinfo1@gmail.com | Collaborator (Write) | Code |
| Netlify | via the Sadguru GitHub login | via GitHub pushes | Hosting, forms |
| Google Search Console | Sadguru Google account | Added as user | Search health |
| UptimeRobot | Maintainer | Owner | Downtime alerts |

Netlify settings that must stay on:
- **Forms → form detection: enabled.** If it's turned off, the contact form fails.
- **Notifications → form submission email → sadguruinfo1@gmail.com** (plus the maintainer, optional).
- **Notifications → deploy failed email → maintainer.**

Free-plan limit: **100 form submissions per month.** Check usage in Netlify → Forms.

## 6. Monthly checklist (10 minutes)

- [ ] Send one test enquiry from the live site and confirm it arrives in Gmail (then delete it in Netlify → Forms).
- [ ] Check form usage against the 100/month limit.
- [ ] On a phone, tap Call, WhatsApp, Email, the map, and scan the WhatsApp QR from another screen.
- [ ] Glance at Google Search Console for new errors.
- [ ] Check that UptimeRobot shows no unexplained downtime.

## 7. Moving to a real domain later

1. Buy the domain **in the client's name** (e.g. a .in or .com from any registrar).
2. Netlify → Domain management → Add a domain → follow the DNS instructions. Netlify sets up HTTPS automatically.
3. In the code, replace `https://sadgurubroadnetservices.netlify.app` everywhere it's marked `SITE_URL` (`index.html`, `robots.txt`, `sitemap.xml`), then push.
4. In Google Search Console, add the new domain and submit `sitemap.xml` again.
