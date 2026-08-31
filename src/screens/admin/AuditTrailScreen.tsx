import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { LeaveLog } from '../../types';
import { format } from 'date-fns';
import { ArrowLeft, Shield, Clock } from 'lucide-react-native';

export const AuditTrailScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [logs, setLogs] = useState<LeaveLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'leaveLogs'), orderBy('timestamp', 'desc')),
      (snap) => {
        setLogs(
          snap.docs.map(
            (d) =>
              ({
                id: d.id,
                ...d.data(),
                timestamp: d.data().timestamp?.toDate() || new Date(),
              }) as LeaveLog
          )
        );
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={18} color="#2563eb" />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>System Audit Trail</Text>
        <Text style={styles.subtitle}>Complete ledger of administrative and approval events.</Text>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : logs.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyText}>No audit trail entries recorded.</Text>
          </View>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: { item: LeaveLog }) => (
              <View style={styles.card}>
                <View style={styles.row}>
                  <Shield size={16} color="#7c3aed" />
                  <Text style={styles.actionText}>
                    {item.actionByName} ({item.actionByRole}) {item.action} request for {item.studentName}
                  </Text>
                </View>
                <View style={styles.timeRow}>
                  <Clock size={12} color="#94a3b8" />
                  <Text style={styles.timeText}>{format(new Date(item.timestamp), 'yyyy-MM-dd HH:mm:ss')}</Text>
                </View>
                {item.comment ? (
                  <View style={styles.commentBox}>
                    <Text style={styles.commentText}>Note: {item.comment}</Text>
                  </View>
                ) : null}
              </View>
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  commentBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
  commentText: {
    fontSize: 11,
    color: '#475569',
  },
});
