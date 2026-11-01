import { soundService } from './soundService';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

let channelsInitialized = false;
const recentNotificationKeys = new Set<string>();

export const initNotificationChannels = async () => {
  if (!Capacitor.isNativePlatform()) return;
  if (channelsInitialized) return;

  try {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') {
      console.warn('Local notifications permission not granted:', perm.display);
    }

    // Canal para mensajes estándar (v4: importancia alta, visible en pantalla bloqueada, sonido + vibración al unísono)
    await LocalNotifications.createChannel({
      id: 'chat_messages_v4',
      name: 'Mensajes de Chat',
      description: 'Notificaciones inmediatas para mensajes de chat',
      importance: 5, // High importance (heads-up / lockscreen alert)
      visibility: 1, // Public (visible on lockscreen)
      sound: 'notification.mp3',
      vibration: true,
      lights: true,
      lightColor: '#0284c7'
    });

    // Canal para zumbidos (v4: importancia máxima, visible en pantalla bloqueada, sonido + vibración LARGA al unísono)
    await LocalNotifications.createChannel({
      id: 'chat_nudges_v4',
      name: 'Zumbidos de Alerta',
      description: 'Notificaciones y vibración prolongada para zumbidos',
      importance: 5,
      visibility: 1,
      sound: 'nudge.mp3',
      vibration: true,
      lights: true,
      lightColor: '#ef4444'
    });

    channelsInitialized = true;
  } catch (err) {
    console.warn('Error creating Android notification channels:', err);
  }
};

export const requestNotificationPermission = () => {
  if (Capacitor.isNativePlatform()) {
    initNotificationChannels();
  } else if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }
};

export const showUserConnectNotification = (
  fullName: string, 
  avatarUrl?: string
): 'external' | 'in-app' => {
  if (!Capacitor.isNativePlatform()) {
    soundService.play('/msn_login.mp3');
  }

  // 1. Try Electron Notification if available
  if ((window as any).electronAPI?.showMsnNotification) {
    try {
      (window as any).electronAPI.showMsnNotification({
        type: 'login',
        fullName: fullName,
        avatarUrl: avatarUrl
      });
      return 'external';
    } catch (e) {
      console.warn('Electron notification error:', e);
    }
  }

  // 2. Try System Web Notification API (outside app window)
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(`${fullName.toUpperCase()} acaba de iniciar sesión.`, {
          body: 'Portal Médico - Usuario conectado',
          icon: avatarUrl || '/portalmedico_icon.png',
          tag: `login-${Date.now()}`,
          silent: true
        });

        setTimeout(() => {
          try {
            notif.close();
          } catch (err) {}
        }, 4500);

        return 'external';
      } catch (err) {
        console.warn('Web Notification error:', err);
      }
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }

  return 'in-app';
};

export const showChatMessageNotification = async (
  senderName: string,
  messageText: string,
  avatarUrl?: string
) => {
  // Deduplicación rápida para evitar disparos múltiples del mismo mensaje
  const notifKey = `msg_${senderName}_${messageText}`;
  if (recentNotificationKeys.has(notifKey)) return;
  recentNotificationKeys.add(notifKey);
  setTimeout(() => recentNotificationKeys.delete(notifKey), 3000);

  // 1. Plataforma Nativa Android (Capacitor)
  // Al unísono: el sistema Android dispara sonido, vibración de mensaje y burbuja heads-up
  // simultáneamente en un solo evento nativo sin retraso de AlarmManager
  if (Capacitor.isNativePlatform()) {
    try {
      await initNotificationChannels();

      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Date.now() % 100000) + Math.floor(Math.random() * 1000),
            title: senderName || 'Mensaje de Chat',
            body: messageText || 'Nuevo mensaje',
            channelId: 'chat_messages_v4',
            smallIcon: 'ic_notification',
            sound: 'notification.mp3',
            foreground: true
          }
        ]
      });
      return;
    } catch (err) {
      console.warn('Error en notificación nativa móvil:', err);
    }
  }

  // 2. Entorno Web / Desktop
  soundService.play('/notification.mp3');
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([100, 80, 100]);
  }

  // Electron Notification
  if ((window as any).electronAPI?.showMsnNotification) {
    try {
      (window as any).electronAPI.showMsnNotification({
        type: 'message',
        fullName: senderName,
        message: messageText,
        avatarUrl: avatarUrl
      });
      return;
    } catch (e) {
      console.warn('Electron notification error:', e);
    }
  }

  // Web Notification API
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(`${senderName}: ${messageText || 'Nuevo mensaje'}`, {
          body: messageText || 'Nuevo mensaje',
          icon: avatarUrl || '/portalmedico_icon.png',
          tag: `msg-${Date.now()}`,
          silent: true
        });

        setTimeout(() => {
          try {
            notif.close();
          } catch (err) {}
        }, 4500);
      } catch (err) {
        console.warn('Web Notification error:', err);
      }
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }
};

export const showChatNudgeNotification = async (senderName: string) => {
  const nudgeText = `¡${senderName} te ha enviado un zumbido!`;

  // Deduplicación rápida
  const notifKey = `nudge_${senderName}`;
  if (recentNotificationKeys.has(notifKey)) return;
  recentNotificationKeys.add(notifKey);
  setTimeout(() => recentNotificationKeys.delete(notifKey), 3000);

  // 1. Plataforma Nativa Android (Capacitor)
  // Al unísono: el sistema Android ejecuta el sonido de zumbido, la VIBRACIÓN LARGA continua
  // y la burbuja de notificación heads-up tanto en pantalla activa como bloqueada
  if (Capacitor.isNativePlatform()) {
    try {
      await initNotificationChannels();

      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Date.now() % 100000) + Math.floor(Math.random() * 1000),
            title: '¡ZUMBIDO DE ALERTA!',
            body: nudgeText,
            channelId: 'chat_nudges_v4',
            smallIcon: 'ic_notification',
            sound: 'nudge.mp3',
            foreground: true
          }
        ]
      });
      return;
    } catch (err) {
      console.warn('Error en notificación nativa zumbido:', err);
    }
  }

  // 2. Entorno Web / Desktop
  soundService.play('/nudge.mp3');
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([1500, 200, 1200]);
  }

  // Electron Notification
  if ((window as any).electronAPI?.showMsnNotification) {
    try {
      (window as any).electronAPI.showMsnNotification({
        type: 'message',
        fullName: nudgeText,
        message: nudgeText,
      });
    } catch (e) {
      console.warn('Electron notification error:', e);
    }
  }

  // Web Notification
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(nudgeText, {
          body: nudgeText,
          icon: '/portalmedico_icon.png',
          tag: `nudge-${Date.now()}`,
          silent: true
        });
        setTimeout(() => {
          try { notif.close(); } catch (err) {}
        }, 4500);
      } catch (e) {}
    }
  }
};
