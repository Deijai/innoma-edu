// hooks/useRoleBasedData.ts - Sistema completo de hierarquia

import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';

// ============================================
// 1. HOOK PARA TURMAS BASEADO NO ROLE
// ============================================

export const useMyClasses = () => {
    const { user } = useAuthStore();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            setClasses([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        let q;

        try {
            if (user.role === 'director') {
                // Diretor vê todas as turmas da escola
                q = query(
                    collection(db, 'classes'),
                    where('schoolId', '==', user.schoolId),
                    where('isActive', '==', true),
                    orderBy('name', 'asc')
                );
            }
            else if (user.role === 'teacher') {
                // Professor vê apenas suas turmas
                q = query(
                    collection(db, 'classes'),
                    where('teacherId', '==', user.id),
                    where('isActive', '==', true),
                    orderBy('name', 'asc')
                );
            }
            else if (user.role === 'student') {
                // Estudante vê apenas turmas onde está matriculado
                q = query(
                    collection(db, 'classes'),
                    where('studentIds', 'array-contains', user.id),
                    where('isActive', '==', true),
                    orderBy('name', 'asc')
                );
            }

            if (q) {
                const unsubscribe = onSnapshot(q,
                    (snapshot) => {
                        const classesData = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                        setClasses(classesData as any);
                        setLoading(false);
                        setError(null);
                    },
                    (error: any) => {
                        console.error('Erro ao carregar turmas:', error);
                        setError(error.message);
                        setLoading(false);
                    }
                );

                return unsubscribe;
            }
        } catch (error: any) {
            console.error('Erro ao configurar listener de turmas:', error);
            setError(error.message);
            setLoading(false);
        }
    }, [user]);

    return { classes, loading, error };
};

// ============================================
// 2. HOOK PARA TAREFAS BASEADO NO ROLE
// ============================================

export const useMyTasks = () => {
    const { user } = useAuthStore();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            setTasks([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const loadTasks = async () => {
            try {
                if (user.role === 'director') {
                    // Diretor vê todas as tarefas da escola
                    const q = query(
                        collection(db, 'tasks'),
                        where('schoolId', '==', user.schoolId),
                        where('isActive', '==', true),
                        orderBy('dueDate', 'asc')
                    );

                    const unsubscribe = onSnapshot(q, (snapshot) => {
                        const tasksData = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                            dueDate: doc.data().dueDate?.toDate() || new Date()
                        }));
                        setTasks(tasksData as any);
                        setLoading(false);
                    });

                    return unsubscribe;
                }
                else if (user.role === 'teacher') {
                    // Professor vê apenas tarefas que criou
                    const q = query(
                        collection(db, 'tasks'),
                        where('createdBy', '==', user.id),
                        where('isActive', '==', true),
                        orderBy('dueDate', 'asc')
                    );

                    const unsubscribe = onSnapshot(q, (snapshot) => {
                        const tasksData = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                            dueDate: doc.data().dueDate?.toDate() || new Date()
                        }));
                        setTasks(tasksData as any);
                        setLoading(false);
                    });

                    return unsubscribe;
                }
                else if (user.role === 'student') {
                    // Estudante: primeiro pegar suas turmas, depois as tarefas
                    const classesQuery = query(
                        collection(db, 'classes'),
                        where('studentIds', 'array-contains', user.id),
                        where('isActive', '==', true)
                    );

                    const classesSnapshot = await getDocs(classesQuery);
                    const classIds = classesSnapshot.docs.map(doc => doc.id);

                    if (classIds.length > 0) {
                        const q = query(
                            collection(db, 'tasks'),
                            where('classId', 'in', classIds),
                            where('isActive', '==', true),
                            orderBy('dueDate', 'asc')
                        );

                        const unsubscribe = onSnapshot(q, (snapshot) => {
                            const tasksData = snapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data(),
                                dueDate: doc.data().dueDate?.toDate() || new Date()
                            }));
                            setTasks(tasksData as any);
                            setLoading(false);
                        });

                        return unsubscribe;
                    } else {
                        setTasks([]);
                        setLoading(false);
                    }
                }
            } catch (error: any) {
                console.error('Erro ao carregar tarefas:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        loadTasks();
    }, [user]);

    return { tasks, loading, error };
};

// ============================================
// 3. HOOK PARA AULAS BASEADO NO ROLE
// ============================================

