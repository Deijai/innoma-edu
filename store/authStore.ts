// store/authStore.ts - Versão COMPLETA e SIMPLIFICADA

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { create } from 'zustand';
import { auth, db } from '../config/firebase';
import { User } from '../types';

interface AuthStore {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Auth methods
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  loadUser: () => Promise<void>;
  initializeAuth: () => () => void;

  // Helper methods
  hasRole: (role: string) => boolean;
  isStudent: () => boolean;
  isTeacher: () => boolean;
  isDirector: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  firebaseUser: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Atualizar último login
      await updateDoc(doc(db, 'users', result.user.uid), {
        lastLogin: serverTimestamp()
      });

      return true;
    } catch (error: any) {
      console.error('Erro no login:', error);

      let errorMessage = 'Erro ao fazer login';

      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Email ou senha incorretos';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Conta desativada';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
      }

      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (name: string, email: string, password: string, role = 'student') => {
    set({ isLoading: true });

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Atualizar perfil
      await updateProfile(result.user, {
        displayName: name
      });

      // Criar documento do usuário
      await setDoc(doc(db, 'users', result.user.uid), {
        id: result.user.uid,
        email: result.user.email!,
        name,
        role: role as 'student' | 'teacher' | 'director',
        schoolId: '',
        isActive: role === 'student' ? true : false, // Estudantes ativos, outros precisam aprovação
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });

      return true;
    } catch (error: any) {
      console.error('Erro no signup:', error);

      let errorMessage = 'Erro ao criar conta';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email já está em uso';
          break;
        case 'auth/weak-password':
          errorMessage = 'A senha deve ter pelo menos 6 caracteres';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet';
          break;
      }

      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await signOut(auth);

      set({
        user: null,
        firebaseUser: null,
        isAuthenticated: false,
        isInitialized: false
      });

      await AsyncStorage.clear();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true });

    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);

      let errorMessage = 'Erro ao enviar email de recuperação';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Email não encontrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet';
          break;
      }

      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  loadUser: async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');

      if (savedUser) {
        const user = JSON.parse(savedUser);
        set({
          user,
          isAuthenticated: true,
          isInitialized: true
        });
      } else {
        set({ isInitialized: true });
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      set({ isInitialized: true });
    }
  },

  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Buscar dados do usuário no Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();

            // Verificar se usuário está ativo
            if (!userData.isActive) {
              await signOut(auth);
              set({ isInitialized: true });
              return;
            }

            const user: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: userData.name || '',
              role: userData.role as 'student' | 'teacher' | 'director',
              schoolId: userData.schoolId || '',
              avatar: firebaseUser.photoURL || undefined,
              isActive: userData.isActive || false,
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
              lastLogin: userData.lastLogin?.toDate(),
              fcmToken: userData.fcmToken,
            };

            set({
              user,
              firebaseUser,
              isAuthenticated: true,
              isInitialized: true
            });

            // Salvar no AsyncStorage
            await AsyncStorage.setItem('user', JSON.stringify(user));
          } else {
            await signOut(auth);
            set({ isInitialized: true });
          }
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          set({ isInitialized: true });
        }
      } else {
        set({
          user: null,
          firebaseUser: null,
          isAuthenticated: false,
          isInitialized: true
        });

        await AsyncStorage.removeItem('user');
      }
    });

    return unsubscribe;
  },

  // Helper methods
  hasRole: (role: string) => {
    const { user } = get();
    return user?.role === role;
  },

  isStudent: () => {
    return get().hasRole('student');
  },

  isTeacher: () => {
    return get().hasRole('teacher');
  },

  isDirector: () => {
    return get().hasRole('director');
  },
}));

// Inicializar auth automaticamente
let authUnsubscribe: (() => void) | null = null;

export const initializeAuthListener = () => {
  if (authUnsubscribe) {
    authUnsubscribe();
  }
  authUnsubscribe = useAuthStore.getState().initializeAuth();
  return authUnsubscribe;
};

// Helper functions para uso externo
export const getCurrentUser = () => {
  return useAuthStore.getState().user;
};

export const isUserAuthenticated = () => {
  return useAuthStore.getState().isAuthenticated;
};

export const getUserRole = () => {
  return useAuthStore.getState().user?.role;
};

export const isTeacher = () => {
  return useAuthStore.getState().hasRole('teacher');
};

export const isStudent = () => {
  return useAuthStore.getState().hasRole('student');
};

export const isDirector = () => {
  return useAuthStore.getState().hasRole('director');
};

export const hasRole = (role: string) => {
  return useAuthStore.getState().hasRole(role);
};