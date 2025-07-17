// app/(tabs)/_layout.tsx - Com controle de permissões por tab

import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export default function TabsLayout() {
    const { theme } = useThemeStore();
    const { user } = useAuthStore();

    // Verificar permissões para cada tab
    const hasPermission = (tabName: string) => {
        if (!user) return false;

        switch (tabName) {
            case 'index':
            case 'tasks':
            case 'classroom':
            case 'chat':
                return true; // Todos podem ver essas tabs

            case 'add-task':
            case 'add-class':
                return user.role === 'teacher' || user.role === 'director';

            case 'settings':
                return user.role === 'director';

            default:
                return false;
        }
    };

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
            }}
        >
            {/* Tabs básicas - sempre visíveis */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Início',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="🏠" color={color} size={size} />
                    ),
                }}
            />

            <Tabs.Screen
                name="tasks"
                options={{
                    title: 'Tarefas',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="📋" color={color} size={size} />
                    ),
                }}
            />

            <Tabs.Screen
                name="classroom"
                options={{
                    title: 'Aulas',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="🎓" color={color} size={size} />
                    ),
                }}
            />

            <Tabs.Screen
                name="chat"
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="💬" color={color} size={size} />
                    ),
                }}
            />

            {/* Tabs condicionais - só aparecem se tiver permissão */}
            <Tabs.Screen
                name="add-task"
                options={hasPermission('add-task') ? {
                    title: 'Nova Tarefa',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="➕" color={color} size={size} />
                    ),
                } : {
                    href: null, // 🎯 ISSO FAZ A TAB SUMIR!
                }}
            />

            <Tabs.Screen
                name="add-class"
                options={hasPermission('add-class') ? {
                    title: 'Nova Aula',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="📚" color={color} size={size} />
                    ),
                } : {
                    href: null, // 🎯 ISSO FAZ A TAB SUMIR!
                }}
            />

            <Tabs.Screen
                name="settings"
                options={hasPermission('settings') ? {
                    title: 'Configurações',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="⚙️" color={color} size={size} />
                    ),
                } : {
                    href: null, // 🎯 ISSO FAZ A TAB SUMIR!
                }}
            />
        </Tabs>
    );
}

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