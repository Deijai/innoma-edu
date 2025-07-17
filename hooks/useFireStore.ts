import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentData,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    QueryConstraint,
    QueryDocumentSnapshot,
    serverTimestamp,
    startAfter,
    Unsubscribe,
    updateDoc,
    where
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import { FirebaseClass, FirebaseMessage, FirebaseSubmission, FirebaseTask, FirebaseUser } from '../types/firebase';

// ========================================
// INTERFACES DOS HOOKS
// ========================================

interface FirestoreHookResult<T> {
    data: T[];
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

interface FirestoreDocumentResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

interface PaginatedResult<T> {
    data: T[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    refresh: () => void;
}

interface SchoolStats {
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalTasks: number;
    loading: boolean;
}

// ========================================
// HOOK PRINCIPAL
// ========================================

export const useFirestore = () => {
    const { user, schoolId, isAuthenticated } = useAuthStore();

    // ========================================
    // 1. HOOK GENÉRICO PARA COLEÇÕES
    // ========================================
    const useCollection = <T = DocumentData>(
        collectionName: string,
        constraints: QueryConstraint[] = [],
        dependencies: any[] = []
    ): FirestoreHookResult<T> => {
        const [data, setData] = useState<T[]>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        const refresh = useCallback(() => {
            setLoading(true);
            setError(null);
        }, []);

        useEffect(() => {
            if (!isAuthenticated || !user || constraints.length === 0) {
                setData([]);
                setLoading(false);
                return;
            }

            let unsubscribe: Unsubscribe | null = null;

            try {
                const q = query(collection(db, collectionName), ...constraints);

                unsubscribe = onSnapshot(q,
                    (snapshot) => {
                        const documents = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        })) as T[];

                        setData(documents);
                        setLoading(false);
                        setError(null);
                    },
                    (error) => {
                        console.error(`Error in useCollection(${collectionName}):`, error);
                        setError(error.message);
                        setLoading(false);
                    }
                );
            } catch (error: any) {
                console.error(`Error setting up listener for ${collectionName}:`, error);
                setError(error.message);
                setLoading(false);
            }

            return () => {
                if (unsubscribe) {
                    unsubscribe();
                }
            };
        }, [isAuthenticated, user, collectionName, JSON.stringify(constraints), ...dependencies]);

