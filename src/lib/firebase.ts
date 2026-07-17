import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Submission } from '../types';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, 'ai-studio-breakthroughexpe-9e8c069f-55e9-413a-9285-78032331b413');

// Test Firestore connection on boot (Critical Constraint)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration: Client is offline.");
    }
  }
}
testConnection();

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar.events');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.setCustomParameters({ prompt: 'consent' });

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // User is logged in via Firebase but we don't have the calendar access token in-memory yet.
        // That is normal on page refresh.
        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Firestore helper functions for Submission management
export const saveSubmissionToFirestore = async (submission: Submission): Promise<void> => {
  try {
    const docRef = doc(db, 'submissions', submission.id);
    await setDoc(docRef, submission);
  } catch (error) {
    console.error('Error saving submission to Firestore:', error);
    throw error;
  }
};

export const getSubmissionsFromFirestore = async (): Promise<Submission[]> => {
  try {
    const submissionsCol = collection(db, 'submissions');
    const snapshot = await getDocs(submissionsCol);
    const list: Submission[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Submission);
    });
    return list;
  } catch (error) {
    console.error('Error getting submissions from Firestore:', error);
    throw error;
  }
};

export const deleteSubmissionFromFirestore = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'submissions', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting submission from Firestore:', error);
    throw error;
  }
};

export const clearAllSubmissionsFromFirestore = async (submissionsList: Submission[]): Promise<void> => {
  try {
    for (const sub of submissionsList) {
      await deleteDoc(doc(db, 'submissions', sub.id));
    }
  } catch (error) {
    console.error('Error clearing all submissions from Firestore:', error);
    throw error;
  }
};

