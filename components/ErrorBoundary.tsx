// components/ErrorBoundary.tsx - Componente para capturar erros

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Atualiza o state para mostrar a UI de erro
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log do erro para debugging
        console.error('ErrorBoundary capturou um erro:', error, errorInfo);

        // Salvar informações do erro no state
        this.setState({
            error,
            errorInfo
        });

        // Aqui você poderia enviar o erro para um serviço de monitoramento
        // como Sentry, Bugsnag, etc.
        this.logErrorToService(error, errorInfo);
    }

    logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
        // Implementar logging para serviços externos
        if (__DEV__) {
            console.group('🚨 Error Boundary - Erro Capturado');
            console.error('Error:', error);
            console.error('Error Info:', errorInfo);
            console.error('Component Stack:', errorInfo.componentStack);
            console.groupEnd();
        }

        // Em produção, enviar para serviço de monitoramento:
        // Sentry.captureException(error, { extra: errorInfo });
    };

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            // UI customizada de erro
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return <ErrorFallback
                error={this.state.error}
                onRetry={this.handleRetry}
            />;
        }

        return this.props.children;
    }
}

// Componente de fallback padrão
interface ErrorFallbackProps {
    error?: Error;
    onRetry: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry }) => {
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            padding: 20,
        },
        icon: {
            fontSize: 64,
            marginBottom: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#dc3545',
            marginBottom: 12,
            textAlign: 'center',
        },
        message: {
            fontSize: 16,
            color: '#6c757d',
            textAlign: 'center',
            marginBottom: 30,
            lineHeight: 24,
        },
        button: {
            backgroundColor: '#007bff',
            borderRadius: 8,
            paddingHorizontal: 24,
            paddingVertical: 12,
            marginBottom: 16,
        },
        buttonText: {
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
        },
        errorDetails: {
            backgroundColor: '#f8f9fa',
            borderRadius: 8,
            padding: 16,
            marginTop: 20,
            maxWidth: '100%',
        },
        errorText: {
            fontSize: 12,
            color: '#dc3545',
            fontFamily: 'monospace',
        },
        debugButton: {
            backgroundColor: '#6c757d',
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginTop: 16,
        },
        debugButtonText: {
            color: 'white',
            fontSize: 14,
        },
    });

    const [showDetails, setShowDetails] = React.useState(false);

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>💥</Text>
            <Text style={styles.title}>Oops! Algo deu errado</Text>
            <Text style={styles.message}>
                Ocorreu um erro inesperado. Tente novamente ou reinicie o aplicativo.
            </Text>

            <TouchableOpacity style={styles.button} onPress={onRetry}>
                <Text style={styles.buttonText}>🔄 Tentar Novamente</Text>
            </TouchableOpacity>

            {__DEV__ && (
                <>
                    <TouchableOpacity
                        style={styles.debugButton}
                        onPress={() => setShowDetails(!showDetails)}
                    >
                        <Text style={styles.debugButtonText}>
                            {showDetails ? '🔼 Ocultar Detalhes' : '🔽 Mostrar Detalhes'}
                        </Text>
                    </TouchableOpacity>

                    {showDetails && error && (
                        <View style={styles.errorDetails}>
                            <Text style={styles.errorText}>
                                {error.name}: {error.message}
                                {'\n\n'}
                                {error.stack}
                            </Text>
                        </View>
                    )}
                </>
            )}
        </View>
    );
};

// Hook para usar ErrorBoundary programaticamente
export const useErrorHandler = () => {
    const handleError = React.useCallback((error: Error, errorInfo?: any) => {
        console.error('Erro capturado pelo useErrorHandler:', error, errorInfo);

        // Em produção, enviar para serviço de monitoramento
        if (!__DEV__) {
            // Sentry.captureException(error, { extra: errorInfo });
        }
    }, []);

    return { handleError };
};

// HOC para envolver componentes com ErrorBoundary
export const withErrorBoundary = <P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
) => {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary fallback={fallback}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

    return WrappedComponent;
};

export default ErrorBoundary;