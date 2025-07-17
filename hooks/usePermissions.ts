import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { Permission } from '../types/firebase';

export const usePermissions = () => {
    const { user, userRole, userPermissions, hasPermission, hasRole, hasAnyPermission } = useAuthStore();

    // Permissions específicas para UI
    const permissions = useMemo(() => {
        if (!user || !userRole) {
            return {
                // Navegação
                canAccessUserManagement: false,
                canAccessReports: false,
                canAccessSettings: false,

                // Gestão de usuários
                canCreateUsers: false,
                canEditUsers: false,
                canDeleteUsers: false,
                canViewAllUsers: false,
                canAssignRoles: false,

                // Gestão de turmas
                canCreateClass: false,
                canEditClass: false,
                canDeleteClass: false,
                canManageStudents: false,
                canViewAllClasses: false,

                // Gestão de tarefas
                canCreateTask: false,
                canEditTask: false,
                canDeleteTask: false,
                canGradeSubmissions: false,
                canViewAllTasks: false,

                // Visualização de dados
                canViewStudentProgress: false,
                canViewClassAnalytics: false,
                canViewSchoolReports: false,
                canExportData: false,

                // Comunicação
                canSendAnnouncements: false,
                canModerateChat: false,
                canViewAllMessages: false,

                // Auditoria
                canViewAuditLogs: false,
                canConfigureSchool: false,

                // Helpers
                isStudent: false,
                isTeacher: false,
                isDirector: false,
            };
        }

        return {
            // Navegação
            canAccessUserManagement: hasRole('director'),
            canAccessReports: hasAnyPermission([Permission.VIEW_SCHOOL_REPORTS, Permission.VIEW_CLASS_ANALYTICS]),
            canAccessSettings: hasRole('director'),

            // Gestão de usuários
            canCreateUsers: hasPermission(Permission.MANAGE_USERS),
            canEditUsers: hasPermission(Permission.MANAGE_USERS),
            canDeleteUsers: hasPermission(Permission.MANAGE_USERS),
            canViewAllUsers: hasPermission(Permission.VIEW_ALL_USERS),
            canAssignRoles: hasRole('director'),

            // Gestão de turmas
            canCreateClass: hasPermission(Permission.CREATE_CLASS),
            canEditClass: hasPermission(Permission.EDIT_CLASS),
            canDeleteClass: hasPermission(Permission.DELETE_CLASS),
            canManageStudents: hasPermission(Permission.MANAGE_STUDENTS),
            canViewAllClasses: hasRole('director'),

            // Gestão de tarefas
            canCreateTask: hasPermission(Permission.CREATE_TASK),
            canEditTask: hasPermission(Permission.EDIT_TASK),
            canDeleteTask: hasPermission(Permission.DELETE_TASK),
            canGradeSubmissions: hasPermission(Permission.GRADE_SUBMISSIONS),
            canViewAllTasks: hasRole('director'),

            // Visualização de dados
            canViewStudentProgress: hasPermission(Permission.VIEW_STUDENT_PROGRESS),
            canViewClassAnalytics: hasPermission(Permission.VIEW_CLASS_ANALYTICS),
            canViewSchoolReports: hasPermission(Permission.VIEW_SCHOOL_REPORTS),
            canExportData: hasPermission(Permission.EXPORT_DATA),

            // Comunicação
            canSendAnnouncements: hasPermission(Permission.SEND_SCHOOL_ANNOUNCEMENTS),
            canModerateChat: hasPermission(Permission.MODERATE_CHAT),
            canViewAllMessages: hasRole('director'),

            // Auditoria
            canViewAuditLogs: hasPermission(Permission.VIEW_AUDIT_LOGS),
            canConfigureSchool: hasPermission(Permission.CONFIGURE_SCHOOL),

            // Helpers
            isStudent: hasRole('student'),
            isTeacher: hasRole('teacher'),
            isDirector: hasRole('director'),
        };
    }, [user, userRole, userPermissions, hasPermission, hasRole, hasAnyPermission]);

    // Função para verificar se pode acessar recurso específico
    const canAccessResource = (resource: string, action: string, context?: any) => {
        if (!user) return false;

        // Diretores têm acesso total
        if (hasRole('director')) return true;

        // Verificações específicas baseadas no contexto
        switch (resource) {
            case 'class':
                if (action === 'view') {
                    return context?.teacherId === user.id ||
                        context?.studentIds?.includes(user.id) ||
                        hasRole('director');
                }
                if (action === 'edit') {
                    return context?.teacherId === user.id || hasRole('director');
                }
                if (action === 'delete') {
                    return hasRole('director');
                }
                break;

            case 'task':
                if (action === 'view') {
                    return context?.createdBy === user.id ||
                        context?.studentIds?.includes(user.id) ||
                        hasRole('director');
                }
                if (action === 'edit') {
                    return context?.createdBy === user.id || hasRole('director');
                }
                if (action === 'grade') {
                    return context?.createdBy === user.id || hasRole('director');
                }
                break;

            case 'user':
                if (action === 'view') {
                    return context?.id === user.id || hasRole('director') ||
                        (hasRole('teacher') && context?.role === 'student');
                }
                if (action === 'edit') {
                    return context?.id === user.id || hasRole('director');
                }
                break;
        }

        return false;
    };

    // Função para verificar se pode executar ação em contexto específico
    const canPerformAction = (action: string, context?: any) => {
        if (!user) return false;

        switch (action) {
            case 'create_class':
                return hasPermission(Permission.CREATE_CLASS);

            case 'edit_class':
                return hasPermission(Permission.EDIT_CLASS) &&
                    canAccessResource('class', 'edit', context);

            case 'delete_class':
                return hasPermission(Permission.DELETE_CLASS) &&
                    canAccessResource('class', 'delete', context);

            case 'create_task':
                return hasPermission(Permission.CREATE_TASK) &&
                    canAccessResource('class', 'edit', context);

            case 'grade_task':
                return hasPermission(Permission.GRADE_SUBMISSIONS) &&
                    canAccessResource('task', 'grade', context);

            case 'manage_user':
                return hasPermission(Permission.MANAGE_USERS);

            case 'view_reports':
                return hasAnyPermission([Permission.VIEW_SCHOOL_REPORTS, Permission.VIEW_CLASS_ANALYTICS]);

            default:
                return false;
        }
    };

    // Função para obter tabs disponíveis baseado no role
    const getAvailableTabs = () => {
        const baseTabs = [
            { name: 'home', title: 'Início', icon: '🏠' },
            { name: 'tasks', title: 'Tarefas', icon: '📋' },
            { name: 'chat', title: 'Chat', icon: '💬' },
        ];

        if (hasRole('student')) {
            return [
                ...baseTabs,
                { name: 'materials', title: 'Materiais', icon: '📚' },
                { name: 'grades', title: 'Notas', icon: '📊' },
            ];
        }

        if (hasRole('teacher')) {
            return [
                ...baseTabs,
                { name: 'materials', title: 'Materiais', icon: '📚' },
                { name: 'create-task', title: 'Criar Tarefa', icon: '➕' },
                { name: 'classes', title: 'Turmas', icon: '🎓' },
                { name: 'reports', title: 'Relatórios', icon: '📊' },
            ];
        }

        if (hasRole('director')) {
            return [
                ...baseTabs,
                { name: 'materials', title: 'Materiais', icon: '📚' },
                { name: 'create-task', title: 'Criar Tarefa', icon: '➕' },
                { name: 'classes', title: 'Turmas', icon: '🎓' },
                { name: 'users', title: 'Usuários', icon: '👥' },
                { name: 'reports', title: 'Relatórios', icon: '📊' },
                { name: 'settings', title: 'Configurações', icon: '⚙️' },
            ];
        }

        return baseTabs;
    };

    // Função para obter ações disponíveis em um contexto
    const getAvailableActions = (resource: string, context?: any) => {
        const actions = [];

        if (canAccessResource(resource, 'view', context)) {
            actions.push('view');
        }

        if (canAccessResource(resource, 'edit', context)) {
            actions.push('edit');
        }

        if (canAccessResource(resource, 'delete', context)) {
            actions.push('delete');
        }

        // Ações específicas por recurso
        if (resource === 'task' && canAccessResource(resource, 'grade', context)) {
            actions.push('grade');
        }

        return actions;
    };

    // Função para verificar se deve mostrar elemento na UI
    const shouldShowElement = (elementType: string, context?: any) => {
        switch (elementType) {
            case 'create_class_button':
                return permissions.canCreateClass;

            case 'manage_users_tab':
                return permissions.canAccessUserManagement;

            case 'reports_section':
                return permissions.canAccessReports;

            case 'settings_tab':
                return permissions.canAccessSettings;

            case 'grade_input':
                return permissions.canGradeSubmissions &&
                    canAccessResource('task', 'grade', context);

            case 'delete_button':
                return permissions.isDirector;

            case 'audit_logs':
                return permissions.canViewAuditLogs;

            default:
                return true;
        }
    };

    return {
        // Permissions object
        permissions,

        // Utility functions
        canAccessResource,
        canPerformAction,
        getAvailableTabs,
        getAvailableActions,
        shouldShowElement,

        // Direct access to auth store functions
        hasPermission,
        hasRole,
        hasAnyPermission,

        // User info
        user,
        userRole,
        userPermissions,
    };
};