import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export default function NotFoundScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Bounce animation for the emoji
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: -20,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotation animation for the question mark
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleGoHome = () => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      handleGoHome();
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    content: {
      alignItems: 'center',
      maxWidth: 300,
    },
    emojiContainer: {
      marginBottom: 20,
    },
    emoji: {
      fontSize: 80,
      textAlign: 'center',
    },
    questionMark: {
      fontSize: 40,
      color: theme.colors.primary,
      position: 'absolute',
      top: -10,
      right: -10,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 20,
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: 12,
    },
    description: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 40,
    },
    buttonContainer: {
      width: '100%',
      gap: 12,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonSecondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    buttonTextSecondary: {
      color: theme.colors.text,
    },
    decorativeElements: {
      position: 'absolute',
      top: 100,
      left: 50,
      right: 50,
      flexDirection: 'row',
      justifyContent: 'space-between',
      opacity: 0.1,
    },
    decorativeEmoji: {
      fontSize: 24,
      color: theme.colors.primary,
    },
    footerContainer: {
      position: 'absolute',
      bottom: 60,
      left: 20,
      right: 20,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    appName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    errorCode: {
      position: 'absolute',
      top: 80,
      right: 20,
      fontSize: 120,
      fontWeight: '900',
      color: theme.colors.border,
      opacity: 0.3,
      zIndex: -1,
    },
    wave: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 100,
      backgroundColor: theme.colors.primary + '10',
      borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.errorCode}>404</Text>

      <View style={styles.decorativeElements}>
        <Text style={styles.decorativeEmoji}>📚</Text>
        <Text style={styles.decorativeEmoji}>🎓</Text>
        <Text style={styles.decorativeEmoji}>📝</Text>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.emojiContainer, { transform: [{ translateY: bounceAnim }] }]}>
          <Text style={styles.emoji}>🤔</Text>
          <Animated.Text style={[styles.questionMark, { transform: [{ rotate: spin }] }]}>
            ?
          </Animated.Text>
        </Animated.View>

        <Text style={styles.title}>Página não encontrada</Text>
        <Text style={styles.subtitle}>Ops! Algo deu errado</Text>
        <Text style={styles.description}>
          A página que você está procurando não existe ou foi movida. Vamos te ajudar a encontrar o caminho certo!
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleGoHome}>
            <Text style={styles.buttonText}>
              {isAuthenticated ? '🏠 Ir para Início' : '🔐 Fazer Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleGoBack}
          >
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
              ← Voltar
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          Precisa de ajuda? Entre em contato conosco
        </Text>
        <Text style={styles.appName}>EduApp</Text>
      </View>

      <View style={styles.wave} />
    </View>
  );
}