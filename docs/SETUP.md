# Vercel KV Setup Guide

This guide will help you set up Vercel KV (Upstash Redis) and OAuth authentication for your Cube Timer app.

## Prerequisites

- Vercel account (free tier works)
- GitHub/Google account (for OAuth, optional)

## Step 1: Create Vercel KV Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project → **Storage** tab
3. Click **Create Database** → Select **KV** (Key-Value Store)
4. Give it a name (e.g., "cube-timer-kv")
5. Select your region (choose closest to your users)
6. Click **Create**

## Step 2: Get KV Credentials

After creating the database:

1. Go to the KV database page
2. Click on the **Settings** or **Quickstart** tab
3. You'll see two environment variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
4. Copy these values

## Step 3: Update Local Environment Variables

Open `.env.local` and replace the placeholders:

```env
# Replace these with your actual KV credentials
KV_REST_API_URL="https://your-unique-url.upstash.io"
KV_REST_API_TOKEN="AXXXxxxx_your_actual_token_here"

# This is already generated, don't change
NEXTAUTH_SECRET="/yhpCJ+nZMqwjEdMH0nYKT6VfRu5um+Z32CaE5S28qg="
NEXTAUTH_URL="http://localhost:3000"
```

## Step 4: Set Up OAuth Providers (Optional)

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - **Application name**: Cube Timer
   - **Homepage URL**: `http://localhost:3000` (for dev) or your production URL
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click **Register application**
5. Copy **Client ID** and generate a **Client Secret**
6. Update `.env.local`:

```env
GITHUB_ID="your_github_client_id"
GITHUB_SECRET="your_github_client_secret"
```

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth Client ID**
5. Configure OAuth consent screen if prompted
6. Select **Web application**
7. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
8. Copy **Client ID** and **Client Secret**
9. Update `.env.local`:

```env
GOOGLE_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_SECRET="your_google_client_secret"
```

## Step 5: Deploy to Vercel

### Add Environment Variables to Vercel

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add each variable from your `.env.local`:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your production URL, e.g., `https://cube-timer.vercel.app`)
   - `GITHUB_ID` (if using GitHub OAuth)
   - `GITHUB_SECRET` (if using GitHub OAuth)
   - `GOOGLE_ID` (if using Google OAuth)
   - `GOOGLE_SECRET` (if using Google OAuth)
3. Select which environments to apply to (Production, Preview, Development)

**Important:** When deploying to production:
- Update `NEXTAUTH_URL` to your production URL
- Update OAuth callback URLs in GitHub/Google settings to use production URL

### Deploy

```bash
# Push to GitHub (triggers automatic Vercel deployment if connected)
git add .
git commit -m "Add Vercel KV and OAuth authentication"
git push origin main

# OR deploy directly with Vercel CLI
source ~/.nvm/nvm.sh && vercel --prod --yes
```

## Step 6: Update OAuth Callback URLs for Production

After deployment:

1. **GitHub**: Add production callback URL
   - Go to your OAuth App settings
   - Add: `https://your-domain.vercel.app/api/auth/callback/github`

2. **Google**: Add production callback URL
   - Go to your OAuth Client settings
   - Add authorized redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`

## Testing

### Local Development

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Test the features:
   - App should work normally (localStorage fallback)
   - Click Settings (gear icon) → See "Sign in to sync" button
   - Click "Sign in" → Choose OAuth provider
   - After sign-in, your data should sync to cloud
   - Open in another browser/device → Sign in → See same data

### Production

1. Visit your deployed URL
2. Test anonymous usage (works without sign-in)
3. Test OAuth sign-in
4. Verify cross-device sync

## Troubleshooting

### "KV credentials not configured" warning

This is normal if you haven't set up KV yet. The app will continue to work with localStorage only.

### OAuth sign-in not working

- Check callback URLs match exactly (including https vs http)
- Verify environment variables are set in Vercel
- Check browser console for errors
- Ensure OAuth app is not in "suspended" or "review" status

### Data not syncing

- Check sync status in Settings panel
- Open browser console, look for sync errors
- Verify KV credentials are correct
- Check Upstash dashboard for usage/errors

### Build failures

- Ensure all environment variables are set
- Check for TypeScript errors: `npm run build`
- Review build logs in Vercel dashboard

## Free Tier Limits

- **Vercel KV**: 256MB storage, 500K commands/month (~500 active users)
- **NextAuth.js**: No limits (open source)
- **Vercel Hosting**: 100GB bandwidth/month

## Security Notes

- Never commit `.env.local` to git (it's in `.gitignore`)
- Rotate secrets if accidentally exposed
- Use strong `NEXTAUTH_SECRET` (already generated for you)
- Review OAuth app permissions regularly

## Next Steps

- Test multi-device sync
- Monitor usage in Upstash/Vercel dashboards
- Consider adding data export feature
- Set up error monitoring (Sentry, etc.)

---

Need help? Check the [Next-Auth documentation](https://next-auth.js.org/) or [Vercel KV documentation](https://vercel.com/docs/storage/vercel-kv).
