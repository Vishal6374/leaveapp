import React, { useState, useRef } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import { BottomNavBar } from '../components/common/BottomNavBar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { AuthScreen } from '../screens/AuthScreen';
import { DashboardScreen } from '../screens/DashboardScreen';

// Student Screens
import { NewRequestScreen } from '../screens/student/NewRequestScreen';
import { MyRequestsScreen } from '../screens/student/MyRequestsScreen';
import { StudentStatsScreen } from '../screens/student/StudentStatsScreen';

// Teacher Screens
import { PendingRequestsScreen } from '../screens/teacher/PendingRequestsScreen';
import { LogsScreen } from '../screens/teacher/LogsScreen';
import { StudentRecordsScreen } from '../screens/teacher/StudentRecordsScreen';

// Admin Screens
import { UserManagementScreen } from '../screens/admin/UserManagementScreen';
import { SettingsScreen } from '../screens/admin/SettingsScreen';
import { ReportsScreen } from '../screens/admin/ReportsScreen';
import { AuditTrailScreen } from '../screens/admin/AuditTrailScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
  const { currentUser, loading, signOut } = useAuth();
  const navigationRef = useNavigationContainerRef();
  const [currentRouteName, setCurrentRouteName] = useState<string>('Dashboard');

  // 15-Minute Session Inactivity Security Timeout
  useSessionTimeout({
    timeoutMs: 15 * 60 * 1000,
    onTimeout: async () => {
      await signOut();
    },
    enabled: !!currentUser,
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.appContainer}>
      <NavigationContainer
        ref={navigationRef}
        onStateChange={() => {
          const route = navigationRef.getCurrentRoute();
          if (route && (route as any).name) {
            setCurrentRouteName((route as any).name);
          }
        }}
      >
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!currentUser ? (
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : (
            <>
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="NewRequest" component={NewRequestScreen} />
              <Stack.Screen name="MyRequests" component={MyRequestsScreen} />
              <Stack.Screen name="StudentStats" component={StudentStatsScreen} />
              <Stack.Screen name="PendingRequests" component={PendingRequestsScreen} />
              <Stack.Screen name="Logs" component={LogsScreen} />
              <Stack.Screen name="StudentRecords" component={StudentRecordsScreen} />
              <Stack.Screen name="UserManagement" component={UserManagementScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="Reports" component={ReportsScreen} />
              <Stack.Screen name="AuditTrail" component={AuditTrailScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {currentUser && navigationRef.isReady() ? (
        <BottomNavBar
          navigation={navigationRef}
          currentRouteName={currentRouteName}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: colors.bgPage,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
  },
});

