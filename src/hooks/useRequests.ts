import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LeaveRequest, LeaveLog, RequestType, RequestStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useRequests = () => {
  const { userData, currentUser } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [logs, setLogs] = useState<LeaveLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData || !currentUser) {
      setLoading(false);
      return;
    }

    let q;

    if (userData.role === 'student') {
      q = query(
        collection(db, 'leaveRequests'),
        where('studentId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
    } else if (userData.role === 'teacher') {
      q = query(
        collection(db, 'leaveRequests'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
    } else if (userData.role === 'hod') {
      q = query(
        collection(db, 'leaveRequests'),
        where('department', '==', userData.department),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'leaveRequests'),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q,
      async (snapshot) => {
        let requestsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            fromDate: data.fromDate?.toDate() || new Date(),
            toDate: data.toDate?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as LeaveRequest;
        });

        if (userData.role === 'teacher') {
          try {
            const assignmentsQuery = query(
              collection(db, 'classAssignments'),
              where('advisorId', '==', currentUser.uid)
            );
            const assignmentsSnapshot = await getDocs(assignmentsQuery);
            const assignments = assignmentsSnapshot.docs.map(d => ({
              department: d.data().department,
              year: d.data().year
            }));
            requestsData = requestsData.filter(req =>
              assignments.some(a => a.department === req.department && a.year === req.year)
            );
          } catch (err) {
            console.error('Error fetching class assignments:', err);
          }
        }

        setRequests(requestsData);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore leaveRequests snapshot error:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userData, currentUser]);

  useEffect(() => {
    if (!userData || !currentUser || (userData.role !== 'teacher' && userData.role !== 'hod' && userData.role !== 'admin')) {
      return;
    }

    let logsQuery;

    if (userData.role === 'teacher') {
      logsQuery = query(
        collection(db, 'leaveLogs'),
        where('actionBy', '==', currentUser.uid),
        orderBy('timestamp', 'desc')
      );
    } else {
      logsQuery = query(
        collection(db, 'leaveLogs'),
        orderBy('timestamp', 'desc')
      );
    }

    const unsubscribe = onSnapshot(logsQuery,
      (snapshot) => {
        const logsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date()
          } as LeaveLog;
        });
        setLogs(logsData);
      },
      (error) => {
        console.error('Firestore leaveLogs snapshot error:', error);
      }
    );

    return unsubscribe;
  }, [userData, currentUser]);

  const createRequest = async (
    fromDate: Date,
    toDate: Date,
    reason: string,
    type: RequestType,
    attachmentBase64?: string,
    subType?: string
  ) => {
    if (!currentUser || !userData) throw new Error('Not authenticated');

    await addDoc(collection(db, 'leaveRequests'), {
      studentId: currentUser.uid,
      studentName: userData.name,
      department: userData.department,
      year: userData.year || '',
      fromDate: Timestamp.fromDate(fromDate),
      toDate: Timestamp.fromDate(toDate),
      reason,
      type,
      subType: subType || '',
      attachmentUrl: attachmentBase64 || '',
      status: 'pending' as RequestStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await addDoc(collection(db, 'notifications'), {
      role: 'teacher',
      department: userData.department,
      studentId: currentUser.uid,
      year: userData.year || '',
      title: `New ${type.toUpperCase()} Request`,
      message: `${userData.name} has submitted a new ${type === 'leave' ? 'leave' : 'on-duty'} request.`,
      type: 'new_request',
      read: false,
      timestamp: serverTimestamp()
    });
  };

  const processRequest = async (
    requestId: string,
    action: 'approved' | 'rejected',
    studentId: string,
    studentName?: string,
    comment?: string
  ) => {
    if (!currentUser || !userData) throw new Error('Not authenticated');

    const req = requests.find(r => r.id === requestId);
    const type = req?.type || 'leave';

    await updateDoc(doc(db, 'leaveRequests', requestId), {
      status: action,
      actedBy: currentUser.uid,
      actedByName: userData.name,
      actedByRole: userData.role,
      comment: comment || '',
      updatedAt: serverTimestamp()
    });

    await addDoc(collection(db, 'leaveLogs'), {
      requestId: requestId,
      studentId,
      studentName: studentName || '',
      actionBy: currentUser.uid,
      actionByName: userData.name,
      actionByRole: userData.role,
      action,
      comment: comment || '',
      timestamp: serverTimestamp()
    });

    if (action === 'approved') {
      await addDoc(collection(db, 'attendance'), {
        studentId,
        studentName: studentName || '',
        status: type === 'leave' ? 'leave' : 'od',
        requestId,
        date: serverTimestamp(),
        recordedBy: currentUser.uid
      });
    }

    await addDoc(collection(db, 'notifications'), {
      userId: studentId,
      title: `${type.toUpperCase()} ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `Your ${type} request has been ${action} by ${userData.role === 'hod' ? 'HOD' : 'Advisor'} (${userData.name}).${action === 'rejected' && comment ? ` Reason: ${comment}` : ''}`,
      type: 'request_status',
      read: false,
      timestamp: serverTimestamp()
    });
  };

  return {
    requests,
    logs,
    loading,
    createRequest,
    processRequest
  };
};
