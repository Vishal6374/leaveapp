import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRequests } from '../../hooks/useRequests';
import { Header } from '../../components/common/Header';
import { RequestCard } from '../../components/common/RequestCard';
import { LeaveRequest } from '../../types';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { colors, shadows, radius } from '../../theme';

export const PendingRequestsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { requests, loading, processRequest } = useRequests();

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  const handleApprove = async (id: string) => {
    const item = pendingRequests.find((r) => r.id === id);
    if (!item) return;

    try {
      await processRequest(id, 'approved', item.studentId, item.studentName);
      Alert.alert('Approved', 'Request has been approved successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Action failed.');
    }
  };

  const handleReject = async (id: string) => {
    const item = pendingRequests.find((r) => r.id === id);
    if (!item) return;

    Alert.prompt(
      'Reject Request',
      'Please enter a reason or comment for rejection:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async (comment?: string) => {
            try {
              await processRequest(id, 'rejected', item.studentId, item.studentName, comment);
              Alert.alert('Rejected', 'Request has been rejected.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Action failed.');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Pending Approvals Queue</Text>
        <Text style={styles.subtitle}>Review and approve student leave and OD applications.</Text>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : pendingRequests.length === 0 ? (
          <View style={styles.centerBox}>
            <CheckCircle2 size={40} color={colors.success} style={{ marginBottom: 10 }} />
            <Text style={styles.emptyText}>All leave applications have been reviewed!</Text>
          </View>
        ) : (
          <FlatList
            data={pendingRequests}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: { item: LeaveRequest }) => (
              <RequestCard
                request={item}
                showActions
                onApprove={handleApprove}
                onReject={handleReject}
              />
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
});

