import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LeaveRequest } from '../../types';
import { format } from 'date-fns';
import { Calendar, FileText, Check, X } from 'lucide-react-native';

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
    switch (status) {
      case 'approved':
        return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
      case 'rejected':
        return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' };
      default:
        return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
    }
  };

  const statusStyle = getStatusColor(request.status);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.typeRow}>
          <View style={[styles.typeBadge, request.type === 'od' ? styles.odBadge : styles.leaveBadge]}>
            <Text style={[styles.typeText, request.type === 'od' ? styles.odText : styles.leaveText]}>
              {request.type.toUpperCase()}
            </Text>
          </View>
          {request.studentName ? (
            <Text style={styles.studentName} numberOfLines={1}>
              {request.studentName}
            </Text>
          ) : null}
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {request.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.dateRow}>
        <Calendar size={14} color="#64748b" />
        <Text style={styles.dateText}>
          {format(new Date(request.fromDate), 'MMM dd, yyyy')} - {format(new Date(request.toDate), 'MMM dd, yyyy')}
        </Text>
      </View>

      {request.reason ? (
        <View style={styles.reasonRow}>
          <FileText size={14} color="#64748b" style={styles.reasonIcon} />
          <Text style={styles.reasonText} numberOfLines={2}>
            {request.reason}
          </Text>
        </View>
      ) : null}

      {request.comment ? (
        <View style={styles.commentBox}>
          <Text style={styles.commentLabel}>Note:</Text>
          <Text style={styles.commentText}>{request.comment}</Text>
        </View>
      ) : null}

      {showActions && request.status === 'pending' && (onApprove || onReject) ? (
        <View style={styles.actionRow}>
          {onApprove ? (
            <TouchableOpacity
              style={[styles.btn, styles.approveBtn]}
              onPress={() => onApprove(request.id)}
              activeOpacity={0.7}
            >
              <Check size={14} color="#ffffff" />
              <Text style={styles.approveBtnText}>Approve</Text>
            </TouchableOpacity>
          ) : null}

          {onReject ? (
            <TouchableOpacity
              style={[styles.btn, styles.rejectBtn]}
              onPress={() => onReject(request.id)}
              activeOpacity={0.7}
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
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  leaveBadge: {
    backgroundColor: '#eff6ff',
  },
  odBadge: {
    backgroundColor: '#f3e8ff',
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  leaveText: {
    color: '#2563eb',
  },
  odText: {
    color: '#7c3aed',
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
  },
  reasonIcon: {
    marginTop: 2,
  },
  reasonText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
    lineHeight: 16,
  },
  commentBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  commentLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 11,
    color: '#334155',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  approveBtn: {
    backgroundColor: '#16a34a',
  },
  approveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectBtn: {
    backgroundColor: '#dc2626',
  },
  rejectBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
