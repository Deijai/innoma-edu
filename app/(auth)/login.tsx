// app/(auth)/login.tsx - Versão SIMPLES

import ConnectionStatus from '@/components/ConnectionStatus';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const { login, isLoading } = useAuthStore();
    const { theme } = useThemeStore();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        try {
            const success = await login(email, password);
            if (success) {
                router.replace('/(tabs)');
            }
        } catch (error: any) {
            Alert.alert('Erro', error.message);
        }
    };

    const handleDemoLogin = (userType: 'student' | 'teacher') => {
        const demoCredentials = {
            student: { email: 'joao@student.com', password: '123456' },
            teacher: { email: 'maria@teacher.com', password: '123456' }
        };

        const { email: demoEmail, password: demoPassword } = demoCredentials[userType];
        setEmail(demoEmail);
        setPassword(demoPassword);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        scrollContainer: {
            flex: 1,
            justifyContent: 'center',
            padding: 20,
        },
        title: {
            fontSize: 32,
            fontWeight: 'bold',
            color: theme.colors.primary,
            textAlign: 'center',
            marginBottom: 10,
        },
        subtitle: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginBottom: 40,
        },
        inputContainer: {
            marginBottom: 20,
        },
        label: {
            fontSize: 16,
            color: theme.colors.text,
            marginBottom: 8,
            fontWeight: '500',
        },
        input: {
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: theme.colors.text,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        passwordContainer: {
            position: 'relative',
        },
        showPasswordButton: {
            position: 'absolute',
            right: 16,
            top: 16,
        },
        showPasswordText: {
            color: theme.colors.primary,
            fontSize: 14,
        },
        loginButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            marginTop: 20,
        },
        loginButtonDisabled: {
            backgroundColor: theme.colors.textSecondary,
            opacity: 0.6,
        },
        loginButtonText: {
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
        },
        forgotPassword: {
            alignItems: 'center',
            marginTop: 20,
        },
        forgotPasswordText: {
            color: theme.colors.primary,
            fontSize: 14,
        },
        divider: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 30,
        },
        dividerLine: {
            flex: 1,
            height: 1,
            backgroundColor: theme.colors.border,
        },
        dividerText: {
            color: theme.colors.textSecondary,
            paddingHorizontal: 16,
        },
        signupContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
        },
        signupText: {
            color: theme.colors.textSecondary,
            fontSize: 14,
        },
        signupLink: {
            color: theme.colors.primary,
            fontSize: 14,
            fontWeight: '500',
        },
        demoContainer: {
            marginTop: 20,
            padding: 16,
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
        },
        demoTitle: {
            fontSize: 14,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: 12,
            textAlign: 'center',
        },
        demoButtonsContainer: {
            flexDirection: 'row',
            gap: 8,
        },
        demoButton: {
            flex: 1,
            backgroundColor: theme.colors.primary + '20',
            borderRadius: 8,
            padding: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.primary,
        },
        demoButtonText: {
            color: theme.colors.primary,
            fontSize: 12,
            fontWeight: '600',
        },
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <ConnectionStatus />
                <Text style={styles.title}>EduApp</Text>
                <Text style={styles.subtitle}>Entre na sua conta</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Digite seu email"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Senha</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Digite sua senha"
                            placeholderTextColor={theme.colors.textSecondary}
                            secureTextEntry={!showPassword}
                            autoComplete="password"
                        />
                        <TouchableOpacity
                            style={styles.showPasswordButton}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Text style={styles.showPasswordText}>
                                {showPassword ? 'Ocultar' : 'Mostrar'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    <Text style={styles.loginButtonText}>
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={() => router.push('/(auth)/reset-password')}
                >
                    <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>ou</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>Não tem uma conta? </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                        <Text style={styles.signupLink}>Cadastre-se</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.demoContainer}>
                    <Text style={styles.demoTitle}>🚀 Contas Demo</Text>

                    <View style={styles.demoButtonsContainer}>
                        <TouchableOpacity
                            style={styles.demoButton}
                            onPress={() => handleDemoLogin('student')}
                        >
                            <Text style={styles.demoButtonText}>👨‍🎓 Estudante</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.demoButton}
                            onPress={() => handleDemoLogin('teacher')}
                        >
                            <Text style={styles.demoButtonText}>👨‍🏫 Professor</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}