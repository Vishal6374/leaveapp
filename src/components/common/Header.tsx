import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react-native';

export const Header: React.FC = () => {
  const { userData, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.userInfoContainer}>
        <View style={styles.avatar}>
          <UserIcon size={20} color="#2563eb" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{userData?.name || 'User'}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {userData?.role?.toUpperCase() || 'STUDENT'}
              </Text>
            </View>
            {userData?.department ? (
              <View style={styles.deptBadge}>
                <Text style={styles.deptBadgeText}>{userData.department}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => signOut()}
        activeOpacity={0.7}
      >
        <LogOut size={18} color="#ef4444" />
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  welcomeText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginVertical: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 6,
  },
  roleBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  deptBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deptBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  logoutButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
