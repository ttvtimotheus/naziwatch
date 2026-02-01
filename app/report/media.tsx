import { ReportStepIndicator } from '@/components/report-step-indicator';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useReportStore } from '@/store/report-store';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReportMediaScreen() {
  const insets = useSafeAreaInsets();
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
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        addMedia(result.assets[0].uri, 'image');
      }
    } finally {
      setLoading(false);
    }
  };

  const goToReview = () => router.push('/report/review');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xxl }]}
    >
      <ReportStepIndicator current={5} />
      <Text style={[styles.title, { color: colors.text }]}>Medien (optional)</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>
        Foto hinzufügen, wenn es den Vorfall sachlich verdeutlicht. Metadaten werden entfernt. Keine Gesichter oder identifizierbaren Personen.
      </Text>

      <Pressable
        style={[styles.addCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}
        onPress={pickImage}
        disabled={loading}
      >
        <View style={[styles.addIconWrap, { backgroundColor: colors.background }]}>
          <Ionicons name="image-outline" size={40} color={colors.tint} />
        </View>
        <Text style={[styles.addTitle, { color: colors.text }]}>
          {loading ? 'Lade…' : 'Foto auswählen'}
        </Text>
        <Text style={[styles.addSub, { color: colors.icon }]}>Aus Galerie</Text>
      </Pressable>

      {mediaUris.length > 0 && (
        <View style={styles.mediaList}>
          <Text style={[styles.mediaListTitle, { color: colors.icon }]}>Ausgewählt</Text>
          {mediaUris.map((m, i) => (
            <View
              key={i}
              style={[styles.mediaCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}
            >
              <Ionicons name="image" size={24} color={colors.icon} />
              <Text style={[styles.mediaLabel, { color: colors.text }]} numberOfLines={1}>
                {m.type === 'image' ? 'Bild' : 'Video'} {i + 1}
              </Text>
              <Pressable onPress={() => removeMedia(i)} style={styles.removeBtn}>
                <Ionicons name="close-circle" size={28} color={colors.tint} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Pressable
        style={[styles.skipBtn, { borderColor: colors.border }]}
        onPress={goToReview}
      >
        <Text style={[styles.skipBtnText, { color: colors.text }]}>Ohne Medien fortfahren</Text>
      </Pressable>

      <Pressable
        style={[styles.primaryBtn, { backgroundColor: colors.tint }, Shadow.md]}
        onPress={goToReview}
      >
        <Text style={styles.primaryBtnText}>Weiter zur Überprüfung</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl },
  title: { fontSize: 22, fontWeight: '700', marginBottom: Spacing.sm },
  subtitle: { fontSize: 15, marginBottom: Spacing.xl, lineHeight: 22 },
  addCard: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  addIconWrap: {
    width: 80,
    height: 80,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTitle: { fontSize: 17, fontWeight: '600' },
  addSub: { fontSize: 14 },
  mediaList: { marginBottom: Spacing.xl },
  mediaListTitle: { fontSize: 13, fontWeight: '600', marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  mediaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  mediaLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  removeBtn: { padding: Spacing.xs },
  skipBtn: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  skipBtnText: { fontSize: 16, fontWeight: '600' },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
  },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
