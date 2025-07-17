import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  IdTokenResult,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { create } from 'zustand';
import { auth, db, functions } from '../config/firebase';
import { User } from '../types';
import { FirebaseCustomClaims, FirebaseUser as FirestoreUser, Permission, ROLE_PERMISSIONS } from '../types/firebase';

interface AuthStore {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: string | null;
  userPermissions: Permission[];
  schoolId: string | null;
  customClaims: FirebaseCustomClaims | null;

  // Auth methods
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;

  // User management
  updateUserProfile: (data: Partial<Omit<User, 'id'>>) => Promise<boolean>;
  setUserRole: (userId: string, role: string, schoolId: string) => Promise<boolean>;

  // Permission checks
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  canAccessResource: (resource: string, action: string) => boolean;

  // Initialize
  initializeAuth: () => void;
  refreshUserData: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  firebaseUser: null,
  isAuthenticated: false,
  isLoading: false,
  userRole: null,
  userPermissions: [],
  schoolId: null,
  customClaims: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true });

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Atualizar último login
      await updateDoc(doc(db, 'users', result.user.uid), {
        lastLogin: serverTimestamp()
      });

      // Forçar refresh do token para obter custom claims atualizadas
      await result.user.getIdToken(true);

      return true;
    } catch (error: any) {
      console.error('Erro no login:', error);

      // Tratamento de erros específicos
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          throw new Error('Email ou senha incorretos');
        case 'auth/user-disabled':
          throw new Error('Conta desativada');
        case 'auth/too-many-requests':
          throw new Error('Muitas tentativas. Tente novamente mais tarde');
        default:
          throw new Error('Erro ao fazer login');
      }
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (email: string, password: string, name: string, role = 'student') => {
    set({ isLoading: true });

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Atualizar perfil do Firebase Auth
      await updateProfile(result.user, {
        displayName: name
      });

      // Criar documento do usuário no Firestore
      const userData: Partial<FirestoreUser> = {
        id: result.user.uid,
        email: result.user.email!,
        name,
        role: role as 'student' | 'teacher' | 'director',
        schoolId: '', // Será definido pelo diretor
        isActive: true,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
        lastLogin: serverTimestamp() as any,
      };

      await setDoc(doc(db, 'users', result.user.uid), userData);

      // Se não for estudante, necessita aprovação do diretor
      if (role !== 'student') {
        // Criar notificação para diretores
        await createApprovalNotification(result.user.uid, name, role);
      }

      return true;
    } catch (error: any) {
      console.error('Erro no signup:', error);

      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('Email já está em uso');
        case 'auth/weak-password':
          throw new Error('Senha muito fraca');
        case 'auth/invalid-email':
          throw new Error('Email inválido');
        default:
          throw new Error('Erro ao criar conta');
      }
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await signOut(auth);

      // Limpar dados do store
      set({
        user: null,
        firebaseUser: null,
        isAuthenticated: false,
        userRole: null,
        userPermissions: [],
        schoolId: null,
        customClaims: null
      });

      // Limpar dados locais
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

      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('Email não encontrado');
        case 'auth/invalid-email':
          throw new Error('Email inválido');
        default:
          throw new Error('Erro ao enviar email de recuperação');
      }
    } finally {
      set({ isLoading: false });
    }
  },

  updateUserProfile: async (data: Partial<Omit<User, 'id'>>) => {
    const currentUser = get().firebaseUser;
    const userId = get().user?.id;

    if (!currentUser || !userId) {
      throw new Error('Usuário não autenticado');
    }

    set({ isLoading: true });

    try {
      // Atualizar no Firestore
      await updateDoc(doc(db, 'users', userId), {
        ...data,
        updatedAt: serverTimestamp()
      });

      // Atualizar perfil do Firebase Auth se necessário
      if (data.name) {
        await updateProfile(currentUser, {
          displayName: data.name
        });
      }

      // Atualizar store local
      set(state => ({
        user: state.user ? { ...state.user, ...data } : null
      }));

      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw new Error('Erro ao atualizar perfil');
    } finally {
      set({ isLoading: false });
    }
  },

  setUserRole: async (userId: string, role: string, schoolId: string) => {
    const setUserRoleFunction = httpsCallable(functions, 'setUserRole');

    try {
      const result = await setUserRoleFunction({ userId, role, schoolId });
      return (result.data as any).success;
    } catch (error: any) {
      console.error('Erro ao definir role:', error);
      throw new Error(error.message || 'Erro ao definir role do usuário');
    }
  },

  hasPermission: (permission: Permission) => {
    const { userPermissions } = get();
    return userPermissions.includes(permission);
  },

  hasRole: (role: string) => {
    const { userRole } = get();
    return userRole === role;
  },

  hasAnyPermission: (permissions: Permission[]) => {
    const { userPermissions } = get();
    return permissions.some(permission => userPermissions.includes(permission));
  },

  canAccessResource: (resource: string, action: string) => {
    const { userRole, userPermissions } = get();

    // Diretores têm acesso total
    if (userRole === 'director') return true;

    // Verificar permissões específicas
    const requiredPermission = `${action}_${resource}` as Permission;
    return userPermissions.includes(requiredPermission);
  },

  refreshUserData: async () => {
    const currentUser = get().firebaseUser;
    if (!currentUser) return;

    try {
      // Forçar refresh do token
      await currentUser.getIdToken(true);

      // Recarregar dados do Firestore
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const user: User = {
          id: currentUser.uid,
          email: currentUser.email!,
          name: userData.name || '',
          role: userData.role as 'student' | 'teacher' | 'director',
          schoolId: userData.schoolId || '',
          avatar: currentUser.photoURL || undefined,
          isActive: userData.isActive || false,
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
          lastLogin: userData.lastLogin?.toDate(),
          fcmToken: userData.fcmToken,
        };

        set({ user });
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  },

  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Obter custom claims
          const idTokenResult: IdTokenResult = await firebaseUser.getIdTokenResult();
          const customClaims = idTokenResult.claims as unknown as FirebaseCustomClaims;

          // Buscar dados completos do Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();

            // Verificar se usuário está ativo
            if (!userData.isActive) {
              await signOut(auth);
              throw new Error('Conta desativada');
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

            const userPermissions = ROLE_PERMISSIONS[user.role] || [];

            set({
              user,
              firebaseUser,
              isAuthenticated: true,
              userRole: user.role,
              userPermissions,
              schoolId: user.schoolId,
              customClaims,
            });

            // Salvar dados locais para uso offline
            await AsyncStorage.setItem('user', JSON.stringify(user));
            await AsyncStorage.setItem('userRole', user.role);
            await AsyncStorage.setItem('schoolId', user.schoolId);
          } else {
            // Usuário não existe no Firestore, fazer logout
            await signOut(auth);
          }
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          await signOut(auth);
        }
      } else {
        // Usuário não autenticado
        set({
          user: null,
          firebaseUser: null,
          isAuthenticated: false,
          userRole: null,
          userPermissions: [],
          schoolId: null,
          customClaims: null,
        });

        // Limpar dados locais
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('userRole');
        await AsyncStorage.removeItem('schoolId');
      }
    });

    return unsubscribe;
  },
}));

// Helper function para criar notificação de aprovação
async function createApprovalNotification(userId: string, userName: string, role: string) {
  const createNotificationFunction = httpsCallable(functions, 'createApprovalNotification');
  await createNotificationFunction({ userId, userName, role });
}

// Helper functions para uso externo
export const getCurrentUser = () => {
  return useAuthStore.getState().user;
};

export const isUserAuthenticated = () => {
  return useAuthStore.getState().isAuthenticated;
};

export const getUserRole = () => {
  return useAuthStore.getState().userRole;
};

export const getUserPermissions = () => {
  return useAuthStore.getState().userPermissions;
};

export const isTeacher = () => {
  return getUserRole() === 'teacher';
};

export const isStudent = () => {
  return getUserRole() === 'student';
};

export const isDirector = () => {
  return getUserRole() === 'director';
};

export const hasPermission = (permission: Permission) => {
  return useAuthStore.getState().hasPermission(permission);
};

export const hasRole = (role: string) => {
  return useAuthStore.getState().hasRole(role);
};