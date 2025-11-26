# 🖤 NOCTURNE - Flutter Dark E-Commerce App

A beautiful gothic-themed e-commerce mobile application built with Flutter, featuring Firebase authentication and a dark, elegant UI.

## ✨ Features

- 🔥 **Firebase Google Authentication** - Sign in with Google
- 🛍️ **Product Catalog** - Browse gothic fashion items
- 🛒 **Shopping Cart** - Add/remove items, adjust quantities
- 💳 **Checkout Flow** - Complete orders with payment method selection
- 👤 **User Profile** - View account info and order history
- 🎨 **Dark Gothic Theme** - Elegant black & white design
- 📱 **Mobile-First** - Optimized for mobile devices
- 🔄 **State Management** - Provider pattern for reactive UI
- 🌐 **API Integration** - Connects to Express.js backend

## 🚀 Getting Started

### Prerequisites

- Flutter SDK (3.0.0 or higher)
- Dart SDK
- Android Studio / Xcode (for emulators)
- Node.js backend running on `http://localhost:5000`

### Installation

1. **Install Flutter dependencies:**
   ```bash
   cd nocturne_flutter
   flutter pub get
   ```

2. **Configure Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Add Android/iOS apps to your project
   - Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
   - Place them in the appropriate directories:
     - Android: `android/app/google-services.json`
     - iOS: `ios/Runner/GoogleService-Info.plist`
   - Update `lib/config/firebase_options.dart` with your app IDs

3. **Update API URL:**
   - Open `lib/services/api_service.dart`
   - Change `baseUrl` to your backend URL:
     - For Android Emulator: `http://10.0.2.2:5000`
     - For iOS Simulator: `http://localhost:5000`
     - For Physical Device: `http://YOUR_COMPUTER_IP:5000`

4. **Run the app:**
   ```bash
   flutter run
   ```

## 📁 Project Structure

```
nocturne_flutter/
├── lib/
│   ├── config/
│   │   ├── firebase_options.dart    # Firebase configuration
│   │   ├── routes.dart               # App routing
│   │   └── theme.dart                # Dark theme configuration
│   ├── models/
│   │   ├── product.dart              # Product model
│   │   ├── cart_item.dart            # Cart item model
│   │   └── order.dart                # Order model
│   ├── providers/
│   │   ├── auth_provider.dart        # Authentication state
│   │   ├── products_provider.dart    # Products state
│   │   └── cart_provider.dart        # Cart state
│   ├── screens/
│   │   ├── shop_screen.dart          # Main shop page
│   │   ├── cart_screen.dart          # Shopping cart
│   │   ├── checkout_screen.dart      # Checkout flow
│   │   ├── profile_screen.dart       # User profile
│   │   └── product_detail_screen.dart # Product details
│   ├── services/
│   │   └── api_service.dart          # Backend API calls
│   ├── widgets/
│   │   ├── product_card.dart         # Product card component
│   │   ├── category_chips.dart       # Category filter chips
│   │   └── bottom_nav_bar.dart       # Bottom navigation
│   └── main.dart                     # App entry point
├── pubspec.yaml                      # Dependencies
└── README.md                         # This file
```

## 🎨 Theme

The app uses a custom dark gothic theme with:
- **Primary Color:** Stark White (#F2F2F2)
- **Background:** Void Black (#080808)
- **Accent:** Charcoal Gray (#1A1A1A)
- **Fonts:** 
  - Cinzel (Display/Headers)
  - Cormorant Garamond (Titles)
  - Inter (Body Text)

## 📦 Dependencies

- `firebase_core` & `firebase_auth` - Authentication
- `google_sign_in` - Google Sign-In
- `provider` - State management
- `go_router` - Navigation
- `http` & `dio` - API calls
- `cached_network_image` - Image caching
- `google_fonts` - Custom fonts

## 🔧 Configuration

### Backend API

Make sure your Express.js backend is running with these endpoints:

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/cart/:userId` - Get user cart
- `POST /api/cart` - Add to cart
- `PATCH /api/cart/:id` - Update cart quantity
- `DELETE /api/cart/:id` - Remove from cart
- `GET /api/orders/:userId` - Get user orders
- `POST /api/orders` - Create order

### Firebase Setup

1. Enable Google Sign-In in Firebase Console
2. Add SHA-1 fingerprint for Android (for Google Sign-In)
3. Update `firebase_options.dart` with your credentials

## 🏃 Running on Different Platforms

### Android
```bash
flutter run -d android
```

### iOS
```bash
flutter run -d ios
```

### Web (Not recommended for this app)
```bash
flutter run -d chrome
```

## 🐛 Troubleshooting

**Issue:** Can't connect to backend
- **Solution:** Update `baseUrl` in `api_service.dart` to correct IP/URL

**Issue:** Google Sign-In not working on Android
- **Solution:** Add SHA-1 fingerprint to Firebase Console

**Issue:** Images not loading
- **Solution:** Check backend is serving images correctly

## 📱 Screenshots

(Add screenshots of your app here)

## 🤝 Contributing

This is a demo project. Feel free to fork and customize!

## 📄 License

MIT License

## 👨‍💻 Author

Created for NocturneLux E-Commerce Platform

