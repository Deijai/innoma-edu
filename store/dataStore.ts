// store/dataStore.ts - Sistema de dados OTIMIZADO

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Class, Course, Message, Task, User } from '../types';

// ==========================================
// DADOS MOCK ORGANIZADOS
// ==========================================

export const MOCK_COURSES: Course[] = [
    {
        id: '1',
        title: 'Matemática',
        subject: 'Matemática',
        color: '#FF6B6B',
        icon: '📐',
        progress: 75,
        teacher: 'Prof. Ana Silva',
        students: 28,
        description: 'Álgebra e Geometria avançada',
    },
    {
        id: '2',
        title: 'Química',
        subject: 'Química',
        color: '#4ECDC4',
        icon: '🧪',
        progress: 60,
        teacher: 'Prof. Carlos Santos',
        students: 25,
        description: 'Química Orgânica e Inorgânica',
    },
    {
        id: '3',
        title: 'Física',
        subject: 'Física',
        color: '#45B7D1',
        icon: '⚡',
        progress: 45,
        teacher: 'Prof. Marina Costa',
        students: 30,
        description: 'Mecânica e Termodinâmica',
    },
    {
        id: '4',
        title: 'Biologia',
        subject: 'Biologia',
        color: '#96CEB4',
        icon: '🧬',
        progress: 80,
        teacher: 'Prof. João Oliveira',
        students: 26,
        description: 'Biologia Celular e Molecular',
    },
];

export const MOCK_USERS: User[] = [
    {
        id: 'student1',
        name: 'João Silva',
        email: 'joao@student.com',
        role: 'student',
        schoolId: 'school1',
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
    },
    {
        id: 'teacher1',
        name: 'Maria Santos',
        email: 'maria@teacher.com',
        role: 'teacher',
        schoolId: 'school1',
        isActive: true,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
    },
    {
        id: 'director1',
        name: 'Carlos Silva',
        email: 'carlos@director.com',
        role: 'director',
        schoolId: 'school1',
        isActive: true,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
    },
];

// ==========================================
// STORE PRINCIPAL
// ==========================================

interface DataStore {
    // Estado
    courses: Course[];
    tasks: Task[];
    classes: Class[];
    messages: Message[];
    users: User[];

    // Flags
    isLoading: boolean;
    hasLoaded: boolean;

