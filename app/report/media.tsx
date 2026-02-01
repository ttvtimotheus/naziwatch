import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useReportStore } from '@/store/report-store';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ReportMediaScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { mediaUris, addMedia, removeMedia } = useReportStore();
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung', 'Zugriff auf Fotos ist nötig, um ein Bild hinzuzufügen.');
      return;
    }
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        addMedia(result.assets[0].uri, 'image');
      }
    } finally {
      setLoading(false);
    }
  };

  const skip = () => router.push('/report/review');
  const next = () => router.push('/report/review');

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.hint, { color: colors.icon }]}>
        Optional: Foto oder Video hinzufügen. Metadaten werden beim Upload entfernt. Keine Gesichter oder identifizierbaren Personen.
      </Text>
      <Pressable style={[styles.addBtn, { borderColor: colors.border }]} onPress={pickImage} disabled={loading}>
        <Ionicons name="image-outline" size={32} color={colors.icon} />
        <Text style={[styles.addBtnText, { color: colors.text }]}>Foto auswählen</Text>
      </Pressable>
      {mediaUris.length > 0 && (
        <View style={styles.list}>
          {mediaUris.map((m, i) => (
            <View key={i} style={[styles.mediaRow, { borderColor: colors.border }]}>
              <Text style={[styles.mediaLabel, { color: colors.text }]} numberOfLines={1}>
                {m.type === 'image' ? 'Bild' : 'Video'} {i + 1}
              </Text>
              <Pressable onPress={() => removeMedia(i)}>
                <Ionicons name="close-circle" size={24} color={colors.tint} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
      <Pressable style={[styles.skipBtn, { borderColor: colors.border }]} onPress={skip}>
        <Text style={[styles.skipBtnText, { color: colors.text }]}>Ohne Medien fortfahren</Text>
      </Pressable>
      <Pressable style={[styles.primaryBtn, { backgroundColor: colors.tint }]} onPress={next}>
        <Text style={styles.primaryBtnText}>Weiter zur Überprüfung</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: Spacing.xl * 2 },
  hint: { fontSize: 14, marginBottom: Spacing.lg },
  addBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  addBtnText: { marginTop: Spacing.sm },
  list: { marginBottom: Spacing.lg },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  mediaLabel: { flex: 1 },
  skipBtn: {
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  skipBtnText: { fontSize: 16 },
  primaryBtn: { paddingVertical: Spacing.lg, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
