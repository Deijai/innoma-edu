// hooks/usePermissions.ts - Sistema SIMPLIFICADO e OTIMIZADO

import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';

// Definir permissões de forma clara e simples
const ROLE_PERMISSIONS = {
    student: {
        canViewTasks: true,
        canViewClasses: true,
        canUseChat: true,
        canCreateTask: false,
        canCreateClass: false,
        canManageUsers: false,
        canAccessSettings: false,
        tabs: ['index', 'tasks', 'classroom', 'chat', 'settings']
    },
    teacher: {
        canViewTasks: true,
        canViewClasses: true,
        canUseChat: true,
        canCreateTask: true,
        canCreateClass: true,
        canManageUsers: false,
        canAccessSettings: false,
        tabs: ['index', 'tasks', 'classroom', 'chat', 'add-task', 'add-class']
    },
    director: {
        canViewTasks: true,
        canViewClasses: true,
        canUseChat: true,
        canCreateTask: true,
        canCreateClass: true,
        canManageUsers: true,
        canAccessSettings: true,
        tabs: ['index', 'tasks', 'classroom', 'chat', 'add-task', 'add-class', 'settings']
    }
} as const;

// Informações das tabs
const TAB_INFO = {
    index: { title: 'Início', icon: '🏠' },
    tasks: { title: 'Tarefas', icon: '📋' },
    classroom: { title: 'Aulas', icon: '🎓' },
    chat: { title: 'Chat', icon: '💬' },
    'add-task': { title: 'Nova Tarefa', icon: '➕' },
    'add-class': { title: 'Nova Aula', icon: '📚' },
    settings: { title: 'Configurações', icon: '⚙️' }
} as const;

export const usePermissions = () => {
    const { user, isAuthenticated, isInitialized } = useAuthStore();

    // Memoizar permissões para evitar re-renders
    const permissions = useMemo(() => {
        // Se não inicializou ou não tem usuário, retornar permissões básicas
        if (!isInitialized || !user) {
            return {
                canViewTasks: true,
                canViewClasses: true,
                canUseChat: true,
                canCreateTask: false,
                canCreateClass: false,
                canManageUsers: false,
                canAccessSettings: false,
                tabs: ['index', 'tasks', 'classroom', 'chat']
            };
        }

        // Retornar permissões baseadas no role
        return ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.student;
    }, [user, isInitialized]);

    // Tabs disponíveis com informações completas
    const availableTabs = useMemo(() => {
        return permissions.tabs.map(tabName => ({
            name: tabName,
            ...TAB_INFO[tabName as keyof typeof TAB_INFO]
        }));
    }, [permissions.tabs]);

    // Função para verificar permissão específica
    const hasPermission = (permission: keyof typeof permissions) => {
        return permissions[permission] === true;
    };

    // Função para verificar se pode acessar uma tab
    const canAccessTab = (tabName: string) => {
        return permissions.tabs.includes(tabName as any);
    };

    // Função para verificar role
    const hasRole = (role: string) => {
        return user?.role === role;
    };

    // Helpers para roles específicos
    const isStudent = user?.role === 'student';
    const isTeacher = user?.role === 'teacher';
    const isDirector = user?.role === 'director';

    return {
        // Dados do usuário
        user,
        isAuthenticated,
        isInitialized,
        userRole: user?.role,

        // Permissões
        permissions,
        hasPermission,
        canAccessTab,
        hasRole,

        // Helpers de role
        isStudent,
        isTeacher,
        isDirector,

        // Tabs
        availableTabs,

        // Função para debug
        debug: () => {
            console.log('=== PERMISSIONS DEBUG ===');
            console.log('User:', user);
            console.log('Role:', user?.role);
            console.log('Permissions:', permissions);
            console.log('Available tabs:', availableTabs);
        }
    };
};

// Hook específico para verificar se deve mostrar um elemento
export const useConditionalRender = () => {
    const { hasPermission, canAccessTab, hasRole } = usePermissions();

    const showIf = (condition: boolean) => condition;
    const showIfRole = (role: string) => hasRole(role);
    const showIfPermission = (permission: keyof ReturnType<typeof usePermissions>['permissions']) => hasPermission(permission);
    const showIfTab = (tabName: string) => canAccessTab(tabName);

    return {
        showIf,
        showIfRole,
        showIfPermission,
        showIfTab
    };
};

// Tipo para as permissões (útil para TypeScript)
export type UserPermissions = ReturnType<typeof usePermissions>['permissions'];
export type UserRole = 'student' | 'teacher' | 'director';
export type TabName = keyof typeof TAB_INFO;