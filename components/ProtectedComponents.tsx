import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePermissions } from '../hooks/usePermissions';
import { useThemeStore } from '../store/themeStore';
import { Permission } from '../types/firebase';

// Componente para proteger rotas inteiras
interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
    requiredPermission?: Permission;
    requiredPermissions?: Permission[];
    fallback?: React.ReactNode;
    redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole,
    requiredPermission,
    requiredPermissions,
    fallback,
    redirectTo
}) => {
    const { hasRole, hasPermission, hasAnyPermission, user } = usePermissions();
    const { theme } = useThemeStore();
    const router = useRouter();

    // Verificar se está autenticado
    if (!user) {
        if (redirectTo) {
            router.replace(redirectTo as any);
            return null;
        }

        return fallback || <UnauthorizedScreen message="Faça login para acessar esta página" />;
    }

    // Verificar role específico
    if (requiredRole && !hasRole(requiredRole)) {
        return fallback || <UnauthorizedScreen message="Você não tem permissão para acessar esta página" />;
    }

    // Verificar permissão específica
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return fallback || <UnauthorizedScreen message="Você não tem permissão para acessar esta funcionalidade" />;
    }

    // Verificar múltiplas permissões (precisa de pelo menos uma)
    if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
        return fallback || <UnauthorizedScreen message="Você não tem permissão para acessar esta funcionalidade" />;
    }

    return <>{children}</>;
};

// Componente para proteger elementos específicos
interface ProtectedElementProps {
    children: React.ReactNode;
    requiredRole?: string;
    requiredPermission?: Permission;
    requiredPermissions?: Permission[];
    fallback?: React.ReactNode;
    showFallback?: boolean;
}

export const ProtectedElement: React.FC<ProtectedElementProps> = ({
    children,
    requiredRole,
    requiredPermission,
    requiredPermissions,
    fallback,
    showFallback = false
}) => {
    const { hasRole, hasPermission, hasAnyPermission, user } = usePermissions();

    if (!user) {
        return showFallback ? (fallback || null) : null;
    }

    if (requiredRole && !hasRole(requiredRole)) {
        return showFallback ? (fallback || null) : null;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        return showFallback ? (fallback || null) : null;
    }

    if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
        return showFallback ? (fallback || null) : null;
    }

    return <>{children}</>;
};

// Botão protegido que só aparece se o usuário tiver permissão
interface ProtectedButtonProps {
    title: string;
    onPress: () => void;
    requiredRole?: string;
    requiredPermission?: Permission;
    requiredPermissions?: Permission[];
    disabled?: boolean;
    style?: any;
    textStyle?: any;
    disabledStyle?: any;
    showTooltip?: boolean;
    tooltipMessage?: string;
}

export const ProtectedButton: React.FC<ProtectedButtonProps> = ({
    title,
    onPress,
    requiredRole,
    requiredPermission,
    requiredPermissions,
    disabled = false,
    style,
    textStyle,
    disabledStyle,
    showTooltip = false,
    tooltipMessage
}) => {
    const { hasRole, hasPermission, hasAnyPermission, user } = usePermissions();
    const { theme } = useThemeStore();

    const hasAccess = user && (
        (!requiredRole || hasRole(requiredRole)) &&
        (!requiredPermission || hasPermission(requiredPermission)) &&
        (!requiredPermissions || hasAnyPermission(requiredPermissions))
    );

    const handlePress = () => {
        if (!hasAccess) {
            if (showTooltip) {
                Alert.alert(
                    'Acesso Negado',
                    tooltipMessage || 'Você não tem permissão para executar esta ação'
                );
            }
            return;
        }

        onPress();
    };

    const styles = StyleSheet.create({
        button: {
            backgroundColor: hasAccess ? theme.colors.primary : theme.colors.textSecondary,
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (!hasAccess || disabled) ? 0.6 : 1,
            ...style,
            ...((!hasAccess || disabled) ? disabledStyle : {})
        },
        text: {
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
            ...textStyle
        }
    });

    if (!hasAccess && !showTooltip) {
        return null;
    }

    return (
        <TouchableOpacity
            style={styles.button}
            onPress={handlePress}
            disabled={!hasAccess || disabled}
            activeOpacity={0.7}
        >
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
};

// Componente de tela não autorizada
interface UnauthorizedScreenProps {
    message?: string;
    showBackButton?: boolean;
    backButtonText?: string;
    onBackPress?: () => void;
}

export const UnauthorizedScreen: React.FC<UnauthorizedScreenProps> = ({
    message = 'Você não tem permissão para acessar esta página',
    showBackButton = true,
    backButtonText = 'Voltar',
    onBackPress
}) => {
    const { theme } = useThemeStore();
    const router = useRouter();

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            router.back();
        }
    };

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
            <Text style={styles.message}>{message}</Text>

            {showBackButton && (
                <TouchableOpacity style={styles.button} onPress={handleBackPress}>
                    <Text style={styles.buttonText}>{backButtonText}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

// Hook para renderização condicional
export const useConditionalRender = () => {
    const { shouldShowElement } = usePermissions();

    const renderIf = (condition: boolean, component: React.ReactNode) => {
        return condition ? component : null;
    };

    const renderIfRole = (role: string, component: React.ReactNode) => {
        return shouldShowElement('role_check', { role }) ? component : null;
    };

    const renderIfPermission = (permission: Permission, component: React.ReactNode) => {
        return shouldShowElement('permission_check', { permission }) ? component : null;
    };

    return {
        renderIf,
        renderIfRole,
        renderIfPermission,
        shouldShowElement,
    };
};

// Componente para navegação baseada em roles
interface RoleBasedNavigationProps {
    children: React.ReactNode;
    studentContent?: React.ReactNode;
    teacherContent?: React.ReactNode;
    directorContent?: React.ReactNode;
}

export const RoleBasedNavigation: React.FC<RoleBasedNavigationProps> = ({
    children,
    studentContent,
    teacherContent,
    directorContent
}) => {
    const { permissions } = usePermissions();

    if (permissions.isStudent && studentContent) {
        return <>{studentContent}</>;
    }

    if (permissions.isTeacher && teacherContent) {
        return <>{teacherContent}</>;
    }

    if (permissions.isDirector && directorContent) {
        return <>{directorContent}</>;
    }

    return <>{children}</>;
};

// Componente para exibir informações baseadas no contexto
interface ContextualInfoProps {
    resource: string;
    context: any;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const ContextualInfo: React.FC<ContextualInfoProps> = ({
    resource,
    context,
    children,
    fallback
}) => {
    const { canAccessResource } = usePermissions();

    if (!canAccessResource(resource, 'view', context)) {
        return fallback ? <>{fallback}</> : null;
    }

    return <>{children}</>;
};

// Componente para ações contextuais
interface ContextualActionsProps {
    resource: string;
    context: any;
    actions: {
        action: string;
        component: React.ReactNode;
    }[];
}

export const ContextualActions: React.FC<ContextualActionsProps> = ({
    resource,
    context,
    actions
}) => {
    const { getAvailableActions } = usePermissions();
    const availableActions = getAvailableActions(resource, context);

    return (
        <View style={{ flexDirection: 'row', gap: 8 }}>
            {actions.map(({ action, component }) => {
                if (availableActions.includes(action)) {
                    return <React.Fragment key={action}>{component}</React.Fragment>;
                }
                return null;
            })}
        </View>
    );
};