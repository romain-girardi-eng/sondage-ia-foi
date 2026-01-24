"use client";

import { useState, useEffect, useCallback } from "react";

const CSRF_HEADER_NAME = "x-csrf-token";

export function useCSRF() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchToken = useCallback(async () => {
    try {
      const response = await fetch("/api/csrf");
      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
      }
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const getHeaders = useCallback((): Record<string, string> => {
    if (!token) return {};
    return { [CSRF_HEADER_NAME]: token };
  }, [token]);

  const fetchWithCSRF = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const headers = new Headers(options.headers);

      if (token) {
        headers.set(CSRF_HEADER_NAME, token);
      }

      return fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });
    },
    [token]
  );

  return {
    token,
    isLoading,
    getHeaders,
    fetchWithCSRF,
    refreshToken: fetchToken,
  };
}
