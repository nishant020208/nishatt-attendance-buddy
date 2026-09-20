import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nishatt.attendancebuddy',
  appName: 'nishatt-attendance-buddy',
  webDir: 'dist',
  server: {
    url: 'https://attendance.nishatt.com',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;
