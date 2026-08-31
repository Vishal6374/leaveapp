import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, department: string, year?: string, sinNumber?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));

          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              uid: user.uid,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date()
            } as User);
          } else {
            if (user.email === 'admin@college.edu' || user.email === 'admin@university.edu') {
              const newAdmin = {
                name: 'System Administrator',
                email: user.email,
                role: 'admin' as UserRole,
                department: 'Administration',
                createdAt: new Date()
              };
              await setDoc(doc(db, 'users', user.uid), newAdmin);
              setUserData({ uid: user.uid, ...newAdmin });
            } else {
              setUserData(null);
              await firebaseSignOut(auth);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }

      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    department: string,
    year?: string,
    sinNumber?: string
  ) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      role: 'student' as UserRole,
      department,
      year: year || '',
      sinNumber: sinNumber || '',
      createdAt: serverTimestamp()
    });
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserData(null);
  };

  const value = {
    currentUser,
    userData,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
