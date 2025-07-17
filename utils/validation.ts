// utils/validation.ts - Sistema completo de validação

export interface ValidationRule {
    type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
    value?: any;
    message: string;
    validator?: (value: any) => boolean;
}

export interface FieldValidation {
    isValid: boolean;
    errors: string[];
}

export interface FormValidation {
    isValid: boolean;
    fields: Record<string, FieldValidation>;
    errors: string[];
}

// ==========================================
// VALIDADORES INDIVIDUAIS
// ==========================================

export const validators = {
    required: (value: any): boolean => {
        if (typeof value === 'string') {
            return value.trim().length > 0;
        }
        return value !== null && value !== undefined && value !== '';
    },

    email: (value: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },

    minLength: (value: string, minLength: number): boolean => {
        return value.length >= minLength;
    },

    maxLength: (value: string, maxLength: number): boolean => {
        return value.length <= maxLength;
    },

    pattern: (value: string, pattern: RegExp): boolean => {
        return pattern.test(value);
    },

    password: (value: string): boolean => {
        // Pelo menos 6 caracteres
        return value.length >= 6;
    },

    strongPassword: (value: string): boolean => {
        // Pelo menos 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return strongPasswordRegex.test(value);
    },

    confirmPassword: (password: string, confirmPassword: string): boolean => {
        return password === confirmPassword;
    },

    phone: (value: string): boolean => {
        // Formato brasileiro simples
        const phoneRegex = /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/;
        return phoneRegex.test(value);
    },

    date: (value: string): boolean => {
        const date = new Date(value);
        return !isNaN(date.getTime());
    },

    futureDate: (value: string): boolean => {
        const date = new Date(value);
        const now = new Date();
        return date > now;
    },

    pastDate: (value: string): boolean => {
        const date = new Date(value);
        const now = new Date();
        return date < now;
    },

    url: (value: string): boolean => {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    },

    number: (value: string): boolean => {
        return !isNaN(Number(value)) && value.trim() !== '';
    },

    positiveNumber: (value: string): boolean => {
        const num = Number(value);
        return !isNaN(num) && num > 0;
    },

    integer: (value: string): boolean => {
        const num = Number(value);
        return !isNaN(num) && Number.isInteger(num);
    },
};

// ==========================================
// REGRAS PREDEFINIDAS
// ==========================================

export const commonRules = {
    name: [
        { type: 'required', message: 'Nome é obrigatório' },
        { type: 'minLength', value: 2, message: 'Nome deve ter pelo menos 2 caracteres' },
        { type: 'maxLength', value: 50, message: 'Nome deve ter no máximo 50 caracteres' },
    ] as ValidationRule[],

    email: [
        { type: 'required', message: 'Email é obrigatório' },
        { type: 'email', message: 'Email deve ter um formato válido' },
    ] as ValidationRule[],

    password: [
        { type: 'required', message: 'Senha é obrigatória' },
        { type: 'minLength', value: 6, message: 'Senha deve ter pelo menos 6 caracteres' },
    ] as ValidationRule[],

    strongPassword: [
        { type: 'required', message: 'Senha é obrigatória' },
        { type: 'minLength', value: 8, message: 'Senha deve ter pelo menos 8 caracteres' },
        {
            type: 'custom',
            message: 'Senha deve conter pelo menos 1 maiúscula, 1 minúscula e 1 número',
            validator: validators.strongPassword
        },
    ] as ValidationRule[],

    taskTitle: [
        { type: 'required', message: 'Título é obrigatório' },
        { type: 'minLength', value: 3, message: 'Título deve ter pelo menos 3 caracteres' },
        { type: 'maxLength', value: 100, message: 'Título deve ter no máximo 100 caracteres' },
    ] as ValidationRule[],

    taskDescription: [
        { type: 'maxLength', value: 500, message: 'Descrição deve ter no máximo 500 caracteres' },
    ] as ValidationRule[],

    dueDate: [
        { type: 'required', message: 'Data de vencimento é obrigatória' },
        { type: 'date', message: 'Data deve ter um formato válido' },
        {
            type: 'custom',
            message: 'Data de vencimento não pode ser no passado',
            validator: validators.futureDate
        },
    ] as ValidationRule[],

    duration: [
        { type: 'required', message: 'Duração é obrigatória' },
        { type: 'number', message: 'Duração deve ser um número' },
        { type: 'positiveNumber', message: 'Duração deve ser maior que zero' },
    ] as ValidationRule[],
};

