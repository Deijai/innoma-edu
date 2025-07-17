// functions/index.js - Correções e melhorias

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Firestore and Auth references
const db = admin.firestore();
const auth = admin.auth();

// Permission mapping
const ROLE_PERMISSIONS = {
  student: [
    'read_own_data',
    'submit_tasks',
    'view_own_grades',
    'participate_in_class_chat'
  ],
  teacher: [
    'read_own_data',
    'submit_tasks',
    'view_own_grades',
    'participate_in_class_chat',
    'create_class',
    'edit_class',
    'create_task',
    'edit_task',
    'grade_submissions',
    'view_student_progress',
    'view_class_analytics',
    'manage_students'
  ],
  director: [
    'read_own_data',
    'submit_tasks',
    'view_own_grades',
    'participate_in_class_chat',
    'create_class',
    'edit_class',
    'create_task',
    'edit_task',
    'grade_submissions',
    'view_student_progress',
    'view_class_analytics',
    'manage_students',
    'manage_users',
    'view_all_users',
    'delete_class',
    'delete_task',
    'view_school_reports',
    'send_school_announcements',
    'moderate_chat',
    'configure_school',
    'manage_school_settings',
    'view_audit_logs',
    'export_data'
  ]
};

// Helper function to create audit log
async function createAuditLog(userId, action, resource, details = {}, schoolId = null) {
  try {
    const user = await auth.getUser(userId);
    const userDoc = await db.doc(`users/${userId}`).get();
    const userData = userDoc.data();

    await db.collection('audit_logs').add({
      userId,
      userName: userData?.name || user.displayName || 'Unknown',
      userRole: userData?.role || 'unknown',
      action,
      resource,
      resourceId: details.resourceId || null,
      details,
      schoolId: schoolId || userData?.schoolId || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ipAddress: null,
      userAgent: null
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
}

// ✅ NOVA - Cloud Function: Approve user
exports.approveUser = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  // Check if user has permission
  const callerToken = context.auth.token;
  if (callerToken.role !== 'director') {
    throw new functions.https.HttpsError('permission-denied', 'Apenas diretores podem aprovar usuários');
  }

  const { userId, approved } = data;

  if (!userId || typeof approved !== 'boolean') {
    throw new functions.https.HttpsError('invalid-argument', 'Dados inválidos');
  }

  try {
    if (approved) {
      // Aprovar usuário
      await db.doc(`users/${userId}`).update({
        isActive: true,
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        approvedBy: context.auth.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Definir custom claims
      const userDoc = await db.doc(`users/${userId}`).get();
      const userData = userDoc.data();
      
      if (userData) {
        const permissions = ROLE_PERMISSIONS[userData.role] || [];
        
        await auth.setCustomUserClaims(userId, {
          role: userData.role,
          schoolId: userData.schoolId || callerToken.schoolId,
          permissions,
          isActive: true
        });
      }

      // Create audit log
      await createAuditLog(context.auth.uid, 'approve_user', 'user', {
        resourceId: userId,
        approved: true
      }, callerToken.schoolId);

      return { success: true, message: 'Usuário aprovado com sucesso' };
    } else {
      // Rejeitar usuário
      await db.doc(`users/${userId}`).update({
        isActive: false,
        rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
        rejectedBy: context.auth.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Create audit log
      await createAuditLog(context.auth.uid, 'reject_user', 'user', {
        resourceId: userId,
        approved: false
      }, callerToken.schoolId);

      return { success: true, message: 'Usuário rejeitado' };
    }
  } catch (error) {
    console.error('Error approving user:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao processar aprovação');
  }
});

// ✅ CORRIGIDA - Cloud Function: Set user role and permissions
exports.setUserRole = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  // Check if user has permission to set roles
  const callerToken = context.auth.token;
  if (callerToken.role !== 'director') {
    throw new functions.https.HttpsError('permission-denied', 'Apenas diretores podem definir roles');
  }

  const { userId, role, schoolId } = data;

  // Validate input
  if (!userId || !role || !schoolId) {
    throw new functions.https.HttpsError('invalid-argument', 'Dados inválidos');
  }

  if (!['student', 'teacher', 'director'].includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Role inválido');
  }

  // Check if director is trying to set role for their own school
  if (callerToken.schoolId && callerToken.schoolId !== schoolId) {
    throw new functions.https.HttpsError('permission-denied', 'Você só pode gerenciar usuários da sua escola');
  }

  try {
    // Get user permissions for the role
    const permissions = ROLE_PERMISSIONS[role] || [];

    // Set custom claims
    await auth.setCustomUserClaims(userId, {
      role,
      schoolId,
      permissions,
      isActive: true
    });

    // Update user document in Firestore
    await db.doc(`users/${userId}`).update({
      role,
      schoolId,
      isActive: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create audit log
    await createAuditLog(context.auth.uid, 'set_user_role', 'user', {
      resourceId: userId,
      newRole: role,
      schoolId
    }, schoolId);

    return { success: true, message: 'Role definido com sucesso' };
  } catch (error) {
    console.error('Error setting user role:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao definir role do usuário');
  }
});

// ✅ MELHORADA - Cloud Function: Create approval notification
exports.createApprovalNotification = functions.https.onCall(async (data, context) => {
  const { userId, userName, role } = data;

  try {
    // Find all directors to notify
    const directorsSnapshot = await db.collection('users')
      .where('role', '==', 'director')
      .where('isActive', '==', true)
      .get();

    const notifications = [];
    
    directorsSnapshot.forEach(doc => {
      const directorData = doc.data();
      notifications.push({
        title: 'Nova Solicitação de Aprovação',
        body: `${userName} solicitou aprovação como ${role === 'teacher' ? 'Professor' : 'Diretor'}`,
        type: 'approval_request',
        targetUserId: doc.id,
        targetUserRole: 'director',
        schoolId: directorData.schoolId,
        relatedResourceId: userId,
        relatedResourceType: 'user',
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    // Save notifications
    const batch = db.batch();
    notifications.forEach(notification => {
      const notificationRef = db.collection('notifications').doc();
      batch.set(notificationRef, notification);
    });
    
    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error('Error creating approval notification:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao criar notificação');
  }
});

// ✅ NOVA - Cloud Function: Get school statistics
exports.getSchoolStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  const callerToken = context.auth.token;
  if (callerToken.role !== 'director') {
    throw new functions.https.HttpsError('permission-denied', 'Apenas diretores podem ver estatísticas');
  }

  try {
    const schoolId = callerToken.schoolId;
    
    const [usersSnapshot, classesSnapshot, tasksSnapshot] = await Promise.all([
      db.collection('users').where('schoolId', '==', schoolId).get(),
      db.collection('classes').where('schoolId', '==', schoolId).where('isActive', '==', true).get(),
      db.collection('tasks').where('schoolId', '==', schoolId).where('isActive', '==', true).get()
    ]);

    const users = usersSnapshot.docs.map(doc => doc.data());
    const students = users.filter(u => u.role === 'student');
    const teachers = users.filter(u => u.role === 'teacher');
    const pendingUsers = users.filter(u => !u.isActive);

    return {
      totalUsers: users.length,
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalClasses: classesSnapshot.size,
      totalTasks: tasksSnapshot.size,
      pendingUsers: pendingUsers.length,
      success: true
    };
  } catch (error) {
    console.error('Error getting school stats:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao obter estatísticas');
  }
});

// ✅ NOVA - Cloud Function: Delete user
exports.deleteUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  const callerToken = context.auth.token;
  if (callerToken.role !== 'director') {
    throw new functions.https.HttpsError('permission-denied', 'Apenas diretores podem deletar usuários');
  }

  const { userId } = data;

  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'ID do usuário é obrigatório');
  }

  try {
    // Get user data before deletion
    const userDoc = await db.doc(`users/${userId}`).get();
    const userData = userDoc.data();

    if (!userData) {
      throw new functions.https.HttpsError('not-found', 'Usuário não encontrado');
    }

    // Check if user belongs to the same school
    if (userData.schoolId !== callerToken.schoolId) {
      throw new functions.https.HttpsError('permission-denied', 'Você só pode deletar usuários da sua escola');
    }

    // Soft delete - mark as inactive
    await db.doc(`users/${userId}`).update({
      isActive: false,
      deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      deletedBy: context.auth.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Remove from classes
    const classesSnapshot = await db.collection('classes')
      .where('studentIds', 'array-contains', userId)
      .get();

    const batch = db.batch();
    classesSnapshot.forEach(doc => {
      batch.update(doc.ref, {
        studentIds: admin.firestore.FieldValue.arrayRemove(userId)
      });
    });
    await batch.commit();

    // Create audit log
    await createAuditLog(context.auth.uid, 'delete_user', 'user', {
      resourceId: userId,
      userName: userData.name
    }, callerToken.schoolId);

    return { success: true, message: 'Usuário removido com sucesso' };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao deletar usuário');
  }
});

// ✅ MELHORADA - Cloud Function: Manage class
exports.manageClass = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  const { action, classData } = data;
  const userToken = context.auth.token;

  // Check permissions
  if (!['teacher', 'director'].includes(userToken.role)) {
    throw new functions.https.HttpsError('permission-denied', 'Sem permissão para gerenciar turmas');
  }

  try {
    let result;
    
    switch (action) {
      case 'create':
        result = await createClass(classData, context.auth);
        break;
      case 'update':
        result = await updateClass(classData, context.auth);
        break;
      case 'delete':
        result = await deleteClass(classData.id, context.auth);
        break;
      case 'addStudent':
        result = await addStudentToClass(classData.classId, classData.studentId, context.auth);
        break;
      case 'removeStudent':
        result = await removeStudentFromClass(classData.classId, classData.studentId, context.auth);
        break;
      default:
        throw new functions.https.HttpsError('invalid-argument', 'Ação inválida');
    }

    return result;
  } catch (error) {
    console.error('Error managing class:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Erro ao gerenciar turma');
  }
});

// Helper functions for class management
async function createClass(classData, auth) {
  const classRef = db.collection('classes').doc();
  const teacherDoc = await db.doc(`users/${auth.uid}`).get();
  const teacherData = teacherDoc.data();

  const newClass = {
    id: classRef.id,
    name: classData.name,
    subject: classData.subject,
    description: classData.description || '',
    teacherId: auth.uid,
    teacherName: teacherData?.name || 'Unknown',
    studentIds: [],
    schoolId: auth.token.schoolId,
    schedule: classData.schedule || [],
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await classRef.set(newClass);

  // Create audit log
  await createAuditLog(auth.uid, 'create_class', 'class', {
    resourceId: classRef.id,
    className: classData.name
  }, auth.token.schoolId);

  return { id: classRef.id, success: true };
}

async function updateClass(classData, auth) {
  const classRef = db.doc(`classes/${classData.id}`);
  const classDoc = await classRef.get();

  if (!classDoc.exists) {
    throw new Error('Turma não encontrada');
  }

  const classInfo = classDoc.data();

  // Check if user can edit this class
  if (auth.token.role !== 'director' && classInfo.teacherId !== auth.uid) {
    throw new Error('Sem permissão para editar esta turma');
  }

  const updateData = {
    ...classData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await classRef.update(updateData);

  // Create audit log
  await createAuditLog(auth.uid, 'update_class', 'class', {
    resourceId: classData.id,
    updates: updateData
  }, auth.token.schoolId);

  return { success: true };
}

async function deleteClass(classId, auth) {
  const classRef = db.doc(`classes/${classId}`);
  const classDoc = await classRef.get();

  if (!classDoc.exists) {
    throw new Error('Turma não encontrada');
  }

  const classInfo = classDoc.data();

  // Only directors can delete classes
  if (auth.token.role !== 'director') {
    throw new Error('Apenas diretores podem excluir turmas');
  }

  // Soft delete - mark as inactive
  await classRef.update({
    isActive: false,
    deletedAt: admin.firestore.FieldValue.serverTimestamp(),
    deletedBy: auth.uid,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Create audit log
  await createAuditLog(auth.uid, 'delete_class', 'class', {
    resourceId: classId,
    className: classInfo.name
  }, auth.token.schoolId);

  return { success: true };
}

async function addStudentToClass(classId, studentId, auth) {
  const classRef = db.doc(`classes/${classId}`);
  const studentRef = db.doc(`users/${studentId}`);

  const [classDoc, studentDoc] = await Promise.all([
    classRef.get(),
    studentRef.get()
  ]);

  if (!classDoc.exists) {
    throw new Error('Turma não encontrada');
  }

  if (!studentDoc.exists) {
    throw new Error('Estudante não encontrado');
  }

  const classInfo = classDoc.data();
  const studentInfo = studentDoc.data();

  // Check permissions
  if (auth.token.role !== 'director' && classInfo.teacherId !== auth.uid) {
    throw new Error('Sem permissão para gerenciar esta turma');
  }

  // Check if student is from the same school
  if (studentInfo.schoolId !== auth.token.schoolId) {
    throw new Error('Estudante não pertence à mesma escola');
  }

  // Check if student is already in the class
  if (classInfo.studentIds.includes(studentId)) {
    throw new Error('Estudante já está na turma');
  }

  // Add student to class
  await classRef.update({
    studentIds: admin.firestore.FieldValue.arrayUnion(studentId),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Create audit log
  await createAuditLog(auth.uid, 'add_student_to_class', 'class', {
    resourceId: classId,
    studentId,
    studentName: studentInfo.name
  }, auth.token.schoolId);

  return { success: true };
}

async function removeStudentFromClass(classId, studentId, auth) {
  const classRef = db.doc(`classes/${classId}`);
  const classDoc = await classRef.get();

  if (!classDoc.exists) {
    throw new Error('Turma não encontrada');
  }

  const classInfo = classDoc.data();

  // Check permissions
  if (auth.token.role !== 'director' && classInfo.teacherId !== auth.uid) {
    throw new Error('Sem permissão para gerenciar esta turma');
  }

  // Remove student from class
  await classRef.update({
    studentIds: admin.firestore.FieldValue.arrayRemove(studentId),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Create audit log
  await createAuditLog(auth.uid, 'remove_student_from_class', 'class', {
    resourceId: classId,
    studentId
  }, auth.token.schoolId);

  return { success: true };
}

// ✅ MELHORADA - Cloud Function: On user creation
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    // Create user document in Firestore
    await db.doc(`users/${user.uid}`).set({
      id: user.uid,
      email: user.email,
      name: user.displayName || '',
      role: 'student', // Default role
      schoolId: '', // To be set by director
      avatar: user.photoURL || '',
      isActive: true, // Students are active by default
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });

    // Set default custom claims for students
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'student',
      schoolId: '',
      permissions: ROLE_PERMISSIONS.student,
      isActive: true
    });

    console.log(`User document created for ${user.uid}`);
  } catch (error) {
    console.error('Error creating user document:', error);
  }
});

// ✅ MELHORADA - Cloud Function: On user deletion
exports.onUserDelete = functions.auth.user().onDelete(async (user) => {
  try {
    // Delete user document from Firestore
    await db.doc(`users/${user.uid}`).delete();

    // Clean up user data from classes
    const classesSnapshot = await db.collection('classes')
      .where('studentIds', 'array-contains', user.uid)
      .get();

    const batch = db.batch();
    classesSnapshot.forEach(doc => {
      batch.update(doc.ref, {
        studentIds: admin.firestore.FieldValue.arrayRemove(user.uid)
      });
    });

    await batch.commit();

    console.log(`User data cleaned up for ${user.uid}`);
  } catch (error) {
    console.error('Error cleaning up user data:', error);
  }
});

// ✅ MELHORADA - Cloud Function: Send notification when task is created
exports.onTaskCreated = functions.firestore
  .document('tasks/{taskId}')
  .onCreate(async (snap, context) => {
    const task = snap.data();
    
    try {
      // Get class information
      const classDoc = await db.doc(`classes/${task.classId}`).get();
      
      if (!classDoc.exists) return;
      
      const classData = classDoc.data();
      const studentIds = classData.studentIds || [];
      
      // Create notifications for all students in the class
      const notifications = [];
      
      for (const studentId of studentIds) {
        notifications.push({
          title: 'Nova Tarefa Disponível',
          body: `${task.title} - Vence em ${task.dueDate.toDate().toLocaleDateString('pt-BR')}`,
          type: 'task_assigned',
          targetUserId: studentId,
          targetUserRole: 'student',
          schoolId: task.schoolId,
          relatedResourceId: context.params.taskId,
          relatedResourceType: 'task',
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      
      // Save notifications in batch
      const batch = db.batch();
      notifications.forEach(notification => {
        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, notification);
      });
      
      await batch.commit();
      
      console.log(`Notifications sent for task ${context.params.taskId}`);
    } catch (error) {
      console.error('Error sending task notifications:', error);
    }
  });

// ✅ MELHORADA - Cloud Function: Send notification when grade is updated
exports.onGradeUpdated = functions.firestore
  .document('submissions/{submissionId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Only notify if grade was actually changed
    if (before.grade === after.grade) return;
    
    try {
      // Create notification for the student
      await db.collection('notifications').add({
        title: 'Nota Lançada',
        body: `Sua nota em ${after.taskTitle}: ${after.grade}`,
        type: 'grade_released',
        targetUserId: after.studentId,
        targetUserRole: 'student',
        schoolId: after.schoolId || '',
        relatedResourceId: context.params.submissionId,
        relatedResourceType: 'submission',
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`Grade notification sent for submission ${context.params.submissionId}`);
    } catch (error) {
      console.error('Error sending grade notification:', error);
    }
  });

// ✅ NOVA - Cloud Function: Send welcome email
exports.sendWelcomeEmail = functions.https.onCall(async (data, context) => {
  // This would integrate with email service like SendGrid, Mailgun, etc.
  // For now, just log the action
  console.log('Welcome email would be sent to:', data.email);
  return { success: true };
});

// ✅ NOVA - Cloud Function: Backup user data
exports.backupUserData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  const callerToken = context.auth.token;
  if (callerToken.role !== 'director') {
    throw new functions.https.HttpsError('permission-denied', 'Apenas diretores podem fazer backup');
  }

  try {
    const schoolId = callerToken.schoolId;
    
    // Get all school data
    const [users, classes, tasks] = await Promise.all([
      db.collection('users').where('schoolId', '==', schoolId).get(),
      db.collection('classes').where('schoolId', '==', schoolId).get(),
      db.collection('tasks').where('schoolId', '==', schoolId).get()
    ]);

    const backupData = {
      users: users.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      classes: classes.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      tasks: tasks.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.uid,
      schoolId: schoolId
    };

    // Save backup
    await db.collection('backups').add(backupData);

    return { success: true, message: 'Backup criado com sucesso' };
  } catch (error) {
    console.error('Error creating backup:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao criar backup');
  }
});