# 📱 NocturneLux - APK Build Guide

## 🚀 Building Your Android APK

This guide will help you build the NocturneLux Flutter app as an installable APK file.

---

## 📋 PREREQUISITES

Before building, make sure you have:

✅ **Flutter SDK** installed (from Downloads folder)  
✅ **Android SDK** configured  
✅ **Java JDK** installed  
✅ **Android Emulator** or physical device  

---

## 🔨 BUILD COMMANDS

### **1. Debug APK** (For Testing)

**Command**:
```bash
cd nocturne_flutter
flutter build apk --debug
```

**Output Location**:
```
nocturne_flutter/build/app/outputs/flutter-apk/app-debug.apk
```

**Size**: ~40-60 MB  
**Use Case**: Testing on devices, debugging  
**Performance**: Slower, includes debug symbols  

---

### **2. Release APK** (For Distribution)

**Command**:
```bash
cd nocturne_flutter
flutter build apk --release
```

**Output Location**:
```
nocturne_flutter/build/app/outputs/flutter-apk/app-release.apk
```

**Size**: ~20-30 MB (smaller, optimized)  
**Use Case**: Production, distribution to users  
**Performance**: Optimized, faster  

---

### **3. Split APKs** (Smaller Size)

**Command**:
```bash
cd nocturne_flutter
flutter build apk --split-per-abi
```

**Output Location**:
```
nocturne_flutter/build/app/outputs/flutter-apk/
  - app-armeabi-v7a-release.apk  (~15 MB)
  - app-arm64-v8a-release.apk    (~18 MB)
  - app-x86_64-release.apk       (~20 MB)
```

**Use Case**: Smaller APKs for specific device architectures  
**Benefit**: Users download only what they need  

---

## 📦 RECOMMENDED BUILD

For **testing and sharing**, use:

```bash
cd nocturne_flutter
flutter build apk --release
```

This creates a **single universal APK** that works on all Android devices.

---

## 🔐 SIGNING THE APK (Optional - For Production)

For **Google Play Store** or **production distribution**, you need to sign the APK.

### **Step 1: Create Keystore**

```bash
keytool -genkey -v -keystore nocturne-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias nocturne
```

**Save this file securely!** You'll need it for all future updates.

### **Step 2: Create key.properties**

Create `nocturne_flutter/android/key.properties`:

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=nocturne
storeFile=../../nocturne-release-key.jks
```

### **Step 3: Update build.gradle**

Edit `nocturne_flutter/android/app/build.gradle`:

```gradle
// Add before android block
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing config ...
    
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### **Step 4: Build Signed APK**

```bash
flutter build apk --release
```

---

## 📲 INSTALLING THE APK

### **On Emulator**:

```bash
flutter install
```

Or drag-and-drop the APK onto the emulator.

### **On Physical Device**:

1. **Enable USB Debugging** on your Android device
2. **Connect via USB**
3. Run:
   ```bash
   flutter install
   ```

Or:

1. **Transfer APK** to device (email, USB, cloud)
2. **Open APK** on device
3. **Allow installation** from unknown sources
4. **Install**

---

## 🎯 QUICK BUILD SCRIPT

I'll build the release APK for you now!

**Building**: `flutter build apk --release`

**This will**:
- ✅ Compile Dart code to native ARM code
- ✅ Optimize assets and images
- ✅ Create production-ready APK
- ✅ Output to `build/app/outputs/flutter-apk/`

**Estimated time**: 2-5 minutes

---

## 📊 APK SIZE OPTIMIZATION

To reduce APK size:

1. **Use split APKs**: `--split-per-abi`
2. **Remove unused resources**: Already done by Flutter
3. **Compress images**: Use WebP format
4. **Enable ProGuard**: Add to `build.gradle`

---

## 🔍 TROUBLESHOOTING

### **Error: SDK not found**
```bash
flutter doctor
```
Fix any issues shown.

### **Error: Gradle build failed**
```bash
cd nocturne_flutter/android
./gradlew clean
cd ../..
flutter clean
flutter pub get
flutter build apk --release
```

### **Error: Signing failed**
Make sure `key.properties` path is correct and keystore file exists.

---

## ✅ VERIFICATION

After building, verify the APK:

```bash
# Check APK exists
ls -lh nocturne_flutter/build/app/outputs/flutter-apk/

# Install and test
flutter install
```

---

## 🎉 SUCCESS!

Once built, you'll have:

📦 **app-release.apk** - Ready to install on any Android device!

**Share it with**:
- Friends and family
- Beta testers
- Customers

**Or upload to**:
- Google Play Store
- Your website
- App distribution platforms

---

**Let me build it for you now!** 🚀

