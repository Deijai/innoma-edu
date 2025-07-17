import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { usePermissions } from '../../hooks/usePermissions';
import { useThemeStore } from '../../store/themeStore';

export default function TabsLayout() {
    const { theme } = useThemeStore();
    const { getAvailableTabs } = usePermissions();

    const availableTabs = getAvailableTabs();

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