import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Department } from '../types';

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const deptsQuery = query(collection(db, 'departments'));
    const unsubscribe = onSnapshot(
      deptsQuery,
      (snapshot) => {
        const deptsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Department[];
        setDepartments(deptsData);
        setLoading(false);
      },
      (error) => {
        console.warn('useDepartments error:', error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { departments, loading };
};
