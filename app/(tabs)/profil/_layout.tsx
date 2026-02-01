import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';

export default function ProfilLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.tint,
        headerTitleStyle: { color: colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Profil', headerLargeTitle: false }} />
      <Stack.Screen name="datenschutz" options={{ title: 'Datenschutz' }} />
      <Stack.Screen name="regeln" options={{ title: 'Regeln & Nutzung' }} />
      <Stack.Screen name="faq" options={{ title: 'FAQ' }} />
    </Stack>
  );
}
