import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { StatCard } from '../../components/common/StatCard';
import { db } from '../../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { LeaveRequest } from '../../types';
import { ArrowLeft, BarChart3, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react-native';
import { colors, shadows, radius } from '../../theme';

export const ReportsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'leaveRequests'),
      (snap) => {
        setRequests(
          snap.docs.map(
            (d) =>
              ({
                id: d.id,
                ...d.data(),
              }) as LeaveRequest
          )
        );
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  const total = requests.length;
  const approved = requests.filter((r) => r.status === 'approved').length;
  const pending = requests.filter((r) => r.status === 'pending').length;
  const rejected = requests.filter((r) => r.status === 'rejected').length;

  const leaveCount = requests.filter((r) => r.type === 'leave').length;
  const odCount = requests.filter((r) => r.type === 'od').length;

  const approvalPct = total > 0 ? Math.round((approved / total) * 100) : 100;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>System Analytics & Reports</Text>
        <Text style={styles.subtitle}>Overview of leave request volume and approval distributions.</Text>

        <View style={styles.banner}>
          <Text style={styles.bannerVal}>{approvalPct}%</Text>
          <Text style={styles.bannerTitle}>Overall Approval Rate</Text>
          <Text style={styles.bannerSub}>{approved} approved out of {total} total requests</Text>
        </View>

        <Text style={styles.sectionHeader}>Status Breakdown</Text>
        <View style={styles.grid}>
          <StatCard
            title="TOTAL REQUESTS"
            value={total}
            subtext="Applications"
            accentColor={colors.primary}
            icon={<FileText size={18} color={colors.primary} />}
          />
          <StatCard
            title="APPROVED"
            value={approved}
            subtext="Granted"
            accentColor={colors.success}
            icon={<CheckCircle2 size={18} color={colors.success} />}
          />
        </View>

        <View style={styles.grid}>
          <StatCard
            title="PENDING"
            value={pending}
            subtext="In review"
            accentColor={colors.warning}
            icon={<Clock size={18} color={colors.warning} />}
          />
          <StatCard
            title="REJECTED"
            value={rejected}
            subtext="Declined"
            accentColor={colors.danger}
            icon={<XCircle size={18} color={colors.danger} />}
          />
        </View>

        <Text style={styles.sectionHeader}>Category Breakdown</Text>
        <View style={styles.grid}>
          <StatCard
            title="LEAVE APPLICATIONS"
            value={leaveCount}
            subtext="Casual & Medical"
            accentColor={colors.secondary}
            icon={<BarChart3 size={18} color={colors.secondary} />}
          />
          <StatCard
            title="ON-DUTY (OD)"
            value={odCount}
            subtext="Academic OD"
            accentColor={colors.accentViolet}
            icon={<BarChart3 size={18} color={colors.accentViolet} />}
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
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 16,
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
  bannerVal: {
    fontSize: 44,
    fontWeight: '900',
    color: colors.success,
    letterSpacing: -1,
    marginBottom: 2,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
});

