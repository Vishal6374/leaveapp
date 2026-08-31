import React from 'react';
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
import { LeaveLog } from '../../types';
import { format } from 'date-fns';
import { ArrowLeft, Clock, CheckCircle2, XCircle } from 'lucide-react-native';

export const LogsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { logs, loading } = useRequests();

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={18} color="#2563eb" />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Decision Audit Logs</Text>
        <Text style={styles.subtitle}>History of leave request approvals and rejections.</Text>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : logs.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyText}>No action logs recorded yet.</Text>
          </View>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: { item: LeaveLog }) => (
              <View style={styles.logCard}>
                <View style={styles.logHeader}>
                  <View style={styles.iconRow}>
                    {item.action === 'approved' ? (
                      <CheckCircle2 size={18} color="#16a34a" />
                    ) : (
                      <XCircle size={18} color="#dc2626" />
                    )}
                    <Text style={styles.studentName}>{item.studentName || 'Student'}</Text>
                  </View>

                  <View style={[styles.badge, item.action === 'approved' ? styles.approveBadge : styles.rejectBadge]}>
                    <Text style={[styles.badgeText, item.action === 'approved' ? styles.approveText : styles.rejectText]}>
                      {item.action.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.metaText}>
                  Action by: {item.actionByName || 'Staff'} ({item.actionByRole?.toUpperCase()})
                </Text>

                <View style={styles.timeRow}>
                  <Clock size={12} color="#94a3b8" />
                  <Text style={styles.timeText}>{format(new Date(item.timestamp), 'MMM dd, yyyy - hh:mm a')}</Text>
                </View>

                {item.comment ? (
                  <View style={styles.commentBox}>
                    <Text style={styles.commentText}>{item.comment}</Text>
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
  logCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  approveBadge: {
    backgroundColor: '#dcfce7',
  },
  rejectBadge: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  approveText: {
    color: '#15803d',
  },
  rejectText: {
    color: '#b91c1c',
  },
  metaText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  commentBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  commentText: {
    fontSize: 11,
    color: '#334155',
  },
});
