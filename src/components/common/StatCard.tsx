import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, shadows, radius } from '../../theme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon,
  accentColor = colors.primary,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {icon ? (
          <View style={[styles.iconBox, { backgroundColor: `${accentColor}18` }]}>
            {icon}
          </View>
        ) : null}
      </View>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      {subtext ? (
        <View style={styles.subtextContainer}>
          <Text style={styles.subtext} numberOfLines={1}>
            {subtext}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: 16,
    marginVertical: 6,
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    flex: 1,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtextContainer: {
    marginTop: 2,
  },
  subtext: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
});

