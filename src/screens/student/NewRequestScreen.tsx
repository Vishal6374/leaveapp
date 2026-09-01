import React, { useState, useEffect, useMemo } from 'react';
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
import { useAttendancePrediction } from '../../hooks/useAttendancePrediction';
import { Header } from '../../components/common/Header';
import { RequestType, Holiday } from '../../types';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { format, addDays, startOfMonth } from 'date-fns';
import { Calendar, FileText, ArrowLeft, Send, AlertTriangle, TrendingDown, Sparkles } from 'lucide-react-native';
import { colors, shadows, radius } from '../../theme';

export const NewRequestScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { createRequest, requests } = useRequests();

  const [requestType, setRequestType] = useState<RequestType>('leave');
  const [fromDateStr, setFromDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [toDateStr, setToDateStr] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [reason, setReason] = useState('');
  const [subType, setSubType] = useState('casual');
  const [loading, setLoading] = useState(false);

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [semesterStart, setSemesterStart] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [minAttendance, setMinAttendance] = useState<number>(75);

  useEffect(() => {
    const unsubH = onSnapshot(collection(db, 'holidays'), (snap) => {
      setHolidays(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Holiday));
    });
    const unsubS = onSnapshot(doc(db, 'systemSettings', 'global'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.semesterStart) setSemesterStart(data.semesterStart);
        if (data.minAttendancePercent) setMinAttendance(data.minAttendancePercent);
      }
    });

    return () => {
      unsubH();
      unsubS();
    };
  }, []);

  const approvedRequests = useMemo(() => {
    return requests.filter((r) => r.status === 'approved');
  }, [requests]);

  const proposedFromDate = useMemo(() => {
    const d = new Date(fromDateStr);
    return isNaN(d.getTime()) ? undefined : d;
  }, [fromDateStr]);

  const proposedToDate = useMemo(() => {
    const d = new Date(toDateStr);
    return isNaN(d.getTime()) ? undefined : d;
  }, [toDateStr]);

  const { currentPct, projectedPct, wouldDropBelowThreshold } = useAttendancePrediction({
    approvedRequests,
    holidays,
    semesterConfig: { start: semesterStart, threshold: minAttendance },
    proposedFromDate,
    proposedToDate,
  });

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
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Apply for Leave / OD</Text>
              <Text style={styles.subtitle}>Fill out the application details for advisor review.</Text>
            </View>
          </View>

          {/* Request Type Selector */}
          <Text style={styles.label}>APPLICATION CATEGORY *</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeBtn, requestType === 'leave' ? styles.activeTypeBtn : styles.inactiveTypeBtn]}
              onPress={() => setRequestType('leave')}
              activeOpacity={0.8}
            >
              <Text style={[styles.typeBtnText, requestType === 'leave' ? styles.activeTypeBtnText : styles.inactiveTypeBtnText]}>
                Casual Leave
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
              <Text style={styles.label}>LEAVE SUBTYPE</Text>
              <View style={styles.chipRow}>
                {['casual', 'medical', 'academic'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.subChip, subType === st ? styles.activeSubChip : styles.inactiveSubChip]}
                    onPress={() => setSubType(st)}
                    activeOpacity={0.8}
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
              <Text style={styles.label}>FROM DATE *</Text>
              <View style={styles.inputBox}>
                <Calendar size={16} color={colors.primary} />
                <TextInput
                  style={styles.input}
                  value={fromDateStr}
                  onChangeText={setFromDateStr}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.flexHalf}>
              <Text style={styles.label}>TO DATE *</Text>
              <View style={styles.inputBox}>
                <Calendar size={16} color={colors.primary} />
                <TextInput
                  style={styles.input}
                  value={toDateStr}
                  onChangeText={setToDateStr}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          </View>

          {/* Attendance Prediction Preview Banner */}
          <View style={styles.predictionCard}>
            <View style={styles.predictionHeader}>
              <Sparkles size={14} color={colors.primary} />
              <Text style={styles.predictionTitle}>ATTENDANCE IMPACT PREDICTION</Text>
            </View>

            <View style={styles.predictionRow}>
              <View style={styles.predItem}>
                <Text style={styles.predVal}>{currentPct}%</Text>
                <Text style={styles.predSub}>Current</Text>
              </View>

              <TrendingDown size={20} color={colors.textMuted} />

              <View style={styles.predItem}>
                <Text style={[styles.predVal, { color: wouldDropBelowThreshold ? colors.danger : colors.primary }]}>
                  {projectedPct}%
                </Text>
                <Text style={styles.predSub}>Projected</Text>
              </View>
            </View>

            {wouldDropBelowThreshold ? (
              <View style={styles.warningBox}>
                <AlertTriangle size={16} color={colors.dangerText} />
                <Text style={styles.warningText}>
                  Warning: Approving this leave will drop your attendance below the required {minAttendance}% threshold!
                </Text>
              </View>
            ) : null}
          </View>

          {/* Reason Input */}
          <Text style={styles.label}>REASON FOR APPLICATION *</Text>
          <View style={[styles.inputBox, styles.textAreaBox]}>
            <FileText size={16} color={colors.primary} style={styles.textAreaIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={reason}
              onChangeText={setReason}
              placeholder="State your reason clearly..."
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.btnInner}>
                <Send size={18} color="#ffffff" />
                <Text style={styles.submitBtnText}>Submit Application</Text>
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
    backgroundColor: colors.bgPage,
  },
  scrollContent: {
    padding: 18,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
  },
  headerRow: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  typeBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  activeTypeBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  inactiveTypeBtn: {
    backgroundColor: colors.bgPage,
    borderColor: colors.borderLight,
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  activeTypeBtnText: {
    color: '#ffffff',
  },
  inactiveTypeBtnText: {
    color: colors.textSecondary,
  },
  fieldBlock: {
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  subChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  activeSubChip: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  inactiveSubChip: {
    backgroundColor: colors.bgPage,
    borderColor: colors.borderLight,
  },
  subChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  activeSubText: {
    color: colors.primary,
  },
  inactiveSubText: {
    color: colors.textMuted,
  },
  dateGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  flexHalf: {
    flex: 1,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgPage,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    marginLeft: 8,
    fontWeight: '600',
  },
  predictionCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  predictionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  predItem: {
    alignItems: 'center',
  },
  predVal: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  predSub: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    borderRadius: radius.xs,
    padding: 10,
    marginTop: 10,
  },
  warningText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.dangerText,
    flex: 1,
    lineHeight: 16,
  },
  textAreaBox: {
    height: 110,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textAreaIcon: {
    marginTop: 2,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    ...shadows.md,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});


