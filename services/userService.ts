import { db } from './firebase';
import { collection, addDoc, onSnapshot, getDocs, query } from 'firebase/firestore';
import { User } from '../types';

export const USER_COLLECTION = 'users';

export const registerCloudUser = async (user: User): Promise<void> => {
    try {
        const usersRef = collection(db, USER_COLLECTION);
        await addDoc(usersRef, user);
    } catch (e) {
        console.error("Error Registrando Usuario en la Nube", e);
        throw e;
    }
};

export const subscribeToCloudUsers = (callback: (users: User[]) => void) => {
    const q = query(collection(db, USER_COLLECTION));
    return onSnapshot(q, (snapshot) => {
        const cloudUsers: User[] = [];
        snapshot.forEach((doc) => {
            cloudUsers.push(doc.data() as User);
        });
        callback(cloudUsers);
    }, (error) => {
        console.error("Error al escuchar usuarios en la nube:", error);
    });
};
