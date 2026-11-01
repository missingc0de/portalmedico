package cl.portalmedico.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ContentResolver;
import android.content.Context;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private PowerManager.WakeLock wakeLock;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Permitir que la app despierte la pantalla y se muestre en pantalla bloqueada
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            );
        }

        // Mantener CPU activa para sondeos de mensajes en segundo plano cuando la pantalla esté apagada
        try {
            PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (powerManager != null) {
                wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "PortalMedico:BackgroundChatLock");
                wakeLock.setReferenceCounted(false);
                wakeLock.acquire(10 * 60 * 1000L);
            }
        } catch (Exception ignored) {}

        // Permitir reproducción de audio en WebView sin interacción previa
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();
                settings.setMediaPlaybackRequiresUserGesture(false);
            }
        } catch (Exception ignored) {}

        // Inicializar canales de notificación nativos de alta prioridad y visibilidad pública
        createNativeNotificationChannels();
    }

    private void createNativeNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager == null) return;

            // Eliminar canales antiguos para evitar configuraciones cacheadas por Android
            try {
                notificationManager.deleteNotificationChannel("chat_messages");
                notificationManager.deleteNotificationChannel("chat_nudges");
                notificationManager.deleteNotificationChannel("chat_messages_v2");
                notificationManager.deleteNotificationChannel("chat_nudges_v2");
                notificationManager.deleteNotificationChannel("chat_messages_v3");
                notificationManager.deleteNotificationChannel("chat_nudges_v3");
            } catch (Exception ignored) {}

            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .build();

            // 1. Canal de Mensajes de Chat (v4)
            // Sonido, vibración de mensaje y burbuja heads-up visible en pantalla bloqueada
            NotificationChannel msgChannel = new NotificationChannel(
                "chat_messages_v4",
                "Mensajes de Chat",
                NotificationManager.IMPORTANCE_HIGH
            );
            msgChannel.setDescription("Notificaciones inmediatas para mensajes de chat");
            msgChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            msgChannel.enableVibration(true);
            // Doble vibración al unísono: silencio 0ms, vibración 250ms, pausa 150ms, vibración 250ms
            msgChannel.setVibrationPattern(new long[]{0, 250, 150, 250});
            msgChannel.enableLights(true);
            msgChannel.setLightColor(Color.parseColor("#0284c7"));

            try {
                Uri msgSoundUri = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + getPackageName() + "/raw/notification");
                msgChannel.setSound(msgSoundUri, audioAttributes);
            } catch (Exception ignored) {}

            notificationManager.createNotificationChannel(msgChannel);

            // 2. Canal de Zumbidos de Alerta (v4)
            // Sonido nudge, vibración LARGA continua y burbuja heads-up en pantalla bloqueada
            NotificationChannel nudgeChannel = new NotificationChannel(
                "chat_nudges_v4",
                "Zumbidos de Alerta",
                NotificationManager.IMPORTANCE_HIGH
            );
            nudgeChannel.setDescription("Notificaciones y vibración prolongada para zumbidos");
            nudgeChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            nudgeChannel.enableVibration(true);
            // Vibración LARGA: 1.5s continuo + pausa 200ms + 1.2s continuo
            nudgeChannel.setVibrationPattern(new long[]{0, 1500, 200, 1200});
            nudgeChannel.enableLights(true);
            nudgeChannel.setLightColor(Color.parseColor("#ef4444"));

            try {
                Uri nudgeSoundUri = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + getPackageName() + "/raw/nudge");
                nudgeChannel.setSound(nudgeSoundUri, audioAttributes);
            } catch (Exception ignored) {}

            notificationManager.createNotificationChannel(nudgeChannel);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (wakeLock != null && !wakeLock.isHeld()) {
            try {
                wakeLock.acquire(10 * 60 * 1000L);
            } catch (Exception ignored) {}
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (wakeLock != null && wakeLock.isHeld()) {
            try {
                wakeLock.release();
            } catch (Exception ignored) {}
        }
    }
}
