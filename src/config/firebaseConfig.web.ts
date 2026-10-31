
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  initializeAuth,
  browserLocalPersistence,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCmB9tAY3s6a5MadsgB0H3O6H9mcAdh_YI",
  authDomain: "predictia-5790b.firebaseapp.com",
  projectId: "predictia-5790b",
  storageBucket: "predictia-5790b.firebasestorage.app",
  messagingSenderId: "29769819058",
  appId: "1:29769819058:web:7ab68ac59e38fe31f7faab",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
});

export { app };
