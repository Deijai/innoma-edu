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

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<'student' | 'teacher'>('student');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();
    const { signup, isLoading } = useAuthStore();
    const { theme } = useThemeStore();

    const handleSignup = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
            return;
        }

        const success = await signup(name, email, password, role);

        if (success) {
            router.replace('/(tabs)');
        } else {
            Alert.alert('Erro', 'Erro ao criar conta. Tente novamente.');
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        scrollContainer: {
            flexGrow: 1,
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
        roleContainer: {
            marginBottom: 20,
        },
        roleButtons: {
            flexDirection: 'row',
            gap: 12,
        },
        roleButton: {
            flex: 1,
            padding: 16,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: theme.colors.border,
            alignItems: 'center',
        },
        roleButtonActive: {
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.primary + '20',
        },
        roleButtonText: {
            color: theme.colors.text,
            fontSize: 16,
            fontWeight: '500',
        },
        roleButtonTextActive: {
            color: theme.colors.primary,
        },
        signupButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            marginTop: 20,
        },
        signupButtonDisabled: {
            backgroundColor: theme.colors.textSecondary,
        },
        signupButtonText: {
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
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Criar Conta</Text>
                <Text style={styles.subtitle}>Junte-se à nossa plataforma</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nome Completo</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Digite seu nome completo"
                        placeholderTextColor={theme.colors.textSecondary}
                        autoComplete="name"
                    />
                </View>

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

                <View style={styles.roleContainer}>
                    <Text style={styles.label}>Tipo de Conta</Text>
                    <View style={styles.roleButtons}>
                        <TouchableOpacity
                            style={[
                                styles.roleButton,
                                role === 'student' && styles.roleButtonActive,
                            ]}
                            onPress={() => setRole('student')}
                        >
                            <Text
                                style={[
                                    styles.roleButtonText,
                                    role === 'student' && styles.roleButtonTextActive,
                                ]}
                            >
                                Estudante
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.roleButton,
                                role === 'teacher' && styles.roleButtonActive,
                            ]}
                            onPress={() => setRole('teacher')}
                        >
                            <Text
                                style={[
                                    styles.roleButtonText,
                                    role === 'teacher' && styles.roleButtonTextActive,
                                ]}
                            >
                                Professor
                            </Text>
                        </TouchableOpacity>
                    </View>
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

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirmar Senha</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirme sua senha"
                            placeholderTextColor={theme.colors.textSecondary}
                            secureTextEntry={!showConfirmPassword}
                            autoComplete="password"
                        />
                        <TouchableOpacity
                            style={styles.showPasswordButton}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <Text style={styles.showPasswordText}>
                                {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
                    onPress={handleSignup}
                    disabled={isLoading}
                >
                    <Text style={styles.signupButtonText}>
                        {isLoading ? 'Criando conta...' : 'Criar Conta'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>ou</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Já tem uma conta? </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                        <Text style={styles.loginLink}>Entrar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}