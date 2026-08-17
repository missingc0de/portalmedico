import { soundService } from './soundService';

export const requestNotificationPermission = () => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }
};

export const showUserConnectNotification = (
  fullName: string, 
  avatarUrl?: string
): 'external' | 'in-app' => {
  // 1. Play login sound
  soundService.play('/msn_login.mp3');

  // 2. Try Electron Notification if available (runs outside main window)
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

  // 3. Try System Web Notification API (outside app window)
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(`${fullName.toUpperCase()} acaba de iniciar sesión.`, {
          body: 'Portal Médico - Usuario conectado',
          icon: avatarUrl || '/portalmedico_icon.png',
          tag: `login-${Date.now()}`,
          silent: true // sound is already played by soundService
        });

        // Auto-close after 4.5 seconds so it disappears automatically outside the app
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

  // 4. Fallback to in-app toast ONLY if external notification was not shown
  return 'in-app';
};

export const showChatMessageNotification = (
  senderName: string,
  messageText: string,
  avatarUrl?: string
) => {
  // 1. Play notification sound
  soundService.play('/notification.mp3');

  // 2. Try Electron Notification if available
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

  // 3. Try System Web Notification API if permitted (outside app window)
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(`${senderName} dice:`, {
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
