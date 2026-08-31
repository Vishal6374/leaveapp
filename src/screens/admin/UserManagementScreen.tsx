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
import { ArrowLeft, User as UserIcon, Shield } from 'lucide-react-native';

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
          <ArrowLeft size={18} color="#2563eb" />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>User & Access Management</Text>
        <Text style={styles.subtitle}>Assign user roles and manage access privileges.</Text>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : users.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyText}>No users registered in the system.</Text>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.uid}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: { item: User }) => (
              <View style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userLeft}>
                    <View style={styles.avatar}>
                      <UserIcon size={18} color="#2563eb" />
                    </View>
                    <View>
                      <Text style={styles.userName}>{item.name}</Text>
                      <Text style={styles.userEmail}>{item.email}</Text>
                    </View>
                  </View>
                  <View style={styles.roleBadge}>
                    <Shield size={12} color="#1d4ed8" />
                    <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
                  </View>
                </View>

                <Text style={styles.deptLabel}>Department: {item.department || 'Unassigned'}</Text>

                <Text style={styles.roleSelectLabel}>Change Role:</Text>
                <View style={styles.roleChipRow}>
                  {ROLES.map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.roleChip, item.role === r ? styles.activeRoleChip : styles.inactiveRoleChip]}
                      onPress={() => handleChangeRole(item, r)}
                    >
                      <Text style={[styles.roleChipText, item.role === r ? styles.activeRoleText : styles.inactiveRoleText]}>
                        {r.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
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
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 11,
    color: '#64748b',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  deptLabel: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 8,
  },
  roleSelectLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 6,
  },
  roleChipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  activeRoleChip: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  inactiveRoleChip: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  roleChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  activeRoleText: {
    color: '#ffffff',
  },
  inactiveRoleText: {
    color: '#475569',
  },
});
