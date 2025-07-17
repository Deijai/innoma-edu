export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'teacher' | 'director';
    schoolId: string;
    avatar?: string;
    isActive: boolean;  // ✅ ADICIONADO
    createdAt: Date;    // ✅ ADICIONADO
    updatedAt: Date;    // ✅ ADICIONADO
    lastLogin?: Date;   // ✅ ADICIONADO
    fcmToken?: string;  // ✅ ADICIONADO
}

export interface Course {
    id: string;
    title: string;
    subject: string;
    color: string;
    icon: string;
    progress?: number;
    teacher: string;
    students: number;
    description?: string;
}

export interface Task {
    id: string;
    title: string;
    course: string;
    dueDate: Date;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    description?: string;
    category: string;
}

export interface Class {
    id: string;
    title: string;
    course: string;
    teacher: string;
    date: Date;
    duration: number;
    description?: string;
    resources?: string[];
}

export interface Theme {
    isDark: boolean;
    colors: {
        primary: string;
        secondary: string;
        background: string;
        surface: string;
        text: string;
        textSecondary: string;
        border: string;
        error: string;
        success: string;
        warning: string;
    };
}

export interface Message {
    id: string;
    text: string;
    sender: string;
    timestamp: Date;
    isAudio?: boolean;
    audioUri?: string;
    isUser: boolean;
    isRead?: boolean;
}