    // Ações para tarefas
    addTask: (task: Omit<Task, 'id'>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    toggleTask: (id: string) => void;

    // Ações para aulas
    addClass: (classData: Omit<Class, 'id'>) => void;
    updateClass: (id: string, updates: Partial<Class>) => void;
    deleteClass: (id: string) => void;

    // Ações para mensagens
    addMessage: (message: Omit<Message, 'id'>) => void;
    markMessageAsRead: (id: string) => void;

    // Ações para cursos
    updateCourse: (id: string, updates: Partial<Course>) => void;

    // Ações para usuários
    updateUser: (id: string, updates: Partial<User>) => void;

    // Utilitários
    loadMockData: () => void;
    clearData: () => void;
    reset: () => void;
}

export const useDataStore = create<DataStore>()(
    persist(
        (set, get) => ({
            // Estado inicial
            courses: [],
            tasks: [],
            classes: [],
            messages: [],
            users: [],
            isLoading: false,
            hasLoaded: false,

            // ==========================================
            // AÇÕES PARA TAREFAS
            // ==========================================
            addTask: (taskData) => {
                const newTask: Task = {
                    ...taskData,
                    id: `task_${Date.now()}`,
                };

                set((state) => ({
                    tasks: [...state.tasks, newTask],
                }));
            },

            updateTask: (id, updates) => {
                set((state) => ({
                    tasks: state.tasks.map(task =>
                        task.id === id ? { ...task, ...updates } : task
                    ),
                }));
            },

            deleteTask: (id) => {
                set((state) => ({
                    tasks: state.tasks.filter(task => task.id !== id),
                }));
            },

            toggleTask: (id) => {
                set((state) => ({
                    tasks: state.tasks.map(task =>
                        task.id === id ? { ...task, completed: !task.completed } : task
                    ),
                }));
            },

            // ==========================================
            // AÇÕES PARA AULAS
            // ==========================================
            addClass: (classData) => {
                const newClass: Class = {
                    ...classData,
                    id: `class_${Date.now()}`,
                };

                set((state) => ({
                    classes: [...state.classes, newClass],
                }));
            },

            updateClass: (id, updates) => {
                set((state) => ({
                    classes: state.classes.map(cls =>
                        cls.id === id ? { ...cls, ...updates } : cls
                    ),
                }));
            },

            deleteClass: (id) => {
                set((state) => ({
                    classes: state.classes.filter(cls => cls.id !== id),
                }));
            },

            // ==========================================
            // AÇÕES PARA MENSAGENS
            // ==========================================
            addMessage: (messageData) => {
                const newMessage: Message = {
                    ...messageData,
                    id: `msg_${Date.now()}`,
                };

                set((state) => ({
                    messages: [...state.messages, newMessage],
                }));
            },

            markMessageAsRead: (id) => {
                set((state) => ({
                    messages: state.messages.map(msg =>
                        msg.id === id ? { ...msg, isRead: true } : msg
                    ),
                }));
            },

            // ==========================================
            // AÇÕES PARA CURSOS
            // ==========================================
            updateCourse: (id, updates) => {
                set((state) => ({
                    courses: state.courses.map(course =>
                        course.id === id ? { ...course, ...updates } : course
                    ),
                }));
            },

            // ==========================================
            // AÇÕES PARA USUÁRIOS
            // ==========================================
            updateUser: (id, updates) => {
                set((state) => ({
                    users: state.users.map(user =>
                        user.id === id ? { ...user, ...updates } : user
                    ),
                }));
            },

            // ==========================================
            // UTILITÁRIOS
            // ==========================================
            loadMockData: () => {
                set({
                    courses: MOCK_COURSES,
                    users: MOCK_USERS,
                    tasks: generateMockTasks(),
                    classes: generateMockClasses(),
                    messages: generateMockMessages(),
                    hasLoaded: true,
                });
            },

            clearData: () => {
                set({
                    courses: [],
                    tasks: [],
                    classes: [],
                    messages: [],
                    users: [],
                    hasLoaded: false,
                });
            },

            reset: () => {
                get().clearData();
                get().loadMockData();
            },
        }),
        {
            name: 'edu-app-data',
            // Só persistir dados essenciais
            partialize: (state) => ({
                courses: state.courses,
                tasks: state.tasks,
                classes: state.classes,
                hasLoaded: state.hasLoaded,
            }),
        }
    )
);

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function generateMockTasks(): Task[] {
    return [
        {
            id: '1',
            title: 'Lista de Exercícios - Física',
            course: 'Física',
            dueDate: new Date('2024-12-20'),
            completed: false,
            priority: 'high',
            category: 'Exercícios',
            description: 'Resolver problemas de cinemática',
        },
        {
            id: '2',
            title: 'Relatório de Química',
            course: 'Química',
            dueDate: new Date('2024-12-22'),
            completed: false,
            priority: 'medium',
            category: 'Relatório',
            description: 'Experimento sobre reações químicas',
        },
        {
            id: '3',
            title: 'Prova de Matemática',
            course: 'Matemática',
            dueDate: new Date('2024-12-25'),
            completed: true,
            priority: 'high',
            category: 'Prova',
            description: 'Equações do segundo grau',
        },
    ];
}

function generateMockClasses(): Class[] {
    return [
        {
            id: '1',
            title: 'Introdução à Física',
            course: 'Física',
            teacher: 'Prof. Marina Costa',
            date: new Date('2024-12-19T09:30:00'),
            duration: 90,
            description: 'Conceitos básicos de mecânica clássica',
            resources: ['slides.pdf', 'exercicios.pdf'],
        },
        {
            id: '2',
            title: 'Química Orgânica',
            course: 'Química',
            teacher: 'Prof. Carlos Santos',
            date: new Date('2024-12-19T14:00:00'),
            duration: 60,
            description: 'Compostos orgânicos e suas propriedades',
        },
    ];
}

function generateMockMessages(): Message[] {
    return [
        {
            id: '1',
            text: 'Olá! Como posso ajudá-lo hoje?',
            sender: 'EduBot',
            timestamp: new Date(),
            isUser: false,
        },
        {
            id: '2',
            text: 'Preciso de ajuda com as tarefas de física',
            sender: 'João Silva',
            timestamp: new Date(),
            isUser: true,
        },
        {
            id: '3',
            text: 'Claro! Vou te ajudar com os exercícios. Qual é sua dúvida específica?',
            sender: 'EduBot',
            timestamp: new Date(),
            isUser: false,
        },
    ];
}

// ==========================================
// HOOKS SELETORES OTIMIZADOS
// ==========================================

export const useTasksData = () => {
    const { tasks, addTask, updateTask, deleteTask, toggleTask } = useDataStore();

    // Memoização computada
    const completedTasks = tasks.filter(task => task.completed);
    const pendingTasks = tasks.filter(task => !task.completed);
    const overdueTasks = tasks.filter(task =>
        !task.completed && new Date(task.dueDate) < new Date()
    );

    return {
        tasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        stats: {
            total: tasks.length,
            completed: completedTasks.length,
            pending: pendingTasks.length,
            overdue: overdueTasks.length,
        },
    };
};

export const useClassesData = () => {
    const { classes, addClass, updateClass, deleteClass } = useDataStore();

    const todayClasses = classes.filter(cls => {
        const today = new Date();
        return new Date(cls.date).toDateString() === today.toDateString();
    });

    const upcomingClasses = classes.filter(cls => {
        const now = new Date();
        return new Date(cls.date) > now;
    });

    return {
        classes,
        todayClasses,
        upcomingClasses,
        addClass,
        updateClass,
        deleteClass,
        stats: {
            total: classes.length,
            today: todayClasses.length,
            upcoming: upcomingClasses.length,
        },
    };
};

export const useMessagesData = () => {
    const { messages, addMessage, markMessageAsRead } = useDataStore();

    const unreadMessages = messages.filter(msg => !msg.sender);

    return {
        messages,
        unreadMessages,
        addMessage,
        markMessageAsRead,
        stats: {
            total: messages.length,
            unread: unreadMessages.length,
        },
    };
};