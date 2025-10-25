'use client';

import { useState, useEffect } from 'react';

interface UserData {
  id: string;
  email: string;
  role: string;
  email_confirmed_at: string;
  phone: string;
  confirmed_at: string;
  last_sign_in_at: string;
  app_metadata: {
    provider: string;
    providers: string[];
  };
  user_metadata: {
    email_verified: boolean;
  };
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}

interface AuthData {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  user: UserData;
  weak_password?: {
    message: string;
    reasons: string[];
  };
}

interface UseAuthDataReturn {
  authData: AuthData | null;
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuthData = (): UseAuthDataReturn => {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCookieValue = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  const decodeBase64 = (str: string): string => {
    try {
      // Decodificar base64 y luego parsear JSON
      const decoded = atob(str);
      return decoded;
    } catch (error) {
      console.error('Error decoding base64:', error);
      throw new Error('Invalid base64 string');
    }
  };

  const parseAuthToken = (): AuthData | null => {
    try {
      // Obtener la cookie con el token de autenticación
      const cookieValue = getCookieValue('sb-erdspusdrdcxbvlkciot-auth-token');
      
      if (!cookieValue) {
        return null;
      }

      // Remover el prefijo 'base64-' si existe
      const base64String = cookieValue.startsWith('base64-') 
        ? cookieValue.substring(7) 
        : cookieValue;

      // Decodificar base64
      const decodedString = decodeBase64(base64String);
      
      // Parsear JSON
      const authData: AuthData = JSON.parse(decodedString);
      
      return authData;
    } catch (error) {
      console.error('Error parsing auth token:', error);
      setError('Error al parsear el token de autenticación');
      return null;
    }
  };

  const checkTokenExpiration = (authData: AuthData): boolean => {
    const now = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    return authData.expires_at > now;
  };

  useEffect(() => {
    const loadAuthData = () => {
      setIsLoading(true);
      setError(null);

      try {
        const parsedAuthData = parseAuthToken();
        
        if (parsedAuthData) {
          // Verificar si el token ha expirado
          if (checkTokenExpiration(parsedAuthData)) {
            setAuthData(parsedAuthData);
          } else {
            setError('Token expirado');
            setAuthData(null);
          }
        } else {
          setAuthData(null);
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
        setError('Error al cargar datos de autenticación');
        setAuthData(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Cargar datos inicialmente
    loadAuthData();

    // Opcional: Escuchar cambios en las cookies
    const interval = setInterval(() => {
      loadAuthData();
    }, 30000); // Verificar cada 30 segundos

    // Limpiar interval al desmontar
    return () => clearInterval(interval);
  }, []);

  return {
    authData,
    user: authData?.user || null,
    isAuthenticated: authData !== null && !error,
    isLoading,
    error,
  };
};

// Hook adicional para obtener solo datos específicos del usuario
export const useUser = () => {
  const { user, isAuthenticated, isLoading, error } = useAuthData();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    // Métodos de conveniencia
    userId: user?.id || null,
    userEmail: user?.email || null,
    userRole: user?.role || null,
    isEmailVerified: user?.user_metadata?.email_verified || false,
    lastSignIn: user?.last_sign_in_at ? new Date(user.last_sign_in_at) : null,
  };
};

// Hook para obtener información del token
export const useAuthToken = () => {
  const { authData, isAuthenticated, isLoading, error } = useAuthData();

  return {
    accessToken: authData?.access_token || null,
    refreshToken: authData?.refresh_token || null,
    tokenType: authData?.token_type || null,
    expiresAt: authData?.expires_at ? new Date(authData.expires_at * 1000) : null,
    expiresIn: authData?.expires_in || null,
    isAuthenticated,
    isLoading,
    error,
  };
};