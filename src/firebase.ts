import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, type User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase web yapılandırması (istemci tarafı, gizli değildir; erişim Firestore kurallarıyla korunur).
const firebaseConfig = {
  apiKey: 'AIzaSyCrKrhz67Zdv-nK6H5_xFsEKnolYxb-WQU',
  authDomain: 'zyphor-4379d.firebaseapp.com',
  projectId: 'zyphor-4379d',
  storageBucket: 'zyphor-4379d.firebasestorage.app',
  messagingSenderId: '93544625604',
  appId: '1:93544625604:web:fdf1352ece9101e4e46091',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

let userPromise: Promise<User> | null = null;

/** Oyuncuyu görünmeden anonim olarak oturum açtırır; aynı cihazda aynı kimlik korunur. */
export function ensureUser(): Promise<User> {
  if (!userPromise) {
    // Önce kayıtlı oturumun yüklenmesini bekle; yoksa her açılışta yeni anonim kullanıcı oluşurdu.
    userPromise = auth
      .authStateReady()
      .then(async () => auth.currentUser ?? (await signInAnonymously(auth)).user)
      .catch((err) => {
        userPromise = null; // bir sonraki denemede tekrar dene
        throw err;
      });
  }
  return userPromise;
}
