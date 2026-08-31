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
import { ArrowLeft, Search, User as UserIcon, AlertTriangle } from 'lucide-react-native';

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
          <ArrowLeft size={18} color="#2563eb" />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Student Class Records</Text>
        <Text style={styles.subtitle}>Department student list and attendance monitoring.</Text>

        <View style={styles.searchBox}>
          <Search size={16} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or SIN..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : filteredStudents.length === 0 ? (
          <View style={styles.centerBox}>
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

              return (
                <View style={styles.studentCard}>
                  <View style={styles.row}>
                    <View style={styles.avatar}>
                      <UserIcon size={18} color="#2563eb" />
                    </View>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>{item.name}</Text>
                      <Text style={styles.studentSub}>
                        {item.department} {item.year ? `• Year ${item.year}` : ''} {item.sinNumber ? `• SIN: ${item.sinNumber}` : ''}
                      </Text>
                      <Text style={styles.emailText}>{item.email}</Text>
                    </View>

                    <View style={[styles.rateBadge, isLow ? styles.lowBadge : styles.goodBadge]}>
                      {isLow ? <AlertTriangle size={12} color="#dc2626" /> : null}
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    marginLeft: 8,
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
  studentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  studentSub: {
    fontSize: 11,
    color: '#475569',
    marginTop: 1,
  },
  emailText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
  },
  rateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  goodBadge: {
    backgroundColor: '#dcfce7',
  },
  lowBadge: {
    backgroundColor: '#fee2e2',
  },
  rateText: {
    fontSize: 12,
    fontWeight: '800',
  },
  goodRateText: {
    color: '#15803d',
  },
  lowRateText: {
    color: '#b91c1c',
  },
});
