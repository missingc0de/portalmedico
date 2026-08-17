import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCJl8t0n7j0OpaNy3S0cIKy5sOS6c0H924",
  authDomain: "chat-portalmedico.firebaseapp.com",
  projectId: "chat-portalmedico",
  storageBucket: "chat-portalmedico.firebasestorage.app",
  messagingSenderId: "414564050609",
  appId: "1:414564050609:web:0508a5c4c28c810f32a490"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
