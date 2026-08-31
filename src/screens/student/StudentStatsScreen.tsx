import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRequests } from '../../hooks/useRequests';
import { Header } from '../../components/common/Header';
import { StatCard } from '../../components/common/StatCard';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, doc } from 'firebase/firestore';
import { format, eachDayOfInterval, startOfMonth, getDay } from 'date-fns';
import type { Holiday } from '../../types';
import { ArrowLeft, CheckCircle2, Clock, XCircle, FileText, AlertTriangle } from 'lucide-react-native';

export const StudentStatsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { requests, loading } = useRequests();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [semesterStart, setSemesterStart] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    const unsubH = onSnapshot(query(collection(db, 'holidays')), (snap) => {
      setHolidays(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Holiday));
    });
    const unsubS = onSnapshot(doc(db, 'systemSettings', 'global'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.semesterStart) setSemesterStart(data.semesterStart);
      }
      setLoadingConfig(false);
    });
    return () => {
      unsubH();
      unsubS();
    };
  }, []);

  const approved = requests.filter((r) => r.status === 'approved');
  const pending = requests.filter((r) => r.status === 'pending');
  const rejected = requests.filter((r) => r.status === 'rejected');

  const attendanceStats = useMemo(() => {
    try {
      const semStart = new Date(semesterStart);
      const today = new Date();
      if (today < semStart) return { workingDays: 0, absentDays: 0, attendanceRate: 100 };

      const workingDaysList = eachDayOfInterval({ start: semStart, end: today }).filter((d) => {
        const dow = getDay(d);
        const dateKey = format(d, 'yyyy-MM-dd');
        return dow !== 0 && dow !== 6 && !holidays.some((h) => h.date === dateKey);
      });

      const absentDays = approved
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
          } catch (_) {
            return acc;
          }
        }, 0);

      const workingDays = workingDaysList.length;
      const attendanceRate =
        workingDays > 0 ? Math.max(0, Math.round(((workingDays - absentDays) / workingDays) * 100)) : 100;

      return { workingDays, absentDays, attendanceRate };
    } catch (_) {
      return { workingDays: 0, absentDays: 0, attendanceRate: 100 };
    }
  }, [semesterStart, approved, holidays]);

  if (loading || loadingConfig) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading Statistics...</Text>
      </View>
    );
  }

  const isLow = attendanceStats.attendanceRate < 75;

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={18} color="#2563eb" />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Attendance & Request Metrics</Text>

        {isLow ? (
          <View style={styles.alertBox}>
            <AlertTriangle size={20} color="#dc2626" />
            <View style={styles.alertTextContent}>
              <Text style={styles.alertTitle}>Attendance Warning {"(<75%)"}</Text>
              <Text style={styles.alertDesc}>
                Your current attendance is {attendanceStats.attendanceRate}%. Submitting further leave requests may put you below college eligibility criteria.
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.banner}>
          <Text style={styles.bannerRate}>{attendanceStats.attendanceRate}%</Text>
          <Text style={styles.bannerSub}>Current Cumulative Attendance Rate</Text>
          <Text style={styles.bannerDetails}>
            {attendanceStats.workingDays - attendanceStats.absentDays} Days Present out of {attendanceStats.workingDays} Total Working Days
          </Text>
        </View>

        <Text style={styles.sectionHeader}>Request Breakdown</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Submitted"
            value={requests.length}
            accentColor="#2563eb"
            icon={<FileText size={16} color="#2563eb" />}
          />
          <StatCard
            title="Approved"
            value={approved.length}
            accentColor="#16a34a"
            icon={<CheckCircle2 size={16} color="#16a34a" />}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Pending"
            value={pending.length}
            accentColor="#d97706"
            icon={<Clock size={16} color="#d97706" />}
          />
          <StatCard
            title="Rejected"
            value={rejected.length}
            accentColor="#dc2626"
            icon={<XCircle size={16} color="#dc2626" />}
          />
        </View>
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
  },
  scrollContent: {
    padding: 16,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
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
    marginBottom: 14,
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  alertTextContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991b1b',
    marginBottom: 2,
  },
  alertDesc: {
    fontSize: 12,
    color: '#b91c1c',
    lineHeight: 16,
  },
  banner: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerRate: {
    fontSize: 36,
    fontWeight: '900',
    color: '#38bdf8',
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  bannerDetails: {
    fontSize: 12,
    color: '#94a3b8',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
});
