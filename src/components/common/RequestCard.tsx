import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LeaveRequest } from '../../types';
import { format } from 'date-fns';
import { Calendar, FileText, Check, X, User } from 'lucide-react-native';
import { colors, shadows, radius } from '../../theme';

interface RequestCardProps {
  request: LeaveRequest;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions?: boolean;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onApprove,
  onReject,
  showActions = false,
}) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { bg: colors.successBg, text: colors.successText, border: colors.successBorder };
      case 'rejected':
        return { bg: colors.dangerBg, text: colors.dangerText, border: colors.dangerBorder };
      default:
        return { bg: colors.warningBg, text: colors.warningText, border: colors.warningBorder };
    }
  };

  const statusStyle = getStatusColor(request.status);
  const isOd = request.type === 'od';

  return (
    <View style={styles.card}>
      {/* Top Header Row */}
      <View style={styles.header}>
        <View style={styles.typeRow}>
          <View style={[styles.typeBadge, isOd ? styles.odBadge : styles.leaveBadge]}>
            <Text style={[styles.typeText, isOd ? styles.odText : styles.leaveText]}>
              {request.type?.toUpperCase()}
              {(request as any).subType ? ` • ${(request as any).subType.toUpperCase()}` : ''}
            </Text>
          </View>

          {request.studentName ? (
            <View style={styles.studentInfo}>
              <User size={14} color={colors.textSecondary} />
              <Text style={styles.studentName} numberOfLines={1}>
                {request.studentName}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {request.status?.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Date Pill Container */}
      <View style={styles.datePillContainer}>
        <Calendar size={14} color={colors.primary} />
        <Text style={styles.dateText}>
          {format(new Date(request.fromDate), 'MMM dd, yyyy')} - {format(new Date(request.toDate), 'MMM dd, yyyy')}
        </Text>
      </View>

      {/* Reason Container */}
      {request.reason ? (
        <View style={styles.reasonRow}>
          <FileText size={14} color={colors.textMuted} style={styles.reasonIcon} />
          <Text style={styles.reasonText} numberOfLines={2}>
            {request.reason}
          </Text>
        </View>
      ) : null}

      {/* Comment Note Box */}
      {request.comment ? (
        <View style={styles.commentBox}>
          <Text style={styles.commentLabel}>Advisor Note:</Text>
          <Text style={styles.commentText}>{request.comment}</Text>
        </View>
      ) : null}

      {/* Action Buttons Row */}
      {showActions && request.status === 'pending' && (onApprove || onReject) ? (
        <View style={styles.actionRow}>
          {onApprove ? (
            <TouchableOpacity
              style={[styles.btn, styles.approveBtn]}
              onPress={() => onApprove(request.id)}
              activeOpacity={0.8}
            >
              <Check size={14} color="#ffffff" />
              <Text style={styles.approveBtnText}>Approve</Text>
            </TouchableOpacity>
          ) : null}

          {onReject ? (
            <TouchableOpacity
              style={[styles.btn, styles.rejectBtn]}
              onPress={() => onReject(request.id)}
              activeOpacity={0.8}
            >
              <X size={14} color="#ffffff" />
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
          ) : null}
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
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
    flexWrap: 'wrap',
  },
  typeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  leaveBadge: {
    backgroundColor: colors.typeLeave.bg,
    borderColor: colors.typeLeave.border,
  },
  odBadge: {
    backgroundColor: colors.typeOd.bg,
    borderColor: colors.typeOd.border,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  leaveText: {
    color: colors.typeLeave.text,
  },
  odText: {
    color: colors.typeOd.text,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  datePillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 2,
  },
  reasonIcon: {
    marginTop: 2,
  },
  reasonText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
  commentBox: {
    backgroundColor: '#f8fafc',
    borderRadius: radius.sm,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  commentLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  commentText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm,
    ...shadows.sm,
  },
  approveBtn: {
    backgroundColor: colors.success,
  },
  approveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  rejectBtn: {
    backgroundColor: colors.danger,
  },
  rejectBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});

