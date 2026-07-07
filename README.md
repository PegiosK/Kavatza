# καβάτζα

A zero‑based **envelope budgeting** app for Android (Greek UI, euro, no bank links).
Built with React + Vite, wrapped natively with Capacitor. All data stays **on the
device** — nothing is uploaded anywhere.

The budgeting model is YNAB‑style: log income, assign every euro to a category,
spend against it, and the **available** balance rolls over month to month.
Includes scheduled (recurring) items, reports, savings goals, and JSON/CSV backup.

---

## Getting the APK

You can't sideload this folder directly — it has to be compiled into an `.apk`
first. Pick whichever path suits you.

### Option A — Cloud build (no tools to install) ✅ easiest

1. Create a new repository on GitHub and push this project to it (default branch `main`).
2. Go to the repo's **Actions** tab → **Build Android APK** → **Run workflow**.
   (It also runs automatically on every push to `main`.)
3. When it finishes (~3–4 min), open the run and download the
   **`kavatza-debug-apk`** artifact. Inside is `app-debug.apk`.
4. Copy that file to your phone and install it (see *Installing on your phone* below).

The workflow lives in `.github/workflows/build-apk.yml` and needs no secrets.

### Option B — Local build

**Prerequisites**

- Node.js 18+ and npm
- **JDK 21** (this project uses Capacitor 7 / Gradle 8.11 / AGP 8.7, which target JDK 21)
- Android SDK (platform 35, build‑tools 35). The easiest source is
  [Android Studio](https://developer.android.com/studio); install it, open the
  SDK Manager once, and it sets `ANDROID_HOME` for you.

**Build**

```bash
npm install
npm run build            # produces dist/ (the web app)
npx cap sync android     # copies dist/ into the native project
cd android
./gradlew assembleDebug  # on Windows: gradlew.bat assembleDebug
```

The APK lands at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Or, instead of the last two commands, run `npm run open:android` to open the
project in Android Studio and press **Run** ▶ with your phone connected.

---

## Publishing to Google Play

Want the one‑tap, no‑warnings install for friends? Publish to Google Play. The full
walkthrough — account, signed **AAB**, store listing, the required forms, and the
mandatory 12‑testers/14‑day closed test for new personal accounts — is in
**`play/PLAY_STORE_GUIDE.md`**. Listing text is in `play/listing.md`, graphics in
`play/assets/` (icon, feature graphic, screenshots), and a ready privacy policy in
`play/privacy.html`. Build the bundle with the **Play Store AAB** GitHub Action or
`./gradlew bundleRelease`.

---

## Installing on your phone (sideloading)

1. Transfer `app-debug.apk` to the phone (USB, Google Drive, email to yourself, etc.).
2. Tap it. Android will ask to allow installing from this source —
   **Settings → Apps → Special access → Install unknown apps** → enable for the
   app you're installing from (e.g. Files or Drive).
3. Install, then find **καβάτζα** in your app drawer.

A *debug* APK is fine for trying it yourself. To share with friends, build a
**signed release** (next section) — it's the proper, updatable, distributable build.

---

## Publishing a signed release (to share with friends)

This project is already configured for signed release builds. A signing key
(`android/kavatza-release.keystore`) is included so you can build right away.
**Back this file up and keep it safe** — you need the same key to ship updates;
lose it and you can't update the app under the same identity. The passwords live
in `android/keystore.properties` (and in `RELEASE_SECRETS.txt` for the cloud build).

### Easiest: cloud release with a public download link

This builds the signed APK and publishes it as a **GitHub Release** — a permanent
public URL you can paste straight into a social post.

1. Push this project to a GitHub repo.
2. Add four repository secrets — **Settings → Secrets and variables → Actions →
   New repository secret**. The exact names and values are in `RELEASE_SECRETS.txt`:
   `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`.
   (Then delete `RELEASE_SECRETS.txt`.)
3. Make a release: either
   ```bash
   git tag v1.0
   git push origin v1.0
   ```
   or go to **Actions → Release APK → Run workflow** and type `v1.0`.
4. In ~4 minutes a **Release** appears at
   `https://github.com/<you>/<repo>/releases` with `kavatza-v1.0.apk` attached.
   Share that release link (or the direct APK link) — that's your post.

### Local release build

```bash
npm install && npm run build && npx cap sync android
cd android
./gradlew assembleRelease     # Windows: gradlew.bat assembleRelease
```

Signed APK: `android/app/build/outputs/apk/release/app-release.apk`.

### What your friends will see (tell them this)

Apps installed outside the Play Store always trigger a one‑time Android prompt —
this is normal, not a sign anything's wrong, and signing does **not** remove it:

1. Tap the APK link → download → open it.
2. Android asks to allow installs from this source (browser/Files) → enable it once.
3. Play Protect may show a "scan / install anyway" dialog → choose to install.
4. The app appears as **καβάτζα**.

### Shipping an update later

Bump `versionCode` (and `versionName`) in `android/app/build.gradle`, then tag a
new version (`v1.1`). Friends install the new APK over the old one — data is kept,
because it's signed with the same key.

### The one‑tap alternative: Google Play

If you'd rather friends just tap **Install** with no prompts, publish to Google
Play: a one‑time US$25 developer account, a short store listing, and a review
(usually a day or two). Play also wants an **AAB**, not an APK —
`./gradlew bundleRelease` produces `app-release.aab`. Happy to set that path up
if you decide to go that way.

---

## Customising

| What | Where |
|------|-------|
| App name | `capacitor.config.json` → `appName`, and `android/app/src/main/res/values/strings.xml` |
| App id / package | `capacitor.config.json` → `appId` (currently `gr.kavatza.app`) |
| Icon | edit `make_icons.py`, run `python3 make_icons.py`, then `npx cap sync android` |
| Default language | `seedState()` in `src/App.jsx` (`settings.lang: "el"`); switch any time in‑app under **Περισσότερα → Γλώσσα** |
| Starting categories | `seedState()` in `src/App.jsx` |

**Live development in the browser:** `npm run dev` (fast iteration; storage uses
the browser's localStorage, same as the app).

---

## Project structure

```
kavatza/
├─ src/
│  ├─ App.jsx          # the entire app (budget, activity, reports, more)
│  ├─ main.jsx         # entry point, bundled fonts
│  └─ index.css        # base styles + animations
├─ android/            # native Android project (icons, gradle wrapper, etc.)
├─ resources/          # master icon art (1024px)
├─ make_icons.py       # regenerates all Android launcher icons
├─ capacitor.config.json
├─ vite.config.js
└─ .github/workflows/build-apk.yml
```

## Data & privacy

Everything is stored locally via the WebView's `localStorage`, which persists
across launches. There is no account, no network call, no analytics. Clearing the
app's data (or uninstalling) erases your budget — so use **Περισσότερα → Αντίγραφο
& επαναφορά** to export a JSON backup now and then. You can restore it on any
install of the app.
