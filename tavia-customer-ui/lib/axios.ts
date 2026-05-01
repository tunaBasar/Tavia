import axios from 'axios';
import { Platform } from 'react-native';

/**
 * Centralized Axios instance for the Tavia Customer App.
 * Points to the API Gateway (port 8080).
 *
 * Android emulator uses 10.0.2.2 to reach host localhost.
 * iOS simulator and web use localhost directly.
 */
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8080',
  ios: 'http://localhost:8080',
  default: 'http://localhost:8080',
});

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
