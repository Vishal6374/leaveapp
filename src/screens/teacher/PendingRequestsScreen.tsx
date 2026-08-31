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
import { ArrowLeft } from 'lucide-react-native';

export const PendingRequestsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { requests, loading, processRequest } = useRequests();

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  const handleApprove = async (id: string) => {
    const item = pendingRequests.find((r) => r.id === id);
    if (!item) return;

    try {
      await processRequest(id, 'approved', item.studentId, item.studentName);
      Alert.alert('Approved', 'Request has been approved.');
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
          <ArrowLeft size={18} color="#2563eb" />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Pending Approval Requests</Text>
        <Text style={styles.subtitle}>Review leave and OD applications from students.</Text>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : pendingRequests.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyText}>No pending requests to review.</Text>
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
});
