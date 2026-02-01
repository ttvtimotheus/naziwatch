import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, Text, View } from 'react-native';

const STEPS = 6; // category, location, time, description, media, review

interface ReportStepIndicatorProps {
  current: number; // 1-based
}

export function ReportStepIndicator({ current }: ReportStepIndicatorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.wrap}>
      <View style={styles.dots}>
        {Array.from({ length: STEPS }, (_, i) => i + 1).map((step) => (
          <View
            key={step}
            style={[
              styles.dot,
              {
                backgroundColor: step <= current ? colors.tint : colors.border,
                width: step === current ? 20 : 8,
                opacity: step <= current ? 1 : 0.5,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: colors.icon }]}>
        Schritt {Math.min(current, STEPS)} von {STEPS}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: Spacing.lg },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: Radius.full,
  },
  label: { fontSize: 12, fontWeight: '600', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },
});
