// For client-side checks
export const isLocalhostClient = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

// For server-side checks (use env variable)
export const isLocalhostServer = () => {
  return process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
};

// Use this in middleware/server
export const shouldBypassAuthServer = () => isLocalhostServer();
// Use this in client components
export const shouldBypassAuthClient = () => isLocalhostClient(); 