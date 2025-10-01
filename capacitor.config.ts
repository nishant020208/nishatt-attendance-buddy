import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d24ab5bc1dc942e0b7c6e29243cb10e9',
  appName: 'nishatt-attendance-buddy',
  webDir: 'dist',
  server: {
    url: 'https://d24ab5bc-1dc9-42e0-b7c6-e29243cb10e9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;
