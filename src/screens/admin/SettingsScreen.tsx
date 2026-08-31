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
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={18} color="#2563eb" />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>System Settings & Holidays</Text>
        <Text style={styles.subtitle}>Configure attendance criteria and official holiday calendars.</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <SettingsIcon size={18} color="#2563eb" />
            <Text style={styles.cardTitle}>Global Attendance Thresholds</Text>
          </View>

          <Text style={styles.label}>Minimum Attendance Percentage (%)</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={minAttendance}
              onChangeText={setMinAttendance}
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.label}>Semester Start Date (YYYY-MM-DD)</Text>
          <View style={styles.inputBox}>
            <Calendar size={16} color="#64748b" />
            <TextInput
              style={styles.input}
              value={semesterStart}
              onChangeText={setSemesterStart}
            />
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveSettings}
            disabled={saving}
            activeOpacity={0.7}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.btnInner}>
                <Save size={16} color="#ffffff" />
                <Text style={styles.saveBtnText}>Save System Settings</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={18} color="#2563eb" />
            <Text style={styles.cardTitle}>Official Holiday Calendar</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.flexHalf}>
              <Text style={styles.label}>Holiday Name</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Festival"
                  value={newHolidayName}
                  onChangeText={setNewHolidayName}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.flexHalf}>
              <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={newHolidayDate}
                  onChangeText={setNewHolidayDate}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={handleAddHoliday} activeOpacity={0.7}>
            <Plus size={16} color="#ffffff" />
            <Text style={styles.addBtnText}>Add Holiday</Text>
          </TouchableOpacity>

          <Text style={styles.subHeader}>Configured Holidays ({holidays.length})</Text>
          {holidays.map((h) => (
            <View key={h.id} style={styles.holidayRow}>
              <View>
                <Text style={styles.holidayName}>{h.name}</Text>
                <Text style={styles.holidayDate}>{h.date}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteHoliday(h.id)} activeOpacity={0.7}>
                <Trash2 size={16} color="#ef4444" />
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 44,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
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
    backgroundColor: '#16a34a',
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  subHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  holidayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  holidayName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  holidayDate: {
    fontSize: 11,
    color: '#64748b',
  },
});
