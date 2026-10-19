import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getBaseUrl = () => {
  if (!__DEV__) {
    return 'https://your-app-name.onrender.com'; // <-- Paste your production URL here
  }
  // 1. If running on the web
  if (Platform.OS === 'web') {
    return 'http://localhost:8000'; // Change to your web backend port
  }

  // 2. If running in Expo Go / Development build, extract host IP automatically
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  
  if (debuggerHost) {
    const localhost = debuggerHost.split(':')[0];
    return `http://${localhost}:8000`; // 3000 is your Node.js/Express backend port
  }

  // 3. Fallbacks for standalone emulators if hostUri isn't available
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000'; // Android Emulator special loopback IP
  }
  
  // iOS Simulator fallback
  return 'http://localhost:8000';
};

const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000, // Optional: request timeout in milliseconds
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;