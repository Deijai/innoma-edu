// components/ValidatedInput.tsx - Input com validação integrada

import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { useThemeStore } from '../store/themeStore';

interface ValidatedInputProps extends Omit<TextInputProps, 'onChangeText' | 'onBlur'> {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    onBlur?: () => void;
    errors?: string[];
    required?: boolean;
    helpText?: string;
    leftIcon?: string;
    rightIcon?: string;
    onRightIconPress?: () => void;
    containerStyle?: any;
    inputStyle?: any;
    type?: 'text' | 'email' | 'password' | 'number' | 'phone';
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
    label,
    value,
    onChangeText,
    onBlur,
    errors = [],
    required = false,
    helpText,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    inputStyle,
    type = 'text',
    ...textInputProps
}) => {
    const { theme } = useThemeStore();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const hasError = errors.length > 0;
    const isPassword = type === 'password';

    // Configurações baseadas no tipo
    const getInputProps = () => {
        const baseProps: Partial<TextInputProps> = {
            ...textInputProps,
        };

        switch (type) {
            case 'email':
                return {
                    ...baseProps,
                    keyboardType: 'email-address' as const,
                    autoCapitalize: 'none' as const,
                    autoComplete: 'email' as const,
                };
            case 'password':
                return {
                    ...baseProps,
                    secureTextEntry: !showPassword,
                    autoCapitalize: 'none' as const,
                    autoComplete: 'password' as const,
                };
            case 'number':
                return {
                    ...baseProps,
                    keyboardType: 'numeric' as const,
                };
            case 'phone':
                return {
                    ...baseProps,
                    keyboardType: 'phone-pad' as const,
                    autoComplete: 'tel' as const,
                };
            default:
                return baseProps;
        }
    };

    const styles = StyleSheet.create({
        container: {
            marginBottom: 16,
            ...containerStyle,
        },
        labelContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        label: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
        },
        required: {
            color: theme.colors.error,
            marginLeft: 4,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: hasError
                ? theme.colors.error
                : isFocused
                    ? theme.colors.primary
                    : theme.colors.border,
            paddingHorizontal: 16,
            minHeight: 48,
        },
        leftIcon: {
            marginRight: 12,
            fontSize: 20,
        },
        input: {
            flex: 1,
            fontSize: 16,
            color: theme.colors.text,
            paddingVertical: 12,
            ...inputStyle,
        },
        rightIconContainer: {
            marginLeft: 12,
            padding: 4,
        },
        rightIcon: {
            fontSize: 20,
            color: theme.colors.textSecondary,
        },
        helpText: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginTop: 4,
            lineHeight: 16,
        },
        errorContainer: {
            marginTop: 4,
        },
        errorText: {
            fontSize: 12,
            color: theme.colors.error,
            lineHeight: 16,
        },
        multipleErrors: {
            marginTop: 2,
        },
    });

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const getRightIcon = () => {
        if (isPassword) {
            return showPassword ? '🙈' : '👁️';
        }
        return rightIcon;
    };

    const handleRightIconPress = () => {
        if (isPassword) {
            handleTogglePassword();
        } else if (onRightIconPress) {
            onRightIconPress();
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (onBlur) {
            onBlur();
        }
    };

    return (
        <View style={styles.container}>
            {/* Label */}
            <View style={styles.labelContainer}>
                <Text style={styles.label}>{label}</Text>
                {required && <Text style={styles.required}>*</Text>}
            </View>

            {/* Input Container */}
            <View style={styles.inputContainer}>
                {leftIcon && (
                    <Text style={styles.leftIcon}>{leftIcon}</Text>
                )}

                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholderTextColor={theme.colors.textSecondary}
                    {...getInputProps()}
                />

                {(rightIcon || isPassword) && (
                    <TouchableOpacity
                        style={styles.rightIconContainer}
                        onPress={handleRightIconPress}
                        disabled={!isPassword && !onRightIconPress}
                    >
                        <Text style={styles.rightIcon}>
                            {getRightIcon()}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Help Text */}
            {helpText && !hasError && (
                <Text style={styles.helpText}>{helpText}</Text>
            )}

            {/* Error Messages */}
            {hasError && (
                <View style={styles.errorContainer}>
                    {errors.map((error, index) => (
                        <Text
                            key={index}
                            style={[
                                styles.errorText,
                                index > 0 && styles.multipleErrors
                            ]}
                        >
                            • {error}
                        </Text>
                    ))}
                </View>
            )}
        </View>
    );
};

// ==========================================
// COMPONENTE DE TEXTAREA VALIDADO
// ==========================================

interface ValidatedTextAreaProps extends ValidatedInputProps {
    numberOfLines?: number;
    maxLength?: number;
    showCharacterCount?: boolean;
}

export const ValidatedTextArea: React.FC<ValidatedTextAreaProps> = ({
    numberOfLines = 4,
    maxLength,
    showCharacterCount = false,
    ...props
}) => {
    const { theme } = useThemeStore();

    const characterCount = props.value?.length || 0;
    const isNearLimit = maxLength && characterCount > maxLength * 0.8;
    const isOverLimit = maxLength && characterCount > maxLength;

    const characterCountStyle = {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'right' as const,
        color: isOverLimit
            ? theme.colors.error
            : isNearLimit
                ? theme.colors.warning
                : theme.colors.textSecondary,
    };

    return (
        <View>
            <ValidatedInput
                {...props}
                multiline
                numberOfLines={numberOfLines}
                maxLength={maxLength}
                inputStyle={{
                    minHeight: numberOfLines * 20,
                    textAlignVertical: 'top',
                    ...props.inputStyle,
                }}
            />
            {showCharacterCount && maxLength && (
                <Text style={characterCountStyle}>
                    {characterCount}/{maxLength}
                </Text>
            )}
        </View>
    );
};

// ==========================================
// COMPONENTE DE SELECT VALIDADO
// ==========================================

interface SelectOption {
    label: string;
    value: string;
    icon?: string;
}

interface ValidatedSelectProps {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    options: SelectOption[];
    errors?: string[];
    required?: boolean;
    helpText?: string;
    placeholder?: string;
    containerStyle?: any;
}

export const ValidatedSelect: React.FC<ValidatedSelectProps> = ({
    label,
    value,
    onValueChange,
    options,
    errors = [],
    required = false,
    helpText,
    placeholder = 'Selecione uma opção...',
    containerStyle,
}) => {
    const { theme } = useThemeStore();
    const [isOpen, setIsOpen] = useState(false);

    const hasError = errors.length > 0;
    const selectedOption = options.find(opt => opt.value === value);

    const styles = StyleSheet.create({
        container: {
            marginBottom: 16,
            ...containerStyle,
        },
        labelContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        label: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
        },
        required: {
            color: theme.colors.error,
            marginLeft: 4,
        },
        selectContainer: {
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: hasError
                ? theme.colors.error
                : isOpen
                    ? theme.colors.primary
                    : theme.colors.border,
        },
        selectButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            minHeight: 48,
        },
        selectText: {
            fontSize: 16,
            color: selectedOption ? theme.colors.text : theme.colors.textSecondary,
            flex: 1,
        },
        selectIcon: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            marginLeft: 8,
        },
        optionsContainer: {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            maxHeight: 200,
        },
        option: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        optionIcon: {
            marginRight: 8,
            fontSize: 16,
        },
        optionText: {
            fontSize: 16,
            color: theme.colors.text,
            flex: 1,
        },
        selectedOption: {
            backgroundColor: theme.colors.primary + '20',
        },
        helpText: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginTop: 4,
        },
        errorText: {
            fontSize: 12,
            color: theme.colors.error,
            marginTop: 4,
        },
    });

    const handleSelectOption = (optionValue: string) => {
        onValueChange(optionValue);
        setIsOpen(false);
    };

    return (
        <View style={styles.container}>
            {/* Label */}
            <View style={styles.labelContainer}>
                <Text style={styles.label}>{label}</Text>
                {required && <Text style={styles.required}>*</Text>}
            </View>

            {/* Select Container */}
            <View style={styles.selectContainer}>
                <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => setIsOpen(!isOpen)}
                >
                    <Text style={styles.selectText}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </Text>
                    <Text style={styles.selectIcon}>
                        {isOpen ? '🔼' : '🔽'}
                    </Text>
                </TouchableOpacity>

                {/* Options */}
                {isOpen && (
                    <View style={styles.optionsContainer}>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.option,
                                    value === option.value && styles.selectedOption
                                ]}
                                onPress={() => handleSelectOption(option.value)}
                            >
                                {option.icon && (
                                    <Text style={styles.optionIcon}>{option.icon}</Text>
                                )}
                                <Text style={styles.optionText}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Help Text */}
            {helpText && !hasError && (
                <Text style={styles.helpText}>{helpText}</Text>
            )}

            {/* Error Messages */}
            {hasError && (
                <Text style={styles.errorText}>
                    {errors.join(', ')}
                </Text>
            )}
        </View>
    );
};

export default ValidatedInput;