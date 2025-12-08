import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.campaignstar.app",
  appName: "Campaign Star",
  webDir: "dist",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
    // Uncomment to test live on device pointing to Vercel build
    // url: "https://sh-seven-55.vercel.app",
    // cleartext: true,
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
