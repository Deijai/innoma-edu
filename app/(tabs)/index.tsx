// app/(tabs)/index.tsx - Tela Home CORRIGIDA

import React from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RoleBased, ShowIf } from '../../components/ProtectionComponents';
import { useDashboardData, useNotifications, useProgressData, useUserData } from '../../hooks/useUserData';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export default function HomeScreen() {
    const { logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const { loadMockData } = useAppStore();
    const { userData, user } = useUserData();
    const dashboardData = useDashboardData();
    const progressData = useProgressData();
    const notifications = useNotifications();

    const [refreshing, setRefreshing] = React.useState(false);

    const handleLogout = () => {
        Alert.alert(
            'Sair',
            'Tem certeza que deseja sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', onPress: logout },
            ]
        );
    };

    const handleRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadMockData();
        setTimeout(() => setRefreshing(false), 1000);
    }, [loadMockData]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            paddingTop: 60,
            backgroundColor: theme.colors.surface,
        },
        welcomeContainer: {
            flex: 1,
        },
        welcomeText: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.colors.text,
        },
        userRole: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginTop: 4,
        },
        headerButtons: {
            flexDirection: 'row',
            gap: 10,
        },
        headerButton: {
            padding: 8,
            borderRadius: 8,
            backgroundColor: theme.colors.background,
        },
        headerButtonText: {
            color: theme.colors.text,
            fontSize: 16,
        },
        content: {
            flex: 1,
        },
        section: {
            marginBottom: 24,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: 16,
            paddingHorizontal: 20,
        },
        // Notifications
        notificationsContainer: {
            paddingHorizontal: 20,
        },
        notificationCard: {
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
            borderLeftWidth: 4,
        },
        notificationIcon: {
            fontSize: 24,
            marginRight: 12,
        },
        notificationContent: {
            flex: 1,
        },
        notificationTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
        },
        notificationMessage: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginTop: 4,
        },
        // Stats
        statsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 20,
            marginHorizontal: 20,
        },
        statItem: {
            alignItems: 'center',
        },
        statNumber: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.colors.primary,
        },
        statLabel: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginTop: 4,
            textAlign: 'center',
        },
        // Quick Actions
        quickActionsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            paddingHorizontal: 20,
        },
        quickActionCard: {
            flex: 1,
            minWidth: '45%',
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        quickActionIcon: {
            fontSize: 32,
            marginBottom: 8,
        },
        quickActionTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
            textAlign: 'center',
        },
        quickActionSubtitle: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginTop: 4,
        },
        // Recent Items
        recentItemsContainer: {
            paddingHorizontal: 20,
        },
        recentItem: {
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
        },
        recentItemIcon: {
            fontSize: 20,
            marginRight: 12,
        },
        recentItemContent: {
            flex: 1,
        },
        recentItemTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
        },
        recentItemSubtitle: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginTop: 4,
        },
        recentItemTime: {
            fontSize: 12,
            color: theme.colors.textSecondary,
        },
        // Progress
        progressContainer: {
            paddingHorizontal: 20,
        },
        progressCard: {
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
        },
        progressHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        progressTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
        },
        progressPercentage: {
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.colors.primary,
        },
        progressBar: {
            height: 6,
            backgroundColor: theme.colors.border,
            borderRadius: 3,
            overflow: 'hidden',
        },
        progressFill: {
            height: '100%',
            backgroundColor: theme.colors.primary,
        },
        progressDetails: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
        },
        progressDetail: {
            fontSize: 12,
            color: theme.colors.textSecondary,
        },
        // Empty States
        emptyState: {
            alignItems: 'center',
            padding: 40,
        },
        emptyStateIcon: {
            fontSize: 48,
            marginBottom: 12,
        },
        emptyStateText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            fontStyle: 'italic',
        },
    });

    if (!user || !userData) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateIcon}>⏳</Text>
                    <Text style={styles.emptyStateText}>Carregando dados do usuário...</Text>
                </View>
            </View>
        );
    }

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'student': return 'Estudante';
            case 'teacher': return 'Professor';
            case 'director': return 'Diretor';
            default: return role;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'error': return theme.colors.error;
            case 'warning': return theme.colors.warning;
            case 'info': return theme.colors.primary;
            default: return theme.colors.success;
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'error': return '🚨';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '✅';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.welcomeContainer}>
                    <Text style={styles.welcomeText}>
                        {dashboardData?.greeting || `Olá, ${user.name}!`}
                    </Text>
                    <Text style={styles.userRole}>
                        {getRoleDisplayName(user.role)}
                    </Text>
                </View>
                <View style={styles.headerButtons}>
                    <TouchableOpacity style={styles.headerButton} onPress={toggleTheme}>
                        <Text style={styles.headerButtonText}>
                            {theme.isDark ? '☀️' : '🌙'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
                        <Text style={styles.headerButtonText}>🚪</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                    />
                }
            >
                {/* Notificações */}
                {notifications.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🔔 Notificações</Text>
                        <View style={styles.notificationsContainer}>
                            {notifications.map((notification) => (
                                <View
                                    key={notification.id}
                                    style={[
                                        styles.notificationCard,
                                        { borderLeftColor: getNotificationColor(notification.type) }
                                    ]}
                                >
                                    <Text style={styles.notificationIcon}>
                                        {getNotificationIcon(notification.type)}
                                    </Text>
                                    <View style={styles.notificationContent}>
                                        <Text style={styles.notificationTitle}>
                                            {notification.title}
                                        </Text>
                                        <Text style={styles.notificationMessage}>
                                            {notification.message}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Estatísticas */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📊 Resumo</Text>
                    <View style={styles.statsContainer}>
                        <RoleBased
                            studentContent={
                                <>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>
                                            {userData.stats?.totalTasks || 0}
                                        </Text>
                                        <Text style={styles.statLabel}>Tarefas</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>
                                            {userData.stats?.completedTasks || 0}
                                        </Text>
                                        <Text style={styles.statLabel}>Concluídas</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>
                                            {userData.stats?.todayClasses || 0}
                                        </Text>
                                        <Text style={styles.statLabel}>Aulas Hoje</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>
                                            {userData.stats?.totalClasses || 0}
                                        </Text>
                                        <Text style={styles.statLabel}>Total Aulas</Text>
                                    </View>
                                </>
                            }
                            teacherContent={
                                <>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>
                                            {userData.stats?.totalTasks || 0}
                                        </Text>
                                        <Text style={styles.statLabel}>Tarefas</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>
                                            {userData.stats?.completedTasks || 0}
                                        </Text>
                                        <Text style={styles.statLabel}>Concluídas</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>
                                            {userData.stats?.totalClasses || 0}
                                        </Text>
                                        <Text style={styles.statLabel}>Aulas</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>
                                            {userData.stats?.todayClasses || 0}
                                        </Text>
                                        <Text style={styles.statLabel}>Hoje</Text>
                                    </View>
                                </>
                            }
                            directorContent={
                                <>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>
                                            {userData.stats?.totalTasks || 0}
                                        </Text>
                                        <Text style={styles.statLabel}>Tarefas</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>
                                            {userData.stats?.completedTasks || 0}
                                        </Text>
                                        <Text style={styles.statLabel}>Concluídas</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>
                                            {userData.stats?.totalClasses || 0}
                                        </Text>
                                        <Text style={styles.statLabel}>Aulas</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>
                                            {userData.stats?.pendingTasks || 0}
                                        </Text>
                                        <Text style={styles.statLabel}>Pendentes</Text>
                                    </View>
                                </>
                            }
                        />
                    </View>
                </View>

                {/* Progresso - Apenas para estudantes */}
                <ShowIf role="student">
                    {progressData && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>📈 Progresso</Text>
                            <View style={styles.progressContainer}>
                                <View style={styles.progressCard}>
                                    <View style={styles.progressHeader}>
                                        <Text style={styles.progressTitle}>Progresso Geral</Text>
                                        <Text style={styles.progressPercentage}>
                                            {progressData.overall.rate}%
                                        </Text>
                                    </View>
                                    <View style={styles.progressBar}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                { width: `${progressData.overall.rate}%` }
                                            ]}
                                        />
                                    </View>
                                    <View style={styles.progressDetails}>
                                        <Text style={styles.progressDetail}>
                                            {progressData.overall.completed} de {progressData.overall.total} tarefas
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                </ShowIf>

                {/* Ações Rápidas */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚡ Ações Rápidas</Text>
                    <View style={styles.quickActionsContainer}>
                        <TouchableOpacity style={styles.quickActionCard}>
                            <Text style={styles.quickActionIcon}>📋</Text>
                            <Text style={styles.quickActionTitle}>Tarefas</Text>
                            <Text style={styles.quickActionSubtitle}>
                                {userData.stats?.pendingTasks || 0} pendentes
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickActionCard}>
                            <Text style={styles.quickActionIcon}>🎓</Text>
                            <Text style={styles.quickActionTitle}>Aulas</Text>
                            <Text style={styles.quickActionSubtitle}>
                                {userData.stats?.totalClasses || 0} total
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickActionCard}>
                            <Text style={styles.quickActionIcon}>💬</Text>
                            <Text style={styles.quickActionTitle}>Chat</Text>
                            <Text style={styles.quickActionSubtitle}>Conversar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickActionCard}>
                            <Text style={styles.quickActionIcon}>🔄</Text>
                            <Text style={styles.quickActionTitle}>Atualizar</Text>
                            <Text style={styles.quickActionSubtitle}>Recarregar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Próximas Tarefas */}
                {dashboardData?.upcomingDeadlines && dashboardData.upcomingDeadlines.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>⏰ Próximas Entregas</Text>
                        <View style={styles.recentItemsContainer}>
                            {dashboardData.upcomingDeadlines.map((task) => (
                                <View key={task.id} style={styles.recentItem}>
                                    <Text style={styles.recentItemIcon}>📋</Text>
                                    <View style={styles.recentItemContent}>
                                        <Text style={styles.recentItemTitle}>{task.title}</Text>
                                        <Text style={styles.recentItemSubtitle}>
                                            {task.course} • {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                        </Text>
                                    </View>
                                    <Text style={styles.recentItemTime}>
                                        {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Espaço extra para scroll */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}