# Culyn Mobile

## Development

Install dependencies and start the dev server:

```bash
pnpm install
npx expo start
```

## Environment Setup

Copy the relevant env file before building:

| Environment | File              | API                |
| ----------- | ----------------- | ------------------ |
| Staging     | `.env.staging`    | Staging backend    |
| Production  | `.env.production` | Production backend |

Fill in `EXPO_PUBLIC_CULYN_API_URL` in each file with the correct backend URL.

---

## Build Workflow

### Staging → TestFlight (local Xcode build)

Use this for testing before shipping to the App Store. No EAS quota used.

**1. Sync native code for staging:**

```bash
APP_ENV=staging npx expo prebuild
cd ios && pod install && cd ..
```

**2. Open in Xcode and archive:**

```bash
open ios/culynapp.xcworkspace
```

- Select **`culynapp Staging`** scheme (top bar)
- Select **Any iOS Device (arm64)** as the target
- **Product → Archive**
- In the Organizer: **Distribute App → App Store Connect → Upload**
- In App Store Connect → **TestFlight → Internal Testing** → add testers

> The staging app uses bundle ID `com.culyn-ai.staging` and app name **Culyn (Staging)**.
> Both staging and production apps can be installed on the same device simultaneously.

---

### Production → App Store (EAS build)

Use this when the build is verified in staging and ready to ship.

**1. Fill in `eas.json` submit config** (one-time):

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your@email.com",
      "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID"
    }
  }
}
```

**2. Build and submit:**

```bash
eas build -p ios --profile production --auto-submit
```

This builds remotely and submits directly to App Store Connect for review.

---

## One-time Apple Setup

These are done once in the Apple Developer Portal and App Store Connect:

1. **Register staging bundle ID** — [developer.apple.com](https://developer.apple.com) → Certificates, Identifiers & Profiles → Identifiers → `+` → `com.culyn-ai.staging`
2. **Create staging app in App Store Connect** — [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → My Apps → `+` → New App → use `com.culyn-ai.staging`
3. **Add internal testers** — TestFlight → Internal Testing → add yourself and testers

---

## EAS Credentials (first EAS build only)

```bash
eas credentials
```

Lets EAS auto-manage signing certificates and provisioning profiles.

---

## Version Management

EAS handles build number auto-increment (`appVersionSource: "remote"` in `eas.json`).

```bash
# Check current build number
eas build:version:get -p ios

# Set manually if needed
eas build:version:set -p ios --build-number 42
```

---

## Key Files

| File                  | Purpose                                                             |
| --------------------- | ------------------------------------------------------------------- |
| `app.config.ts`       | Dynamic config — switches bundle ID and app name based on `APP_ENV` |
| `eas.json`            | EAS build profiles (production only)                                |
| `.env.staging`        | Staging env vars (gitignored)                                       |
| `.env.production`     | Production env vars (gitignored)                                    |
| `constants/config.ts` | Runtime `APP_ENV` and `API_URL` exports                             |
| `lib/api.ts`          | Axios client using `API_URL` from `constants/config.ts`             |
