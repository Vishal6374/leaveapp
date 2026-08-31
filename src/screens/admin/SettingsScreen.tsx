import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, collection, addDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { Holiday } from '../../types';
import { format } from 'date-fns';
import { ArrowLeft, Save, Plus, Trash2, Calendar, Settings as SettingsIcon } from 'lucide-react-native';
import { colors, shadows, radius } from '../../theme';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [minAttendance, setMinAttendance] = useState('75');
  const [semesterStart, setSemesterStart] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    const fetchGlobal = async () => {
      try {
        const snap = await getDoc(doc(db, 'systemSettings', 'global'));
        if (snap.exists()) {
          const data = snap.data();
          if (data.minAttendancePercent) setMinAttendance(String(data.minAttendancePercent));
          if (data.semesterStart) setSemesterStart(data.semesterStart);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobal();

    const unsubH = onSnapshot(collection(db, 'holidays'), (snap) => {
      setHolidays(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Holiday));
    });

    return () => unsubH();
  }, []);

  const handleSaveSettings = async () => {
    const pct = parseInt(minAttendance, 10);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      Alert.alert('Invalid Input', 'Please enter a valid percentage (0-100).');
      return;
    }

    setSaving(true);
    try {
      await setDoc(doc(db, 'systemSettings', 'global'), {
        minAttendancePercent: pct,
        semesterStart,
        updatedAt: new Date(),
      });
      Alert.alert('Settings Saved', 'System configuration has been updated successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddHoliday = async () => {
    if (!newHolidayName.trim() || !newHolidayDate.trim()) {
      Alert.alert('Missing Fields', 'Please enter holiday name and date.');
      return;
    }

    try {
      await addDoc(collection(db, 'holidays'), {
        name: newHolidayName.trim(),
        date: newHolidayDate.trim(),
        type: 'college',
      });
      setNewHolidayName('');
      Alert.alert('Holiday Added', 'New holiday entry created.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add holiday.');
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'holidays', id));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete holiday.');
    }
  };

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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={18} color={colors.primary} />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>System Settings & Holidays</Text>
        <Text style={styles.subtitle}>Configure global attendance threshold & academic holiday calendar.</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <SettingsIcon size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Global Attendance Thresholds</Text>
          </View>

          <Text style={styles.label}>MINIMUM REQUIRED ATTENDANCE (%)</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={minAttendance}
              onChangeText={setMinAttendance}
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <Text style={styles.label}>SEMESTER START DATE (YYYY-MM-DD)</Text>
          <View style={styles.inputBox}>
            <Calendar size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              value={semesterStart}
              onChangeText={setSemesterStart}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveSettings}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.btnInner}>
                <Save size={16} color="#ffffff" />
                <Text style={styles.saveBtnText}>Save Configuration</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Official Holiday Calendar</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.flexHalf}>
              <Text style={styles.label}>HOLIDAY NAME</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Diwali"
                  value={newHolidayName}
                  onChangeText={setNewHolidayName}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.flexHalf}>
              <Text style={styles.label}>DATE (YYYY-MM-DD)</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={newHolidayDate}
                  onChangeText={setNewHolidayDate}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={handleAddHoliday} activeOpacity={0.8}>
            <Plus size={16} color="#ffffff" />
            <Text style={styles.addBtnText}>Add Holiday Entry</Text>
          </TouchableOpacity>

          <Text style={styles.subHeader}>Registered Holidays ({holidays.length})</Text>

          {holidays.map((h) => (
            <View key={h.id} style={styles.holidayRow}>
              <View>
                <Text style={styles.holidayName}>{h.name}</Text>
                <Text style={styles.holidayDate}>{h.date}</Text>
              </View>

              <TouchableOpacity onPress={() => handleDeleteHoliday(h.id)} activeOpacity={0.7}>
                <Trash2 size={16} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
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
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgPage,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    ...shadows.sm,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flexHalf: {
    flex: 1,
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: colors.success,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    ...shadows.sm,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  subHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 18,
    marginBottom: 10,
  },
  holidayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  holidayName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  holidayDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
});
