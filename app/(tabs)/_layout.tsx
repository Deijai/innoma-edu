// app/(tabs)/_layout.tsx - Layout OTIMIZADO com permissões

import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { usePermissions } from '../../hooks/usePermissions';
import { useThemeStore } from '../../store/themeStore';

export default function TabsLayout() {
    const { theme } = useThemeStore();
    const { availableTabs, canAccessTab } = usePermissions();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: theme.colors.background,
                    borderTopColor: theme.colors.border,
                    height: 65,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                headerStyle: {
                    backgroundColor: theme.colors.background,
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerShown: false, // Esconder header padrão
            }}
        >
            {/* Renderizar todas as tabs, mas só mostrar as permitidas */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Início',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="🏠" color={color} size={size} />
                    ),
                    href: canAccessTab('index') ? undefined : null,
                }}
            />

            <Tabs.Screen
                name="tasks"
                options={{
                    title: 'Tarefas',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="📋" color={color} size={size} />
                    ),
                    href: canAccessTab('tasks') ? undefined : null,
                }}
            />

            <Tabs.Screen
                name="classroom"
                options={{
                    title: 'Aulas',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="🎓" color={color} size={size} />
                    ),
                    href: canAccessTab('classroom') ? undefined : null,
                }}
            />

            <Tabs.Screen
                name="chat"
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="💬" color={color} size={size} />
                    ),
                    href: canAccessTab('chat') ? undefined : null,
                }}
            />

            <Tabs.Screen
                name="add-task"
                options={{
                    title: 'Nova Tarefa',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="➕" color={color} size={size} />
                    ),
                    href: canAccessTab('add-task') ? undefined : null,
                }}
            />

            <Tabs.Screen
                name="add-class"
                options={{
                    title: 'Nova Aula',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="📚" color={color} size={size} />
                    ),
                    href: canAccessTab('add-class') ? undefined : null,
                }}
            />

            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Configurações',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="⚙️" color={color} size={size} />
                    ),
                    href: canAccessTab('settings') ? undefined : null,
                }}
            />
        </Tabs>
    );
}

// Componente de ícone otimizado
function TabIcon({ name, color, size }: { name: string; color: string; size: number }) {
    return (
        <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: size + 4,
            height: size + 4,
        }}>
            <Text style={{
                fontSize: size,
                color,
                textAlign: 'center',
            }}>
                {name}
            </Text>
        </View>
    );
}

// Componente alternativo usando a lista de tabs disponíveis
export function DynamicTabsLayout() {
    const { theme } = useThemeStore();
    const { availableTabs } = usePermissions();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: theme.colors.background,
                    borderTopColor: theme.colors.border,
                    height: 65,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                headerShown: false,
            }}
        >
            {availableTabs.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        tabBarIcon: ({ color, size }) => (
                            <TabIcon name={tab.icon} color={color} size={size} />
                        ),
                    }}
                />
            ))}
        </Tabs>
    );
}