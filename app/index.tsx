// app/index.tsx - Correção completa

import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export default function IndexScreen() {
    const router = useRouter();
    const { isAuthenticated, user, isInitialized } = useAuthStore();
    const { theme } = useThemeStore();

    useEffect(() => {
        // Aguardar inicialização do auth
        if (!isInitialized) return;

        const timer = setTimeout(() => {
            if (isAuthenticated && user) {
                // Verificar se usuário está ativo
                if (!user.isActive) {
                    router.replace('/(auth)/pending-approval');
                } else {
                    router.replace('/(tabs)');
                }
            } else {
                router.replace('/(auth)/login');
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [isAuthenticated, user, isInitialized, router]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.background,
        },
        logoContainer: {
            marginBottom: 40,
        },
        logo: {
            fontSize: 64,
            marginBottom: 16,
        },
        title: {
            fontSize: 32,
            fontWeight: 'bold',
            color: theme.colors.primary,
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            marginBottom: 40,
            textAlign: 'center',
        },
        loader: {
            marginTop: 20,
        },
        statusText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginTop: 16,
            textAlign: 'center',
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Text style={styles.logo}>🎓</Text>
            </View>
            <Text style={styles.title}>EduApp</Text>
            <Text style={styles.subtitle}>
                Transformando a educação{'\n'}através da tecnologia
            </Text>

            <ActivityIndicator
                size="large"
                color={theme.colors.primary}
                style={styles.loader}
            />

            <Text style={styles.statusText}>
                {!isInitialized ? 'Inicializando...' : 'Carregando...'}
            </Text>
        </View>
    );
}