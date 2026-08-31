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
  Sparkles,
  PlusCircle,
  TrendingUp,
} from 'lucide-react-native';
import { colors, shadows, radius } from '../theme';

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

      const attendedDays = Math.max(0, totalWorkingDays - absentDays);
      const percentage = totalWorkingDays > 0 ? (attendedDays / totalWorkingDays) * 100 : 100;

      totalAttendanceSum += percentage;
      if (percentage < 75) lowAttendanceCount++;

      return { student, percentage };
    });

    const averageAttendance = Math.round(totalAttendanceSum / students.length);

    return { averageAttendance, lowAttendanceCount, studentStats };
  }, [students, allRequests, holidays, semesterStart]);

  const pendingRequests = useMemo(() => {
    return rawRequests.filter((r) => r.status === 'pending');
  }, [rawRequests]);

  const approvedRequests = useMemo(() => {
    return rawRequests.filter((r) => r.status === 'approved');
  }, [rawRequests]);

  if (requestsLoading || loadingConfig || dbLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  const renderStudentDashboard = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.banner}>
        <View style={styles.bannerHeaderRow}>
          <Text style={styles.bannerTitle}>Student Portal</Text>
          <View style={styles.heroBadge}>
            <Sparkles size={12} color="#ffffff" />
            <Text style={styles.heroBadgeText}>ACTIVE</Text>
          </View>
        </View>
        <Text style={styles.bannerSubtitle}>
          Track your leave requests, check attendance, and apply for OD seamlessly.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard
          title="TOTAL REQUESTS"
          value={rawRequests.length}
          subtext="Submitted total"
          icon={<FileText size={18} color={colors.primary} />}
          accentColor={colors.primary}
        />
        <StatCard
          title="PENDING"
          value={pendingRequests.length}
          subtext="Awaiting review"
          icon={<Clock size={18} color={colors.warning} />}
          accentColor={colors.warning}
        />
        <StatCard
          title="APPROVED"
          value={approvedRequests.length}
          subtext="Granted leaves"
          icon={<CheckCircle2 size={18} color={colors.success} />}
          accentColor={colors.success}
        />
      </View>

      <Text style={styles.sectionHeader}>Quick Actions</Text>
      
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('NewRequest')}
        activeOpacity={0.8}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconBox, { backgroundColor: colors.primaryLight }]}>
            <PlusCircle size={20} color={colors.primary} />
          </View>
          <View style={styles.actionTextBox}>
            <Text style={styles.actionText}>Apply for Leave / OD</Text>
            <Text style={styles.actionSubtext}>Submit new leave request or OD clearance</Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('MyRequests')}
        activeOpacity={0.8}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconBox, { backgroundColor: colors.accentVioletLight }]}>
            <FileText size={20} color={colors.accentViolet} />
          </View>
          <View style={styles.actionTextBox}>
            <Text style={styles.actionText}>My Request History</Text>
            <Text style={styles.actionSubtext}>View status of all submitted applications</Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('StudentStats')}
        activeOpacity={0.8}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconBox, { backgroundColor: colors.secondaryLight }]}>
            <TrendingUp size={20} color={colors.secondary} />
          </View>
          <View style={styles.actionTextBox}>
            <Text style={styles.actionText}>Attendance & Analytics</Text>
            <Text style={styles.actionSubtext}>Check attendance predictions & trends</Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Recent Activity</Text>
      {rawRequests.length === 0 ? (
        <View style={styles.emptyCard}>
          <Clock size={32} color={colors.textMuted} style={{ marginBottom: 8 }} />
          <Text style={styles.emptyText}>No recent leave requests found.</Text>
        </View>
      ) : (
        rawRequests.slice(0, 3).map((req) => (
          <RequestCard key={req.id} request={req} />
        ))
      )}
    </View>
  );

  const renderTeacherDashboard = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.banner}>
        <View style={styles.bannerHeaderRow}>
          <Text style={styles.bannerTitle}>
            {userData?.role === 'hod' ? 'HOD Portal' : 'Faculty Dashboard'}
          </Text>
          <View style={styles.heroBadge}>
            <Sparkles size={12} color="#ffffff" />
            <Text style={styles.heroBadgeText}>{userData?.department || 'DEPT'}</Text>
          </View>
        </View>
        <Text style={styles.bannerSubtitle}>
          Manage student requests, track department stats, and approve leave clearance.
        </Text>
      </View>

      {userData?.role === 'teacher' && assignments.length > 0 ? (
        <View style={styles.classSelectorBox}>
          <Text style={styles.selectorLabel}>ASSIGNED CLASS ADVISOR FOR:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {assignments.map((c) => {
              const isSelected = selectedClass?.id === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, isSelected ? styles.activeChip : styles.inactiveChip]}
                  onPress={() => setSelectedClass(c)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isSelected ? styles.activeChipText : styles.inactiveChipText]}>
                    Year {c.year} - {c.department}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.statsRow}>
        <StatCard
          title="PENDING REQS"
          value={pendingRequests.length}
          subtext="Needs approval"
          icon={<Clock size={18} color={colors.warning} />}
          accentColor={colors.warning}
        />
        <StatCard
          title="AVG ATTENDANCE"
          value={`${stats.averageAttendance}%`}
          subtext="Class average"
          icon={<BarChart3 size={18} color={colors.primary} />}
          accentColor={colors.primary}
        />
        <StatCard
          title="AT RISK (<75%)"
          value={stats.lowAttendanceCount}
          subtext="Low attendance"
          icon={<AlertTriangle size={18} color={colors.danger} />}
          accentColor={colors.danger}
        />
      </View>

      <Text style={styles.sectionHeader}>Quick Actions</Text>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('PendingRequests')}
        activeOpacity={0.8}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconBox, { backgroundColor: colors.warningBg }]}>
            <Clock size={20} color={colors.warning} />
          </View>
          <View style={styles.actionTextBox}>
            <Text style={styles.actionText}>Pending Leave Approvals ({pendingRequests.length})</Text>
            <Text style={styles.actionSubtext}>Review & approve student applications</Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('StudentRecords')}
        activeOpacity={0.8}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconBox, { backgroundColor: colors.primaryLight }]}>
            <Users size={20} color={colors.primary} />
          </View>
          <View style={styles.actionTextBox}>
            <Text style={styles.actionText}>Student Records & Attendance</Text>
            <Text style={styles.actionSubtext}>View attendance percentages & leave details</Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('Logs')}
        activeOpacity={0.8}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconBox, { backgroundColor: colors.accentVioletLight }]}>
            <FileText size={20} color={colors.accentViolet} />
          </View>
          <View style={styles.actionTextBox}>
            <Text style={styles.actionText}>Leave History Logs</Text>
            <Text style={styles.actionSubtext}>Audit past approvals and rejections</Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Pending Approval Queue</Text>
      {pendingRequests.length === 0 ? (
        <View style={styles.emptyCard}>
          <CheckCircle2 size={32} color={colors.success} style={{ marginBottom: 8 }} />
          <Text style={styles.emptyText}>All leave requests have been reviewed!</Text>
        </View>
      ) : (
        pendingRequests.slice(0, 3).map((req) => (
          <RequestCard
            key={req.id}
            request={req}
            showActions
            onApprove={(id) => processRequest(id, 'approved', req.studentId, req.studentName)}
            onReject={(id) => processRequest(id, 'rejected', req.studentId, req.studentName)}
          />
        ))
      )}
    </View>
  );

  const renderAdminDashboard = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.banner}>
        <View style={styles.bannerHeaderRow}>
          <Text style={styles.bannerTitle}>Admin Control Center</Text>
          <View style={styles.heroBadge}>
            <Shield size={12} color="#ffffff" />
            <Text style={styles.heroBadgeText}>SYSTEM ADMIN</Text>
          </View>
        </View>
        <Text style={styles.bannerSubtitle}>
          Configure system settings, manage users, assign class advisors, and export reports.
        </Text>
      </View>

      <Text style={styles.sectionHeader}>Admin Modules</Text>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('UserManagement')}
        activeOpacity={0.8}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconBox, { backgroundColor: colors.primaryLight }]}>
            <Users size={20} color={colors.primary} />
          </View>
          <View style={styles.actionTextBox}>
            <Text style={styles.actionText}>User & Role Management</Text>
            <Text style={styles.actionSubtext}>Manage accounts, roles & class assignments</Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('Settings')}
        activeOpacity={0.8}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconBox, { backgroundColor: colors.warningBg }]}>
            <Settings size={20} color={colors.warning} />
          </View>
          <View style={styles.actionTextBox}>
            <Text style={styles.actionText}>System Settings & Holidays</Text>
            <Text style={styles.actionSubtext}>Configure semester dates & holiday calendar</Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('Reports')}
        activeOpacity={0.8}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconBox, { backgroundColor: colors.successBg }]}>
            <BarChart3 size={20} color={colors.success} />
          </View>
          <View style={styles.actionTextBox}>
            <Text style={styles.actionText}>Reports & Analytics</Text>
            <Text style={styles.actionSubtext}>Export attendance data & department metrics</Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('AuditTrail')}
        activeOpacity={0.8}
      >
        <View style={styles.actionLeft}>
          <View style={[styles.actionIconBox, { backgroundColor: colors.accentVioletLight }]}>
            <Shield size={20} color={colors.accentViolet} />
          </View>
          <View style={styles.actionTextBox}>
            <Text style={styles.actionText}>Audit Trail Logs</Text>
            <Text style={styles.actionSubtext}>Security audit trail & action logs</Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.textMuted} />
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
    backgroundColor: colors.bgPage,
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
    padding: 18,
  },
  sectionContainer: {
    flexDirection: 'column',
  },
  banner: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 18,
    ...shadows.md,
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#e0e7ff',
    lineHeight: 19,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextBox: {
    flex: 1,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionSubtext: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  classSelectorBox: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  inactiveChip: {
    backgroundColor: colors.bgCard,
    borderColor: colors.borderLight,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activeChipText: {
    color: '#ffffff',
  },
  inactiveChipText: {
    color: colors.textSecondary,
  },
});
