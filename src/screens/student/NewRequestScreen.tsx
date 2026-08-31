import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRequests } from '../../hooks/useRequests';
import { Header } from '../../components/common/Header';
import { RequestType } from '../../types';
import { format, addDays } from 'date-fns';
import { Calendar, FileText, ArrowLeft, Send } from 'lucide-react-native';

export const NewRequestScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { createRequest } = useRequests();

  const [requestType, setRequestType] = useState<RequestType>('leave');
  const [fromDateStr, setFromDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [toDateStr, setToDateStr] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [reason, setReason] = useState('');
  const [subType, setSubType] = useState('casual');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert('Missing Reason', 'Please enter a reason for your request.');
      return;
    }

    const fromDate = new Date(fromDateStr);
    const toDate = new Date(toDateStr);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      Alert.alert('Invalid Date', 'Please enter dates in YYYY-MM-DD format.');
      return;
    }

    if (fromDate > toDate) {
      Alert.alert('Invalid Date Range', 'From Date cannot be after To Date.');
      return;
    }

    setLoading(true);
    try {
      await createRequest(fromDate, toDate, reason.trim(), requestType, undefined, subType);
      Alert.alert('Success', 'Your request has been submitted successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={18} color="#2563eb" />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>New Leave / OD Request</Text>
          <Text style={styles.subtitle}>Fill out the details below to submit for advisor approval.</Text>

          {/* Request Type Selector */}
          <Text style={styles.label}>Request Category *</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeBtn, requestType === 'leave' ? styles.activeTypeBtn : styles.inactiveTypeBtn]}
              onPress={() => setRequestType('leave')}
              activeOpacity={0.8}
            >
              <Text style={[styles.typeBtnText, requestType === 'leave' ? styles.activeTypeBtnText : styles.inactiveTypeBtnText]}>
                Leave Request
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeBtn, requestType === 'od' ? styles.activeTypeBtn : styles.inactiveTypeBtn]}
              onPress={() => setRequestType('od')}
              activeOpacity={0.8}
            >
              <Text style={[styles.typeBtnText, requestType === 'od' ? styles.activeTypeBtnText : styles.inactiveTypeBtnText]}>
                On-Duty (OD)
              </Text>
            </TouchableOpacity>
          </View>

          {requestType === 'leave' ? (
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Leave Subtype</Text>
              <View style={styles.chipRow}>
                {['casual', 'medical', 'academic'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.subChip, subType === st ? styles.activeSubChip : styles.inactiveSubChip]}
                    onPress={() => setSubType(st)}
                  >
                    <Text style={[styles.subChipText, subType === st ? styles.activeSubText : styles.inactiveSubText]}>
                      {st.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/* Date Inputs */}
          <View style={styles.dateGrid}>
            <View style={styles.flexHalf}>
              <Text style={styles.label}>From Date (YYYY-MM-DD) *</Text>
              <View style={styles.inputBox}>
                <Calendar size={16} color="#64748b" />
                <TextInput
                  style={styles.input}
                  value={fromDateStr}
                  onChangeText={setFromDateStr}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.flexHalf}>
              <Text style={styles.label}>To Date (YYYY-MM-DD) *</Text>
              <View style={styles.inputBox}>
                <Calendar size={16} color="#64748b" />
                <TextInput
                  style={styles.input}
                  value={toDateStr}
                  onChangeText={setToDateStr}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>
          </View>

          {/* Reason Input */}
          <Text style={styles.label}>Reason for Request *</Text>
          <View style={[styles.inputBox, styles.textAreaBox]}>
            <FileText size={16} color="#64748b" style={styles.textAreaIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={reason}
              onChangeText={setReason}
              placeholder="State the reason clearly..."
              multiline
              numberOfLines={4}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.btnInner}>
                <Send size={18} color="#ffffff" />
                <Text style={styles.submitBtnText}>Submit Request</Text>
              </View>
            )}
          </TouchableOpacity>
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
  scrollContent: {
    padding: 16,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  typeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  activeTypeBtn: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  inactiveTypeBtn: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  activeTypeBtnText: {
    color: '#ffffff',
  },
  inactiveTypeBtnText: {
    color: '#475569',
  },
  fieldBlock: {
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  subChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  activeSubChip: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  inactiveSubChip: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  subChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeSubText: {
    color: '#2563eb',
  },
  inactiveSubText: {
    color: '#64748b',
  },
  dateGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  flexHalf: {
    flex: 1,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    marginLeft: 8,
  },
  textAreaBox: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  textAreaIcon: {
    marginTop: 2,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
