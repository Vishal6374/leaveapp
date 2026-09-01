import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  BarChart3,
  Users,
  Clock,
  Settings,
  Shield,
  FileText,
} from 'lucide-react-native';
import { colors, shadows, radius } from '../../theme';

interface BottomNavBarProps {
  navigation: any;
  currentRouteName: string;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ navigation, currentRouteName }) => {
  const { userData } = useAuth();

  if (!userData) return null;

  const getNavItems = () => {
    switch (userData.role) {
      case 'student':
        return [
          { route: 'Dashboard', label: 'Home', icon: LayoutDashboard },
          { route: 'NewRequest', label: 'Apply', icon: PlusCircle },
          { route: 'MyRequests', label: 'Requests', icon: ClipboardList },
          { route: 'StudentStats', label: 'Analytics', icon: BarChart3 },
        ];
      case 'teacher':
      case 'hod':
        return [
          { route: 'Dashboard', label: 'Home', icon: LayoutDashboard },
          { route: 'PendingRequests', label: 'Pending', icon: Clock },
          { route: 'StudentRecords', label: 'Records', icon: Users },
          { route: 'Reports', label: 'Reports', icon: BarChart3 },
          { route: 'Logs', label: 'Logs', icon: FileText },
        ];
      case 'admin':
        return [
          { route: 'Dashboard', label: 'Home', icon: LayoutDashboard },
          { route: 'UserManagement', label: 'Users', icon: Users },
          { route: 'Reports', label: 'Reports', icon: BarChart3 },
          { route: 'AuditTrail', label: 'Audit', icon: Shield },
          { route: 'Settings', label: 'Settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = currentRouteName === item.route;
        const IconComponent = item.icon;

        return (
          <TouchableOpacity
            key={item.route}
            style={[styles.navItem, isActive ? styles.activeNavItem : null]}
            onPress={() => {
              if (!isActive) {
                navigation.navigate(item.route);
              }
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive ? styles.activeIconWrapper : null]}>
              <IconComponent size={20} color={isActive ? colors.primary : colors.textMuted} />
            </View>
            <Text style={[styles.navLabel, isActive ? styles.activeNavLabel : null]} numberOfLines={1}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    ...shadows.lg,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  activeNavItem: {},
  iconWrapper: {
    width: 38,
    height: 30,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: {
    backgroundColor: colors.primaryLight,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },
  activeNavLabel: {
    color: colors.primary,
    fontWeight: '800',
  },
});
