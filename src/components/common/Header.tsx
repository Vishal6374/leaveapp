import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User as UserIcon, ShieldAlert } from 'lucide-react-native';
import { colors, shadows, radius } from '../../theme';

export const Header: React.FC = () => {
  const { userData, signOut } = useAuth();

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

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => signOut()}
        activeOpacity={0.75}
      >
        <LogOut size={18} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 14,
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
    marginRight: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  welcomeText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 6,
    flexWrap: 'wrap',
  },
  roleBadge: {
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  deptBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  deptBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
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

