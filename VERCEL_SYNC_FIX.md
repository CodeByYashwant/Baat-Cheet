# Fixing Vercel-GitHub Sync Issues

## Quick Fixes

### Option 1: Check Vercel Project Settings (Recommended)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (baat-cheet)
3. **Go to Settings** → **Git**
4. **Check the following**:
   - **Repository**: Should be connected to `CodeByYashwant/Baat-Cheet`
   - **Production Branch**: Should be `main` (or `master`)
   - **Root Directory**: **MUST be set to `frontend`** (this is likely the issue!)
   - **Build Command**: Should be `npm run build` or `npm install && npm run build`
   - **Output Directory**: Should be `build`

### Option 2: Reconnect GitHub Integration

1. Go to **Settings** → **Git**
2. Click **Disconnect** next to your GitHub repository
3. Click **Connect Git Repository**
4. Select your repository again
5. **IMPORTANT**: Set **Root Directory** to `frontend`
6. Configure:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`
7. Click **Deploy**

### Option 3: Manual Deployment Trigger

1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on the latest deployment
3. Or click **Deploy** → **Deploy Latest Commit**

### Option 4: Check Webhook Status

1. Go to **Settings** → **Git**
2. Check if there's a webhook error
3. If webhook is broken:
   - Disconnect and reconnect the repository
   - Or manually trigger a deployment

## Verify Your Configuration

Your `vercel.json` is in the `frontend/` directory, which is correct. But Vercel needs to know to:
1. Look in the `frontend/` directory for the project
2. Run `npm install` and `npm run build` from that directory
3. Use the `build/` folder as output

## Common Issues

### Issue: Vercel is building from root directory
**Solution**: Set Root Directory to `frontend` in Vercel settings

### Issue: Build fails because it can't find package.json
**Solution**: Root Directory must be `frontend`

### Issue: Webhook not triggering
**Solution**: 
- Check GitHub repository settings → Webhooks
- Verify Vercel webhook is active
- Reconnect if needed

### Issue: Wrong branch
**Solution**: Make sure Production Branch is set to `main` (or your default branch)

## Quick Test

After fixing the settings:
1. Make a small change (add a comment in a file)
2. Commit and push: `git add . && git commit -m "test" && git push`
3. Check Vercel dashboard - should see a new deployment starting automatically

## If Still Not Working

1. **Check Vercel Build Logs**:
   - Go to Deployments → Click on latest deployment → View Build Logs
   - Look for errors

2. **Verify GitHub Connection**:
   - Go to GitHub → Your repo → Settings → Webhooks
   - Check if Vercel webhook exists and is active

3. **Manual Deploy via Vercel CLI** (if needed):
   ```bash
   cd frontend
   npm install -g vercel
   vercel --prod
   ```

