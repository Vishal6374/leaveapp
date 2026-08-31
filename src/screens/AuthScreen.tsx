import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useDepartments } from '../hooks/useDepartments';
import { Mail, Lock, User, Hash, ChevronRight, Zap } from 'lucide-react-native';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const { departments } = useDepartments();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [quickLoginEmail, setQuickLoginEmail] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState('1');
  const [sinNumber, setSinNumber] = useState('');

  const QUICK_USERS = [
    { label: 'Admin', email: 'admin@example.com', role: 'admin' },
    { label: 'HOD AI', email: 'hodai@example.com', role: 'hod' },
    { label: 'HOD CSE', email: 'hodcse@example.com', role: 'hod' },
    { label: 'T23 AI', email: 't23ai@example.com', role: 'teacher' },
    { label: 'S23 AI', email: 'student@gmail.com', role: 'student' },
    { label: 'T23 CSE', email: 't23cse@example.com', role: 'teacher' },
    { label: 'S23 CSE', email: 'sridharanan44@gmail.com', role: 'student' },
  ];

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email.trim(), password);
      } else {
        if (!name || !department) {
          Alert.alert('Missing Information', 'Please provide full name and department.');
          setLoading(false);
          return;
        }
        await signUp(email.trim(), password, name.trim(), department, year, sinNumber.trim());
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message || 'Failed to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string, label: string) => {
    setEmail(userEmail);
    setPassword('123456');
    setQuickLoginEmail(userEmail);
    try {
      await signIn(userEmail, '123456');
    } catch (error: any) {
      Alert.alert('Quick Login Error', error.message || `Failed to log in as ${label}`);
    } finally {
      setQuickLoginEmail(null);
    }
  };

  const defaultDepts = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>CLH</Text>
          </View>
          <Text style={styles.appTitle}>Class Leave Manager</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Get Started'}</Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? 'Enter your credentials to access your portal'
              : 'Join our community of students and staff'}
          </Text>
        </View>

        {!isLogin ? (
          <View style={styles.formSection}>
            <Text style={styles.label}>FULL NAME *</Text>
            <View style={styles.inputBox}>
              <User size={18} color="#64748b" />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <Text style={styles.label}>DEPARTMENT *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {(departments.length > 0 ? departments.map((d) => d.name) : defaultDepts).map((dept) => (
                <TouchableOpacity
                  key={dept}
                  style={[styles.deptChip, department === dept ? styles.activeChip : styles.inactiveChip]}
                  onPress={() => setDepartment(dept)}
                >
                  <Text style={[styles.chipText, department === dept ? styles.activeChipText : styles.inactiveChipText]}>
                    {dept}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.row}>
              <View style={styles.flexHalf}>
                <Text style={styles.label}>YEAR</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                  {['1', '2', '3', '4'].map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[styles.yearChip, year === y ? styles.activeChip : styles.inactiveChip]}
                      onPress={() => setYear(y)}
                    >
                      <Text style={[styles.chipText, year === y ? styles.activeChipText : styles.inactiveChipText]}>
                        Yr {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.flexHalf}>
                <Text style={styles.label}>SIN NO.</Text>
                <View style={styles.inputBox}>
                  <Hash size={18} color="#64748b" />
                  <TextInput
                    style={styles.input}
                    placeholder="123456"
                    value={sinNumber}
                    onChangeText={setSinNumber}
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.formSection}>
          <Text style={styles.label}>EMAIL ADDRESS *</Text>
          <View style={styles.inputBox}>
            <Mail size={18} color="#64748b" />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <Text style={styles.label}>PASSWORD *</Text>
          <View style={styles.inputBox}>
            <Lock size={18} color="#64748b" />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleAuth}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <View style={styles.btnInner}>
              <Text style={styles.submitBtnText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
              <ChevronRight size={18} color="#ffffff" />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setIsLogin(!isLogin)}
          activeOpacity={0.7}
        >
          <Text style={styles.toggleBtnText}>
            {isLogin ? "New here? Join Now" : 'Already member? Sign In'}
          </Text>
        </TouchableOpacity>

        {isLogin ? (
          <View style={styles.sandboxSection}>
            <View style={styles.sandboxHeader}>
              <Zap size={14} color="#2563eb" />
              <Text style={styles.sandboxTitle}>QUICK ACCESS SANDBOX</Text>
            </View>
            <View style={styles.gridContainer}>
              {QUICK_USERS.map((user) => (
                <TouchableOpacity
                  key={user.email}
                  style={styles.quickBtn}
                  onPress={() => handleQuickLogin(user.email, user.label)}
                  disabled={loading || quickLoginEmail !== null}
                  activeOpacity={0.7}
                >
                  {quickLoginEmail === user.email ? (
                    <ActivityIndicator size="small" color="#2563eb" />
                  ) : (
                    <Text style={styles.quickBtnText}>{user.label}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  logoRow: {
    alignItems: 'center',
    marginBottom: 14,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 4,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    marginLeft: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },
  deptChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  yearChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  activeChip: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  inactiveChip: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeChipText: {
    color: '#ffffff',
  },
  inactiveChipText: {
    color: '#475569',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flexHalf: {
    flex: 1,
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  toggleBtn: {
    marginTop: 12,
    alignItems: 'center',
    padding: 6,
  },
  toggleBtnText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '600',
  },
  sandboxSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  sandboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 10,
  },
  sandboxTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  quickBtn: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: '28%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
  },
});
