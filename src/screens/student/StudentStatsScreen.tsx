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
import { ArrowLeft, CheckCircle2, Clock, XCircle, FileText, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import { colors, shadows, radius } from '../../theme';

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
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Calculating Attendance Metrics...</Text>
      </View>
    );
  }

  const isLow = attendanceStats.attendanceRate < 75;

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Attendance & Analytics</Text>

        {isLow ? (
          <View style={styles.alertBox}>
            <AlertTriangle size={20} color={colors.danger} />
            <View style={styles.alertTextContent}>
              <Text style={styles.alertTitle}>Attendance Warning {"(<75%)"}</Text>
              <Text style={styles.alertDesc}>
                Your current attendance is {attendanceStats.attendanceRate}%. Submitting further leave requests may put you below eligibility criteria.
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.banner}>
          <View style={styles.bannerRateGlow}>
            <Text style={styles.bannerRate}>{attendanceStats.attendanceRate}%</Text>
          </View>
          <Text style={styles.bannerSub}>Cumulative Attendance Rate</Text>
          <Text style={styles.bannerDetails}>
            {attendanceStats.workingDays - attendanceStats.absentDays} Days Present out of {attendanceStats.workingDays} Working Days
          </Text>
        </View>

        <Text style={styles.sectionHeader}>Request Statistics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="TOTAL SUBMITTED"
            value={requests.length}
            subtext="Applications"
            accentColor={colors.primary}
            icon={<FileText size={18} color={colors.primary} />}
          />
          <StatCard
            title="APPROVED"
            value={approved.length}
            subtext="Granted"
            accentColor={colors.success}
            icon={<CheckCircle2 size={18} color={colors.success} />}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="PENDING"
            value={pending.length}
            subtext="In review"
            accentColor={colors.warning}
            icon={<Clock size={18} color={colors.warning} />}
          />
          <StatCard
            title="REJECTED"
            value={rejected.length}
            subtext="Declined"
            accentColor={colors.danger}
            icon={<XCircle size={18} color={colors.danger} />}
          />
        </View>
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
    backgroundColor: colors.bgCard,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  scrollContent: {
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
    marginBottom: 14,
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  alertTextContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.dangerText,
    marginBottom: 2,
  },
  alertDesc: {
    fontSize: 12,
    color: colors.dangerText,
    lineHeight: 18,
    fontWeight: '500',
  },
  banner: {
    backgroundColor: '#0f172a',
    borderRadius: radius.lg,
    padding: 24,
    alignItems: 'center',
    marginBottom: 18,
    ...shadows.lg,
  },
  bannerRateGlow: {
    marginBottom: 6,
  },
  bannerRate: {
    fontSize: 44,
    fontWeight: '900',
    color: colors.secondary,
    letterSpacing: -1,
  },
  bannerSub: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  bannerDetails: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
});

