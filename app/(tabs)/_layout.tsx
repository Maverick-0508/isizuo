import { Tabs } from 'expo-router';
import { StyleSheet, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, BORDER_RADIUS, SHADOWS } from '@/constants';
import { useTranslation } from '@/hooks';

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarLabelStyle: styles.tabLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('matches'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
          ),
          tabBarAccessibilityLabel: t('matches'),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('explore'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={24} color={color} />
          ),
          tabBarAccessibilityLabel: t('explore'),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: t('events'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
          ),
          tabBarAccessibilityLabel: t('events'),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t('communities'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={24} color={color} />
          ),
          tabBarAccessibilityLabel: t('communities'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
          tabBarAccessibilityLabel: t('settings'),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.glassBg,
    borderTopWidth: 0,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 0,
    height: Platform.OS === 'ios' ? 92 : 72,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: FONTS.semiBold,
    letterSpacing: 0.3,
    marginTop: 4,
  },
});
