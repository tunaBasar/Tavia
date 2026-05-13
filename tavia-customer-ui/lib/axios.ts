import axios from 'axios';
import Constants from 'expo-constants';

import { NativeModules, Platform } from 'react-native';

/**
 * Centralized Axios instance for the Tavia Customer App.
 * Points to the API Gateway (port 8080).
 *
 * Resolution priority:
 *  1. EXPO_PUBLIC_API_URL env override
 *  2. ADB reverse tunnel (Android + __DEV__) → http://localhost:8080
 *  3. Dynamic LAN IP from Metro scriptURL (iOS / future Wi-Fi testing)
 *  4. Legacy hostUri / debuggerHost extraction
 *  5. Localhost fallback
 *
 * ADB tunnel is detected automatically when the Metro bundle was loaded via
 * localhost/127.0.0.1, or can be forced with EXPO_PUBLIC_USE_ADB_TUNNEL=true.
 */

const GATEWAY_PORT = 8080;
const ADB_TUNNEL_BASE = `http://localhost:${GATEWAY_PORT}`;

function isAdbTunnelActive(): boolean {
  if (Platform.OS !== 'android' || !__DEV__) return false;

  // Explicit opt-in via .env
  if (process.env.EXPO_PUBLIC_USE_ADB_TUNNEL === 'true') return true;

  // Auto-detect: if Metro served the bundle through localhost, ADB reverse
  // is bridging the device ↔ host connection.
  const scriptURL: string | undefined =
    NativeModules.SourceCode?.scriptURL ?? Constants.experienceUrl;
  if (typeof scriptURL === 'string') {
    return scriptURL.includes('localhost') || scriptURL.includes('127.0.0.1');
  }

  return false;
}

function resolveBaseUrl(): string {
  // 1. Explicit override via environment variable (highest priority)
  const envUrl = Constants.expoConfig?.extra?.apiUrl
    ?? process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  // 2. ADB Reverse Tunnel — Android physical device priority path
  //    `adb reverse tcp:8080 tcp:8080` maps the device's localhost:8080
  //    to the host's API Gateway. On AP-isolated networks the LAN IP is
  //    unreachable, so this MUST take precedence over dynamic IP extraction.
  if (isAdbTunnelActive()) {
    return ADB_TUNNEL_BASE;
  }

  // 3. Dynamic LAN IP from the Metro bundle source URL
  //    Primary path for iOS physical devices or future Wi-Fi testing.
  const scriptURL = NativeModules.SourceCode?.scriptURL || Constants.experienceUrl;
  if (typeof scriptURL === 'string') {
    const match = scriptURL.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
    if (match) {
      return `http://${match[0]}:${GATEWAY_PORT}`;
    }
  }

  // 4. Legacy Fallbacks for edge cases
  const devHost =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    (Constants as Record<string, unknown>).debuggerHost;

  if (typeof devHost === 'string' && devHost.length > 0) {
    const host = devHost.split(':')[0];
    return `http://${host}:${GATEWAY_PORT}`;
  }

  // 5. Fallback for web or non-dev environments
  return ADB_TUNNEL_BASE;
}

const BASE_URL = resolveBaseUrl();

if (__DEV__) {
  const src = NativeModules.SourceCode?.scriptURL ?? 'N/A';
  console.log(
    `[Tavia API] Base URL → ${BASE_URL}` +
    ` | platform=${Platform.OS}` +
    ` | adbTunnel=${isAdbTunnelActive()}` +
    ` | scriptURL=${typeof src === 'string' ? src.substring(0, 80) : src}`
  );
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__ && error.message === 'Network Error') {
      console.error(
        `[Tavia API] Network Error → ${error.config?.baseURL}${error.config?.url}\n` +
        `  Ensure ADB tunnels are active:\n` +
        `    adb reverse tcp:${GATEWAY_PORT} tcp:${GATEWAY_PORT}\n` +
        `  Or set EXPO_PUBLIC_USE_ADB_TUNNEL=true in .env`
      );
    }
    return Promise.reject(error);
  }
);

export default api;
