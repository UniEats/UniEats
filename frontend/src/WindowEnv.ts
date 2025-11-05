declare global {
  interface Window {
    _env_: {
      baseApiUrl?: string;
      VITE_BACKEND_URL: string;
    };
  }
}

export {};