export const useMySessions = () => {
    const { user } = useAuthStore();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            setSessions([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const loadSessions = async () => {
            try {
                if (user.role === 'director') {
                    // Diretor vê todas as aulas da escola
                    const q = query(
                        collection(db, 'classes'),
                        where('schoolId', '==', user.schoolId),
                        where('isActive', '==', true),
                        orderBy('createdAt', 'desc')
                    );

                    const unsubscribe = onSnapshot(q, (snapshot) => {
                        const sessionsData = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                            date: doc.data().date?.toDate() || new Date()
                        }));
                        setSessions(sessionsData as any);
                        setLoading(false);
                    });

                    return unsubscribe;
                }
                else if (user.role === 'teacher') {
                    // Professor vê apenas suas aulas
                    const q = query(
                        collection(db, 'classes'),
                        where('teacherId', '==', user.id),
                        where('isActive', '==', true),
                        orderBy('createdAt', 'desc')
                    );

                    const unsubscribe = onSnapshot(q, (snapshot) => {
                        const sessionsData = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                            date: doc.data().date?.toDate() || new Date()
                        }));
                        setSessions(sessionsData as any);
                        setLoading(false);
                    });

                    return unsubscribe;
                }
                else if (user.role === 'student') {
                    // Estudante: pegar suas turmas (que são suas aulas)
                    const classesQuery = query(
                        collection(db, 'classes'),
                        where('studentIds', 'array-contains', user.id),
                        where('isActive', '==', true),
                        orderBy('createdAt', 'desc')
                    );

                    const unsubscribe = onSnapshot(classesQuery, (snapshot) => {
                        const sessionsData = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                            date: doc.data().createdAt?.toDate() || new Date()
                        }));
                        setSessions(sessionsData as any);
                        setLoading(false);
                    });

                    return unsubscribe;
                }
            } catch (error: any) {
                console.error('Erro ao carregar aulas:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        loadSessions();
    }, [user]);

    return { sessions, loading, error };
};

// ============================================
// 4. HOOK PARA ESTUDANTES DE UMA TURMA
// ============================================

