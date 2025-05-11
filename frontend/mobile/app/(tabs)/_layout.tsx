import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MediaProvider } from '../context/MediaContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <MediaProvider>
    <GestureHandlerRootView>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          height: 70,
          backgroundColor: '#22272B',
          borderTopWidth: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0,
          borderTopColor: 'transparent',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Доставки',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="shippingbox" color={color} />,
        }}
      />
      <Tabs.Screen
        name="also"
        options={{
          title: 'Еще',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="ellipsis" color={color} />,
        }}
      />
      <Tabs.Screen/>
      <Tabs.Screen
        name="create"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="transit-time"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="file-manager"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="distance"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="packaging"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="services-menu"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
    </GestureHandlerRootView>
    </MediaProvider>
  );
}
