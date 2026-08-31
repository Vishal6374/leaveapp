import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/common/Header';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { User } from '../../types';
import { ArrowLeft, Search, User as UserIcon, AlertTriangle, Users } from 'lucide-react-native';
import { colors, shadows, radius } from '../../theme';

export const StudentRecordsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userData } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!userData) return;

    let q = query(collection(db, 'users'), where('role', '==', 'student'));
    if (userData.role === 'hod' || userData.role === 'teacher') {
      q = query(
        collection(db, 'users'),
        where('role', '==', 'student'),
        where('department', '==', userData.department)
      );
    }

    const unsub = onSnapshot(
      q,
      (snap) => {
        setStudents(
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
  }, [userData]);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.sinNumber && s.sinNumber.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Student Class Records</Text>
        <Text style={styles.subtitle}>Department student directory and attendance monitoring.</Text>

        <View style={styles.searchBox}>
          <Search size={16} color={colors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or SIN..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filteredStudents.length === 0 ? (
          <View style={styles.centerBox}>
            <Users size={36} color={colors.textMuted} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyText}>No student records found.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredStudents}
            keyExtractor={(item) => item.uid}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: { item: User }) => {
              const attRate = item.attendanceRate ?? 85;
              const isLow = attRate < 75;

              const initials = item.name
                ? item.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'S';

              return (
                <View style={styles.studentCard}>
                  <View style={styles.row}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>{item.name}</Text>
                      <Text style={styles.studentSub}>
                        {item.department} {item.year ? `• Year ${item.year}` : ''} {item.sinNumber ? `• SIN: ${item.sinNumber}` : ''}
                      </Text>
                      <Text style={styles.emailText}>{item.email}</Text>
                    </View>

                    <View style={[styles.rateBadge, isLow ? styles.lowBadge : styles.goodBadge]}>
                      {isLow ? <AlertTriangle size={12} color={colors.dangerText} /> : null}
                      <Text style={[styles.rateText, isLow ? styles.lowRateText : styles.goodRateText]}>
                        {attRate}%
                      </Text>
                    </View>
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    marginLeft: 10,
    fontWeight: '600',
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
  studentCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  studentSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  emailText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  rateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  goodBadge: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },
  lowBadge: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
  },
  rateText: {
    fontSize: 12,
    fontWeight: '900',
  },
  goodRateText: {
    color: colors.successText,
  },
  lowRateText: {
    color: colors.dangerText,
  },
});

