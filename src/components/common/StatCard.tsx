import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
  accentColor = '#2563eb',
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {icon ? <View style={[styles.iconBox, { backgroundColor: `${accentColor}15` }]}>{icon}</View> : null}
      </View>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginVertical: 6,
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    flex: 1,
  },
  iconBox: {
    padding: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
