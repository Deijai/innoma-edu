import { useRouter } from 'expo-router';
import { useState } from 'react';
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

export default function AddClassScreen() {
    const [title, setTitle] = useState('');
    const [course, setCourse] = useState('');
    const [teacher, setTeacher] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState('60');
    const [resources, setResources] = useState('');

    const router = useRouter();
    const { theme } = useThemeStore();
    const { addClass, courses } = useAppStore();
    const { user } = useAuthStore();

    const durations = [
        { value: '30', label: '30 min' },
        { value: '45', label: '45 min' },
        { value: '60', label: '1 hora' },
        { value: '90', label: '1h 30min' },
        { value: '120', label: '2 horas' },
    ];

    const handleSubmit = () => {
        if (!title.trim()) {
            Alert.alert('Erro', 'Por favor, insira um título para a aula');
            return;
        }

        if (!course.trim()) {
            Alert.alert('Erro', 'Por favor, selecione um curso');
            return;
        }

        if (!teacher.trim()) {
            Alert.alert('Erro', 'Por favor, insira o nome do professor');
            return;
        }

        if (!date.trim()) {
            Alert.alert('Erro', 'Por favor, selecione uma data');
            return;
        }

        if (!time.trim()) {
            Alert.alert('Erro', 'Por favor, selecione um horário');
            return;
        }

        // Criar a data da aula
        const classDateTime = new Date(`${date}T${time}`);

        if (classDateTime < new Date()) {
            Alert.alert('Erro', 'A data da aula não pode ser no passado');
            return;
        }

        const resourcesList = resources.trim()
            ? resources.split(',').map(r => r.trim()).filter(r => r)
            : [];

        const newClass = {
            title: title.trim(),
            course: course.trim(),
            teacher: teacher.trim(),
            description: description.trim(),
            date: classDateTime,
            duration: parseInt(duration),
            resources: resourcesList,
        };

        addClass(newClass);

        Alert.alert('Sucesso', 'Aula adicionada com sucesso!', [
            {
                text: 'OK',
                onPress: () => {
                    // Limpar formulário
                    setTitle('');
                    setCourse('');
                    setTeacher('');
                    setDescription('');
                    setDate('');
                    setTime('');
                    setDuration('60');
                    setResources('');

                    router.push('/(tabs)/classroom');
                },
            },
        ]);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            padding: 20,
            paddingTop: 60,
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
        content: {
            flex: 1,
            padding: 20,
        },
        inputContainer: {
            marginBottom: 20,
        },
        label: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 8,
        },
        input: {
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: theme.colors.text,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        textArea: {
            minHeight: 80,
            textAlignVertical: 'top',
        },
        dateTimeContainer: {
            flexDirection: 'row',
            gap: 12,
        },
        dateTimeInput: {
            flex: 1,
        },
        courseSelector: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        courseButton: {
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 16,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        courseButtonActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        courseButtonText: {
            color: theme.colors.text,
            fontSize: 14,
        },
        courseButtonTextActive: {
            color: 'white',
        },
        durationSelector: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        durationButton: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        durationButtonActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        durationButtonText: {
            color: theme.colors.text,
            fontSize: 14,
        },
        durationButtonTextActive: {
            color: 'white',
        },
        submitButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            marginTop: 20,
        },
        submitButtonText: {
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
        },
        cancelButton: {
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            marginTop: 12,
        },
        cancelButtonText: {
            color: theme.colors.text,
            fontSize: 16,
        },
        helpText: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginTop: 4,
            fontStyle: 'italic',
        },
        infoBox: {
            backgroundColor: theme.colors.primary + '20',
            borderRadius: 8,
            padding: 12,
            marginTop: 12,
        },
        infoText: {
            fontSize: 12,
            color: theme.colors.primary,
            lineHeight: 16,
        },
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Adicionar Aula</Text>
                <Text style={styles.subtitle}>Agende uma nova aula</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Título da Aula</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Ex: Introdução à Física Quântica"
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Curso</Text>
                    <View style={styles.courseSelector}>
                        {courses.map((courseItem) => (
                            <TouchableOpacity
                                key={courseItem.id}
                                style={[
                                    styles.courseButton,
                                    course === courseItem.title && styles.courseButtonActive,
                                ]}
                                onPress={() => setCourse(courseItem.title)}
                            >
                                <Text>{courseItem.icon}</Text>
                                <Text style={[
                                    styles.courseButtonText,
                                    course === courseItem.title && styles.courseButtonTextActive,
                                ]}>
                                    {courseItem.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Professor</Text>
                    <TextInput
                        style={styles.input}
                        value={teacher}
                        onChangeText={setTeacher}
                        placeholder="Nome do professor"
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Data e Horário</Text>
                    <View style={styles.dateTimeContainer}>
                        <View style={styles.dateTimeInput}>
                            <TextInput
                                style={styles.input}
                                value={date}
                                onChangeText={setDate}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={theme.colors.textSecondary}
                            />
                            <Text style={styles.helpText}>Formato: Ano-Mês-Dia</Text>
                        </View>
                        <View style={styles.dateTimeInput}>
                            <TextInput
                                style={styles.input}
                                value={time}
                                onChangeText={setTime}
                                placeholder="HH:MM"
                                placeholderTextColor={theme.colors.textSecondary}
                            />
                            <Text style={styles.helpText}>Formato: 24h</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Duração</Text>
                    <View style={styles.durationSelector}>
                        {durations.map((dur) => (
                            <TouchableOpacity
                                key={dur.value}
                                style={[
                                    styles.durationButton,
                                    duration === dur.value && styles.durationButtonActive,
                                ]}
                                onPress={() => setDuration(dur.value)}
                            >
                                <Text style={[
                                    styles.durationButtonText,
                                    duration === dur.value && styles.durationButtonTextActive,
                                ]}>
                                    {dur.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Descrição</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Adicione uma descrição sobre o conteúdo da aula..."
                        placeholderTextColor={theme.colors.textSecondary}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Recursos (Opcional)</Text>
                    <TextInput
                        style={styles.input}
                        value={resources}
                        onChangeText={setResources}
                        placeholder="slides.pdf, exercicios.pdf, video.mp4"
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                    <Text style={styles.helpText}>
                        Separe os recursos por vírgula
                    </Text>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        💡 Dica: As aulas ficam organizadas por data e podem ser visualizadas na aba "Sala de Aula". Você pode adicionar recursos como PDFs, vídeos e outros materiais de apoio.
                    </Text>
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Agendar Aula</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}