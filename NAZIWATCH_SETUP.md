# NaziWatch – Setup & Build

## Umgebung

1. **Supabase**
   - Projekt unter [supabase.com](https://supabase.com) anlegen.
   - SQL aus `supabase/schema.sql` im SQL Editor ausführen (Tabellen, RLS, Storage-Bucket).
   - In Projekt-Einstellungen → API: `URL` und `anon` Key kopieren.

2. **Env**
   - `.env.example` nach `.env` kopieren.
   - `EXPO_PUBLIC_SUPABASE_URL` und `EXPO_PUBLIC_SUPABASE_ANON_KEY` setzen.
   - Optional Admin: `EXPO_PUBLIC_ADMIN_MODE=true` und `EXPO_PUBLIC_ADMIN_CODE` setzen.

## Install

```bash
npm install
```

(Alle Abhängigkeiten sind bereits in `package.json`.)

## Dev Build

- **Neuer EAS Dev Build nötig?** **Ja.** Es wurden native Module ergänzt: `react-native-maps`, `expo-location`, `@react-native-community/datetimepicker`, `expo-image-picker`, `expo-secure-store`, `@gorhom/bottom-sheet` (Reanimated/Gesture Handler waren schon da).
- Nach `npm install` und Setzen der Env-Variablen:

```bash
npx expo prebuild --clean
npx expo run:ios
```

Oder mit EAS:

```bash
eas build --profile development --platform ios
```

## Moderation

- **Öffentliche Lese-Ansicht:** Nur `status = 'approved'` (RLS).
- **Approve/Reject in der App:** Der Admin-Screen nutzt den Anon-Client; ohne weitere Konfiguration erlaubt RLS keine Updates. Optionen:
  1. **Supabase Dashboard:** In der Tabelle `incidents` Zeilen bearbeiten und `status` auf `approved`/`rejected` setzen.
  2. **In-App Admin:** Dafür braucht es z. B. Supabase Auth mit Admin-Rolle und eine RLS-Policy, die UPDATE nur für diese Rolle erlaubt, oder einen eigenen Backend/Edge Function mit Service-Role.

## Apple Maps (iOS)

- Auf iOS nutzt `react-native-maps` standardmäßig Apple Maps (kein Google API Key nötig).
