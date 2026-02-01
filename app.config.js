// Load .env from project root so EXPO_PUBLIC_* are available when config is evaluated.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = {
  expo: {
    name: 'naziwatch',
    slug: 'naziwatch',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'naziwatch',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.timosaiya.naziwatch',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription:
          'NaziWatch zeigt Vorfälle in deiner Nähe und ermöglicht anonymes Melden. Dein Standort wird nur grob und nicht dauerhaft gespeichert.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'NaziWatch nutzt deinen Standort nur grob, um Vorfälle in deiner Nähe anzuzeigen. Kein dauerhaftes Tracking.',
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '7848f5fd-c582-4dbb-9ca3-d6e803fc8a14',
      },
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
      EXPO_PUBLIC_SUPABASE_ANON_KEY:
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '',
      EXPO_PUBLIC_SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '',
      EXPO_PUBLIC_ADMIN_MODE: process.env.EXPO_PUBLIC_ADMIN_MODE ?? '',
      EXPO_PUBLIC_ADMIN_CODE: process.env.EXPO_PUBLIC_ADMIN_CODE ?? '',
    },
  },
};
