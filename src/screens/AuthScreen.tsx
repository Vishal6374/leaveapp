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
import { Mail, Lock, User, Hash, ChevronRight, Zap, Shield, Sparkles } from 'lucide-react-native';
import { colors, shadows, radius } from '../theme';

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
        {/* Brand Header */}
        <View style={styles.logoRow}>
          <View style={styles.logoGlow}>
            <View style={styles.logoBox}>
              <Sparkles size={24} color="#ffffff" />
            </View>
          </View>
          <Text style={styles.appTitle}>Class Leave Manager</Text>
          <Text style={styles.appSubtitle}>Smart Leave & Attendance Portal</Text>
        </View>

        {/* Mode Segmented Tab Toggle */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, isLogin ? styles.tabBtnActive : null]}
            onPress={() => setIsLogin(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, isLogin ? styles.tabTextActive : null]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, !isLogin ? styles.tabBtnActive : null]}
            onPress={() => setIsLogin(false)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, !isLogin ? styles.tabTextActive : null]}>Register</Text>
          </TouchableOpacity>
        </View>

        {!isLogin ? (
          <View style={styles.formSection}>
            <Text style={styles.label}>FULL NAME *</Text>
            <View style={styles.inputBox}>
              <User size={18} color={colors.primary} />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <Text style={styles.label}>DEPARTMENT *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {(departments.length > 0 ? departments.map((d) => d.name) : defaultDepts).map((dept) => (
                <TouchableOpacity
                  key={dept}
                  style={[styles.deptChip, department === dept ? styles.activeChip : styles.inactiveChip]}
                  onPress={() => setDepartment(dept)}
                  activeOpacity={0.8}
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
                      activeOpacity={0.8}
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
                  <Hash size={18} color={colors.primary} />
                  <TextInput
                    style={styles.input}
                    placeholder="123456"
                    value={sinNumber}
                    onChangeText={setSinNumber}
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.formSection}>
          <Text style={styles.label}>EMAIL ADDRESS *</Text>
          <View style={styles.inputBox}>
            <Mail size={18} color={colors.primary} />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <Text style={styles.label}>PASSWORD *</Text>
          <View style={styles.inputBox}>
            <Lock size={18} color={colors.primary} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleAuth}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <View style={styles.btnInner}>
              <Text style={styles.submitBtnText}>{isLogin ? 'Sign In to Portal' : 'Create Account'}</Text>
              <ChevronRight size={18} color="#ffffff" />
            </View>
          )}
        </TouchableOpacity>

        {isLogin ? (
          <View style={styles.sandboxSection}>
            <View style={styles.sandboxHeader}>
              <Zap size={14} color={colors.primary} />
              <Text style={styles.sandboxTitle}>QUICK DEMO ACCOUNTS</Text>
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
                    <ActivityIndicator size="small" color={colors.primary} />
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
    backgroundColor: colors.bgPage,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.lg,
  },
  logoRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoGlow: {
    padding: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginBottom: 10,
    ...shadows.glow,
  },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: radius.md,
    padding: 4,
    marginBottom: 18,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabBtnActive: {
    backgroundColor: colors.bgCard,
    ...shadows.sm,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
  },
  formSection: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
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
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 10,
    fontWeight: '500',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  deptChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  yearChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  inactiveChip: {
    backgroundColor: colors.bgPage,
    borderColor: colors.borderLight,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activeChipText: {
    color: '#ffffff',
  },
  inactiveChipText: {
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flexHalf: {
    flex: 1,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
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
    letterSpacing: 0.2,
  },
  sandboxSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  sandboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sandboxTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  quickBtn: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderRadius: radius.xs,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: '28%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryDark,
  },
});
