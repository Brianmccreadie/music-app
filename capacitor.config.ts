import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.vocalreps.app",
  appName: "Vocal Reps",
  webDir: "out",
  server: {
    // In production, the app loads from the bundled files
    // For development, uncomment below to use live reload:
    // url: "http://YOUR_IP:3000",
    // cleartext: true,
  },
};

export default config;
