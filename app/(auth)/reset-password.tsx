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

export default function ResetPasswordScreen() {
    const [email, setEmail] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);

    const router = useRouter();
    const { resetPassword, isLoading } = useAuthStore();
    const { theme } = useThemeStore();

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Erro', 'Por favor, digite seu email');
            return;
        }

        const success = await resetPassword(email);

        if (success) {
            setIsEmailSent(true);
            Alert.alert(
                'Email enviado!',
                'Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.push('/(auth)/login'),
                    },
                ]
            );
        } else {
            Alert.alert('Erro', 'Email não encontrado. Verifique o endereço e tente novamente.');
        }
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
        backButton: {
            position: 'absolute',
            top: 60,
            left: 20,
            zIndex: 1,
        },
        backButtonText: {
            color: theme.colors.primary,
            fontSize: 16,
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
            lineHeight: 24,
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
        resetButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            marginTop: 20,
        },
        resetButtonDisabled: {
            backgroundColor: theme.colors.textSecondary,
        },
        resetButtonText: {
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
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
        loginContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
        loginText: {
            color: theme.colors.textSecondary,
            fontSize: 14,
        },
        loginLink: {
            color: theme.colors.primary,
            fontSize: 14,
            fontWeight: '500',
        },
        successContainer: {
            backgroundColor: theme.colors.success + '20',
            borderRadius: 12,
            padding: 16,
            marginTop: 20,
            alignItems: 'center',
        },
        successIcon: {
            fontSize: 32,
            marginBottom: 10,
        },
        successTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.success,
            marginBottom: 8,
        },
        successText: {
            fontSize: 14,
            color: theme.colors.text,
            textAlign: 'center',
            lineHeight: 20,
        },
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <Text style={styles.backButtonText}>← Voltar</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Redefinir Senha</Text>
                <Text style={styles.subtitle}>
                    Digite seu email e enviaremos instruções para redefinir sua senha
                </Text>

                {!isEmailSent ? (
                    <>
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

                        <TouchableOpacity
                            style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
                            onPress={handleResetPassword}
                            disabled={isLoading}
                        >
                            <Text style={styles.resetButtonText}>
                                {isLoading ? 'Enviando...' : 'Enviar Instruções'}
                            </Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.successContainer}>
                        <Text style={styles.successIcon}>📧</Text>
                        <Text style={styles.successTitle}>Email Enviado!</Text>
                        <Text style={styles.successText}>
                            Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                        </Text>
                    </View>
                )}

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>ou</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Lembrou da senha? </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                        <Text style={styles.loginLink}>Entrar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}