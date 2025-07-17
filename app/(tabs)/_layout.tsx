import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useThemeStore } from '../../store/themeStore';

export default function TabsLayout() {
    const { theme } = useThemeStore();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                headerShown: false,
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
                name="add-task"
                options={{
                    title: 'Adicionar',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="➕" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="classroom"
                options={{
                    title: 'Sala de Aula',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="🎓" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="add-class"
                options={{
                    title: 'Adicionar Aula',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="📚" color={color} size={size} />
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