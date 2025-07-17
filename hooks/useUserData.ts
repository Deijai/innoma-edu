// hooks/useUserData.ts - Hooks CORRIGIDOS sem dependências complexas

import { useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

// ==========================================
// HOOK PRINCIPAL DO USUÁRIO
// ==========================================

export const useUserData = () => {
    const { user, isAuthenticated, isInitialized } = useAuthStore();
    const { courses, tasks, classes } = useAppStore();

    // Dados específicos do usuário baseados no role
    const userData = useMemo(() => {
        if (!user || !isAuthenticated) {
            return null;
        }

        const baseData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isActive: user.isActive,
        };

        // Calcular estatísticas básicas
        const completedTasks = tasks.filter(task => task.completed);
        const pendingTasks = tasks.filter(task => !task.completed);
        const overdueTasks = tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            const now = new Date();
            return !task.completed && taskDate < now;
        });

        const todayClasses = classes.filter(cls => {
            const today = new Date();
            const classDate = new Date(cls.date);
            return classDate.toDateString() === today.toDateString();
        });

        const upcomingClasses = classes.filter(cls => {
            const now = new Date();
            const classDate = new Date(cls.date);
            return classDate > now;
        });

        // Dados específicos por role
        const stats = {
            totalTasks: tasks.length,
            completedTasks: completedTasks.length,
            pendingTasks: pendingTasks.length,
            overdueTasks: overdueTasks.length,
            totalClasses: classes.length,
            todayClasses: todayClasses.length,
            upcomingClasses: upcomingClasses.length,
        };

        switch (user.role) {
            case 'student':
                return {
                    ...baseData,
                    enrolledCourses: courses,
                    myTasks: tasks,
                    myClasses: classes,
                    todaySchedule: todayClasses,
                    stats,
                };

            case 'teacher':
                return {
                    ...baseData,
                    teachingCourses: courses.filter(course => course.teacher === user.name),
                    myTasks: tasks,
                    myClasses: classes,
                    todaySchedule: todayClasses,
                    stats: {
                        ...stats,
                        coursesTeaching: courses.filter(course => course.teacher === user.name).length,
                        totalStudents: courses.reduce((sum, course) =>
                            course.teacher === user.name ? sum + course.students : sum, 0),
                        tasksCreated: tasks.length,
                        classesScheduled: classes.length,
                    },
                };

            case 'director':
                return {
                    ...baseData,
                    allCourses: courses,
                    allTasks: tasks,
                    allClasses: classes,
                    todaySchedule: todayClasses,
                    stats: {
                        ...stats,
                        totalCourses: courses.length,
                        totalStudents: courses.reduce((sum, course) => sum + course.students, 0),
                        totalTeachers: new Set(courses.map(course => course.teacher)).size,
                        completionRate: tasks.length > 0 ?
                            Math.round((completedTasks.length / tasks.length) * 100) : 0,
                    },
                };

            default:
                return { ...baseData, stats };
        }
    }, [user, isAuthenticated, courses, tasks, classes]);

    return {
        user,
        userData,
        isAuthenticated,
        isInitialized,
        isStudent: user?.role === 'student',
        isTeacher: user?.role === 'teacher',
        isDirector: user?.role === 'director',
    };
};

// ==========================================
// HOOK PARA DASHBOARD
// ==========================================

export const useDashboardData = () => {
    const { userData, user } = useUserData();
    const { tasks, classes } = useAppStore();

    // Dados do dashboard baseados no role
    const dashboardData = useMemo(() => {
        if (!userData || !user) return null;

        const today = new Date();

        const todayTasks = tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate.toDateString() === today.toDateString();
        });

        const thisWeekTasks = tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            const weekFromNow = new Date();
            weekFromNow.setDate(today.getDate() + 7);
            return taskDate >= today && taskDate <= weekFromNow;
        });

        const todayClasses = classes.filter(cls => {
            const classDate = new Date(cls.date);
            return classDate.toDateString() === today.toDateString();
        });

        const upcomingDeadlines = tasks
            .filter(task => !task.completed && new Date(task.dueDate) > today)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 3);

        const recentActivity = generateRecentActivity(user.role, tasks, classes);

        return {
            greeting: getGreeting(user.name),
            todayTasks,
            thisWeekTasks,
            todayClasses,
            quickStats: userData.stats,
            recentActivity,
            upcomingDeadlines,
        };
    }, [userData, user, tasks, classes]);

    return dashboardData;
};

// ==========================================
// HOOK PARA PROGRESSO
// ==========================================

