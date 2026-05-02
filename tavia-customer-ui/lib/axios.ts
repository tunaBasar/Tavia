import axios from 'axios';
import Constants from 'expo-constants';

/**
 * Centralized Axios instance for the Tavia Customer App.
 * Points to the API Gateway (port 8080).
 *
 * Dynamically resolves the host machine's LAN IP from the Expo dev server
 * so that physical devices, emulators, and simulators all work without
 * hardcoded addresses.
 *
 * Resolution chain:
 *  1. `EXPO_PUBLIC_API_URL` env var (explicit override, e.g. for staging)
 *  2. Expo's `expoGoConfig.debuggerHost` (auto-detected LAN IP from dev server)
 *  3. Fallback to `localhost` (web / CI)
 */
function resolveBaseUrl(): string {
  // 1. Explicit override via environment variable
  const envUrl = Constants.expoConfig?.extra?.apiUrl
    ?? process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  // 2. Extract host IP from Expo dev server's debuggerHost (format: "IP:PORT")
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    (Constants as Record<string, unknown>).debuggerHost;

  if (typeof debuggerHost === 'string' && debuggerHost.length > 0) {
    const host = debuggerHost.split(':')[0];
    return `http://${host}:8080`;
  }

  // 3. Fallback for web or non-dev environments
  return 'http://localhost:8080';
}

const BASE_URL = resolveBaseUrl();

if (__DEV__) {
  console.log(`[Tavia API] Base URL resolved to: ${BASE_URL}`);
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  },
});

export default api;
