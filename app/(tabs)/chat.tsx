import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export default function ChatScreen() {
    const [message, setMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [sounds, setSounds] = useState<Map<string, Audio.Sound>>(new Map());

    const scrollViewRef = useRef<ScrollView>(null);
    const { theme } = useThemeStore();
    const { messages, addMessage } = useAppStore();
    const { user } = useAuthStore();

    useEffect(() => {
        // Configurar o áudio
        Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        });

        return () => {
            // Limpar sons ao desmontar
            sounds.forEach(sound => sound.unloadAsync());
        };
    }, []);

    const handleSendMessage = () => {
        if (!message.trim()) return;

        const newMessage = {
            text: message.trim(),
            sender: user?.name || 'Usuário',
            timestamp: new Date(),
            isUser: true,
        };

        addMessage(newMessage);
        setMessage('');

        // Simular resposta automática
        setTimeout(() => {
            const responses = [
                'Entendi! Vou te ajudar com isso.',
                'Ótima pergunta! Deixe-me explicar...',
                'Posso te dar algumas dicas sobre esse assunto.',
                'Vou buscar mais informações para você.',
                'Essa é uma questão interessante. Vamos resolver juntos!',
            ];

            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            const botMessage = {
                text: randomResponse,
                sender: 'EduBot',
                timestamp: new Date(),
                isUser: false,
            };

            addMessage(botMessage);
        }, 1000);
    };

    const startRecording = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permissão necessária', 'Precisamos da permissão do microfone para gravar áudio.');
                return;
            }

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(recording);
            setIsRecording(true);
        } catch (error) {
            console.error('Erro ao iniciar gravação:', error);
            Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();

            if (uri) {
                const audioMessage = {
                    text: '🎵 Mensagem de áudio',
                    sender: user?.name || 'Usuário',
                    timestamp: new Date(),
                    isUser: true,
                    isAudio: true,
                    audioUri: uri,
                };

                addMessage(audioMessage);
            }

            setRecording(null);
            setIsRecording(false);
        } catch (error) {
            console.error('Erro ao parar gravação:', error);
            Alert.alert('Erro', 'Não foi possível salvar a gravação.');
        }
    };

    const playAudio = async (audioUri: string, messageId: string) => {
        try {
            if (isPlaying === messageId) {
                // Parar áudio atual
                const sound = sounds.get(messageId);
                if (sound) {
                    await sound.stopAsync();
                    setIsPlaying(null);
                }
                return;
            }

            // Parar qualquer áudio tocando
            if (isPlaying) {
                const currentSound = sounds.get(isPlaying);
                if (currentSound) {
                    await currentSound.stopAsync();
                }
            }

            const { sound } = await Audio.Sound.createAsync({ uri: audioUri });

            sounds.set(messageId, sound);
            setSounds(new Map(sounds));

            setIsPlaying(messageId);

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setIsPlaying(null);
                }
            });

            await sound.playAsync();
        } catch (error) {
            console.error('Erro ao reproduzir áudio:', error);
            Alert.alert('Erro', 'Não foi possível reproduzir o áudio.');
        }
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            padding: 20,
            paddingTop: 60,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        title: {
            fontSize: 32,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 16,
            color: theme.colors.textSecondary,
        },
        messagesContainer: {
            flex: 1,
            padding: 16,
        },
        messageContainer: {
            marginBottom: 16,
            maxWidth: '80%',
        },
        userMessage: {
            alignSelf: 'flex-end',
        },
        botMessage: {
            alignSelf: 'flex-start',
        },
        messageBubble: {
            borderRadius: 16,
            padding: 12,
            marginBottom: 4,
        },
        userBubble: {
            backgroundColor: theme.colors.primary,
            borderBottomRightRadius: 4,
        },
        botBubble: {
            backgroundColor: theme.colors.surface,
            borderBottomLeftRadius: 4,
        },
        messageText: {
            fontSize: 16,
            lineHeight: 20,
        },
        userText: {
            color: 'white',
        },
        botText: {
            color: theme.colors.text,
        },
        messageInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        messageSender: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            fontWeight: '600',
        },
        messageTime: {
            fontSize: 12,
            color: theme.colors.textSecondary,
        },
        audioMessage: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        audioButton: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
        },
        audioButtonText: {
            color: 'white',
            fontSize: 12,
        },
        audioText: {
            flex: 1,
        },
        inputContainer: {
            flexDirection: 'row',
            padding: 16,
            backgroundColor: theme.colors.surface,
            alignItems: 'flex-end',
            gap: 8,
        },
        textInput: {
            flex: 1,
            backgroundColor: theme.colors.background,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            color: theme.colors.text,
            maxHeight: 100,
        },
        sendButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: 20,
            padding: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        sendButtonText: {
            color: 'white',
            fontSize: 16,
        },
        recordButton: {
            backgroundColor: theme.colors.error,
            borderRadius: 20,
            padding: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        recordButtonActive: {
            backgroundColor: theme.colors.error,
        },
        recordButtonText: {
            color: 'white',
            fontSize: 16,
        },
        emptyState: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 40,
        },
        emptyStateIcon: {
            fontSize: 64,
            marginBottom: 16,
        },
        emptyStateTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: 8,
            textAlign: 'center',
        },
        emptyStateText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            lineHeight: 20,
        },
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Chat</Text>
                <Text style={styles.subtitle}>Converse com o EduBot</Text>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.length > 0 ? (
                    messages.map((msg) => (
                        <View
                            key={msg.id}
                            style={[
                                styles.messageContainer,
                                msg.isUser ? styles.userMessage : styles.botMessage,
                            ]}
                        >
                            <View style={[
                                styles.messageBubble,
                                msg.isUser ? styles.userBubble : styles.botBubble,
                            ]}>
                                {msg.isAudio ? (
                                    <View style={styles.audioMessage}>
                                        <TouchableOpacity
                                            style={styles.audioButton}
                                            onPress={() => playAudio(msg.audioUri!, msg.id)}
                                        >
                                            <Text style={styles.audioButtonText}>
                                                {isPlaying === msg.id ? '⏸️' : '▶️'}
                                            </Text>
                                        </TouchableOpacity>
                                        <Text style={[
                                            styles.messageText,
                                            styles.audioText,
                                            msg.isUser ? styles.userText : styles.botText,
                                        ]}>
                                            {msg.text}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={[
                                        styles.messageText,
                                        msg.isUser ? styles.userText : styles.botText,
                                    ]}>
                                        {msg.text}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.messageInfo}>
                                <Text style={styles.messageSender}>{msg.sender}</Text>
                                <Text style={styles.messageTime}>{formatTime(msg.timestamp)}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateIcon}>💬</Text>
                        <Text style={styles.emptyStateTitle}>Inicie uma conversa</Text>
                        <Text style={styles.emptyStateText}>
                            Faça uma pergunta ou envie uma mensagem de áudio para o EduBot
                        </Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Digite sua mensagem..."
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                    maxLength={500}
                />

                <TouchableOpacity
                    style={[
                        styles.recordButton,
                        isRecording && styles.recordButtonActive,
                    ]}
                    onPress={isRecording ? stopRecording : startRecording}
                >
                    <Text style={styles.recordButtonText}>
                        {isRecording ? '⏹️' : '🎤'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendMessage}
                    disabled={!message.trim()}
                >
                    <Text style={styles.sendButtonText}>➤</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}