import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNotifications, AppNotification } from '../../hooks/useNotifications';
import { format } from 'date-fns';
import { Bell, X, CheckCheck, Trash2, AlertTriangle, CheckCircle2, Clock } from 'lucide-react-native';
import { colors, shadows, radius } from '../../theme';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ visible, onClose }) => {
  const { notifications, loading, markAsRead, markAllAsRead, clearAllNotifications } = useNotifications();

  const getIcon = (type?: string) => {
    switch (type) {
      case 'status':
        return <CheckCircle2 size={18} color={colors.success} />;
      case 'warning':
        return <AlertTriangle size={18} color={colors.danger} />;
      case 'request':
        return <Clock size={18} color={colors.warning} />;
      default:
        return <Bell size={18} color={colors.primary} />;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Bell size={18} color={colors.primary} />
              </View>
              <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Actions Bar */}
          {notifications.length > 0 ? (
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={markAllAsRead} activeOpacity={0.7}>
                <CheckCheck size={14} color={colors.primary} />
                <Text style={styles.actionBtnText}>Mark all as read</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={clearAllNotifications} activeOpacity={0.7}>
                <Trash2 size={14} color={colors.danger} />
                <Text style={[styles.actionBtnText, { color: colors.danger }]}>Clear all</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* List */}
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.centerBox}>
              <Bell size={40} color={colors.textMuted} style={{ marginBottom: 10 }} />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptySub}>You are all caught up!</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listPadding}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }: { item: AppNotification }) => (
                <TouchableOpacity
                  style={[styles.itemCard, !item.read ? styles.unreadCard : null]}
                  onPress={() => !item.read && markAsRead(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.itemHeader}>
                    <View style={styles.itemTitleRow}>
                      {getIcon(item.type)}
                      <Text style={styles.itemTitle}>{item.title}</Text>
                    </View>
                    {!item.read ? <View style={styles.unreadDot} /> : null}
                  </View>

                  <Text style={styles.itemBody}>{item.body}</Text>

                  <Text style={styles.itemTime}>
                    {format(new Date(item.createdAt), 'MMM dd • hh:mm a')}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    height: '75%',
    padding: 20,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 6,
    borderRadius: radius.xs,
    backgroundColor: colors.bgPage,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    marginBottom: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  listPadding: {
    paddingBottom: 24,
  },
  itemCard: {
    backgroundColor: colors.bgPage,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  unreadCard: {
    backgroundColor: colors.primaryLight,
    borderColor: '#c7d2fe',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  itemBody: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 6,
  },
  itemTime: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
