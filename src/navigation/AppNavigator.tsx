import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
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

const Stack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
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
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
