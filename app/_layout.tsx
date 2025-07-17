// app/_layout.tsx - Versão SIMPLES

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { initializeAuthListener, useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export default function RootLayout() {
  const { theme, loadTheme } = useThemeStore();
  const { loadUser } = useAuthStore();
  const { loadMockData } = useAppStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Carregar tema
        await loadTheme();

        // 2. Carregar usuário salvo
        await loadUser();

        // 3. Inicializar Firebase Auth
        const unsubscribe = initializeAuthListener();

        // 4. Carregar dados demo
        loadMockData();

        // Cleanup
        return () => {
          if (unsubscribe) {
            unsubscribe();
          }
        };
      } catch (error) {
        console.error('Erro ao inicializar app:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}