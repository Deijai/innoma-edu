import { Stack } from 'expo-router';
import { useThemeStore } from '../../store/themeStore';

export default function AuthLayout() {
    const { theme } = useThemeStore();

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.background,
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerShown: false,
            }}
        >
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="reset-password" />
        </Stack>
    );
}