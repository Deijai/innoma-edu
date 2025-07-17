// app/(tabs)/settings.tsx - Tela de Configurações

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Protected, ShowIf } from '../../components/ProtectionComponents';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { useThemeStore } from '../../store/themeStore';

export default function SettingsScreen() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const { reset, clearData } = useDataStore();

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [autoSync, setAutoSync] = useState(true);

    const handleLogout = () => {
        Alert.alert(
            'Confirmar Logout',
            'Tem certeza que deseja sair da sua conta?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: logout
                },
            ]
        );
    };

    const handleClearData = () => {
        Alert.alert(
            'Limpar Dados',
            'Isso irá remover todos os dados locais. Tem certeza?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Limpar',
                    style: 'destructive',
                    onPress: () => {
                        clearData();
                        Alert.alert('Sucesso', 'Dados locais limpos!');
                    }
                },
            ]
        );
    };

    const handleResetToDemo = () => {
        Alert.alert(
            'Resetar para Demo',
            'Isso irá restaurar os dados de demonstração. Continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Resetar',
                    onPress: () => {
                        reset();
                        Alert.alert('Sucesso', 'Dados de demo restaurados!');
                    }
                },
            ]
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            padding: 20,
            paddingTop: 60,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        title: {
            fontSize: 32,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 16,
            color: theme.colors.textSecondary,
        },
        content: {
            flex: 1,
        },
        section: {
            backgroundColor: theme.colors.surface,
            marginTop: 20,
            marginHorizontal: 20,
            borderRadius: 12,
            overflow: 'hidden',
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.text,
            padding: 16,
            backgroundColor: theme.colors.background,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        settingItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        settingItemLast: {
            borderBottomWidth: 0,
        },
        settingLeft: {
            flex: 1,
        },
        settingTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 4,
        },
        settingDescription: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        settingRight: {
            marginLeft: 16,
        },
        userInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
        },
        avatar: {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
        },
        avatarText: {
            fontSize: 24,
            color: 'white',
            fontWeight: 'bold',
        },
        userDetails: {
            flex: 1,
        },
        userName: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: 4,
        },
        userEmail: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginBottom: 2,
        },
        userRole: {
            fontSize: 12,
            color: theme.colors.primary,
            fontWeight: '600',
            textTransform: 'uppercase',
        },
        button: {
            backgroundColor: theme.colors.surface,
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginHorizontal: 20,
            marginTop: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        buttonPrimary: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        buttonDanger: {
            backgroundColor: theme.colors.error,
            borderColor: theme.colors.error,
        },
        buttonText: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
        },
        buttonTextPrimary: {
            color: 'white',
        },
        buttonTextDanger: {
            color: 'white',
        },
        version: {
            padding: 20,
            alignItems: 'center',
        },
        versionText: {
            fontSize: 12,
            color: theme.colors.textSecondary,
        },
    });

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'student': return 'Estudante';
            case 'teacher': return 'Professor';
            case 'director': return 'Diretor';
            default: return role;
        }
    };

    const getUserInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (!user) {
        return (
            <Protected requireAuth showError>
                <View />
            </Protected>
        );
    }

    return (
        <Protected requireRole="director" showError>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Configurações</Text>
                    <Text style={styles.subtitle}>Gerencie suas preferências</Text>
                </View>

                <ScrollView style={styles.content}>
                    {/* Informações do Usuário */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>👤 Perfil</Text>
                        <View style={styles.userInfo}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {getUserInitials(user.name)}
                                </Text>
                            </View>
                            <View style={styles.userDetails}>
                                <Text style={styles.userName}>{user.name}</Text>
                                <Text style={styles.userEmail}>{user.email}</Text>
                                <Text style={styles.userRole}>
                                    {getRoleDisplayName(user.role)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Preferências */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>⚙️ Preferências</Text>

                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Text style={styles.settingTitle}>Tema Escuro</Text>
                                <Text style={styles.settingDescription}>
                                    Alternar entre tema claro e escuro
                                </Text>
                            </View>
                            <View style={styles.settingRight}>
                                <Switch
                                    value={theme.isDark}
                                    onValueChange={toggleTheme}
                                    trackColor={{
                                        false: theme.colors.border,
                                        true: theme.colors.primary
                                    }}
                                    thumbColor={theme.colors.background}
                                />
                            </View>
                        </View>

                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Text style={styles.settingTitle}>Notificações</Text>
                                <Text style={styles.settingDescription}>
                                    Receber alertas sobre tarefas e aulas
                                </Text>
                            </View>
                            <View style={styles.settingRight}>
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={setNotificationsEnabled}
                                    trackColor={{
                                        false: theme.colors.border,
                                        true: theme.colors.primary
                                    }}
                                    thumbColor={theme.colors.background}
                                />
                            </View>
                        </View>

                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Text style={styles.settingTitle}>Sons</Text>
                                <Text style={styles.settingDescription}>
                                    Reproduzir sons para notificações
                                </Text>
                            </View>
                            <View style={styles.settingRight}>
                                <Switch
                                    value={soundEnabled}
                                    onValueChange={setSoundEnabled}
                                    trackColor={{
                                        false: theme.colors.border,
                                        true: theme.colors.primary
                                    }}
                                    thumbColor={theme.colors.background}
                                />
                            </View>
                        </View>

                        <View style={[styles.settingItem, styles.settingItemLast]}>
                            <View style={styles.settingLeft}>
                                <Text style={styles.settingTitle}>Sincronização Automática</Text>
                                <Text style={styles.settingDescription}>
                                    Sincronizar dados automaticamente
                                </Text>
                            </View>
                            <View style={styles.settingRight}>
                                <Switch
                                    value={autoSync}
                                    onValueChange={setAutoSync}
                                    trackColor={{
                                        false: theme.colors.border,
                                        true: theme.colors.primary
                                    }}
                                    thumbColor={theme.colors.background}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Ações de Dados */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💾 Dados</Text>

                        <TouchableOpacity
                            style={[styles.settingItem, styles.settingItemLast]}
                            onPress={handleResetToDemo}
                        >
                            <View style={styles.settingLeft}>
                                <Text style={styles.settingTitle}>Restaurar Dados Demo</Text>
                                <Text style={styles.settingDescription}>
                                    Restaurar dados de demonstração
                                </Text>
                            </View>
                            <Text style={{ color: theme.colors.primary }}>🔄</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Ações Administrativas - Só para Diretores */}
                    <ShowIf role="director">
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🛡️ Administração</Text>

                            <TouchableOpacity
                                style={styles.settingItem}
                                onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
                            >
                                <View style={styles.settingLeft}>
                                    <Text style={styles.settingTitle}>Gerenciar Usuários</Text>
                                    <Text style={styles.settingDescription}>
                                        Adicionar e remover usuários
                                    </Text>
                                </View>
                                <Text style={{ color: theme.colors.primary }}>👥</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.settingItem}
                                onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
                            >
                                <View style={styles.settingLeft}>
                                    <Text style={styles.settingTitle}>Relatórios</Text>
                                    <Text style={styles.settingDescription}>
                                        Visualizar relatórios da escola
                                    </Text>
                                </View>
                                <Text style={{ color: theme.colors.primary }}>📊</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.settingItem, styles.settingItemLast]}
                                onPress={handleClearData}
                            >
                                <View style={styles.settingLeft}>
                                    <Text style={styles.settingTitle}>Limpar Dados</Text>
                                    <Text style={styles.settingDescription}>
                                        Remover todos os dados locais
                                    </Text>
                                </View>
                                <Text style={{ color: theme.colors.error }}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    </ShowIf>

                    {/* Botão de Logout */}
                    <TouchableOpacity
                        style={[styles.button, styles.buttonDanger]}
                        onPress={handleLogout}
                    >
                        <Text style={[styles.buttonText, styles.buttonTextDanger]}>
                            🚪 Sair da Conta
                        </Text>
                    </TouchableOpacity>

                    {/* Versão do App */}
                    <View style={styles.version}>
                        <Text style={styles.versionText}>EduApp v1.0.0</Text>
                        <Text style={styles.versionText}>
                            Desenvolvido com ❤️ para educação
                        </Text>
                    </View>

                    {/* Espaço extra */}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </Protected>
    );
}