        return { data, loading, error, refresh };
    };

    // ========================================
    // 2. HOOK PARA DOCUMENTO ÚNICO
    // ========================================
    const useDocument = <T = DocumentData>(
        collectionName: string,
        docId: string
    ): FirestoreDocumentResult<T> => {
        const [data, setData] = useState<T | null>(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        const refresh = useCallback(() => {
            setLoading(true);
            setError(null);
        }, []);

        useEffect(() => {
            if (!docId || !isAuthenticated) {
                setData(null);
                setLoading(false);
                return;
            }

            const docRef = doc(db, collectionName, docId);

            const unsubscribe = onSnapshot(docRef,
                (doc) => {
                    if (doc.exists()) {
                        setData({ id: doc.id, ...doc.data() } as T);
                    } else {
                        setData(null);
                    }
                    setLoading(false);
                    setError(null);
                },
                (error) => {
                    console.error(`Error in useDocument(${collectionName}/${docId}):`, error);
                    setError(error.message);
                    setLoading(false);
                }
            );

            return unsubscribe;
        }, [collectionName, docId, isAuthenticated]);

        return { data, loading, error, refresh };
    };

    // ========================================
    // 3. HOOK PARA PAGINAÇÃO
    // ========================================
    const usePaginatedCollection = <T = DocumentData>(
        collectionName: string,
        constraints: QueryConstraint[] = [],
        pageSize: number = 20
    ): PaginatedResult<T> => {
        const [data, setData] = useState<T[]>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
        const [hasMore, setHasMore] = useState(true);

        const refresh = useCallback(() => {
            setData([]);
            setLoading(true);
            setError(null);
            setLastDoc(null);
            setHasMore(true);
        }, []);

        const loadMore = useCallback(async () => {
            if (loading || !hasMore || !isAuthenticated) return;

            setLoading(true);

            try {
                const q = query(
                    collection(db, collectionName),
                    ...constraints,
                    ...(lastDoc ? [startAfter(lastDoc)] : []),
                    limit(pageSize)
                );

                const snapshot = await getDocs(q);
                const newDocs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as T[];

                setData(prev => lastDoc ? [...prev, ...newDocs] : newDocs);
                setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
                setHasMore(snapshot.docs.length === pageSize);
                setError(null);
            } catch (error: any) {
                console.error(`Error in loadMore(${collectionName}):`, error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }, [collectionName, constraints, pageSize, lastDoc, loading, hasMore, isAuthenticated]);

        useEffect(() => {
            loadMore();
        }, []);

        return { data, loading, error, hasMore, loadMore, refresh };
    };

    // ========================================
    // 4. HELPER PARA CONSTRAINTS BASEADAS EM ROLE
    // ========================================
    const getConstraintsForRole = (resourceType: string): QueryConstraint[] => {
        if (!user || !schoolId) return [];

        const baseConstraints: QueryConstraint[] = [where('isActive', '==', true)];

        switch (resourceType) {
            case 'classes':
                switch (user.role) {
                    case 'teacher':
                        return [...baseConstraints, where('teacherId', '==', user.id)];
                    case 'student':
                        return [...baseConstraints, where('studentIds', 'array-contains', user.id)];
                    case 'director':
                        return [...baseConstraints, where('schoolId', '==', schoolId)];
                    default:
                        return [];
                }

            case 'tasks':
                switch (user.role) {
                    case 'teacher':
                        return [...baseConstraints, where('createdBy', '==', user.id), orderBy('createdAt', 'desc')];
                    case 'director':
                        return [...baseConstraints, where('schoolId', '==', schoolId), orderBy('createdAt', 'desc')];
                    default:
                        return [];
                }

            case 'users':
                if (user.role === 'director') {
                    return [...baseConstraints, where('schoolId', '==', schoolId), orderBy('name', 'asc')];
                }
                return [];

            default:
                return [];
        }
    };

    // ========================================
    // 5. HOOKS ESPECÍFICOS
    // ========================================

    // Hook para turmas do usuário
    const useMyClasses = (): FirestoreHookResult<FirebaseClass> => {
        const constraints = getConstraintsForRole('classes');
        return useCollection<FirebaseClass>('classes', constraints, [user?.role, user?.id, schoolId]);
    };

    // Hook para tarefas do usuário
    const useMyTasks = (): FirestoreHookResult<FirebaseTask> => {
        const [tasks, setTasks] = useState<FirebaseTask[]>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        const refresh = useCallback(() => {
            setLoading(true);
            setError(null);
        }, []);

        useEffect(() => {
            if (!user || !isAuthenticated) {
                setTasks([]);
                setLoading(false);
                return;
            }

            let unsubscribe: Unsubscribe | null = null;

            const setupTaskListener = async () => {
                try {
                    if (user.role === 'student') {
                        // Estudantes: primeiro buscar turmas, depois tarefas
                        const classesQuery = query(
                            collection(db, 'classes'),
                            where('studentIds', 'array-contains', user.id),
                            where('isActive', '==', true)
                        );

                        const classesSnapshot = await getDocs(classesQuery);
                        const classIds = classesSnapshot.docs.map(doc => doc.id);

                        if (classIds.length > 0) {
                            const tasksQuery = query(
                                collection(db, 'tasks'),
                                where('classId', 'in', classIds),
                                where('isActive', '==', true),
                                orderBy('dueDate', 'asc')
                            );

                            unsubscribe = onSnapshot(tasksQuery,
                                (snapshot) => {
                                    const taskData = snapshot.docs.map(doc => ({
                                        id: doc.id,
                                        ...doc.data()
                                    })) as FirebaseTask[];

                                    setTasks(taskData);
                                    setLoading(false);
                                    setError(null);
                                },
                                (error) => {
                                    console.error('Error in student tasks listener:', error);
                                    setError(error.message);
                                    setLoading(false);
                                }
                            );
                        } else {
                            setTasks([]);
                            setLoading(false);
                        }
                    } else {
                        // Professores e diretores: usar constraints diretas
                        const constraints = getConstraintsForRole('tasks');

                        if (constraints.length > 0) {
                            const tasksQuery = query(collection(db, 'tasks'), ...constraints);

                            unsubscribe = onSnapshot(tasksQuery,
                                (snapshot) => {
                                    const taskData = snapshot.docs.map(doc => ({
                                        id: doc.id,
                                        ...doc.data()
                                    })) as FirebaseTask[];

                                    setTasks(taskData);
                                    setLoading(false);
                                    setError(null);
                                },
                                (error) => {
                                    console.error('Error in tasks listener:', error);
                                    setError(error.message);
                                    setLoading(false);
                                }
                            );
                        } else {
                            setTasks([]);
                            setLoading(false);
                        }
                    }
                } catch (error: any) {
                    console.error('Error setting up tasks listener:', error);
                    setError(error.message);
                    setLoading(false);
                }
            };

            setupTaskListener();

            return () => {
                if (unsubscribe) {
                    unsubscribe();
                }
            };
        }, [user, isAuthenticated, schoolId]);

        return { data: tasks, loading, error, refresh };
    };

    // Hook para submissions de uma tarefa
    const useTaskSubmissions = (taskId: string): FirestoreHookResult<FirebaseSubmission> => {
        const constraints = taskId ? [
            where('taskId', '==', taskId),
            where('isActive', '==', true),
            orderBy('submittedAt', 'desc')
        ] : [];

        return useCollection<FirebaseSubmission>('submissions', constraints, [taskId]);
    };

    // Hook para mensagens de uma turma
    const useClassMessages = (classId: string): FirestoreHookResult<FirebaseMessage> => {
        const constraints = classId ? [
            where('targetType', '==', 'class'),
            where('targetId', '==', classId),
            orderBy('timestamp', 'asc')
        ] : [];

        return useCollection<FirebaseMessage>('messages', constraints, [classId]);
    };

    // Hook para usuários da escola
    const useSchoolUsers = (): FirestoreHookResult<FirebaseUser> => {
        const constraints = getConstraintsForRole('users');
        return useCollection<FirebaseUser>('users', constraints, [user?.role, schoolId]);
    };

    // Hook para estatísticas da escola
    const useSchoolStats = (): SchoolStats => {
        const [stats, setStats] = useState<SchoolStats>({
            totalUsers: 0,
            totalStudents: 0,
            totalTeachers: 0,
            totalClasses: 0,
            totalTasks: 0,
            loading: true
        });

        useEffect(() => {
            if (user?.role !== 'director' || !schoolId) {
                setStats(prev => ({ ...prev, loading: false }));
                return;
            }

            const fetchStats = async () => {
                try {
                    const [usersSnapshot, classesSnapshot, tasksSnapshot] = await Promise.all([
                        getDocs(query(collection(db, 'users'), where('schoolId', '==', schoolId))),
                        getDocs(query(collection(db, 'classes'), where('schoolId', '==', schoolId))),
                        getDocs(query(collection(db, 'tasks'), where('schoolId', '==', schoolId)))
                    ]);

                    const users = usersSnapshot.docs.map(doc => doc.data());
                    const students = users.filter(u => u.role === 'student');
                    const teachers = users.filter(u => u.role === 'teacher');

                    setStats({
                        totalUsers: users.length,
                        totalStudents: students.length,
                        totalTeachers: teachers.length,
                        totalClasses: classesSnapshot.size,
                        totalTasks: tasksSnapshot.size,
                        loading: false
                    });
                } catch (error) {
                    console.error('Error fetching school stats:', error);
                    setStats(prev => ({ ...prev, loading: false }));
                }
            };

            fetchStats();
        }, [user, schoolId]);

        return stats;
    };

    // ========================================
    // 6. FUNÇÕES CRUD
    // ========================================
    const createDocument = async (collectionName: string, data: any) => {
        if (!user || !schoolId) {
            throw new Error('Usuário não autenticado ou escola não definida');
        }

        try {
            const docRef = await addDoc(collection(db, collectionName), {
                ...data,
                schoolId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return { id: docRef.id, success: true };
        } catch (error: any) {
            console.error(`Error creating document in ${collectionName}:`, error);
            throw new Error(error.message);
        }
    };

    const updateDocument = async (collectionName: string, docId: string, data: any) => {
        try {
            await updateDoc(doc(db, collectionName, docId), {
                ...data,
                updatedAt: serverTimestamp()
            });

            return { success: true };
        } catch (error: any) {
            console.error(`Error updating document in ${collectionName}:`, error);
            throw new Error(error.message);
        }
    };

    const deleteDocument = async (collectionName: string, docId: string) => {
        try {
            await deleteDoc(doc(db, collectionName, docId));
            return { success: true };
        } catch (error: any) {
            console.error(`Error deleting document in ${collectionName}:`, error);
            throw new Error(error.message);
        }
    };

    const softDeleteDocument = async (collectionName: string, docId: string) => {
        try {
            await updateDoc(doc(db, collectionName, docId), {
                isActive: false,
                updatedAt: serverTimestamp()
            });

            return { success: true };
        } catch (error: any) {
            console.error(`Error soft deleting document in ${collectionName}:`, error);
            throw new Error(error.message);
        }
    };

    // ========================================
    // 7. RETORNO DO HOOK
    // ========================================
    return {
        // Hooks genéricos
        useCollection,
        useDocument,
        usePaginatedCollection,

        // Hooks específicos
        useMyClasses,
        useMyTasks,
        useTaskSubmissions,
        useClassMessages,
        useSchoolUsers,
        useSchoolStats,

        // Funções CRUD
        createDocument,
        updateDocument,
        deleteDocument,
        softDeleteDocument,
    };
};

// ========================================
// EXEMPLO DE USO
// ========================================

/*
import { useFirestore } from '../hooks/useFirestore';

const MyComponent = () => {
  const { useMyClasses, useMyTasks, useSchoolStats } = useFirestore();
  
  // Hooks específicos
  const { data: classes, loading: classesLoading, error: classesError } = useMyClasses();
  const { data: tasks, loading: tasksLoading, error: tasksError } = useMyTasks();
  const stats = useSchoolStats();
  
  // Hook genérico customizado
  const { data: submissions } = useTaskSubmissions('task-id-123');
  
  // CRUD operations
  const { createDocument, updateDocument, softDeleteDocument } = useFirestore();
  
  const handleCreateClass = async () => {
    try {
      await createDocument('classes', {
        name: 'Nova Turma',
        subject: 'Matemática',
        teacherId: 'teacher-id',
        studentIds: []
      });
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };
  
  return (
    <div>
      <h1>Minhas Turmas ({classes.length})</h1>
      <h2>Minhas Tarefas ({tasks.length})</h2>
      <h3>Estatísticas: {stats.totalUsers} usuários</h3>
    </div>
  );
};
*/