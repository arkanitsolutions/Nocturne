# 🚀 NocturneLux Deployment Guide

## Complete Setup & Deployment Instructions

---

## 📋 OVERVIEW

Your project has 3 parts to deploy:

| Component | Technology | Deploy To |
|-----------|------------|-----------|
| **Backend API** | Node.js/Express | Railway, Render, or Heroku |
| **Web App** | React/Vite | Vercel, Netlify, or Cloudflare |
| **Mobile App** | Flutter | Google Play Store / APK |

---

## 🔧 PART 1: BACKEND DEPLOYMENT

### Option A: Deploy to Railway (Recommended - Free Tier)

**Step 1: Create Railway Account**
1. Go to https://railway.app
2. Sign up with GitHub

**Step 2: Deploy**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd NocturneLuxUI
railway init

# Deploy
railway up
```

**Step 3: Get Your URL**
- Railway gives you: `https://your-app.railway.app`
- This is your **API_URL**

### Option B: Deploy to Render (Free Tier)

1. Go to https://render.com
2. Connect GitHub repo
3. Create **New Web Service**
4. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

### Environment Variables (Set in Dashboard)

```env
NODE_ENV=production
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
JWT_SECRET=your-secure-secret-key
```

---

## 🌐 PART 2: WEB APP DEPLOYMENT

### Option A: Deploy to Vercel (Recommended - Free)

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Build & Deploy**
```bash
cd NocturneLuxUI

# Build the app
npm run build

# Deploy
vercel
```

**Step 3: Set Environment Variables**
In Vercel Dashboard → Settings → Environment Variables:
```
VITE_API_URL=https://your-backend.railway.app
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

### Option B: Deploy to Netlify

1. Go to https://netlify.com
2. Drag & drop `dist` folder after running `npm run build`
3. Or connect GitHub for auto-deploy

---

## 📱 PART 3: FLUTTER APP DEPLOYMENT

### Connect Flutter to Backend

**Edit `nocturne_flutter/lib/services/api_service.dart`:**

```dart
class ApiService {
  // Change to your deployed backend URL
  static const String baseUrl = 'https://your-backend.railway.app';
  
  // ...rest of code
}
```

### Build Release APK

```bash
cd nocturne_flutter

# Build APK
flutter build apk --release

# APK location: build/app/outputs/flutter-apk/app-release.apk
```

### Deploy to Google Play Store

1. **Create Developer Account**: https://play.google.com/console ($25 one-time)

2. **Create Signing Key**:
```bash
keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

3. **Configure Signing** - Create `android/key.properties`:
```properties
storePassword=YOUR_PASSWORD
keyPassword=YOUR_PASSWORD
keyAlias=upload
storeFile=../upload-keystore.jks
```

4. **Build App Bundle**:
```bash
flutter build appbundle --release
```

5. **Upload to Play Console**:
   - Create new app
   - Upload `.aab` file
   - Fill store listing
   - Submit for review

---

## 🔗 CONNECTING EVERYTHING

### After Backend Deployment:

**1. Update Web App** (`client/src/lib/api.ts`):
```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'https://your-backend.railway.app';
```

**2. Update Flutter App** (`lib/services/api_service.dart`):
```dart
static const String baseUrl = 'https://your-backend.railway.app';
```

**3. Rebuild & Redeploy**:
```bash
# Web
npm run build && vercel --prod

# Flutter
flutter build apk --release
```

---

## ⚡ QUICK DEPLOY CHECKLIST

### Backend:
- [ ] Push code to GitHub
- [ ] Create Railway/Render account
- [ ] Deploy backend
- [ ] Set environment variables
- [ ] Get API URL

### Web App:
- [ ] Update API URL in code
- [ ] Run `npm run build`
- [ ] Deploy to Vercel/Netlify
- [ ] Set environment variables
- [ ] Test all features

### Mobile App:
- [ ] Update API URL in code
- [ ] Build release APK
- [ ] Test on real device
- [ ] Create Play Store listing (optional)
- [ ] Upload and publish (optional)

---

## 🔒 PRODUCTION CHECKLIST

Before going live:

- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Get real Razorpay API keys
- [ ] Set up proper database (PostgreSQL recommended)
- [ ] Enable HTTPS on all endpoints
- [ ] Add rate limiting
- [ ] Set up error monitoring (Sentry)
- [ ] Configure CORS for your domains

---

## 📊 ESTIMATED COSTS

| Service | Free Tier | Paid |
|---------|-----------|------|
| Railway | 500 hours/month | $5/month |
| Vercel | 100GB bandwidth | $20/month |
| Render | 750 hours/month | $7/month |
| Play Store | - | $25 one-time |

**Total for hobby project: $0 - $25**

---

## 🆘 NEED HELP?

**Common Issues:**

1. **CORS Error**: Add your frontend URL to backend CORS config
2. **API Not Loading**: Check API URL in environment variables
3. **Images Not Loading**: Ensure image URLs are accessible
4. **Auth Not Working**: Check Firebase config for production domain

---

## 🎉 DEPLOYMENT COMPLETE!

Once deployed, you'll have:

✅ **Web App**: `https://your-app.vercel.app`  
✅ **API**: `https://your-backend.railway.app`  
✅ **Mobile APK**: Ready for distribution  

**Your NocturneLux e-commerce platform is live!** 🚀

