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
import { useThemeStore } from '../../store/themeStore';

export default function AddTaskScreen() {
    const [title, setTitle] = useState('');
    const [course, setCourse] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Exercícios');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [dueDate, setDueDate] = useState('');
    const [dueTime, setDueTime] = useState('');

    const router = useRouter();
    const { theme } = useThemeStore();
    const { addTask, courses } = useAppStore();

    const categories = ['Exercícios', 'Prova', 'Trabalho', 'Projeto', 'Leitura', 'Pesquisa'];
    const priorities = [
        { value: 'low', label: 'Baixa', color: theme.colors.success },
        { value: 'medium', label: 'Média', color: theme.colors.warning },
        { value: 'high', label: 'Alta', color: theme.colors.error },
    ];

    const handleSubmit = () => {
        if (!title.trim()) {
            Alert.alert('Erro', 'Por favor, insira um título para a tarefa');
            return;
        }

        if (!course.trim()) {
            Alert.alert('Erro', 'Por favor, selecione um curso');
            return;
        }

        if (!dueDate.trim()) {
            Alert.alert('Erro', 'Por favor, selecione uma data de vencimento');
            return;
        }

        // Criar a data de vencimento
        const dateTime = new Date(`${dueDate}T${dueTime || '23:59'}`);

        if (dateTime < new Date()) {
            Alert.alert('Erro', 'A data de vencimento não pode ser no passado');
            return;
        }

        const newTask = {
            title: title.trim(),
            course: course.trim(),
            description: description.trim(),
            category,
            priority,
            dueDate: dateTime,
            completed: false,
        };

        addTask(newTask);

        Alert.alert('Sucesso', 'Tarefa adicionada com sucesso!', [
            {
                text: 'OK',
                onPress: () => {
                    // Limpar formulário
                    setTitle('');
                    setCourse('');
                    setDescription('');
                    setCategory('Exercícios');
                    setPriority('medium');
                    setDueDate('');
                    setDueTime('');

                    router.push('/(tabs)/tasks');
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
            minHeight: 100,
            textAlignVertical: 'top',
        },
        dateTimeContainer: {
            flexDirection: 'row',
            gap: 12,
        },
        dateTimeInput: {
            flex: 1,
        },
        selectorContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        selectorButton: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        selectorButtonActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        selectorButtonText: {
            color: theme.colors.text,
            fontSize: 14,
        },
        selectorButtonTextActive: {
            color: 'white',
        },
        priorityButton: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: 'transparent',
        },
        priorityButtonActive: {
            borderWidth: 2,
        },
        priorityButtonText: {
            color: 'white',
            fontSize: 14,
            fontWeight: '600',
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
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Adicionar Tarefa</Text>
                <Text style={styles.subtitle}>Crie uma nova atividade</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Título da Tarefa</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Ex: Lista de exercícios de matemática"
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
                    <Text style={styles.label}>Categoria</Text>
                    <View style={styles.selectorContainer}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.selectorButton,
                                    category === cat && styles.selectorButtonActive,
                                ]}
                                onPress={() => setCategory(cat)}
                            >
                                <Text style={[
                                    styles.selectorButtonText,
                                    category === cat && styles.selectorButtonTextActive,
                                ]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Prioridade</Text>
                    <View style={styles.selectorContainer}>
                        {priorities.map((prio) => (
                            <TouchableOpacity
                                key={prio.value}
                                style={[
                                    styles.priorityButton,
                                    { backgroundColor: prio.color },
                                    priority === prio.value && {
                                        ...styles.priorityButtonActive,
                                        borderColor: theme.colors.text,
                                    },
                                ]}
                                onPress={() => setPriority(prio.value as 'low' | 'medium' | 'high')}
                            >
                                <Text style={styles.priorityButtonText}>
                                    {prio.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Data e Hora de Vencimento</Text>
                    <View style={styles.dateTimeContainer}>
                        <View style={styles.dateTimeInput}>
                            <TextInput
                                style={styles.input}
                                value={dueDate}
                                onChangeText={setDueDate}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={theme.colors.textSecondary}
                            />
                        </View>
                        <View style={styles.dateTimeInput}>
                            <TextInput
                                style={styles.input}
                                value={dueTime}
                                onChangeText={setDueTime}
                                placeholder="HH:MM"
                                placeholderTextColor={theme.colors.textSecondary}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Descrição (Opcional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Adicione detalhes sobre a tarefa..."
                        placeholderTextColor={theme.colors.textSecondary}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Adicionar Tarefa</Text>
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