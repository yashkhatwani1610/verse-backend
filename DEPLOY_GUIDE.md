# 🚀 Deploy VERSE Website - Get Permanent Private URL

## 🎯 Quick Deploy to Vercel (5 Minutes)

Follow these simple steps to get your permanent URL:

---

## Step 1: Install Vercel CLI

Open terminal and run:

```bash
npm install -g vercel
```

---

## Step 2: Prepare Your Project

```bash
cd "/Users/yashkhatwani/Documents/Virtual try on project /website"
```

---

## Step 3: Deploy to Vercel

```bash
vercel
```

**You'll be asked:**

1. **"Set up and deploy?"** → Press `Y` (Yes)
2. **"Which scope?"** → Choose your account (or create one)
3. **"Link to existing project?"** → Press `N` (No)
4. **"Project name?"** → Type: `verse-website` (or any name)
5. **"Directory?"** → Press Enter (use current)
6. **"Override settings?"** → Press `N` (No)

**Wait 30 seconds... Done!** ✅

You'll get a URL like: `https://verse-website-abc123.vercel.app`

---

## Step 4: Add Password Protection

### Option A: Using Vercel Dashboard (Easiest)

1. Go to: https://vercel.com/dashboard
2. Click on your project (`verse-website`)
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `PROTECTION_BYPASS`: `your-secret-password`
5. Redeploy: `vercel --prod`

### Option B: Add Basic Auth Middleware

I've created a middleware file for you (see below).

---

## Step 5: Share Your URL

**Your permanent URL**: `https://verse-website-xyz.vercel.app`

**Share with close people**:
- Give them the URL
- Give them the password
- They can access anytime!

---

## 🔒 Password Protection Setup

I'll create a simple auth middleware for you. After deployment, only people with the password can access.

---

## ⚠️ Important Notes

### Backend (Python API) Won't Work on Vercel

Vercel only hosts the **frontend** (React website). Your Python backend needs separate hosting.

**Two options:**

### Option 1: Keep Backend Local (For Testing)
- Deploy frontend to Vercel
- Keep Python backend running locally
- Use ngrok for backend: `ngrok http 7860`
- Update frontend to use ngrok URL

### Option 2: Deploy Backend Separately (For Production)
- Frontend: Vercel (free)
- Backend: Railway/Render (free tier)
- I can help set this up!

---

## 🎯 What I Recommend

**For private sharing with close people:**

1. **Deploy frontend to Vercel** (permanent URL)
2. **Keep backend local** with ngrok (for now)
3. **Later**: Deploy backend to Railway when ready for production

---

## 📝 Next Steps

1. Run the commands above
2. Get your Vercel URL
3. Let me know if you want to add password protection
4. I'll help you connect the backend!

**Ready to deploy?** Just run the commands in order! 🚀
