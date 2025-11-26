# ⚡ NOCTURNE FLUTTER - QUICK START (5 MINUTES)

## 🎯 Goal
Get the Flutter app running on your Android emulator in 5 minutes!

## ✅ Prerequisites Check

Run these commands to verify you have everything:

```bash
flutter --version    # Should show Flutter 3.0+
flutter doctor       # Check for any issues
```

If Flutter is not installed, download from: https://docs.flutter.dev/get-started/install/windows

## 🚀 3-Step Setup

### Step 1: Install Dependencies (1 minute)

```bash
cd nocturne_flutter
flutter pub get
```

### Step 2: Update API URL (30 seconds)

Open `lib/services/api_service.dart` and change line 4:

```dart
static const String baseUrl = 'http://10.0.2.2:5000';  // For Android Emulator
```

### Step 3: Run the App (1 minute)

Make sure your backend is running first:
```bash
cd ..
npm run dev
```

Then in a new terminal:
```bash
cd nocturne_flutter
flutter run
```

## 🎉 That's It!

The app should launch on your emulator. You'll see:
- ✅ NOCTURNE shop screen with products
- ✅ Category filters at the top
- ✅ Product grid with gothic fashion items
- ✅ Bottom navigation bar

## 🔥 Testing Features

### Without Google Sign-In Setup:
- ✅ Browse products
- ✅ Filter by category
- ✅ View product details
- ❌ Can't add to cart (requires sign-in)

### To Enable Google Sign-In:
See `SETUP_INSTRUCTIONS.md` for full Firebase setup

## 📱 Running on Different Devices

### Android Emulator (Recommended for testing)
```bash
flutter run -d emulator-5554
```

### Physical Android Device
1. Enable USB Debugging on your phone
2. Connect via USB
3. Update API URL to your computer's IP:
   ```dart
   static const String baseUrl = 'http://192.168.1.XXX:5000';
   ```
4. Run: `flutter run`

### iOS Simulator (Mac only)
```bash
flutter run -d iPhone
```
API URL can stay as `http://localhost:5000`

## 🐛 Quick Troubleshooting

**Problem:** "Unable to connect to backend"
```bash
# Check backend is running
curl http://localhost:5000/api/products

# For Android emulator, use 10.0.2.2 instead of localhost
```

**Problem:** "Build failed"
```bash
flutter clean
flutter pub get
flutter run
```

**Problem:** "No devices found"
```bash
# Start Android emulator
flutter emulators --launch <emulator_id>

# Or open Android Studio → AVD Manager → Start emulator
```

## 🎨 What You'll See

```
┌─────────────────────────┐
│  NOCTURNE               │  ← Header
│  LUXURY DARKNESS        │
├─────────────────────────┤
│ [ALL] [Corsets] [...]   │  ← Category Filters
├─────────────────────────┤
│  ┌────┐  ┌────┐        │
│  │IMG │  │IMG │        │  ← Product Grid
│  │$$$│  │$$$│        │
│  └────┘  └────┘        │
│  ┌────┐  ┌────┐        │
│  │IMG │  │IMG │        │
│  │$$$│  │$$$│        │
│  └────┘  └────┘        │
├─────────────────────────┤
│ [🏠] [🔍] [🛒] [❤] [👤] │  ← Bottom Nav
└─────────────────────────┘
```

## 🎯 Next Steps

1. ✅ App is running? Great!
2. 📱 Test on physical device (optional)
3. 🔥 Set up Firebase for Google Sign-In (see SETUP_INSTRUCTIONS.md)
4. 🎨 Customize theme colors (lib/config/theme.dart)
5. ✨ Add more features!

## 📚 Full Documentation

- **README.md** - Complete project overview
- **SETUP_INSTRUCTIONS.md** - Detailed Firebase setup
- **lib/** - Source code with comments

## 💡 Tips

- Hot reload: Press `r` in terminal while app is running
- Hot restart: Press `R` in terminal
- Quit: Press `q` in terminal
- Open DevTools: Press `d` in terminal

---

**Need help?** Check `SETUP_INSTRUCTIONS.md` or Flutter docs: https://docs.flutter.dev

