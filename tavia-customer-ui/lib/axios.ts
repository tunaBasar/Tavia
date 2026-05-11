import axios from 'axios';
import Constants from 'expo-constants';

import { NativeModules } from 'react-native';

/**
 * Centralized Axios instance for the Tavia Customer App.
 * Points to the API Gateway (port 8080).
 *
 * Dynamically resolves the host machine's LAN IP from the Expo dev server
 * so that physical devices, emulators, and simulators all work without
 * hardcoded addresses.
 */
function resolveBaseUrl(): string {
  // 1. Explicit override via environment variable
  const envUrl = Constants.expoConfig?.extra?.apiUrl
    ?? process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  // 2. Extract host IP dynamically from the URL that successfully loaded the app
  // This bypasses missing debuggerHost/hostUri bugs in SDK 54+ on physical devices
  const scriptURL = NativeModules.SourceCode?.scriptURL || Constants.experienceUrl;
  if (typeof scriptURL === 'string') {
    const match = scriptURL.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
    if (match) {
      return `http://${match[0]}:8080`;
    }
  }

  // 3. Legacy Fallbacks for edge cases
  const devHost =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    (Constants as Record<string, unknown>).debuggerHost;

  if (typeof devHost === 'string' && devHost.length > 0) {
    const host = devHost.split(':')[0];
    return `http://${host}:8080`;
  }

  // 4. Fallback for web or non-dev environments
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

api.interceptors.request.use(
  (config) => {
    // Import dynamically to avoid circular dependencies
    const { useActiveTenantStore } = require('@/store/useActiveTenantStore');
    const { useCustomerAuthStore } = require('@/store/useCustomerAuthStore');
    
    const activeTenantId = useActiveTenantStore.getState().activeTenantId;
    if (activeTenantId) {
      config.headers['X-Tenant-ID'] = activeTenantId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
