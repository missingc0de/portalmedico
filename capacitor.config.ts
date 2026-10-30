import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cl.portalmedico.app',
  appName: 'PORTAL MÉDICO',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
