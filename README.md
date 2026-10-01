# ORVL / HRVL Surveillance Intelligence Network

Official Animal Disease Surveillance, Diagnostics & Field Epidemiology Portal.

This project is architected as a **100% Free-Tier Static Web Application (Vite + React + TypeScript)**. There is **no paid backend**, **no Node server to host**, and **zero cloud computing costs**.

---

## 🏗️ 100% Free-Tier Architecture

| Layer | Service | Cost | Why it's Free |
|---|---|---|---|
| **Frontend App** | React SPA (Vite) | **$0** | Compiles to pure static files (`dist/`) |
| **Hosting (Option A)** | Firebase Hosting (Spark Plan) | **$0** | Free SSL, global CDN, 10 GB bandwidth/month |
| **Hosting (Option B)** | GitHub Pages | **$0** | Free static website hosting directly from GitHub |
| **Database** | Cloud Firestore | **$0** | 50,000 reads/day, 20,000 writes/day, 1 GB storage on Spark |
| **Authentication** | Firebase Authentication | **$0** | Free Google Sign-In & Email/Password on Spark plan |
| **Weather Telemetry** | Open-Meteo API | **$0** | Open public API with zero key and zero cost |
| **Epidemiological AI** | Built-in Rule Engine / Client Gemini | **$0** | High-precision rule-based reports run offline for free; optional custom user Gemini key |
| **Voice Narration** | Web Speech API | **$0** | Built into modern web browsers (Chrome, Edge, Safari, Firefox) |

---

## 🚀 Step-by-Step Free Deployment

### 1. Local Setup & Build

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables (Optional):**
   Copy `.env.example` to `.env.local` if you need custom Firebase credentials:
   ```bash
   cp .env.example .env.local
   ```
   *(Note: The app already bundles `firebase-applet-config.json` for plug-and-play operation.)*

3. **Test locally:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

4. **Build the production static files:**
   ```bash
   npm run build
   ```
   This generates pure static HTML, CSS, and JavaScript in the `dist/` directory.

---

### 2. Deploy to Firebase Hosting & Firestore (Spark Free Plan)

1. **Install Firebase CLI (if not already installed):**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to your Google / Firebase account:**
   ```bash
   firebase login
   ```

3. **Deploy hosting and security rules:**
   ```bash
   firebase deploy --only hosting,firestore
   ```

Your portal is now live with free SSL at `https://<your-project-id>.web.app` and `https://<your-project-id>.firebaseapp.com`!

---

### 3. Deploy to GitHub Pages (Automatic with GitHub Actions)

1. Push your repository to GitHub.
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The workflow in `.github/workflows/deploy-pages.yml` will automatically build and publish your static app on every push to the `main` branch.

Because `base: './'` is configured in `vite.config.ts`, the app works properly in any GitHub Pages subpath (e.g. `https://username.github.io/repository-name/`).

---

## 🔒 Firestore Security Rules

The database security rules (`firestore.rules`) enforce Attribute-Based Access Control (ABAC):
- **Reads**: Any authenticated user can read surveillance records, personnel profiles, and outbreak maps.
- **Writes**: Only approved roles (`SUPER_ADMIN`, `LAB_ADMIN`, or verified `epidemiologist`) can create or update surveillance data.
- **Self-Profiles**: Regular users can only update their own non-privileged profile fields. They cannot promote themselves to administrator.
- **Audit Logs**: Append-only log trail that cannot be modified or deleted.

---

## ⚠️ Watch-Outs: What Could Exceed Free Limits?

To stay 100% free forever, keep these free-tier limits in mind:

1. **Firestore Daily Read Quota (50,000 document reads/day)**:
   - **Protection in place**: The app uses IndexedDB local persistence (`persistentLocalCache`) so repeated queries are served directly from browser cache without hitting Firestore network reads.
   - Query limits are capped (300–500 documents per query) rather than loading entire multi-year histories at once.
   - *Watch out for*: Opening tens of browser tabs simultaneously or clearing cache repeatedly on large datasets.

2. **Firestore Daily Write Quota (20,000 document writes/day)**:
   - Bulk Excel/CSV imports write records in batches of up to 500 documents. If importing large historical archives with more than 20,000 rows in a single calendar day, split the import across days.

3. **Firestore Total Storage (1 GB on Spark Plan)**:
   - Structured JSON records are small (~1 KB each), allowing ~1,000,000 text records within the 1 GB free quota.
   - Avoid storing raw image files or binaries directly inside Firestore documents.

4. **Firebase Hosting Bandwidth (10 GB/month on Spark Plan or 100 GB/month on GitHub Pages)**:
   - The compiled static site is under ~5 MB. 10 GB accommodates ~2,000+ full initial visits/month, and recurring visits use cached assets.

5. **Gemini AI API (Developer Free Tier)**:
   - By default, the app uses an instant, zero-cost, rule-based epidemiological situation report generator that requires **no API key** and **no credits**.
   - If you optionally paste a Gemini API key in the AI Report Generator, Gemini's free tier allows 15 requests per minute. If that quota is reached, the app automatically and seamlessly falls back to the built-in rule-based report with zero error messages.
