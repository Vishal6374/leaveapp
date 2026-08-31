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
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={18} color="#2563eb" />
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
            title="Total Requests"
            value={total}
            accentColor="#2563eb"
            icon={<FileText size={16} color="#2563eb" />}
          />
          <StatCard
            title="Approved"
            value={approved}
            accentColor="#16a34a"
            icon={<CheckCircle2 size={16} color="#16a34a" />}
          />
        </View>

        <View style={styles.grid}>
          <StatCard
            title="Pending"
            value={pending}
            accentColor="#d97706"
            icon={<Clock size={16} color="#d97706" />}
          />
          <StatCard
            title="Rejected"
            value={rejected}
            accentColor="#dc2626"
            icon={<XCircle size={16} color="#dc2626" />}
          />
        </View>

        <Text style={styles.sectionHeader}>Category Breakdown</Text>
        <View style={styles.grid}>
          <StatCard
            title="Leave Requests"
            value={leaveCount}
            accentColor="#0284c7"
            icon={<BarChart3 size={16} color="#0284c7" />}
          />
          <StatCard
            title="On-Duty (OD)"
            value={odCount}
            accentColor="#9333ea"
            icon={<BarChart3 size={16} color="#9333ea" />}
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
  scrollContent: {
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
  banner: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerVal: {
    fontSize: 38,
    fontWeight: '900',
    color: '#22c55e',
    marginBottom: 2,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  bannerSub: {
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
  grid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
});
