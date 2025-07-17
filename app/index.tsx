import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export default function IndexScreen() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const { theme } = useThemeStore();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isAuthenticated && user) {
                router.replace('/(tabs)');
            } else {
                router.replace('/(auth)/login');
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [isAuthenticated, user, router]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.background,
        },
        title: {
            fontSize: 32,
            fontWeight: 'bold',
            color: theme.colors.primary,
            marginBottom: 20,
        },
        subtitle: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            marginBottom: 40,
        },
        loader: {
            marginTop: 20,
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>EduApp</Text>
            <Text style={styles.subtitle}>Sua plataforma de estudos</Text>
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        </View>
    );
}