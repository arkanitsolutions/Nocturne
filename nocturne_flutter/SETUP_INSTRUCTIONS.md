# 🚀 NOCTURNE FLUTTER - QUICK SETUP GUIDE

## Step 1: Install Flutter

If you don't have Flutter installed:

1. Download Flutter SDK: https://docs.flutter.dev/get-started/install/windows
2. Extract to `C:\src\flutter`
3. Add to PATH: `C:\src\flutter\bin`
4. Run: `flutter doctor` to verify installation

## Step 2: Install Dependencies

```bash
cd nocturne_flutter
flutter pub get
```

## Step 3: Configure Firebase for Android/iOS

### Option A: Use Existing Web Configuration (Quick Test)

The app is already configured with Firebase web credentials. You can test it immediately on an emulator, but Google Sign-In won't work until you add Android/iOS apps.

### Option B: Add Android/iOS Apps (For Full Functionality)

1. Go to: https://console.firebase.google.com/project/clothingstore-d2254
2. Click "Add app" → Select Android or iOS
3. Follow the setup wizard

**For Android:**
- Package name: `com.nocturne.nocturne_flutter`
- Download `google-services.json`
- Place in: `nocturne_flutter/android/app/google-services.json`
- Get SHA-1 fingerprint:
  ```bash
  cd android
  ./gradlew signingReport
  ```
- Add SHA-1 to Firebase Console (for Google Sign-In)

**For iOS:**
- Bundle ID: `com.nocturne.nocturnFlutter`
- Download `GoogleService-Info.plist`
- Place in: `nocturne_flutter/ios/Runner/GoogleService-Info.plist`

## Step 4: Update API URL

Open `lib/services/api_service.dart` and change the `baseUrl`:

**For Android Emulator:**
```dart
static const String baseUrl = 'http://10.0.2.2:5000';
```

**For iOS Simulator:**
```dart
static const String baseUrl = 'http://localhost:5000';
```

**For Physical Device:**
```dart
static const String baseUrl = 'http://YOUR_COMPUTER_IP:5000';
```

To find your computer's IP:
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` (look for inet)

## Step 5: Start Backend Server

Make sure your Express.js backend is running:

```bash
cd ..  # Go back to project root
npm run dev
```

Backend should be running on `http://localhost:5000`

## Step 6: Run Flutter App

### On Android Emulator:
```bash
flutter run -d android
```

### On iOS Simulator (Mac only):
```bash
flutter run -d ios
```

### On Physical Device:
1. Enable USB Debugging (Android) or Developer Mode (iOS)
2. Connect device via USB
3. Run: `flutter devices` to see connected devices
4. Run: `flutter run -d <device-id>`

## 🎯 Quick Test Checklist

- [ ] Backend server running on port 5000
- [ ] Flutter dependencies installed (`flutter pub get`)
- [ ] API URL updated in `api_service.dart`
- [ ] Emulator/device connected
- [ ] App launches successfully
- [ ] Products load on shop screen
- [ ] Can browse products
- [ ] Bottom navigation works

## 🔥 Firebase Authentication Test

**Without Android/iOS app setup:**
- ❌ Google Sign-In will NOT work
- ✅ App will still run and show products
- ✅ Can browse catalog

**With Android/iOS app setup:**
- ✅ Google Sign-In will work
- ✅ Can add to cart
- ✅ Can checkout
- ✅ Can view profile

## 🐛 Common Issues

### Issue: "Unable to connect to backend"
**Solution:** 
- Check backend is running: `http://localhost:5000/api/products`
- Update `baseUrl` in `api_service.dart`
- For Android emulator, use `10.0.2.2` instead of `localhost`

### Issue: "Google Sign-In failed"
**Solution:**
- Add Android/iOS app to Firebase Console
- Download and add `google-services.json` or `GoogleService-Info.plist`
- For Android: Add SHA-1 fingerprint to Firebase

### Issue: "Images not loading"
**Solution:**
- Check backend is serving images from `/assets` route
- Verify image URLs in product data

### Issue: "Build failed"
**Solution:**
- Run: `flutter clean`
- Run: `flutter pub get`
- Try again: `flutter run`

## 📱 Testing Without Firebase Setup

You can test the app without setting up Android/iOS Firebase apps:

1. Comment out Google Sign-In button in `shop_screen.dart`
2. The app will work for browsing products
3. Cart and checkout will require authentication

## 🎨 Customization

### Change Theme Colors
Edit `lib/config/theme.dart`:
```dart
static const Color voidBlack = Color(0xFF080808);
static const Color starkWhite = Color(0xFFF2F2F2);
static const Color crimsonRed = Color(0xFFDC2626);
```

### Change Fonts
Edit `lib/config/theme.dart`:
```dart
displayFontFamily: GoogleFonts.cinzel().fontFamily,
headlineFontFamily: GoogleFonts.cormorantGaramond().fontFamily,
bodyFontFamily: GoogleFonts.inter().fontFamily,
```

## 🚀 Next Steps

1. Test the app on emulator
2. Add Firebase Android/iOS apps for full functionality
3. Test Google Sign-In
4. Test cart and checkout flow
5. Customize theme and branding
6. Add more features!

## 📞 Need Help?

- Flutter Docs: https://docs.flutter.dev
- Firebase Docs: https://firebase.google.com/docs
- Flutter Community: https://flutter.dev/community

---

**Ready to run?** Execute: `flutter run`

