import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  type?: 'status' | 'request' | 'system' | 'warning';
  createdAt: Date;
  link?: string;
}

export const useNotifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', currentUser.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || 'Notification',
            body: data.body || '',
            read: !!data.read,
            type: data.type || 'system',
            createdAt: data.createdAt?.toDate?.() || new Date(),
            link: data.link,
          } as AppNotification;
        });
        setNotifications(list);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching notifications:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser]);

  const markAsRead = async (notificationId: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid, 'notifications', notificationId), {
        read: true,
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    try {
      const unreadList = notifications.filter((n) => !n.read);
      await Promise.all(
        unreadList.map((n) =>
          updateDoc(doc(db, 'users', currentUser.uid, 'notifications', n.id), {
            read: true,
          })
        )
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const clearAllNotifications = async () => {
    if (!currentUser) return;
    try {
      await Promise.all(
        notifications.map((n) =>
          deleteDoc(doc(db, 'users', currentUser.uid, 'notifications', n.id))
        )
      );
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const sendNotificationToUser = async (
    targetUid: string,
    title: string,
    body: string,
    type: 'status' | 'request' | 'system' | 'warning' = 'system'
  ) => {
    try {
      await addDoc(collection(db, 'users', targetUid, 'notifications'), {
        title,
        body,
        read: false,
        type,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    sendNotificationToUser,
  };
};
