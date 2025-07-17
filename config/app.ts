// config/app.ts - Configuração PRINCIPAL do aplicativo

export const APP_CONFIG = {
    // Informações do app
    name: 'EduApp',
    version: '1.0.0',
    description: 'Aplicativo educacional completo',

    // Configurações de autenticação
    auth: {
        enableAutoLogin: true,
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
        enableBiometric: false,
        requireEmailVerification: false,
    },

    // Configurações de dados
    data: {
        enableOfflineMode: true,
        syncInterval: 5 * 60 * 1000, // 5 minutos
        maxCacheSize: 50 * 1024 * 1024, // 50MB
        enableMockData: true,
    },

    // Configurações de UI
    ui: {
        enableDarkMode: true,
        defaultTheme: 'light',
        enableAnimations: true,
        tabBarHeight: 65,
    },

    // Configurações de permissões
    permissions: {
        enableRoleBasedAccess: true,
        enablePermissionCaching: true,
        defaultRole: 'student',
    },

    // Configurações de notificações
    notifications: {
        enablePushNotifications: false,
        enableInAppNotifications: true,
        enableEmailNotifications: false,
    },

    // Configurações de debug
    debug: {
        enableConsoleLogging: __DEV__,
        enablePerformanceMonitoring: __DEV__,
        enableErrorReporting: !__DEV__,
    },

    // Configurações de rede
    network: {
        enableRetry: true,
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 10000,
    },

    // Configurações de Firebase
    firebase: {
        enableFirestore: true,
        enableRealtimeDatabase: false,
        enableStorage: true,
        enableAnalytics: !__DEV__,
    },

    // Configurações de features
    features: {
        enableChat: true,
        enableAudioMessages: true,
        enableFileUpload: true,
        enableVideoCall: false,
        enableGradebook: true,
        enableCalendar: true,
        enableReports: true,
    },

    // Limites do sistema
    limits: {
        maxTasksPerUser: 1000,
        maxClassesPerUser: 100,
        maxMessagesPerChat: 10000,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxAudioDuration: 5 * 60 * 1000, // 5 minutos
    },

    // URLs e endpoints
    urls: {
        privacy: 'https://eduapp.com/privacy',
        terms: 'https://eduapp.com/terms',
        support: 'https://eduapp.com/support',
        feedback: 'https://eduapp.com/feedback',
    },

    // Configurações de desenvolvimento
    development: {
        enableMockUsers: true,
        enableTestData: true,
        enableDevMenu: __DEV__,
        enableHotReload: __DEV__,
    },
};

// Tipos para configuração
export type AppConfig = typeof APP_CONFIG;

// Configurações específicas por ambiente
export const ENVIRONMENT_CONFIG = {
    development: {
        apiUrl: 'http://localhost:3000',
        enableLogging: true,
        enableMockData: true,
    },
    production: {
        apiUrl: 'https://api.eduapp.com',
        enableLogging: false,
        enableMockData: false,
    },
    test: {
        apiUrl: 'http://localhost:3001',
        enableLogging: true,
        enableMockData: true,
    },
};

// Função para obter configuração do ambiente
export const getEnvironmentConfig = () => {
    const env = __DEV__ ? 'development' : 'production';
    return ENVIRONMENT_CONFIG[env];
};

// Configuração unificada
export const CONFIG = {
    ...APP_CONFIG,
    environment: getEnvironmentConfig(),
};