export const useClassStudents = (classId: any) => {
    const { user } = useAuthStore();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user || !classId) {
            setStudents([]);
            setLoading(false);
            return;
        }

        // Só professor da turma ou diretor pode ver estudantes
        if (user.role !== 'teacher' && user.role !== 'director') {
            setStudents([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const loadStudents = async () => {
            try {
                // Primeiro, pegar a turma para ver os studentIds
                const classDoc = await getDoc(doc(db, 'classes', classId));

                if (!classDoc.exists()) {
                    setStudents([]);
                    setLoading(false);
                    return;
                }

                const classData = classDoc.data();
                const studentIds = classData.studentIds || [];

                if (studentIds.length === 0) {
                    setStudents([]);
                    setLoading(false);
                    return;
                }

                // Depois, pegar os dados dos estudantes
                const studentsQuery = query(
                    collection(db, 'users'),
                    where('__name__', 'in', studentIds),
                    where('role', '==', 'student'),
                    where('isActive', '==', true)
                );

                const unsubscribe = onSnapshot(studentsQuery, (snapshot) => {
                    const studentsData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setStudents(studentsData as any);
                    setLoading(false);
                });

                return unsubscribe;
            } catch (error: any) {
                console.error('Erro ao carregar estudantes:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        loadStudents();
    }, [user, classId]);

    return { students, loading, error };
};

// ============================================
// 5. HOOK PARA VERIFICAR ACESSO A TURMA
// ============================================

export const useClassAccess = (classId: any) => {
    const { user } = useAuthStore();
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [classData, setClassData] = useState(null);

    useEffect(() => {
        if (!user || !classId) {
            setHasAccess(false);
            setLoading(false);
            return;
        }

        const checkAccess = async () => {
            try {
                const classDoc = await getDoc(doc(db, 'classes', classId));

                if (!classDoc.exists()) {
                    setHasAccess(false);
                    setClassData(null);
                    setLoading(false);
                    return;
                }

                const classInfo = classDoc.data();
                setClassData(classInfo as any);

                // Verificar acesso baseado no role
                let access = false;

                if (user.role === 'director' && classInfo.schoolId === user.schoolId) {
                    access = true;
                } else if (user.role === 'teacher' && classInfo.teacherId === user.id) {
                    access = true;
                } else if (user.role === 'student' && classInfo.studentIds?.includes(user.id)) {
                    access = true;
                }

                setHasAccess(access);
                setLoading(false);
            } catch (error) {
                console.error('Erro ao verificar acesso:', error);
                setHasAccess(false);
                setLoading(false);
            }
        };

        checkAccess();
    }, [user, classId]);

    return { hasAccess, loading, classData };
};

// ============================================
// 6. HOOK PARA GERENCIAR ESTUDANTES
// ============================================

export const useClassManagement = (classId: any) => {
    const { user } = useAuthStore();

    const addStudentToClass = useCallback(async (studentId: any) => {
        if (!user || (user.role !== 'teacher' && user.role !== 'director')) {
            throw new Error('Sem permissão para adicionar estudantes');
        }

        try {
            await updateDoc(doc(db, 'classes', classId), {
                studentIds: arrayUnion(studentId),
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Erro ao adicionar estudante:', error);
            throw error;
        }
    }, [user, classId]);

    const removeStudentFromClass = useCallback(async (studentId: any) => {
        if (!user || (user.role !== 'teacher' && user.role !== 'director')) {
            throw new Error('Sem permissão para remover estudantes');
        }

        try {
            await updateDoc(doc(db, 'classes', classId), {
                studentIds: arrayRemove(studentId),
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Erro ao remover estudante:', error);
            throw error;
        }
    }, [user, classId]);

    const getAvailableStudents = useCallback(async () => {
        if (!user || (user.role !== 'teacher' && user.role !== 'director')) {
            return [];
        }

        try {
            // Buscar todos os estudantes da escola
            const studentsQuery = query(
                collection(db, 'users'),
                where('schoolId', '==', user.schoolId),
                where('role', '==', 'student'),
                where('isActive', '==', true)
            );

            const studentsSnapshot = await getDocs(studentsQuery);
            const allStudents = studentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Buscar estudantes já matriculados na turma
            const classDoc = await getDoc(doc(db, 'classes', classId));
            const classData = classDoc.data();
            const enrolledIds = classData?.studentIds || [];

            // Filtrar estudantes disponíveis
            const availableStudents = allStudents.filter(
                student => !enrolledIds.includes(student.id)
            );

            return availableStudents;
        } catch (error) {
            console.error('Erro ao buscar estudantes disponíveis:', error);
            return [];
        }
    }, [user, classId]);

    return {
        addStudentToClass,
        removeStudentFromClass,
        getAvailableStudents
    };
};

// ============================================
// 7. HOOK PARA CRIAR TAREFAS
// ============================================

export const useTaskCreation = () => {
    const { user } = useAuthStore();

    const createTask = useCallback(async (taskData: any) => {
        if (!user || (user.role !== 'teacher' && user.role !== 'director')) {
            throw new Error('Sem permissão para criar tarefas');
        }

        try {
            const newTask = {
                ...taskData,
                createdBy: user.id,
                createdByName: user.name,
                schoolId: user.schoolId,
                isActive: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'tasks'), newTask);
            return { id: docRef.id, ...newTask };
        } catch (error) {
            console.error('Erro ao criar tarefa:', error);
            throw error;
        }
    }, [user]);

    return { createTask };
};

// ============================================
// 8. HOOK PARA CRIAR AULAS
// ============================================

export const useClassCreation = () => {
    const { user } = useAuthStore();

    const createClass = useCallback(async (classData: any) => {
        if (!user || (user.role !== 'teacher' && user.role !== 'director')) {
            throw new Error('Sem permissão para criar aulas');
        }

        try {
            const newClass = {
                ...classData,
                teacherId: user.id,
                teacherName: user.name,
                schoolId: user.schoolId,
                studentIds: [],
                isActive: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'classes'), newClass);
            return { id: docRef.id, ...newClass };
        } catch (error) {
            console.error('Erro ao criar aula:', error);
            throw error;
        }
    }, [user]);

    return { createClass };
};

// ============================================
// 9. HOOK PARA ESTATÍSTICAS
// ============================================

export const useSchoolStats = () => {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        totalClasses: 0,
        totalStudents: 0,
        totalTasks: 0,
        totalTeachers: 0,
        loading: true
    });

    useEffect(() => {
        if (!user || user.role !== 'director') {
            setStats(prev => ({ ...prev, loading: false }));
            return;
        }

        const loadStats = async () => {
            try {
                const [classesSnapshot, usersSnapshot, tasksSnapshot] = await Promise.all([
                    getDocs(query(
                        collection(db, 'classes'),
                        where('schoolId', '==', user.schoolId),
                        where('isActive', '==', true)
                    )),
                    getDocs(query(
                        collection(db, 'users'),
                        where('schoolId', '==', user.schoolId),
                        where('isActive', '==', true)
                    )),
                    getDocs(query(
                        collection(db, 'tasks'),
                        where('schoolId', '==', user.schoolId),
                        where('isActive', '==', true)
                    ))
                ]);

                const users = usersSnapshot.docs.map(doc => doc.data());
                const students = users.filter(u => u.role === 'student');
                const teachers = users.filter(u => u.role === 'teacher');

                setStats({
                    totalClasses: classesSnapshot.size,
                    totalStudents: students.length,
                    totalTasks: tasksSnapshot.size,
                    totalTeachers: teachers.length,
                    loading: false
                });
            } catch (error) {
                console.error('Erro ao carregar estatísticas:', error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        loadStats();
    }, [user]);

    return stats;
};