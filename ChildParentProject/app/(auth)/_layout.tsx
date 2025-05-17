import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'fade',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Giriş',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Kayıt Ol',
        }}
      />
    </Stack>
  );
} 