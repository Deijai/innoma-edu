import { useAuthStore } from '../store/authStore';

export const usePermissions = () => {
    const { user, hasRole, isStudent, isTeacher, isDirector, isInitialized } = useAuthStore();

    console.log('=== PERMISSIONS DEBUG ===');
    console.log('User:', user);
    console.log('Is initialized:', isInitialized);
    console.log('User role:', user?.role);

    // Tabs disponíveis baseado no role
    const getAvailableTabs = () => {
        // Se não inicializou ainda, mostrar tabs básicas
        if (!isInitialized) {
            console.log('Not initialized, showing basic tabs');
            return [
                { name: 'index', title: 'Início', icon: '🏠' },
            ];
        }

        // Se não tem usuário, mostrar tabs básicas
        if (!user) {
            console.log('No user, showing basic tabs');
            return [
                { name: 'index', title: 'Início', icon: '🏠' },
                { name: 'tasks', title: 'Tarefas', icon: '📋' },
                { name: 'classroom', title: 'Aulas', icon: '🎓' },
                { name: 'chat', title: 'Chat', icon: '💬' },
            ];
        }

        const baseTabs = [
            { name: 'index', title: 'Início', icon: '🏠' },
            { name: 'tasks', title: 'Tarefas', icon: '📋' },
            { name: 'classroom', title: 'Aulas', icon: '🎓' },
            { name: 'chat', title: 'Chat', icon: '💬' },
        ];

        console.log('User role:', user.role);

        // Verificar role diretamente do user object
        if (user.role === 'student') {
            console.log('Student tabs - ONLY BASE TABS');
            return baseTabs; // SÓ AS TABS BÁSICAS
        }

        if (user.role === 'teacher') {
            console.log('Teacher tabs');
            return [
                ...baseTabs,
                { name: 'add-task', title: 'Nova Tarefa', icon: '➕' },
                { name: 'add-class', title: 'Nova Aula', icon: '📚' },
            ];
        }

        if (user.role === 'director') {
            console.log('Director tabs');
            return [
                ...baseTabs,
                { name: 'add-task', title: 'Nova Tarefa', icon: '➕' },
                { name: 'add-class', title: 'Nova Aula', icon: '📚' },
                { name: 'settings', title: 'Configurações', icon: '⚙️' },
            ];
        }

        console.log('Default tabs (unknown role) - ONLY BASE TABS');
        return baseTabs; // SÓ AS TABS BÁSICAS PARA ROLES DESCONHECIDOS
    };

    // Permissões básicas para compatibilidade
    const permissions = {
        canCreateTask: user?.role === 'teacher' || user?.role === 'director',
        canCreateClass: user?.role === 'teacher' || user?.role === 'director',
        canManageUsers: user?.role === 'director',
        canAccessSettings: user?.role === 'director',
        isStudent: user?.role === 'student',
        isTeacher: user?.role === 'teacher',
        isDirector: user?.role === 'director',
    };

    return {
        permissions,
        getAvailableTabs,
        hasRole,
        user,
        userRole: user?.role,
        userPermissions: [], // Array vazio para compatibilidade
    };
};