# Signal Garden — Google setup (fix OAuth errors)

If you see **“The web app requires you to authorise access”** or **“OAuth client not initialized”**, follow these steps in order. Do not deploy until step 4 succeeds.

## 1. Create the script from the Sheet (required)

Do **not** create a standalone script at [script.google.com](https://script.google.com) unless you know how to set `SHEET_ID`.

1. Create a Google Sheet with a tab named **`Sources`**.
2. Row 1 headers: `enabled` | `name` | `rss_url` | `category` | `priority`
3. Add at least one row, e.g. `TRUE`, `Hacker News`, `https://hnrss.org/frontpage`, `tech`, `1`
4. **Extensions → Apps Script**
5. In the left file list, **delete every `.gs` file except one** `Code.gs` (trash icon on extras like `Untitled.gs`)
6. Open `Code.gs` → **Select all (Ctrl+A) → Delete** → paste **once** from [`signal-garden-apps-script.gs`](signal-garden-apps-script.gs)  
   - `TypeError: redeclaration of const CACHE_TTL_SEC` = pasted twice or two files with the same code  
   - Do **not** paste `appsscript.json` into `Code.gs`
6. Rename the project to something short, e.g. **SignalGarden** (long names can break OAuth)

### Enable V8 runtime (required — Rhino is deprecated)

If you see **“Rhino runtime is deprecated”**, switch to V8 using **one** of these:

**Option A — Project Settings (easiest)**

1. Apps Script → **Project Settings** (gear, left sidebar)
2. Under **Runtime**, select **Chrome V8**
3. Save

**Option B — `appsscript.json`**

1. Project Settings → enable **Show "appsscript.json" manifest file in editor**
2. Open `appsscript.json` and replace its contents with [`appsscript.json`](appsscript.json) from this repo (includes `"runtimeVersion": "V8"`)
3. Save

Then run **`authorizeSetup`** again, and **Deploy → New version**.

### Narrow permissions (optional but recommended)

By default Google may ask for access to **all** spreadsheets. To limit it to **only the sheet this script is bound to**:

1. Use the `appsscript.json` from this repo (see V8 step above)
2. Run **`authorizeSetup`** again if scopes changed

The consent screen should then mention the current spreadsheet only, not “all spreadsheets.”

## 2. Fix “OAuth client not initialized”

This usually means the linked Google Cloud project has no OAuth consent screen.

1. In Apps Script, click **Project Settings** (gear, left sidebar).
2. Under **Google Cloud Platform (GCP) Project**, click the project number link (opens Google Cloud Console).
3. If the project is missing or “pending deletion”, go back to Apps Script → Project Settings → **Change project** → **Create project** → name it `SignalGarden` → Save.
4. In Cloud Console, open **APIs & Services → OAuth consent screen**.
5. Choose **External** (personal Gmail) or **Internal** (Workspace).
6. Fill required fields: app name, user support email, developer email → **Save and Continue**.
7. **Scopes**: Add if prompted:
   - `.../auth/spreadsheets.currentonly` (or spreadsheets)
   - `.../auth/script.external_request` (for RSS via UrlFetch)
8. **Test users** (if app is in “Testing”): add your Gmail → Save.
9. Return to Apps Script.

## 3. Authorize in the editor (before deploy)

1. In the function dropdown at the top, select **`authorizeSetup`** (not `doGet`).
2. Click **Run** ▶.
3. Click **Review permissions** → choose your Google account → **Advanced** → **Go to SignalGarden (unsafe)** → **Allow**.
4. Check **Execution log**: should show spreadsheet name and source count.
5. If Run fails here, fix this before deploying; the public URL will not work.

Optional: run **`doGet`** once the same way and approve if asked again.

## 4. Redeploy after code changes (required for CORS fix)

The React app loads the feed via **JSONP** (`?callback=...`), not `fetch`, because Apps Script does not send CORS headers.

Whenever you update `signal-garden-apps-script.gs` in Google:

1. **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**

## 5. Deploy the web app

1. **Deploy → New deployment**
2. Type: **Web app**
3. **Execute as:** `Me` (your account)
4. **Who has access:** `Anyone`  
   (Use “Anyone”, not “Only myself”, or visitors get an auth wall.)
5. **Deploy** → copy the URL ending in **`/exec`** (not `/dev`).

## 6. Test without logging in

1. Open the `/exec` URL in an **incognito** window (or another browser).
2. You should see JSON like `{"fetchedAt":"...","count":N,"items":[...]}`.
3. If incognito asks you to sign in, redeploy with **Execute as: Me** and **Who has access: Anyone**, then run **authorizeSetup** again and create a **New deployment** (version must bump).

Append `?action=feed` if you want to match the app:  
`https://script.google.com/macros/s/XXXX/exec?action=feed`

## 7. Connect the React app

Set the URL in either place:

- `.env.local`: `REACT_APP_FEED_API_URL=https://script.google.com/macros/s/XXXX/exec`
- or edit [`src/config/feed.ts`](../src/config/feed.ts)

Restart `npm start` after changing env vars.

### Feed URL for the React app (use the echo URL)

`script.google.com/.../exec` often shows a sign-in page or breaks JSONP on redirect. The app uses the **echo** URL instead:

1. Deploy the web app (Execute as **Me**, access **Anyone**).
2. While logged in, open your `/exec` link in the browser.
3. Copy the **`https://script.googleusercontent.com/macros/echo?user_content_key=...`** URL from the address bar (it should show JSON).
4. Paste that into [`src/config/feed.ts`](../src/config/feed.ts) as `FEED_API_URL`.

After redeploying Apps Script, repeat step 2–4 — the `user_content_key` may change.

### Optional limits (quota / testing)

Query params on the web app URL:

| Param | Meaning | Max |
|-------|---------|-----|
| `sourceLimit` or `sources` | How many RSS **URLs** to fetch from the sheet (by priority) | 50 |
| `itemLimit` or `limit` | Max **articles** in the merged feed | 500 |

Example: `.../exec?action=feed&sourceLimit=3&itemLimit=30`

Omit both to fetch all enabled sources and all items (subject to cache).

---

## Is the “This app hasn’t been verified by Google” screen safe?

**Yes, if you wrote or pasted the code yourself** (from this repo’s `signal-garden-apps-script.gs`). You are both the user and the developer; Google shows that warning for all personal projects.

| Permission | Why Signal Garden needs it |
|------------|----------------------------|
| Google Sheets | Read your `Sources` tab (RSS URLs you added) |
| Connect to an external service | `UrlFetchApp` to download RSS XML from those URLs |

What it does **not** do: send your sheet to a third party, post on your behalf, or read Gmail/Drive (unless you add that code).

You do **not** need Google verification for personal use. Verification is for apps used by many people outside your account.

**Only click Allow if you trust the code.** Review [`signal-garden-apps-script.gs`](signal-garden-apps-script.gs) — it only reads the sheet, fetches RSS URLs you listed, and returns JSON.

## Still broken?

| Symptom | Fix |
|--------|-----|
| OAuth client not initialized on script.google.com | New GCP project (step 2.3) + configure OAuth consent screen |
| Authorize every time in browser | Deploy: Execute as **Me**, access **Anyone**; use `/exec` URL |
| `deleted_client` | GCP project was deleted → create new project and redeploy |
| Works for you, not incognito | Not deployed as “Anyone”; or still using `/dev` URL |
| Rhino runtime deprecated | Project Settings → **Chrome V8**, then redeploy new version |
| JSONP / “Could not load feed” | Often sign-in HTML — deploy **Anyone** + V8 + run `authorizeSetup` |
| Empty `items: []` | Check Sources tab, `enabled` = TRUE, valid `rss_url` |
| Work / school account | Admin may block Apps Script web apps; try personal Gmail |

## Sheet-only fallback (no Apps Script)

If OAuth keeps failing, you can skip RSS in the script and use `IMPORTFEED` in the Sheet, then point the app at a published CSV — that is a separate, slower path; ask if you want those steps.
