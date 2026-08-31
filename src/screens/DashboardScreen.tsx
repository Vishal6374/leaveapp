import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRequests } from '../hooks/useRequests';
import { Header } from '../components/common/Header';
import { StatCard } from '../components/common/StatCard';
import { RequestCard } from '../components/common/RequestCard';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { eachDayOfInterval, getDay, format, startOfMonth } from 'date-fns';
import type { User, LeaveRequest, Holiday, ClassAssignment } from '../types';
import {
  FileText,
  Clock,
  CheckCircle2,
  Users,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Settings,
  ChevronRight,
  Shield,
} from 'lucide-react-native';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userData, currentUser } = useAuth();
  const { requests: rawRequests, logs: rawLogs, loading: requestsLoading, processRequest } = useRequests();

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [semesterStart, setSemesterStart] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [assignments, setAssignments] = useState<ClassAssignment[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassAssignment | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>([]);
  const [dbLoading, setDbLoading] = useState(false);

  useEffect(() => {
    const unsubH = onSnapshot(collection(db, 'holidays'), (snap) => {
      setHolidays(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Holiday));
    });
    const unsubS = onSnapshot(
      doc(db, 'systemSettings', 'global'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.semesterStart) setSemesterStart(data.semesterStart);
        }
        setLoadingConfig(false);
      },
      () => {
        setLoadingConfig(false);
      }
    );

    return () => {
      unsubH();
      unsubS();
    };
  }, []);

  useEffect(() => {
    if (!currentUser || userData?.role !== 'teacher') return;
    setDbLoading(true);
    const q = query(
      collection(db, 'classAssignments'),
      where('advisorId', '==', currentUser.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ClassAssignment);
        setAssignments(list);
        if (list.length > 0) {
          setSelectedClass((prev) => (prev ? list.find((c) => c.id === prev.id) || list[0] : list[0]));
        } else {
          setSelectedClass(null);
        }
        setDbLoading(false);
      },
      () => setDbLoading(false)
    );
    return unsub;
  }, [currentUser, userData]);

  useEffect(() => {
    if (!userData || !currentUser) return;

    let q;
    if (userData.role === 'hod') {
      q = query(
        collection(db, 'users'),
        where('role', '==', 'student'),
        where('department', '==', userData.department)
      );
    } else if (userData.role === 'teacher' && selectedClass) {
      q = query(
        collection(db, 'users'),
        where('role', '==', 'student'),
        where('department', '==', selectedClass.department),
        where('year', '==', selectedClass.year)
      );
    } else {
      return;
    }

    const unsub = onSnapshot(q, (snap) => {
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
    });
    return unsub;
  }, [userData, currentUser, selectedClass]);

  useEffect(() => {
    if (!userData || (userData.role !== 'teacher' && userData.role !== 'hod')) return;

    const q = query(
      collection(db, 'leaveRequests'),
      where('department', '==', userData.department)
    );
    const unsub = onSnapshot(q, (snap) => {
      setAllRequests(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            fromDate: data.fromDate?.toDate() || new Date(),
            toDate: data.toDate?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as LeaveRequest;
        })
      );
    });
    return unsub;
  }, [userData]);

  const stats = useMemo(() => {
    if (students.length === 0) return { averageAttendance: 100, lowAttendanceCount: 0, studentStats: [] };

    const semStart = new Date(semesterStart);
    const today = new Date();

    let totalWorkingDays = 0;
    try {
      if (today >= semStart) {
        const allDays = eachDayOfInterval({ start: semStart, end: today });
        totalWorkingDays = allDays.filter((d) => {
          const dow = getDay(d);
          const dateKey = format(d, 'yyyy-MM-dd');
          return dow !== 0 && dow !== 6 && !holidays.some((h) => h.date === dateKey);
        }).length;
      }
    } catch {}

    let totalAttendanceSum = 0;
    let lowAttendanceCount = 0;

    const studentStats = students.map((student) => {
      const studentReqs = allRequests.filter((r) => r.studentId === student.uid && r.status === 'approved');

      let absentDays = 0;
      try {
        if (today >= semStart) {
          absentDays = studentReqs
            .filter((r) => r.type === 'leave')
            .reduce((acc, r) => {
              try {
                return (
                  acc +
                  eachDayOfInterval({ start: r.fromDate, end: r.toDate }).filter(
                    (d) =>
                      d >= semStart &&
                      d <= today &&
                      getDay(d) !== 0 &&
                      getDay(d) !== 6 &&
                      !holidays.some((h) => h.date === format(d, 'yyyy-MM-dd'))
                  ).length
                );
              } catch {
                return acc;
              }
            }, 0);
        }
      } catch {}

      const attendancePct =
        totalWorkingDays > 0 ? Math.max(0, Math.round(((totalWorkingDays - absentDays) / totalWorkingDays) * 100)) : 100;
      if (attendancePct < 75) {
        lowAttendanceCount++;
      }
      totalAttendanceSum += attendancePct;

      return {
        student,
        attendancePct,
      };
    });

    const averageAttendance = students.length > 0 ? Math.round(totalAttendanceSum / students.length) : 100;

    return {
      averageAttendance,
      lowAttendanceCount,
      studentStats,
    };
  }, [students, allRequests, holidays, semesterStart]);

  if (requestsLoading || loadingConfig || dbLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  const pendingRequests = rawRequests.filter((r) => {
    if (userData?.role === 'teacher') {
      return (
        selectedClass &&
        r.status === 'pending' &&
        r.department === selectedClass.department &&
        r.year === selectedClass.year
      );
    }
    return r.status === 'pending';
  });

  const renderStudentDashboard = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Welcome back, {userData?.name}!</Text>
        <Text style={styles.bannerSubtitle}>
          Track your leave requests and submit new ones easily.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard
          title="Pending Requests"
          value={rawRequests.filter((r) => r.status === 'pending').length}
          accentColor="#d97706"
          icon={<Clock size={16} color="#d97706" />}
        />
        <StatCard
          title="Approved Requests"
          value={rawRequests.filter((r) => r.status === 'approved').length}
          accentColor="#16a34a"
          icon={<CheckCircle2 size={16} color="#16a34a" />}
        />
      </View>

      <Text style={styles.sectionHeader}>Quick Actions</Text>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('NewRequest')}
        activeOpacity={0.7}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconBox, { backgroundColor: '#eff6ff' }]}>
            <FileText size={20} color="#2563eb" />
          </View>
          <Text style={styles.actionText}>New Leave / OD Request</Text>
        </View>
        <ChevronRight size={18} color="#94a3b8" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('MyRequests')}
        activeOpacity={0.7}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconBox, { backgroundColor: '#f0fdf4' }]}>
            <BarChart3 size={20} color="#16a34a" />
          </View>
          <Text style={styles.actionText}>View My Requests</Text>
        </View>
        <ChevronRight size={18} color="#94a3b8" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('StudentStats')}
        activeOpacity={0.7}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconBox, { backgroundColor: '#faf5ff' }]}>
            <CalendarDays size={20} color="#9333ea" />
          </View>
          <Text style={styles.actionText}>Calendar & Attendance Stats</Text>
        </View>
        <ChevronRight size={18} color="#94a3b8" />
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Recent Requests</Text>
      {rawRequests.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No leave requests submitted yet.</Text>
        </View>
      ) : (
        <FlatList
          data={rawRequests.slice(0, 5)}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }: { item: LeaveRequest }) => (
            <RequestCard request={item} />
          )}
        />
      )}
    </View>
  );

  const renderTeacherDashboard = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Welcome, {userData?.name}!</Text>
        <Text style={styles.bannerSubtitle}>
          Review and process leave requests from your assigned class.
        </Text>
      </View>

      {assignments.length > 0 ? (
        <View style={styles.classSelectorBox}>
          <Text style={styles.selectorLabel}>Class Assignments:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {assignments.map((asn) => (
              <TouchableOpacity
                key={asn.id}
                style={[
                  styles.chip,
                  selectedClass?.id === asn.id ? styles.activeChip : styles.inactiveChip,
                ]}
                onPress={() => setSelectedClass(asn)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedClass?.id === asn.id ? styles.activeChipText : styles.inactiveChipText,
                  ]}
                >
                  {asn.department} - Year {asn.year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.statsRow}>
        <StatCard
          title="Total Students"
          value={students.length}
          accentColor="#2563eb"
          icon={<Users size={16} color="#2563eb" />}
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests.length}
          accentColor="#d97706"
          icon={<Clock size={16} color="#d97706" />}
        />
      </View>

      <View style={styles.statsRow}>
        <StatCard
          title="Avg Attendance"
          value={`${stats.averageAttendance}%`}
          accentColor="#16a34a"
          icon={<CheckCircle2 size={16} color="#16a34a" />}
        />
        <StatCard
          title="Low Attendance (<75%)"
          value={stats.lowAttendanceCount}
          accentColor="#dc2626"
          icon={<AlertTriangle size={16} color="#dc2626" />}
        />
      </View>

      <Text style={styles.sectionHeader}>Quick Actions</Text>
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('PendingRequests')}
        activeOpacity={0.7}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconBox, { backgroundColor: '#fff7ed' }]}>
            <Clock size={20} color="#ea580c" />
          </View>
          <Text style={styles.actionText}>Process Pending Requests ({pendingRequests.length})</Text>
        </View>
        <ChevronRight size={18} color="#94a3b8" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('StudentRecords')}
        activeOpacity={0.7}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconBox, { backgroundColor: '#eff6ff' }]}>
            <Users size={20} color="#2563eb" />
          </View>
          <Text style={styles.actionText}>Student Records & Attendance</Text>
        </View>
        <ChevronRight size={18} color="#94a3b8" />
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Pending Review</Text>
      {pendingRequests.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No pending requests for your class.</Text>
        </View>
      ) : (
        <FlatList
          data={pendingRequests.slice(0, 5)}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }: { item: LeaveRequest }) => (
            <RequestCard
              request={item}
              showActions
              onApprove={(id) => processRequest(id, 'approved', item.studentId, item.studentName)}
              onReject={(id) => processRequest(id, 'rejected', item.studentId, item.studentName)}
            />
          )}
        />
      )}
    </View>
  );

  const renderAdminDashboard = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Admin Dashboard</Text>
        <Text style={styles.bannerSubtitle}>
          Manage users, department settings, and system configurations.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard
          title="Total Requests"
          value={rawRequests.length}
          accentColor="#2563eb"
          icon={<FileText size={16} color="#2563eb" />}
        />
        <StatCard
          title="Pending Action"
          value={rawRequests.filter((r) => r.status === 'pending').length}
          accentColor="#d97706"
          icon={<Clock size={16} color="#d97706" />}
        />
      </View>

      <Text style={styles.sectionHeader}>Administration Tools</Text>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('UserManagement')}
        activeOpacity={0.7}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconBox, { backgroundColor: '#eff6ff' }]}>
            <Users size={20} color="#2563eb" />
          </View>
          <Text style={styles.actionText}>User Management & Roles</Text>
        </View>
        <ChevronRight size={18} color="#94a3b8" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('Settings')}
        activeOpacity={0.7}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconBox, { backgroundColor: '#f1f5f9' }]}>
            <Settings size={20} color="#475569" />
          </View>
          <Text style={styles.actionText}>System Settings & Holidays</Text>
        </View>
        <ChevronRight size={18} color="#94a3b8" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('Reports')}
        activeOpacity={0.7}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconBox, { backgroundColor: '#f0fdf4' }]}>
            <BarChart3 size={20} color="#16a34a" />
          </View>
          <Text style={styles.actionText}>Reports & Analytics</Text>
        </View>
        <ChevronRight size={18} color="#94a3b8" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('AuditTrail')}
        activeOpacity={0.7}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconBox, { backgroundColor: '#faf5ff' }]}>
            <Shield size={20} color="#9333ea" />
          </View>
          <Text style={styles.actionText}>Audit Trail Logs</Text>
        </View>
        <ChevronRight size={18} color="#94a3b8" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {userData?.role === 'student' && renderStudentDashboard()}
        {(userData?.role === 'teacher' || userData?.role === 'hod') && renderTeacherDashboard()}
        {userData?.role === 'admin' && renderAdminDashboard()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
  },
  sectionContainer: {
    flexDirection: 'column',
  },
  banner: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#dbeafe',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 14,
    marginBottom: 10,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  classSelectorBox: {
    marginBottom: 14,
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeChip: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  inactiveChip: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeChipText: {
    color: '#ffffff',
  },
  inactiveChipText: {
    color: '#475569',
  },
});
