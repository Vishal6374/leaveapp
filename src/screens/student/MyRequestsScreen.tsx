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
import { ArrowLeft } from 'lucide-react-native';

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
          <ArrowLeft size={18} color="#2563eb" />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>My Leave Requests</Text>
        <Text style={styles.subtitle}>Track all submitted requests and status updates.</Text>

        <View style={styles.tabRow}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, filter === tab ? styles.activeTab : styles.inactiveTab]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.tabText, filter === tab ? styles.activeTabText : styles.inactiveTabText]}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : filteredRequests.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyText}>No requests found for "{filter}".</Text>
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
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 14,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  activeTab: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  inactiveTab: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#ffffff',
  },
  inactiveTabText: {
    color: '#64748b',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  listPadding: {
    paddingBottom: 20,
  },
});
