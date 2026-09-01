import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationModal } from './NotificationModal';
import { LogOut, Bell, MapPin, Clock, ShieldCheck } from 'lucide-react-native';
import { format } from 'date-fns';
import { colors, shadows, radius } from '../../theme';

export const Header: React.FC = () => {
  const { userData, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const getRoleStyle = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'teacher':
        return colors.roleTeacher;
      case 'hod':
        return colors.roleHod;
      case 'admin':
        return colors.roleAdmin;
      default:
        return colors.roleStudent;
    }
  };

  const roleStyle = getRoleStyle(userData?.role);
  const initials = userData?.name
    ? userData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <>
      {/* Top Status Bar Line */}
      <View style={styles.topStatusBar}>
        <View style={styles.topStatusItem}>
          <Clock size={12} color={colors.primary} />
          <Text style={styles.topStatusText}>{format(now, 'EEE, dd MMM • hh:mm a')}</Text>
        </View>

        <View style={styles.topStatusItem}>
          <MapPin size={12} color={colors.secondary} />
          <Text style={styles.topStatusText}>
            Main Campus • {userData?.department || 'CSE'}
          </Text>
        </View>

        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>ONLINE</Text>
        </View>
      </View>

      {/* Main Header Bar */}
      <View style={styles.container}>
        <View style={styles.userInfoContainer}>
          <View style={styles.avatarGlow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.welcomeText}>Welcome back 👋</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {userData?.name || 'User'}
            </Text>
            <View style={styles.badgeRow}>
              <View style={[styles.roleBadge, { backgroundColor: roleStyle.bg, borderColor: roleStyle.border }]}>
                <Text style={[styles.roleBadgeText, { color: roleStyle.text }]}>
                  {userData?.role?.toUpperCase() || 'STUDENT'}
                </Text>
              </View>

              {userData?.department ? (
                <View style={styles.deptBadge}>
                  <Text style={styles.deptBadgeText} numberOfLines={1}>
                    {userData.department}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Action Controls: Bell & Logout */}
        <View style={styles.actionsGroup}>
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => setShowNotifications(true)}
            activeOpacity={0.75}
          >
            <Bell size={18} color={colors.textPrimary} />
            {unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => signOut()}
            activeOpacity={0.75}
          >
            <LogOut size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  topStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  topStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  topStatusText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  liveText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCard,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    ...shadows.sm,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  avatarGlow: {
    padding: 2,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginRight: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  welcomeText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
    flexWrap: 'wrap',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  deptBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  deptBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.bgPage,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


