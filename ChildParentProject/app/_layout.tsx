import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { TaskProvider } from './context/TaskContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <TaskProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </TaskProvider>
  );
} 