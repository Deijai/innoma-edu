import { create } from 'zustand';
import { Class, Course, Message, Task } from '../types';

interface AppStore {
    courses: Course[];
    tasks: Task[];
    classes: Class[];
    messages: Message[];
    addTask: (task: Omit<Task, 'id'>) => void;
    toggleTask: (taskId: string) => void;
    addClass: (classData: Omit<Class, 'id'>) => void;
    addMessage: (message: Omit<Message, 'id'>) => void;
    loadMockData: () => void;
}

// Mock data
const mockCourses: Course[] = [
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

const mockTasks: Task[] = [
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

const mockClasses: Class[] = [
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
        title: 'Geografia Mundial',
        course: 'Geografia',
        teacher: 'Prof. Roberto Lima',
        date: new Date('2024-12-19T14:00:00'),
        duration: 60,
        description: 'Estudo dos continentes e oceanos',
    },
];

const mockMessages: Message[] = [
    {
        id: '1',
        text: 'Olá! Como posso ajudá-lo hoje?',
        sender: 'Sistema',
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
        text: 'Claro! Vou te ajudar com os exercícios de cinemática. Qual é sua dúvida específica?',
        sender: 'Sistema',
        timestamp: new Date(),
        isUser: false,
    },
];

export const useAppStore = create<AppStore>((set, get) => ({
    courses: [],
    tasks: [],
    classes: [],
    messages: [],

    addTask: (task: Omit<Task, 'id'>) => {
        const newTask: Task = {
            ...task,
            id: Date.now().toString(),
        };

        set(state => ({
            tasks: [...state.tasks, newTask],
        }));
    },

    toggleTask: (taskId: string) => {
        set(state => ({
            tasks: state.tasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            ),
        }));
    },

    addClass: (classData: Omit<Class, 'id'>) => {
        const newClass: Class = {
            ...classData,
            id: Date.now().toString(),
        };

        set(state => ({
            classes: [...state.classes, newClass],
        }));
    },

    addMessage: (message: Omit<Message, 'id'>) => {
        const newMessage: Message = {
            ...message,
            id: Date.now().toString(),
        };

        set(state => ({
            messages: [...state.messages, newMessage],
        }));
    },

    loadMockData: () => {
        set({
            courses: mockCourses,
            tasks: mockTasks,
            classes: mockClasses,
            messages: mockMessages,
        });
    },
}));