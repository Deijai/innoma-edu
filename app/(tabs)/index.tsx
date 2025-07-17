import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export default function HomeScreen() {
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const { courses, tasks } = useAppStore();

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

    const todayTasks = tasks.filter(task => {
        const today = new Date();
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === today.toDateString();
    });

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
            backgroundColor: theme.colors.surface,
        },
        headerButtonText: {
            color: theme.colors.text,
            fontSize: 16,
        },
        content: {
            flex: 1,
            padding: 20,
        },
        section: {
            marginBottom: 24,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: 16,
        },
        taskCard: {
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
        },
        taskTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 4,
        },
        taskCourse: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginBottom: 8,
        },
        taskTime: {
            fontSize: 12,
            color: theme.colors.textSecondary,
        },
        coursesGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
        },
        courseCard: {
            flex: 1,
            minWidth: '45%',
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        courseIcon: {
            fontSize: 32,
            marginBottom: 8,
        },
        courseTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
            textAlign: 'center',
        },
        courseTeacher: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginTop: 4,
        },
        progressBar: {
            height: 4,
            backgroundColor: theme.colors.border,
            borderRadius: 2,
            marginTop: 8,
            overflow: 'hidden',
        },
        progressFill: {
            height: '100%',
            backgroundColor: theme.colors.primary,
        },
        emptyState: {
            textAlign: 'center',
            color: theme.colors.textSecondary,
            fontStyle: 'italic',
            padding: 20,
        },
        statsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
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
        },
    });

    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Olá, {user?.name}!</Text>
                    <Text style={styles.userRole}>
                        {user?.role === 'teacher' ? 'Professor' : 'Estudante'}
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

            <ScrollView style={styles.content}>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{courses.length}</Text>
                        <Text style={styles.statLabel}>Cursos</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{totalTasks}</Text>
                        <Text style={styles.statLabel}>Tarefas</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{completionRate}%</Text>
                        <Text style={styles.statLabel}>Concluídas</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tarefas de Hoje</Text>
                    {todayTasks.length > 0 ? (
                        todayTasks.map((task) => (
                            <View key={task.id} style={styles.taskCard}>
                                <Text style={styles.taskTitle}>{task.title}</Text>
                                <Text style={styles.taskCourse}>{task.course}</Text>
                                <Text style={styles.taskTime}>
                                    Vence hoje às {new Date(task.dueDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyState}>Nenhuma tarefa para hoje</Text>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Seus Cursos</Text>
                    <View style={styles.coursesGrid}>
                        {courses.map((course) => (
                            <TouchableOpacity key={course.id} style={styles.courseCard}>
                                <Text style={styles.courseIcon}>{course.icon}</Text>
                                <Text style={styles.courseTitle}>{course.title}</Text>
                                <Text style={styles.courseTeacher}>{course.teacher}</Text>
                                {course.progress !== undefined && (
                                    <View style={styles.progressBar}>
                                        <View
                                            style={[styles.progressFill, { width: `${course.progress}%` }]}
                                        />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}