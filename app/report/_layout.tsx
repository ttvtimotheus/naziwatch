import { Stack } from 'expo-router';

export default function ReportLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, title: 'Vorfall melden' }}>
      <Stack.Screen name="index" options={{ title: 'Kategorie' }} />
      <Stack.Screen name="location" options={{ title: 'Ort' }} />
      <Stack.Screen name="time" options={{ title: 'Zeitpunkt' }} />
      <Stack.Screen name="description" options={{ title: 'Beschreibung' }} />
      <Stack.Screen name="media" options={{ title: 'Medien' }} />
      <Stack.Screen name="review" options={{ title: 'Überprüfen' }} />
      <Stack.Screen name="success" options={{ title: 'Eingegangen', headerBackVisible: false }} />
    </Stack>
  );
}
