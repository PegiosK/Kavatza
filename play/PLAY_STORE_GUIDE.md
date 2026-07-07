# Publishing καβάτζα to Google Play — step by step

This is the full path from zero to a public Play Store listing. Read the timeline
first, because for a **new personal developer account** there's a mandatory 14‑day
testing period before you can go live — it's not instant.

> Everything you upload to Play tracks is the **AAB** (`app-release.aab`), not the APK.
> Build it with the **"Play Store AAB"** GitHub Action (or `./gradlew bundleRelease`
> locally). The APK workflow is still useful for sharing outside Play.

---

## Realistic timeline

1. **Day 0** — Create developer account, pay the one‑time **US$25**, complete identity
   verification (government ID + address). Verification can take from minutes to a few days.
2. **Day 0–1** — Create the app, fill the store listing and all "App content" forms,
   upload your first AAB.
3. **Day 1 → Day 15** — Run a **closed test**. Google requires **at least 12 testers
   opted‑in for 14 continuous days** before you can apply for production. *(Personal
   accounts created after 13 Nov 2023. Organisation accounts with a registered business
   are exempt.)* Your friends are perfect testers here.
4. **After 14 days** — Apply for production access, answer the questionnaire about tester
   feedback, then create the production release. Review is usually up to ~7 days.

So: budget about **2.5–3 weeks** end to end. Most of it is the unavoidable test window.

---

## Step 1 — Developer account
1. Go to **play.google.com/console**, sign in, choose a **personal** account type.
2. Pay the **US$25** one‑time fee.
3. Complete **identity verification** (ID + address). Wait for the confirmation email.

## Step 2 — Build the signed AAB
- Easiest: push the project to GitHub, add the four secrets from `RELEASE_SECRETS.txt`
  (Settings → Secrets and variables → Actions), then **Actions → Play Store AAB → Run
  workflow**. Download the **`kavatza-release-aab`** artifact → `app-release.aab`.
- Or locally: `npm install && npm run build && npx cap sync android && cd android &&
  ./gradlew bundleRelease` → `android/app/build/outputs/bundle/release/app-release.aab`.

## Step 3 — Create the app
**Play Console → Create app.**
- App name: **καβάτζα**
- Default language: **Greek (el‑GR)**
- App or game: **App**
- Free or paid: **Free**
- Tick the declarations (developer program policies, US export laws).

## Step 4 — Play App Signing (do this once, on first upload)
When you upload your first AAB (in Step 7), Play will offer **Play App Signing**.
Accept it. What happens:
- **Google holds the app signing key** (it re‑signs what users download).
- **Your keystore (`kavatza-release.keystore`) is the *upload key*** — you sign uploads
  with it. Keep it safe; you need it for every future upload.
> If you ever lose the upload key, Google can reset it (unlike the old self‑signed APK
> world). That's one advantage of the Play route.

## Step 5 — Store listing
**Grow → Store presence → Main store listing.** Paste from `play/listing.md`:
- App name, short description, full description (Greek).
- **App icon:** upload `play/assets/icon-512.png`.
- **Feature graphic:** upload `play/assets/feature-graphic.png`.
- **Phone screenshots:** upload `play/assets/screenshots/01..05` (at least 2 required).
- **App category:** Finance. Contact email: yours.

## Step 6 — App content (the forms)
**Policy → App content.** Suggested answers for καβάτζα:

- **Privacy policy:** host `play/privacy.html` (e.g. copy it to your repo root, enable
  **GitHub Pages**, Settings → Pages → Deploy from branch → `main` / root) and paste the
  URL, e.g. `https://<username>.github.io/<repo>/privacy.html`. *(Fill in the date,
  email, and URL placeholders inside the file first.)*
- **Ads:** No, the app does not contain ads.
- **App access:** All functionality is available without restrictions (no login). Choose
  "All functionality is available without special access".
- **Content rating:** Start the IARC questionnaire. Category: **Utility/Finance**. Answer
  **No** to violence, sexuality, profanity, drugs, gambling, and "user‑generated content".
  Result is typically **Everyone / PEGI 3**.
- **Target audience and content:** Target age **18+** (it's a finance tool for adults;
  this avoids the Families programme requirements). Not appealing to children.
- **Data safety:** **No data collected and no data shared.** Rationale you can rely on:
  the app stores everything **on the device only** and makes **no network calls**, so
  there is no collection or sharing in Play's sense. If asked about data deletion: there
  is no account; users erase data in‑app (More → Erase all data) or by uninstalling.
- **Financial features:** Select **"My app doesn't provide any financial features."**
  καβάτζα is a personal tracker — it doesn't connect to banks, lend, invest, or handle
  payments, so the financial‑products policies don't apply.
- **Government app / News app / COVID‑19:** No to all.

## Step 7 — Closed testing (required before production)
**Test and release → Testing → Closed testing → Create track** (you can use the default
"Alpha").
1. **Create a release**, upload `app-release.aab`, add a short release note
   (e.g. "Πρώτη έκδοση — δοκιμή"). Accept Play App Signing here.
2. **Testers:** create an email list with **at least 12 testers** (use 15–20 to be safe
   against drop‑offs). Add your friends' Google account emails.
3. Share the **opt‑in link** Play gives you. Each tester must open the link, **join**,
   install from Play, and **actually use the app across the 14 days** — Google now checks
   real engagement, and emulators don't count. Ask them to open it a few times over the
   two weeks.
4. Keep them opted in for **14 continuous days**.

## Step 8 — Apply for production & release
1. After 14 days with ≥12 active testers, the Console dashboard shows you can **apply for
   production access**. Answer the short questionnaire: what feedback you got and what you
   changed (give real, specific answers — vague ones get rejected).
2. Once granted: **Production → Create release**, promote or upload the AAB, set rollout
   to 100%, and submit. Review can take up to ~7 days.
3. When approved, your public listing goes live — share `play.google.com/store/apps/details?id=gr.kavatza.app`.

---

## Shipping updates later
1. Bump **`versionCode`** (and `versionName`) in `android/app/build.gradle`
   (e.g. `versionCode 2`, `versionName "1.1"`). `versionCode` must increase every upload.
2. Rebuild the AAB (same workflow) and upload to a track → promote to production.
3. Always signed with the **same upload key** — updates install over the old version and
   keep user data.

## Compliance notes
- Target API is **35 (Android 15)**, which meets Google's current "new apps" requirement.
  From **31 Aug 2026** new submissions must target **API 36**; when that time comes, bump
  `compileSdkVersion`/`targetSdkVersion` to 36 in `android/variables.gradle` (and update
  the CI `sdkmanager` lines to `android-36` / `build-tools;36.0.0`).
- App id is **`gr.kavatza.app`** — this is permanent once published. Don't change it.
