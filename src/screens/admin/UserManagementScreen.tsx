import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { User, UserRole } from '../../types';
import { ArrowLeft, User as UserIcon, Shield, Users } from 'lucide-react-native';
import { colors, shadows, radius } from '../../theme';

export const UserManagementScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        setUsers(
          snap.docs.map(
            (d) =>
              ({
                uid: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate?.() || new Date(),
              }) as User
          )
        );
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  const handleChangeRole = (user: User, newRole: UserRole) => {
    Alert.alert(
      'Confirm Role Change',
      `Change ${user.name}'s role to ${newRole.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'users', user.uid), { role: newRole });
              Alert.alert('Role Updated', `${user.name} is now a ${newRole.toUpperCase()}.`);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to update user role.');
            }
          },
        },
      ]
    );
  };

  const ROLES: UserRole[] = ['student', 'teacher', 'hod', 'admin'];

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>User & Access Control</Text>
        <Text style={styles.subtitle}>Assign role permissions and user privileges.</Text>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : users.length === 0 ? (
          <View style={styles.centerBox}>
            <Users size={36} color={colors.textMuted} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyText}>No users registered in the system.</Text>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.uid}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: { item: User }) => {
              const initials = item.name
                ? item.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'U';

              return (
                <View style={styles.userCard}>
                  <View style={styles.userHeader}>
                    <View style={styles.userLeft}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.userName}>{item.name}</Text>
                        <Text style={styles.userEmail}>{item.email}</Text>
                      </View>
                    </View>

                    <View style={styles.roleBadge}>
                      <Shield size={12} color={colors.primary} />
                      <Text style={styles.roleText}>{item.role?.toUpperCase()}</Text>
                    </View>
                  </View>

                  <Text style={styles.deptLabel}>
                    Department: {item.department || 'N/A'} {item.year ? `• Year ${item.year}` : ''}
                  </Text>

                  <Text style={styles.roleSelectLabel}>ASSIGN ROLE:</Text>
                  <View style={styles.roleChipRow}>
                    {ROLES.map((r) => {
                      const isActive = item.role === r;
                      return (
                        <TouchableOpacity
                          key={r}
                          style={[styles.roleChip, isActive ? styles.activeRoleChip : styles.inactiveRoleChip]}
                          onPress={() => !isActive && handleChangeRole(item, r)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.roleChipText, isActive ? styles.activeRoleText : styles.inactiveRoleText]}>
                            {r.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            }}
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
  userCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    borderColor: '#c7d2fe',
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 0.3,
  },
  deptLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
    fontWeight: '500',
  },
  roleSelectLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  roleChipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  activeRoleChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  inactiveRoleChip: {
    backgroundColor: colors.bgPage,
    borderColor: colors.borderLight,
  },
  roleChipText: {
    fontSize: 10,
    fontWeight: '800',
  },
  activeRoleText: {
    color: '#ffffff',
  },
  inactiveRoleText: {
    color: colors.textSecondary,
  },
});
