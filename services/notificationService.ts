import { soundService } from './soundService';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

let channelsInitialized = false;

export const initNotificationChannels = async () => {
  if (!Capacitor.isNativePlatform()) return;
  if (channelsInitialized) return;

  try {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') {
      console.warn('Local notifications permission not granted:', perm.display);
    }

    // Canal para mensajes estándar (sonido notification.mp3, importancia alta, doble vibración)
    await LocalNotifications.createChannel({
      id: 'chat_messages',
      name: 'Mensajes de Chat',
      description: 'Notificaciones para mensajes entrantes de chat',
      importance: 5, // High importance (heads-up / lockscreen alert)
      visibility: 1, // Public (visible on lockscreen)
      sound: 'notification.mp3',
      vibration: true,
      lights: true,
      lightColor: '#0284c7'
    });

    // Canal para zumbidos (sonido nudge.mp3, importancia máxima, vibración continua)
    await LocalNotifications.createChannel({
      id: 'chat_nudges',
      name: 'Zumbidos de Alerta',
      description: 'Notificaciones para zumbidos de atención inmediata',
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
  // 1. Plataforma Nativa Android (Capacitor)
  // Formato tipo WhatsApp:
  // Título: Carolina Madariaga
  // Cuerpo: Hola (o "Carolina Madariaga: Hola" en vista compacta)
  if (Capacitor.isNativePlatform()) {
    try {
      await initNotificationChannels();

      // Doble vibración nativa estilo WhatsApp (pulso, pausa, pulso)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 80, 100]);
      }

      // Notificación nativa en canal con sonido de notificación del sistema
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Date.now() % 100000) + Math.floor(Math.random() * 1000),
            title: senderName || 'Mensaje de Chat',
            body: messageText || 'Nuevo mensaje',
            channelId: 'chat_messages',
            smallIcon: 'ic_launcher',
            sound: 'notification.mp3',
            schedule: { at: new Date(Date.now() + 50) }
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

  // 1. Plataforma Nativa Android (Capacitor)
  if (Capacitor.isNativePlatform()) {
    try {
      await initNotificationChannels();

      // Vibración de 1 segundo de corrido (largo continuo)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(1000);
      }

      // Notificación nativa en canal de zumbido
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Date.now() % 100000) + Math.floor(Math.random() * 1000),
            title: nudgeText,
            body: nudgeText,
            channelId: 'chat_nudges',
            smallIcon: 'ic_launcher',
            sound: 'nudge.mp3',
            schedule: { at: new Date(Date.now() + 50) }
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
