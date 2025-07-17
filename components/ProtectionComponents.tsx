// components/ProtectionComponents.tsx - Componentes CORRIGIDOS

import { useRouter } from 'expo-router';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

// Hook de permissões simplificado (integrado aqui temporariamente)
const usePermissions = () => {
    const { user, isAuthenticated, isInitialized } = useAuthStore();

    const hasRole = (role: string) => {
        return user?.role === role;
    };

    const hasPermission = (permission: string) => {
        if (!user) return false;

        // Permissões baseadas em roles
        switch (user.role) {
            case 'student':
                return ['canViewTasks', 'canViewClasses', 'canUseChat'].includes(permission);
            case 'teacher':
                return ['canViewTasks', 'canViewClasses', 'canUseChat', 'canCreateTask', 'canCreateClass'].includes(permission);
            case 'director':
                return true; // Diretor tem todas as permissões
            default:
                return false;
        }
    };

    const isStudent = user?.role === 'student';
    const isTeacher = user?.role === 'teacher';
    const isDirector = user?.role === 'director';

    return {
        user,
        isAuthenticated,
        isInitialized,
        hasRole,
        hasPermission,
        isStudent,
        isTeacher,
        isDirector,
    };
};

// ==========================================
// COMPONENTE PRINCIPAL DE PROTEÇÃO
// ==========================================

interface ProtectedProps {
    children: ReactNode;
    requireAuth?: boolean;
    requireRole?: string;
    requirePermission?: string;
    fallback?: ReactNode;
    showError?: boolean;
}

export const Protected: React.FC<ProtectedProps> = ({
    children,
    requireAuth = true,
    requireRole,
    requirePermission,
    fallback,
    showError = false,
}) => {
    const {
        isAuthenticated,
        isInitialized,
        hasRole,
        hasPermission,
        user,
    } = usePermissions();

    // Aguardar inicialização
    if (!isInitialized) {
        return <LoadingScreen />;
    }

    // Verificar autenticação
    if (requireAuth && !isAuthenticated) {
        return showError ? <UnauthorizedScreen /> : (fallback || null);
    }

    // Verificar role
    if (requireRole && !hasRole(requireRole)) {
        return showError ? <UnauthorizedScreen /> : (fallback || null);
    }

    // Verificar permissão
    if (requirePermission && !hasPermission(requirePermission)) {
        return showError ? <UnauthorizedScreen /> : (fallback || null);
    }

    return <>{children}</>;
};

// ==========================================
// COMPONENTE DE CONDICIONAL SIMPLES
// ==========================================

interface ShowIfProps {
    children: ReactNode;
    condition?: boolean;
    role?: string;
    permission?: string;
    authenticated?: boolean;
}

export const ShowIf: React.FC<ShowIfProps> = ({
    children,
    condition = true,
    role,
    permission,
    authenticated,
}) => {
    const { isAuthenticated, hasRole, hasPermission } = usePermissions();

    // Verificar condição básica
    if (!condition) return null;

    // Verificar autenticação
    if (authenticated !== undefined && isAuthenticated !== authenticated) {
        return null;
    }

    // Verificar role
    if (role && !hasRole(role)) {
        return null;
    }

    // Verificar permissão
    if (permission && !hasPermission(permission)) {
        return null;
    }

    return <>{children}</>;
};

// ==========================================
// BOTÃO PROTEGIDO
// ==========================================

interface ProtectedButtonProps {
    title: string;
    onPress: () => void;
    requireRole?: string;
    requirePermission?: string;
    disabled?: boolean;
    style?: any;
    variant?: 'primary' | 'secondary' | 'danger';
}

export const ProtectedButton: React.FC<ProtectedButtonProps> = ({
    title,
    onPress,
    requireRole,
    requirePermission,
    disabled = false,
    style,
    variant = 'primary',
}) => {
    const { hasRole, hasPermission } = usePermissions();
    const { theme } = useThemeStore();

    // Verificar se tem acesso
    const hasAccess = (!requireRole || hasRole(requireRole)) &&
        (!requirePermission || hasPermission(requirePermission));

    // Se não tem acesso, não mostrar
    if (!hasAccess) {
        return null;
    }

    const styles = StyleSheet.create({
        button: {
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: getVariantColor(variant, theme),
            opacity: disabled ? 0.6 : 1,
            ...style,
        },
        text: {
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
        },
    });

    return (
        <TouchableOpacity
            style={styles.button}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
};

// ==========================================
// TELA DE LOADING
// ==========================================

const LoadingScreen: React.FC = () => {
    const { theme } = useThemeStore();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.background,
        },
        text: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            marginTop: 20,
        },
    });

    return (
        <View style={styles.container}>
            <Text style={{ fontSize: 48 }}>⏳</Text>
            <Text style={styles.text}>Carregando...</Text>
        </View>
    );
};

// ==========================================
// TELA DE NÃO AUTORIZADO
// ==========================================

const UnauthorizedScreen: React.FC = () => {
    const { theme } = useThemeStore();
    const router = useRouter();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.background,
            padding: 20,
        },
        icon: {
            fontSize: 64,
            marginBottom: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: 12,
            textAlign: 'center',
        },
        message: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginBottom: 30,
            lineHeight: 24,
        },
        button: {
            backgroundColor: theme.colors.primary,
            borderRadius: 8,
            paddingHorizontal: 20,
            paddingVertical: 12,
        },
        buttonText: {
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>🚫</Text>
            <Text style={styles.title}>Acesso Negado</Text>
            <Text style={styles.message}>
                Você não tem permissão para acessar esta funcionalidade
            </Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.back()}
            >
                <Text style={styles.buttonText}>Voltar</Text>
            </TouchableOpacity>
        </View>
    );
};

// ==========================================
// COMPONENTE PARA DIFERENTES ROLES
// ==========================================

interface RoleBasedProps {
    children?: ReactNode;
    studentContent?: ReactNode;
    teacherContent?: ReactNode;
    directorContent?: ReactNode;
}

export const RoleBased: React.FC<RoleBasedProps> = ({
    children,
    studentContent,
    teacherContent,
    directorContent,
}) => {
    const { isStudent, isTeacher, isDirector } = usePermissions();

    if (isStudent && studentContent) {
        return <>{studentContent}</>;
    }

    if (isTeacher && teacherContent) {
        return <>{teacherContent}</>;
    }

    if (isDirector && directorContent) {
        return <>{directorContent}</>;
    }

    return <>{children || null}</>;
};

// ==========================================
// HELPERS
// ==========================================

function getVariantColor(variant: 'primary' | 'secondary' | 'danger', theme: any) {
    switch (variant) {
        case 'primary':
            return theme.colors.primary;
        case 'secondary':
            return theme.colors.secondary;
        case 'danger':
            return theme.colors.error;
        default:
            return theme.colors.primary;
    }
}

// ==========================================
// EXPORTS ADICIONAIS
// ==========================================

// Hook para verificar múltiplas condições
export const useAccessControl = () => {
    const { isAuthenticated, hasRole, hasPermission } = usePermissions();

    const checkAccess = (requirements: {
        auth?: boolean;
        role?: string;
        permission?: string;
    }) => {
        if (requirements.auth && !isAuthenticated) return false;
        if (requirements.role && !hasRole(requirements.role)) return false;
        if (requirements.permission && !hasPermission(requirements.permission)) return false;
        return true;
    };

    return { checkAccess };
};

// Componente wrapper para páginas protegidas
export const ProtectedPage: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <Protected requireAuth showError>
            {children}
        </Protected>
    );
};