export const useProgressData = () => {
    const { user } = useUserData();
    const { tasks, courses } = useAppStore();

    const progressData = useMemo(() => {
        if (!user) return null;

        const completedTasks = tasks.filter(task => task.completed);
        const totalTasks = tasks.length;
        const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

        // Progresso por curso
        const courseProgress = courses.map(course => {
            const courseTasks = tasks.filter(task => task.course === course.title);
            const courseCompleted = courseTasks.filter(task => task.completed).length;
            const courseTotal = courseTasks.length;
            const courseRate = courseTotal > 0 ? (courseCompleted / courseTotal) * 100 : 0;

            return {
                course: course.title,
                icon: course.icon,
                color: course.color,
                completed: courseCompleted,
                total: courseTotal,
                rate: courseRate,
            };
        });

        return {
            overall: {
                completed: completedTasks.length,
                total: totalTasks,
                rate: Math.round(completionRate),
            },
            byPriority: {
                high: tasks.filter(t => t.priority === 'high'),
                medium: tasks.filter(t => t.priority === 'medium'),
                low: tasks.filter(t => t.priority === 'low'),
            },
            courseProgress,
        };
    }, [user, tasks, courses]);

    return progressData;
};

// ==========================================
// HOOK PARA NOTIFICAÇÕES
// ==========================================

export const useNotifications = () => {
    const { user } = useUserData();
    const { tasks, classes } = useAppStore();

    const notifications = useMemo(() => {
        if (!user) return [];

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const notifications = [];

        // Tarefas vencendo hoje
        const todayTasks = tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return !task.completed && taskDate.toDateString() === today.toDateString();
        });

        if (todayTasks.length > 0) {
            notifications.push({
                id: 'today-tasks',
                type: 'warning',
                title: 'Tarefas para hoje',
                message: `Você tem ${todayTasks.length} tarefa(s) com vencimento hoje`,
                data: todayTasks,
            });
        }

        // Tarefas vencendo amanhã
        const tomorrowTasks = tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return !task.completed && taskDate.toDateString() === tomorrow.toDateString();
        });

        if (tomorrowTasks.length > 0) {
            notifications.push({
                id: 'tomorrow-tasks',
                type: 'info',
                title: 'Tarefas para amanhã',
                message: `Você tem ${tomorrowTasks.length} tarefa(s) com vencimento amanhã`,
                data: tomorrowTasks,
            });
        }

        // Aulas de hoje
        const todayClasses = classes.filter(cls => {
            const classDate = new Date(cls.date);
            return classDate.toDateString() === today.toDateString();
        });

        if (todayClasses.length > 0) {
            notifications.push({
                id: 'today-classes',
                type: 'info',
                title: 'Aulas de hoje',
                message: `Você tem ${todayClasses.length} aula(s) hoje`,
                data: todayClasses,
            });
        }

        // Tarefas atrasadas
        const overdueTasks = tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return !task.completed && taskDate < today;
        });

        if (overdueTasks.length > 0) {
            notifications.push({
                id: 'overdue-tasks',
                type: 'error',
                title: 'Tarefas atrasadas',
                message: `Você tem ${overdueTasks.length} tarefa(s) atrasada(s)`,
                data: overdueTasks,
            });
        }

        return notifications;
    }, [user, tasks, classes]);

    return notifications;
};

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function getGreeting(name: string): string {
    const hour = new Date().getHours();

    if (hour < 12) {
        return `Bom dia, ${name}!`;
    } else if (hour < 18) {
        return `Boa tarde, ${name}!`;
    } else {
        return `Boa noite, ${name}!`;
    }
}

function generateRecentActivity(role: string, tasks: any[], classes: any[]) {
    const activities = [];

    // Adicionar atividades baseadas no role
    if (role === 'student') {
        // Tarefas concluídas recentemente
        const recentCompleted = tasks
            .filter(task => task.completed)
            .slice(-3)
            .map(task => ({
                type: 'task_completed',
                title: `Tarefa concluída: ${task.title}`,
                time: 'há 2 horas',
                icon: '✅',
            }));

        activities.push(...recentCompleted);
    } else if (role === 'teacher') {
        // Aulas criadas recentemente
        const recentClasses = classes
            .slice(-2)
            .map(cls => ({
                type: 'class_created',
                title: `Aula criada: ${cls.title}`,
                time: 'há 1 dia',
                icon: '📚',
            }));

        activities.push(...recentClasses);
    }

    return activities.slice(0, 5); // Últimas 5 atividades
}