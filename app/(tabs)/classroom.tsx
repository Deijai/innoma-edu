import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export default function ClassroomScreen() {
    const { theme } = useThemeStore();
    const { classes, courses } = useAppStore();
    const { user } = useAuthStore();

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return new Date(date).toDateString() === today.toDateString();
    };

    const isUpcoming = (date: Date) => {
        const now = new Date();
        const classDate = new Date(date);
        return classDate > now;
    };

    const getClassStatus = (date: Date) => {
        const now = new Date();
        const classDate = new Date(date);

        if (classDate < now) {
            return 'Concluída';
        } else if (isToday(date)) {
            return 'Hoje';
        } else {
            return 'Agendada';
        }
    };

    const getStatusColor = (date: Date) => {
        const status = getClassStatus(date);
        switch (status) {
            case 'Concluída':
                return theme.colors.textSecondary;
            case 'Hoje':
                return theme.colors.primary;
            case 'Agendada':
                return theme.colors.success;
            default:
                return theme.colors.textSecondary;
        }
    };

    const getCourseIcon = (courseName: string) => {
        const course = courses.find(c => c.title === courseName);
        return course?.icon || '📚';
    };

    const getCourseColor = (courseName: string) => {
        const course = courses.find(c => c.title === courseName);
        return course?.color || theme.colors.primary;
    };

    const handleClassPress = (classItem: any) => {
        const status = getClassStatus(classItem.date);
        const statusText = status === 'Concluída' ? 'Esta aula já foi realizada' :
            status === 'Hoje' ? 'Esta aula está agendada para hoje' :
                'Esta aula está agendada';

        Alert.alert(
            classItem.title,
            `${statusText}\n\nData: ${formatDate(classItem.date)}\nHorário: ${formatTime(classItem.date)}\nProfessor: ${classItem.teacher}\n\nDescrição: ${classItem.description || 'Sem descrição'}`,
            [
                { text: 'OK', style: 'default' },
            ]
        );
    };

    const todayClasses = classes.filter(cls => isToday(cls.date));
    const upcomingClasses = classes.filter(cls => isUpcoming(cls.date) && !isToday(cls.date));
    const pastClasses = classes.filter(cls => !isUpcoming(cls.date) && !isToday(cls.date));

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
        section: {
            marginBottom: 24,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: 16,
        },
        classCard: {
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderLeftWidth: 4,
        },
        classHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8,
        },
        classInfo: {
            flex: 1,
        },
        classTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 4,
        },
        classTeacher: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginBottom: 4,
        },
        classTime: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        classIcon: {
            fontSize: 24,
            marginLeft: 12,
        },
        statusBadge: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            alignSelf: 'flex-start',
            marginTop: 8,
        },
        statusText: {
            fontSize: 10,
            fontWeight: '600',
            color: 'white',
        },
        classDescription: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginTop: 8,
            lineHeight: 20,
        },
        emptyState: {
            alignItems: 'center',
            padding: 20,
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
        coursesList: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 20,
        },
        courseChip: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            gap: 6,
        },
        courseChipText: {
            fontSize: 12,
            color: theme.colors.text,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Sala de Aula</Text>
                <Text style={styles.subtitle}>Acompanhe suas aulas</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{classes.length}</Text>
                        <Text style={styles.statLabel}>Total de Aulas</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{todayClasses.length}</Text>
                        <Text style={styles.statLabel}>Hoje</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{upcomingClasses.length}</Text>
                        <Text style={styles.statLabel}>Próximas</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{pastClasses.length}</Text>
                        <Text style={styles.statLabel}>Realizadas</Text>
                    </View>
                </View>

                <View style={styles.coursesList}>
                    {courses.map((course) => (
                        <View key={course.id} style={styles.courseChip}>
                            <Text>{course.icon}</Text>
                            <Text style={styles.courseChipText}>{course.title}</Text>
                        </View>
                    ))}
                </View>

                {todayClasses.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Aulas de Hoje</Text>
                        {todayClasses.map((classItem) => (
                            <TouchableOpacity
                                key={classItem.id}
                                style={[
                                    styles.classCard,
                                    { borderLeftColor: getCourseColor(classItem.course) },
                                ]}
                                onPress={() => handleClassPress(classItem)}
                            >
                                <View style={styles.classHeader}>
                                    <View style={styles.classInfo}>
                                        <Text style={styles.classTitle}>{classItem.title}</Text>
                                        <Text style={styles.classTeacher}>{classItem.teacher}</Text>
                                        <Text style={styles.classTime}>
                                            {formatTime(classItem.date)} • {classItem.duration} min
                                        </Text>
                                    </View>
                                    <Text style={styles.classIcon}>
                                        {getCourseIcon(classItem.course)}
                                    </Text>
                                </View>

                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: getStatusColor(classItem.date) },
                                ]}>
                                    <Text style={styles.statusText}>
                                        {getClassStatus(classItem.date)}
                                    </Text>
                                </View>

                                {classItem.description && (
                                    <Text style={styles.classDescription}>
                                        {classItem.description}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {upcomingClasses.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Próximas Aulas</Text>
                        {upcomingClasses.map((classItem) => (
                            <TouchableOpacity
                                key={classItem.id}
                                style={[
                                    styles.classCard,
                                    { borderLeftColor: getCourseColor(classItem.course) },
                                ]}
                                onPress={() => handleClassPress(classItem)}
                            >
                                <View style={styles.classHeader}>
                                    <View style={styles.classInfo}>
                                        <Text style={styles.classTitle}>{classItem.title}</Text>
                                        <Text style={styles.classTeacher}>{classItem.teacher}</Text>
                                        <Text style={styles.classTime}>
                                            {formatDate(classItem.date)} • {formatTime(classItem.date)}
                                        </Text>
                                    </View>
                                    <Text style={styles.classIcon}>
                                        {getCourseIcon(classItem.course)}
                                    </Text>
                                </View>

                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: getStatusColor(classItem.date) },
                                ]}>
                                    <Text style={styles.statusText}>
                                        {getClassStatus(classItem.date)}
                                    </Text>
                                </View>

                                {classItem.description && (
                                    <Text style={styles.classDescription}>
                                        {classItem.description}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {pastClasses.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Aulas Anteriores</Text>
                        {pastClasses.map((classItem) => (
                            <TouchableOpacity
                                key={classItem.id}
                                style={[
                                    styles.classCard,
                                    { borderLeftColor: getCourseColor(classItem.course), opacity: 0.7 },
                                ]}
                                onPress={() => handleClassPress(classItem)}
                            >
                                <View style={styles.classHeader}>
                                    <View style={styles.classInfo}>
                                        <Text style={styles.classTitle}>{classItem.title}</Text>
                                        <Text style={styles.classTeacher}>{classItem.teacher}</Text>
                                        <Text style={styles.classTime}>
                                            {formatDate(classItem.date)} • {formatTime(classItem.date)}
                                        </Text>
                                    </View>
                                    <Text style={styles.classIcon}>
                                        {getCourseIcon(classItem.course)}
                                    </Text>
                                </View>

                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: getStatusColor(classItem.date) },
                                ]}>
                                    <Text style={styles.statusText}>
                                        {getClassStatus(classItem.date)}
                                    </Text>
                                </View>

                                {classItem.description && (
                                    <Text style={styles.classDescription}>
                                        {classItem.description}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {classes.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateIcon}>🎓</Text>
                        <Text style={styles.emptyStateText}>
                            Nenhuma aula encontrada{'\n'}
                            Use a aba "Adicionar Aula" para criar uma nova aula
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}