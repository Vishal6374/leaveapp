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
import { ArrowLeft, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react-native';
import { colors, shadows, radius } from '../../theme';

export const LogsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { logs, loading } = useRequests();

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Decision Audit Logs</Text>
        <Text style={styles.subtitle}>Complete history of leave request approvals and rejections.</Text>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : logs.length === 0 ? (
          <View style={styles.centerBox}>
            <FileText size={36} color={colors.textMuted} style={{ marginBottom: 8 }} />
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
                      <CheckCircle2 size={18} color={colors.success} />
                    ) : (
                      <XCircle size={18} color={colors.danger} />
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
                  Processed by: {item.actionByName || 'Staff'} ({item.actionByRole?.toUpperCase()})
                </Text>

                <View style={styles.timeRow}>
                  <Clock size={12} color={colors.textMuted} />
                  <Text style={styles.timeText}>{format(new Date(item.timestamp), 'MMM dd, yyyy • hh:mm a')}</Text>
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
  logCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  approveBadge: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },
  rejectBadge: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  approveText: {
    color: colors.successText,
  },
  rejectText: {
    color: colors.dangerText,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  commentText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});

