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
import { ArrowLeft, Shield, Clock, FileText } from 'lucide-react-native';
import { colors, shadows, radius } from '../../theme';

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
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Security Audit Trail</Text>
        <Text style={styles.subtitle}>Immutable ledger of administrative actions and decision events.</Text>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : logs.length === 0 ? (
          <View style={styles.centerBox}>
            <Shield size={36} color={colors.textMuted} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyText}>No audit trail entries recorded yet.</Text>
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
                  <View style={styles.iconBox}>
                    <Shield size={16} color={colors.accentViolet} />
                  </View>
                  <Text style={styles.actionText}>
                    <Text style={{ fontWeight: '800' }}>{item.actionByName || 'User'}</Text> ({item.actionByRole?.toUpperCase()}) {item.action} leave request for <Text style={{ fontWeight: '800' }}>{item.studentName || 'Student'}</Text>
                  </Text>
                </View>
                <View style={styles.timeRow}>
                  <Clock size={12} color={colors.textMuted} />
                  <Text style={styles.timeText}>{format(new Date(item.timestamp), 'yyyy-MM-dd • HH:mm:ss')}</Text>
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
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.xs,
    backgroundColor: colors.accentVioletLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingLeft: 42,
  },
  timeText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  commentBox: {
    backgroundColor: '#f8fafc',
    borderRadius: radius.xs,
    padding: 10,
    marginTop: 8,
    marginLeft: 42,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  commentText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

