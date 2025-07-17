// components/ConnectionStatus.tsx - Versão SIMPLES ou REMOVER

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../store/themeStore';

interface ConnectionStatusProps {
    showRetryButton?: boolean;
    compact?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
    showRetryButton = true,
    compact = false,
}) => {
    const { theme } = useThemeStore();
    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.success + '20',
            borderRadius: 8,
            padding: 8,
            marginVertical: 4,
            borderWidth: 1,
            borderColor: theme.colors.success,
        },
        statusText: {
            color: theme.colors.success,
            fontSize: 12,
            fontWeight: '600',
        },
    });

    // Versão simplificada - sempre mostra como conectado
    // Remove este componente se não for necessário

    if (compact) {
        return (
            <View style={styles.container}>
                <Text style={styles.statusText}>🟢 Online</Text>
            </View>
        );
    }

    // Não mostrar nada se não for compacto
    return null;
};

export default ConnectionStatus;