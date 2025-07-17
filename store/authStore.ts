import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: 'student' | 'teacher') => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  loadUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<boolean>;
}

// Mock users data for development
const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@student.com',
    role: 'student',
    avatar: 'https://via.placeholder.com/100',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@teacher.com',
    role: 'teacher',
    avatar: 'https://via.placeholder.com/100',
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos@student.com',
    role: 'student',
    avatar: 'https://via.placeholder.com/100',
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@teacher.com',
    role: 'teacher',
    avatar: 'https://via.placeholder.com/100',
  },
];

// Simulate database storage
let userDatabase = [...mockUsers];

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in mock database
      const user = userDatabase.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      // Simple password validation (in real app, use proper hashing)
      if (user && password === '123456') {
        set({ user, isAuthenticated: true });
        
        // Persist user data
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('isAuthenticated', 'true');
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  signup: async (name: string, email: string, password: string, role: 'student' | 'teacher') => {
    set({ isLoading: true });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const existingUser = userDatabase.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (existingUser) {
        return false; // User already exists
      }
      
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role,
        avatar: 'https://via.placeholder.com/100',
      };
      
      // Add to mock database
      userDatabase.push(newUser);
      
      set({ user: newUser, isAuthenticated: true });
      
      // Persist user data
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      await AsyncStorage.setItem('isAuthenticated', 'true');
      
      return true;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  logout: async () => {
    try {
      set({ user: null, isAuthenticated: false });
      
      // Clear persisted data
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('isAuthenticated');
      
      // Clear other app data if needed
      await AsyncStorage.removeItem('theme');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  },
  
  resetPassword: async (email: string) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists
      const user = userDatabase.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (user) {
        // In a real app, you would send a reset password email
        console.log(`Password reset email sent to ${email}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadUser: async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
      
      if (savedUser && isAuthenticated === 'true') {
        const user = JSON.parse(savedUser);
        
        // Verify user still exists in database
        const userExists = userDatabase.find(u => u.id === user.id);
        
        if (userExists) {
          set({ user, isAuthenticated: true });
        } else {
          // User no longer exists, clear storage
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('isAuthenticated');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      // Clear potentially corrupted data
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('isAuthenticated');
    }
  },
  
  updateUser: async (userData: Partial<User>) => {
    const currentUser = get().user;
    
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }
    
    set({ isLoading: true });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update user in mock database
      const userIndex = userDatabase.findIndex(u => u.id === currentUser.id);
      
      if (userIndex !== -1) {
        const updatedUser = { ...currentUser, ...userData };
        userDatabase[userIndex] = updatedUser;
        
        set({ user: updatedUser });
        
        // Persist updated user data
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteAccount: async () => {
    const currentUser = get().user;
    
    if (!currentUser) {
      return false;
    }
    
    set({ isLoading: true });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove user from mock database
      userDatabase = userDatabase.filter(u => u.id !== currentUser.id);
      
      // Clear all user data
      set({ user: null, isAuthenticated: false });
      
      // Clear persisted data
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('isAuthenticated');
      await AsyncStorage.clear(); // Clear all app data
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Helper functions for external use
export const getCurrentUser = () => {
  return useAuthStore.getState().user;
};

export const isUserAuthenticated = () => {
  return useAuthStore.getState().isAuthenticated;
};

export const getUserRole = () => {
  const user = useAuthStore.getState().user;
  return user?.role || null;
};

export const isTeacher = () => {
  return getUserRole() === 'teacher';
};

export const isStudent = () => {
  return getUserRole() === 'student';
};