import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Storage keys
const SERVER_URL_KEY = 'tcp_client_server_url';

// Get or set the server URL from localStorage
export const getServerUrl = (): string => {
  return localStorage.getItem(SERVER_URL_KEY) || '';
};

export const setServerUrl = (url: string): void => {
  localStorage.setItem(SERVER_URL_KEY, url);
};

// Determine the base URL for API requests
// In Android, we can't use relative URLs, so we need to use the full URL
const getBaseUrl = (): string => {
  // Check if running in Android (Capacitor)
  const isCapacitor = (window as any)?.Capacitor?.isNative;
  
  // If running in Capacitor, use a hard-coded server URL or get from environment
  if (isCapacitor) {
    // First check if user has configured a custom server URL
    const savedServerUrl = getServerUrl();
    if (savedServerUrl) {
      return savedServerUrl;
    }
    
    // Otherwise use default logic
    const userAgent = navigator.userAgent.toLowerCase();
    const isEmulator = userAgent.includes('android') && (userAgent.includes('emulator') || userAgent.includes('sdk'));
    
    if (isEmulator) {
      return 'http://10.0.2.2:5000'; // Android emulator special IP for localhost
    } else {
      // On a real device, use local network IP (should be configured by user)
      return 'http://192.168.1.100:5000'; // Default - user should change this
    }
  }
  
  // In browser, we can use relative URLs
  return '';
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getBaseUrl();
  const fullUrl = `${baseUrl}${url}`;
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getBaseUrl();
    const url = queryKey[0] as string;
    const fullUrl = `${baseUrl}${url}`;
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
