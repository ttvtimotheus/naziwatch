import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ADMIN_CODE, ADMIN_MODE } from '@/lib/env';
import { getSignedMediaUrl } from '@/lib/media-urls';
import { supabase } from '@/lib/supabase';
import type { Incident, MediaRow } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [code, setCode] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [pending, setPending] = useState<Incident[]>([]);
  const [mediaByIncidentId, setMediaByIncidentId] = useState<Record<string, MediaRow[]>>({});
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ADMIN_MODE) {
      router.replace('/(tabs)');
      return;
    }
  }, [router]);

  const tryUnlock = () => {
    const entered = code.trim();
    if (entered === ADMIN_CODE) setUnlocked(true);
    else Alert.alert('Falscher Code', 'Bitte den Admin-Code prüfen.');
  };

  const loadPending = async () => {
    setLoading(true);
    const { data: incidents, error } = await supabase.rpc('get_pending_incidents');
    setLoading(false);
    if (error) {
      Alert.alert('Fehler', error.message);
      return;
    }
    const list = (Array.isArray(incidents) ? incidents : []) as Incident[];
    setPending(list);
    if (list.length === 0) {
      setMediaByIncidentId({});
      return;
    }
    const ids = list.map((i) => i.id);
    const { data: mediaRows, error: mediaErr } = await supabase.rpc('get_media_for_incidents', {
      p_incident_ids: ids,
    });
    const mediaList = (Array.isArray(mediaRows) ? mediaRows : []) as MediaRow[];
    const byId: Record<string, MediaRow[]> = {};
    for (const m of mediaList) {
      if (!byId[m.incident_id]) byId[m.incident_id] = [];
      byId[m.incident_id].push(m);
    }
    setMediaByIncidentId(byId);
    const paths = mediaList.filter((m) => m.type === 'image').map((m) => m.url);
    const urlMap: Record<string, string> = {};
    await Promise.all(
      paths.map(async (path) => {
        const url = await getSignedMediaUrl(path);
        if (url) urlMap[path] = url;
      })
    );
    setMediaUrls((prev) => ({ ...prev, ...urlMap }));
  };

  useEffect(() => {
    if (unlocked) loadPending();
  }, [unlocked]);

  const approve = async (id: string) => {
    const { error } = await supabase.rpc('update_incident_status', { p_id: id, p_status: 'approved' });
    if (error) Alert.alert('Fehler', error.message);
    else loadPending();
  };

  const reject = async (id: string) => {
    const { error } = await supabase.rpc('update_incident_status', { p_id: id, p_status: 'rejected' });
    if (error) Alert.alert('Fehler', error.message);
    else loadPending();
  };

  if (!ADMIN_MODE) return null;

  if (!unlocked) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>Moderation</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Code"
          placeholderTextColor={colors.icon}
          value={code}
          onChangeText={setCode}
          secureTextEntry
        />
        <Pressable style={[styles.btn, { backgroundColor: colors.tint }]} onPress={tryUnlock}>
          <Text style={styles.btnText}>Öffnen</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Pending ({pending.length})</Text>
        <Pressable onPress={loadPending} style={[styles.refresh, { borderColor: colors.border }]}>
          <Text style={[styles.refreshText, { color: colors.text }]}>Aktualisieren</Text>
        </Pressable>
      </View>
      {loading ? (
        <Text style={[styles.hint, { color: colors.icon }]}>Lade…</Text>
      ) : (
        <FlatList
          data={pending}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const media = mediaByIncidentId[item.id] ?? [];
            const firstImage = media.find((m) => m.type === 'image');
            const imageUrl = firstImage ? mediaUrls[firstImage.url] : null;
            return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.cardThumb} contentFit="cover" />
              ) : media.length > 0 ? (
                <View style={[styles.cardThumbPlaceholder, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Ionicons name="image-outline" size={28} color={colors.icon} />
                </View>
              ) : null}
              <Text style={[styles.cardCategory, { color: colors.tint }]}>{item.category}</Text>
              <Text style={[styles.cardDesc, { color: colors.text }]} numberOfLines={2}>
                {item.description}
              </Text>
              <Text style={[styles.cardDate, { color: colors.icon }]}>
                {new Date(item.occurred_at).toLocaleString('de-DE')}
              </Text>
              <View style={styles.actions}>
                <Pressable style={[styles.actionBtn, { backgroundColor: '#22c55e' }]} onPress={() => approve(item.id)}>
                  <Text style={styles.actionBtnText}>Approve</Text>
                </Pressable>
                <Pressable style={[styles.actionBtn, { backgroundColor: '#ef4444' }]} onPress={() => reject(item.id)}>
                  <Text style={styles.actionBtnText}>Reject</Text>
                </Pressable>
              </View>
            </View>
          );}}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  title: { fontSize: 20, fontWeight: '700' },
  refresh: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderRadius: 8 },
  refreshText: { fontSize: 14 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    fontSize: 16,
  },
  btn: { paddingVertical: Spacing.lg, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  hint: { marginTop: Spacing.lg },
  list: { paddingBottom: Spacing.xl * 2 },
  card: {
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  cardThumb: { width: '100%', height: 120, borderRadius: 8, marginBottom: Spacing.sm },
  cardThumbPlaceholder: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCategory: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  cardDesc: { fontSize: 14, marginBottom: 4 },
  cardDate: { fontSize: 12, marginBottom: Spacing.sm },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 14 },
});
