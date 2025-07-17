import { Timestamp } from 'firebase/firestore';

// Tipos base do Firebase
export interface FirebaseUser {
    id: string;
    email: string;
    name: string;
    role: 'student' | 'teacher' | 'director';
    schoolId: string;
    avatar?: string;
    isActive: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastLogin?: Timestamp;
    fcmToken?: string;
}

export interface FirebaseSchool {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    directorId: string;
    isActive: boolean;
    settings: {
        allowStudentChat: boolean;
        maxFileSize: number;
        gradeSystem: 'numeric' | 'letter' | 'concept';
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface FirebaseClass {
    id: string;
    name: string;
    subject: string;
    description?: string;
    teacherId: string;
    teacherName: string;
    studentIds: string[];
    schoolId: string;
    schedule: {
        dayOfWeek: number; // 0-6 (Sunday to Saturday)
        startTime: string; // HH:MM format
        endTime: string;
    }[];
    isActive: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface FirebaseTask {
    id: string;
    title: string;
    description: string;
    instructions?: string;
    classId: string;
    className: string;
    createdBy: string;
    createdByName: string;
    schoolId: string;
    dueDate: Timestamp;
    maxScore: number;
    attachments: string[];
    rubric?: {
        criteria: string;
        maxPoints: number;
        levels: {
            name: string;
            description: string;
            points: number;
        }[];
    }[];
    isActive: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface FirebaseSubmission {
    id: string;
    taskId: string;
    taskTitle: string;
    studentId: string;
    studentName: string;
    classId: string;
    submissionText?: string;
    attachments: string[];
    submittedAt: Timestamp;
    grade?: number;
    feedback?: string;
    gradedAt?: Timestamp;
    gradedBy?: string;
    gradedByName?: string;
    status: 'pending' | 'graded' | 'late' | 'returned';
    isActive: boolean;
}

export interface FirebaseMessage {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    senderRole: 'student' | 'teacher' | 'director';
    targetType: 'class' | 'direct' | 'school';
    targetId: string; // classId, userId, or schoolId
    timestamp: Timestamp;
    isAudio?: boolean;
    audioUri?: string;
    isRead: boolean;
    readBy: string[]; // userIds who read the message
}

export interface FirebaseAuditLog {
    id: string;
    userId: string;
    userName: string;
    userRole: string;
    action: string;
    resource: string;
    resourceId: string;
    details: Record<string, any>;
    schoolId: string;
    timestamp: Timestamp;
    ipAddress?: string;
    userAgent?: string;
}

export interface FirebaseNotification {
    id: string;
    title: string;
    body: string;
    type: 'task_assigned' | 'grade_released' | 'class_updated' | 'message_received' | 'system_alert';
    targetUserId: string;
    targetUserRole: string;
    schoolId: string;
    relatedResourceId?: string;
    relatedResourceType?: string;
    isRead: boolean;
    createdAt: Timestamp;
    readAt?: Timestamp;
}

// Tipos para Custom Claims
export interface FirebaseCustomClaims {
    role: 'student' | 'teacher' | 'director';
    schoolId: string;
    permissions: string[];
    isActive: boolean;
}

// Tipos para Security Rules
export interface SecurityRuleContext {
    userId: string;
    userRole: string;
    schoolId: string;
    permissions: string[];
}

// Enums para Permissões
export enum Permission {
    // Gestão de usuários
    MANAGE_USERS = 'manage_users',
    VIEW_ALL_USERS = 'view_all_users',

    // Gestão de turmas
    CREATE_CLASS = 'create_class',
    EDIT_CLASS = 'edit_class',
    DELETE_CLASS = 'delete_class',
    MANAGE_STUDENTS = 'manage_students',

    // Gestão de tarefas
    CREATE_TASK = 'create_task',
    EDIT_TASK = 'edit_task',
    DELETE_TASK = 'delete_task',
    GRADE_SUBMISSIONS = 'grade_submissions',

    // Visualização de dados
    VIEW_STUDENT_PROGRESS = 'view_student_progress',
    VIEW_SCHOOL_REPORTS = 'view_school_reports',
    VIEW_CLASS_ANALYTICS = 'view_class_analytics',

    // Comunicação
    SEND_SCHOOL_ANNOUNCEMENTS = 'send_school_announcements',
    MODERATE_CHAT = 'moderate_chat',

    // Configurações
    CONFIGURE_SCHOOL = 'configure_school',
    MANAGE_SCHOOL_SETTINGS = 'manage_school_settings',

    // Auditoria
    VIEW_AUDIT_LOGS = 'view_audit_logs',
    EXPORT_DATA = 'export_data',
}

// Mapeamento de Roles para Permissões
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
    student: [
        // Permissões básicas para estudantes
    ],
    teacher: [
        Permission.CREATE_CLASS,
        Permission.EDIT_CLASS,
        Permission.CREATE_TASK,
        Permission.EDIT_TASK,
        Permission.GRADE_SUBMISSIONS,
        Permission.VIEW_STUDENT_PROGRESS,
        Permission.VIEW_CLASS_ANALYTICS,
        Permission.MANAGE_STUDENTS,
    ],
    director: [
        // Todas as permissões
        ...Object.values(Permission),
    ],
};

// Tipos para Cloud Functions
export interface CloudFunctionRequest {
    userId: string;
    userRole: string;
    schoolId: string;
    data: Record<string, any>;
}

export interface CloudFunctionResponse {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
}