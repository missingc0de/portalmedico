import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { SpecialEvent } from '../types';

export const EVENTS_COLLECTION = 'calendar_events';

export const subscribeToCalendarEvents = (callback: (events: SpecialEvent[]) => void) => {
    // Intentar leer desde local storage inmediatamente para un primer renderizado rápido
    const backup = localStorage.getItem('calendar_events_backup');
    if (backup) {
        try {
            callback(JSON.parse(backup));
        } catch(e) { console.error("Error leyendo backup de eventos", e); }
    }

    const q = query(collection(db, EVENTS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
        const events: SpecialEvent[] = [];
        snapshot.forEach((doc) => {
            events.push({ id: doc.id, ...doc.data() } as SpecialEvent);
        });
        localStorage.setItem('calendar_events_backup', JSON.stringify(events));
        callback(events);
    }, (error) => {
        console.error("Error al escuchar eventos del calendario:", error);
    });
};

export const addCalendarEvent = async (event: Omit<SpecialEvent, 'id'>) => {
    try {
        const eventsRef = collection(db, EVENTS_COLLECTION);
        const newDoc = await addDoc(eventsRef, event);
        return newDoc.id;
    } catch (e) {
        console.error("Error agregando evento al calendario", e);
        throw e;
    }
};

export const updateCalendarEvent = async (eventId: string, event: Partial<SpecialEvent>) => {
    try {
        const eventRef = doc(db, EVENTS_COLLECTION, eventId);
        await setDoc(eventRef, event, { merge: true });
    } catch (e) {
        console.error("Error actualizando evento", e);
        throw e;
    }
};

export const deleteCalendarEvent = async (eventId: string) => {
    try {
        const eventRef = doc(db, EVENTS_COLLECTION, eventId);
        await deleteDoc(eventRef);
    } catch (e) {
        console.error("Error eliminando evento", e);
        throw e;
    }
};

export const notifyUsersAboutEvent = async (usernames: string[], eventTitle: string) => {
    for (const username of usernames) {
        try {
            const sharedId = Date.now().toString() + Math.random().toString(36).substring(2);
            const payload = {
                text: `Has sido invitado al evento: "${eventTitle}". Revisa tu calendario.`,
                senderName: 'SISTEMA',
                senderUsername: 'system',
                senderProfession: 'administrativo',
                isNudge: false,
                timestamp: serverTimestamp(),
                status: 'sent',
                sharedId: sharedId,
                receiverUsername: username,
            };
            await setDoc(doc(db, 'inbox', username, 'messages', sharedId), payload);
        } catch(e) {
            console.error("No se pudo notificar a", username);
        }
    }
};
