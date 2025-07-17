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

        const success = await login(email, password);

        if (success) {
            router.replace('/(tabs)');
        } else {
            Alert.alert('Erro', 'Email ou senha incorretos');
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
        inputFocused: {
            borderColor: theme.colors.primary,
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
            marginTop: 30,
            padding: 16,
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
        },
        demoTitle: {
            fontSize: 14,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: 8,
        },
        demoText: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            lineHeight: 16,
        },
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
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
                    <Text style={styles.demoTitle}>Contas para teste:</Text>
                    <Text style={styles.demoText}>
                        Estudante: joao@student.com / 123456{'\n'}
                        Professor: maria@teacher.com / 123456
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}