// Constantes úteis
export const CONSTANTS = {
    // Roles
    ROLES: {
        STUDENT: 'student',
        TEACHER: 'teacher',
        DIRECTOR: 'director',
    } as const,

    // Prioridades de tarefas
    TASK_PRIORITIES: {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
    } as const,

    // Categorias de tarefas
    TASK_CATEGORIES: [
        'Exercícios',
        'Prova',
        'Trabalho',
        'Projeto',
        'Leitura',
        'Pesquisa',
        'Relatório',
        'Apresentação',
    ] as const,

    // Status de tarefas
    TASK_STATUS: {
        PENDING: 'pending',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        OVERDUE: 'overdue',
    } as const,

    // Tipos de notificação
    NOTIFICATION_TYPES: {
        INFO: 'info',
        WARNING: 'warning',
        ERROR: 'error',
        SUCCESS: 'success',
    } as const,

    // Durações padrão de aulas
    CLASS_DURATIONS: [
        { value: 30, label: '30 min' },
        { value: 45, label: '45 min' },
        { value: 60, label: '1 hora' },
        { value: 90, label: '1h 30min' },
        { value: 120, label: '2 horas' },
    ] as const,

    // Dias da semana
    DAYS_OF_WEEK: [
        'Segunda-feira',
        'Terça-feira',
        'Quarta-feira',
        'Quinta-feira',
        'Sexta-feira',
        'Sábado',
        'Domingo',
    ] as const,

    // Formatos de data
    DATE_FORMATS: {
        SHORT: 'DD/MM/YYYY',
        LONG: 'DD/MM/YYYY HH:mm',
        TIME: 'HH:mm',
        DISPLAY: 'DD/MM/YYYY [às] HH:mm',
    } as const,

    // Códigos de erro
    ERROR_CODES: {
        NETWORK_ERROR: 'NETWORK_ERROR',
        AUTH_ERROR: 'AUTH_ERROR',
        PERMISSION_ERROR: 'PERMISSION_ERROR',
        VALIDATION_ERROR: 'VALIDATION_ERROR',
        SERVER_ERROR: 'SERVER_ERROR',
        UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    } as const,

    // Limites de campos
    FIELD_LIMITS: {
        NAME: { min: 2, max: 50 },
        EMAIL: { min: 5, max: 100 },
        PASSWORD: { min: 6, max: 50 },
        TITLE: { min: 3, max: 100 },
        DESCRIPTION: { min: 10, max: 500 },
        MESSAGE: { min: 1, max: 1000 },
    } as const,

    // Configurações de paginação
    PAGINATION: {
        DEFAULT_SIZE: 20,
        MAX_SIZE: 100,
        MIN_SIZE: 5,
    } as const,

    // Configurações de cache
    CACHE: {
        USER_DATA: 'userData',
        THEME: 'theme',
        PERMISSIONS: 'permissions',
        APP_STATE: 'appState',
    } as const,

    // Configurações de animação
    ANIMATIONS: {
        FAST: 200,
        NORMAL: 300,
        SLOW: 500,
    } as const,
};

// Funções utilitárias
export const utils = {
    // Verificar se é role válido
    isValidRole: (role: string): role is keyof typeof CONSTANTS.ROLES => {
        return Object.values(CONSTANTS.ROLES).includes(role as any);
    },

    // Verificar se é prioridade válida
    isValidPriority: (priority: string): priority is keyof typeof CONSTANTS.TASK_PRIORITIES => {
        return Object.values(CONSTANTS.TASK_PRIORITIES).includes(priority as any);
    },

    // Obter cor por prioridade
    getPriorityColor: (priority: string) => {
        switch (priority) {
            case CONSTANTS.TASK_PRIORITIES.HIGH:
                return '#EF4444';
            case CONSTANTS.TASK_PRIORITIES.MEDIUM:
                return '#F59E0B';
            case CONSTANTS.TASK_PRIORITIES.LOW:
                return '#10B981';
            default:
                return '#6B7280';
        }
    },

    // Formatar data
    formatDate: (date: Date | string, format: string = CONSTANTS.DATE_FORMATS.SHORT) => {
        const d = new Date(date);

        switch (format) {
            case CONSTANTS.DATE_FORMATS.SHORT:
                return d.toLocaleDateString('pt-BR');
            case CONSTANTS.DATE_FORMATS.LONG:
                return d.toLocaleString('pt-BR');
            case CONSTANTS.DATE_FORMATS.TIME:
                return d.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            default:
                return d.toLocaleDateString('pt-BR');
        }
    },

    // Obter saudação baseada no horário
    getGreeting: (name: string) => {
        const hour = new Date().getHours();

        if (hour < 12) {
            return `Bom dia, ${name}!`;
        } else if (hour < 18) {
            return `Boa tarde, ${name}!`;
        } else {
            return `Boa noite, ${name}!`;
        }
    },

    // Verificar se data é hoje
    isToday: (date: Date | string) => {
        const today = new Date();
        const compareDate = new Date(date);

        return today.toDateString() === compareDate.toDateString();
    },

    // Verificar se data é amanhã
    isTomorrow: (date: Date | string) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const compareDate = new Date(date);

        return tomorrow.toDateString() === compareDate.toDateString();
    },

    // Verificar se data está vencida
    isOverdue: (date: Date | string) => {
        const now = new Date();
        const compareDate = new Date(date);

        return compareDate < now;
    },

    // Calcular dias até uma data
    daysUntil: (date: Date | string) => {
        const now = new Date();
        const compareDate = new Date(date);
        const diffTime = compareDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    },

    // Gerar ID único
    generateId: (prefix: string = '') => {
        return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Validar email
    isValidEmail: (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validar senha
    isValidPassword: (password: string) => {
        return password.length >= CONSTANTS.FIELD_LIMITS.PASSWORD.min;
    },

    // Capitalizar primeira letra
    capitalize: (text: string) => {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },

    // Truncar texto
    truncate: (text: string, length: number = 50) => {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },

    // Determinar se é ambiente de desenvolvimento
    isDevelopment: () => __DEV__,

    // Determinar se é ambiente de produção
    isProduction: () => !__DEV__,
};

// Export default
export default CONFIG;