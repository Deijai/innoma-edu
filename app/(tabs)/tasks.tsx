import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { useThemeStore } from '../../store/themeStore';

export default function TasksScreen() {
    const { theme } = useThemeStore();
    const { tasks, toggleTask } = useAppStore();

    const handleToggleTask = (taskId: string) => {
        toggleTask(taskId);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return theme.colors.error;
            case 'medium':
                return theme.colors.warning;
            case 'low':
                return theme.colors.success;
            default:
                return theme.colors.primary;
        }
    };

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'Alta';
            case 'medium':
                return 'Média';
            case 'low':
                return 'Baixa';
            default:
                return 'Normal';
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const isOverdue = (date: Date) => {
        return new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString();
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            padding: 20,
            paddingTop: 60,
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
            padding: 20,
        },
        filterContainer: {
            flexDirection: 'row',
            marginBottom: 20,
            gap: 12,
        },
        filterButton: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        filterButtonActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        filterButtonText: {
            color: theme.colors.text,
            fontSize: 14,
        },
        filterButtonTextActive: {
            color: 'white',
        },
        taskCard: {
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderLeftWidth: 4,
        },
        taskCardCompleted: {
            opacity: 0.7,
        },
        taskHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8,
        },
        taskTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            flex: 1,
        },
        taskTitleCompleted: {
            textDecorationLine: 'line-through',
            color: theme.colors.textSecondary,
        },
        checkbox: {
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 12,
        },
        checkboxChecked: {
            backgroundColor: theme.colors.primary,
        },
        checkboxText: {
            color: 'white',
            fontSize: 14,
            fontWeight: 'bold',
        },
        taskMeta: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
        },
        taskCourse: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        taskDate: {
            fontSize: 12,
            color: theme.colors.textSecondary,
        },
        taskDateOverdue: {
            color: theme.colors.error,
            fontWeight: '600',
        },
        priorityBadge: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            alignSelf: 'flex-start',
        },
        priorityText: {
            fontSize: 10,
            fontWeight: '600',
            color: 'white',
        },
        taskDescription: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginTop: 8,
            lineHeight: 20,
        },
        emptyState: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 40,
        },
        emptyStateIcon: {
            fontSize: 64,
            marginBottom: 16,
        },
        emptyStateTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: 8,
            textAlign: 'center',
        },
        emptyStateText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            lineHeight: 20,
        },
        statsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
        },
        statItem: {
            alignItems: 'center',
        },
        statNumber: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.colors.primary,
        },
        statLabel: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginTop: 4,
        },
    });

    const completedTasks = tasks.filter(task => task.completed);
    const pendingTasks = tasks.filter(task => !task.completed);
    const overdueTasks = tasks.filter(task => !task.completed && isOverdue(task.dueDate));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Tarefas</Text>
                <Text style={styles.subtitle}>Gerencie suas atividades</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{tasks.length}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{pendingTasks.length}</Text>
                        <Text style={styles.statLabel}>Pendentes</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{overdueTasks.length}</Text>
                        <Text style={styles.statLabel}>Atrasadas</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{completedTasks.length}</Text>
                        <Text style={styles.statLabel}>Concluídas</Text>
                    </View>
                </View>

                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <TouchableOpacity
                            key={task.id}
                            style={[
                                styles.taskCard,
                                { borderLeftColor: getPriorityColor(task.priority) },
                                task.completed && styles.taskCardCompleted,
                            ]}
                            onPress={() => handleToggleTask(task.id)}
                        >
                            <View style={styles.taskHeader}>
                                <Text style={[
                                    styles.taskTitle,
                                    task.completed && styles.taskTitleCompleted,
                                ]}>
                                    {task.title}
                                </Text>
                                <TouchableOpacity
                                    style={[
                                        styles.checkbox,
                                        task.completed && styles.checkboxChecked,
                                    ]}
                                    onPress={() => handleToggleTask(task.id)}
                                >
                                    {task.completed && <Text style={styles.checkboxText}>✓</Text>}
                                </TouchableOpacity>
                            </View>

                            <View style={[
                                styles.priorityBadge,
                                { backgroundColor: getPriorityColor(task.priority) },
                            ]}>
                                <Text style={styles.priorityText}>
                                    {getPriorityText(task.priority)}
                                </Text>
                            </View>

                            {task.description && (
                                <Text style={styles.taskDescription}>{task.description}</Text>
                            )}

                            <View style={styles.taskMeta}>
                                <Text style={styles.taskCourse}>{task.course}</Text>
                                <Text style={[
                                    styles.taskDate,
                                    !task.completed && isOverdue(task.dueDate) && styles.taskDateOverdue,
                                ]}>
                                    {formatDate(task.dueDate)}
                                    {!task.completed && isOverdue(task.dueDate) && ' (Atrasada)'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateIcon}>📋</Text>
                        <Text style={styles.emptyStateTitle}>Nenhuma tarefa encontrada</Text>
                        <Text style={styles.emptyStateText}>
                            Você ainda não tem tarefas cadastradas. Use a aba "Adicionar" para criar uma nova tarefa.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}