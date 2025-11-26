import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for macos - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyATN7Ki99bqhpCeYUcVZLIMJvVX6Poxfmg',
    appId: '1:160460803106:web:735eaaf3be0244e7eb4e7b',
    messagingSenderId: '160460803106',
    projectId: 'clothingstore-d2254',
    authDomain: 'clothingstore-d2254.firebaseapp.com',
    storageBucket: 'clothingstore-d2254.firebasestorage.app',
    measurementId: 'G-026894KEV3',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyATN7Ki99bqhpCeYUcVZLIMJvVX6Poxfmg',
    appId: '1:160460803106:android:YOUR_ANDROID_APP_ID',
    messagingSenderId: '160460803106',
    projectId: 'clothingstore-d2254',
    storageBucket: 'clothingstore-d2254.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyATN7Ki99bqhpCeYUcVZLIMJvVX6Poxfmg',
    appId: '1:160460803106:ios:YOUR_IOS_APP_ID',
    messagingSenderId: '160460803106',
    projectId: 'clothingstore-d2254',
    storageBucket: 'clothingstore-d2254.firebasestorage.app',
    iosBundleId: 'com.nocturne.app',
  );
}

