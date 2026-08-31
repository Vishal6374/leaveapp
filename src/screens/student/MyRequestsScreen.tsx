import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRequests } from '../../hooks/useRequests';
import { Header } from '../../components/common/Header';
import { RequestCard } from '../../components/common/RequestCard';
import { LeaveRequest } from '../../types';
import { ArrowLeft, Inbox } from 'lucide-react-native';
import { colors, shadows, radius } from '../../theme';

export const MyRequestsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { requests, loading } = useRequests();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filteredRequests = requests.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>My Application History</Text>
        <Text style={styles.subtitle}>Track all submitted leave & OD applications and status.</Text>

        <View style={styles.tabRow}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, filter === tab ? styles.activeTab : styles.inactiveTab]}
              onPress={() => setFilter(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, filter === tab ? styles.activeTabText : styles.inactiveTabText]}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filteredRequests.length === 0 ? (
          <View style={styles.centerBox}>
            <Inbox size={36} color={colors.textMuted} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyText}>No applications found for "{filter}".</Text>
          </View>
        ) : (
          <FlatList
            data={filteredRequests}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: { item: LeaveRequest }) => (
              <RequestCard request={item} />
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPage,
  },
  content: {
    flex: 1,
    padding: 18,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 16,
    fontWeight: '500',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  inactiveTab: {
    backgroundColor: colors.bgCard,
    borderColor: colors.borderLight,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  activeTabText: {
    color: '#ffffff',
  },
  inactiveTabText: {
    color: colors.textSecondary,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  listPadding: {
    paddingBottom: 24,
  },
});