// ==========================================
// FUNÇÃO PRINCIPAL DE VALIDAÇÃO
// ==========================================

export function validateField(value: any, rules: ValidationRule[]): FieldValidation {
    const errors: string[] = [];

    for (const rule of rules) {
        let isValid = true;

        switch (rule.type) {
            case 'required':
                isValid = validators.required(value);
                break;
            case 'email':
                isValid = !value || validators.email(value);
                break;
            case 'minLength':
                isValid = !value || validators.minLength(value, rule.value);
                break;
            case 'maxLength':
                isValid = !value || validators.maxLength(value, rule.value);
                break;
            case 'pattern':
                isValid = !value || validators.pattern(value, rule.value);
                break;
            case 'custom':
                isValid = !value || (rule.validator ? rule.validator(value) : true);
                break;
        }

        if (!isValid) {
            errors.push(rule.message);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

export function validateForm(
    data: Record<string, any>,
    rules: Record<string, ValidationRule[]>
): FormValidation {
    const fields: Record<string, FieldValidation> = {};
    const allErrors: string[] = [];

    for (const [fieldName, fieldRules] of Object.entries(rules)) {
        const fieldValue = data[fieldName];
        const fieldValidation = validateField(fieldValue, fieldRules);

        fields[fieldName] = fieldValidation;
        allErrors.push(...fieldValidation.errors);
    }

    return {
        isValid: allErrors.length === 0,
        fields,
        errors: allErrors,
    };
}

// ==========================================
// HOOK PARA VALIDAÇÃO EM TEMPO REAL
// ==========================================

import { useCallback, useState } from 'react';

export function useFormValidation(
    initialData: Record<string, any> = {},
    validationRules: Record<string, ValidationRule[]> = {}
) {
    const [data, setData] = useState(initialData);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [touched, setTouchedState] = useState<Record<string, boolean>>({});

    const validateSingleField = useCallback((fieldName: string, value: any) => {
        const rules = validationRules[fieldName];
        if (!rules) return;

        const validation = validateField(value, rules);
        setErrors(prev => ({
            ...prev,
            [fieldName]: validation.errors,
        }));
    }, [validationRules]);

    const setValue = useCallback((fieldName: string, value: any) => {
        setData(prev => ({
            ...prev,
            [fieldName]: value,
        }));

        // Validar em tempo real apenas se o campo já foi "touched"
        if (touched[fieldName]) {
            validateSingleField(fieldName, value);
        }
    }, [touched, validateSingleField]);

    const markFieldAsTouched = useCallback((fieldName: string) => {
        setTouchedState(prev => ({
            ...prev,
            [fieldName]: true,
        }));

        // Validar quando o campo é "touched" pela primeira vez
        validateSingleField(fieldName, data[fieldName]);
    }, [data, validateSingleField]);

    const validateAll = useCallback(() => {
        const validation = validateForm(data, validationRules);

        const newErrors: Record<string, string[]> = {};
        for (const [fieldName, fieldValidation] of Object.entries(validation.fields)) {
            newErrors[fieldName] = fieldValidation.errors;
        }

        setErrors(newErrors);
        return validation.isValid;
    }, [data, validationRules]);

    const reset = useCallback(() => {
        setData(initialData);
        setErrors({});
        setTouchedState({});
    }, [initialData]);

    const hasErrors = Object.values(errors).some(fieldErrors => fieldErrors.length > 0);

    return {
        data,
        errors,
        touched,
        setValue,
        setTouched: markFieldAsTouched,
        validateAll,
        reset,
        hasErrors,
        isValid: !hasErrors,
    };
}

// ==========================================
// UTILITÁRIOS ADICIONAIS
// ==========================================

export const formatErrorMessage = (errors: string[]): string => {
    return errors.join(', ');
};

export const getFirstError = (errors: string[]): string | null => {
    return errors.length > 0 ? errors[0] : null;
};

export const hasFieldError = (errors: Record<string, string[]>, fieldName: string): boolean => {
    return errors[fieldName] && errors[fieldName].length > 0;
};

export const getFieldError = (errors: Record<string, string[]>, fieldName: string): string | null => {
    return getFirstError(errors[fieldName] || []);
};