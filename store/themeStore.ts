import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Theme } from '../types';

const lightTheme: Theme = {
    isDark: false,
    colors: {
        primary: '#4F46E5',
        secondary: '#10B981',
        background: '#FFFFFF',
        surface: '#F8FAFC',
        text: '#1F2937',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        error: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
    },
};

const darkTheme: Theme = {
    isDark: true,
    colors: {
        primary: '#6366F1',
        secondary: '#34D399',
        background: '#111827',
        surface: '#1F2937',
        text: '#F9FAFB',
        textSecondary: '#9CA3AF',
        border: '#374151',
        error: '#F87171',
        success: '#34D399',
        warning: '#FBBF24',
    },
};

interface ThemeStore {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (isDark: boolean) => void;
    loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
    theme: lightTheme,

    toggleTheme: async () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme.isDark ? lightTheme : darkTheme;

        set({ theme: newTheme });

        try {
            await AsyncStorage.setItem('theme', JSON.stringify(newTheme.isDark));
        } catch (error) {
            console.error('Erro ao salvar tema:', error);
        }
    },

    setTheme: async (isDark: boolean) => {
        const newTheme = isDark ? darkTheme : lightTheme;
        set({ theme: newTheme });

        try {
            await AsyncStorage.setItem('theme', JSON.stringify(isDark));
        } catch (error) {
            console.error('Erro ao salvar tema:', error);
        }
    },

    loadTheme: async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedTheme !== null) {
                const isDark = JSON.parse(savedTheme);
                const theme = isDark ? darkTheme : lightTheme;
                set({ theme });
            }
        } catch (error) {
            console.error('Erro ao carregar tema:', error);
        }
    },
}));