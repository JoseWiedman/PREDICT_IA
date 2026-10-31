
import { initializeApp, getApp, getApps } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import type { Persistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCmB9tAY3s6a5MadsgB0H3O6H9mcAdh_YI",
  authDomain: "predictia-5790b.firebaseapp.com",
  projectId: "predictia-5790b",
  storageBucket: "predictia-5790b.firebasestorage.app",
  messagingSenderId: "29769819058",
  appId: "1:29769819058:web:7ab68ac59e38fe31f7faab",
};

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// Firebase 13: TypeScript no reconoce esta exportación nativa.
// Metro resuelve la implementación React Native al compilar Android.
const getNativePersistence = (
  FirebaseAuth as unknown as {
    getReactNativePersistence: (
      storage: typeof AsyncStorage
    ) => Persistence;
  }
).getReactNativePersistence;

export const auth = FirebaseAuth.initializeAuth(app, {
  persistence: getNativePersistence(AsyncStorage),
});

export { app };
