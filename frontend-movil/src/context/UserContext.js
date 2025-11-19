import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../api/ApiService';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Intentar cargar usuario y token desde AsyncStorage
        const userData = await AsyncStorage.getItem('@user_data');
        const savedToken = await AsyncStorage.getItem('@auth_token');

        if (userData && savedToken) {
          setUser(JSON.parse(userData));
          setToken(savedToken);
          setIsAuthenticated(true);
          return;
        }

        // 2. Si no hay nada en storage y estamos en desarrollo, pedir token de debug
        if (process.env.NODE_ENV === 'development' || __DEV__) {
          await loadDebugToken();
        }
      } catch (error) {
        console.error('Error inicializando UserContext:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const loadDebugToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/debug-token`);
      const data = await response.json();

      if (data && data.success && data.token) {
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);

        await AsyncStorage.setItem('@auth_token', data.token);
        await AsyncStorage.setItem('@user_data', JSON.stringify(data.user));
      } else {
        console.warn('Respuesta inválida del endpoint /debug-token:', data);
      }
    } catch (error) {
      console.warn(
        'No se pudo obtener token de debug. Revisa que el backend esté corriendo y API_BASE_URL sea correcta:',
        error
      );
      // Importante: NO usar aquí un JWT mock si vas a hablar con backend real
    }
  };

  const login = async (userData, authToken) => {
    try {
      await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
      await AsyncStorage.setItem('@auth_token', authToken);
      setUser(userData);
      setToken(authToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error guardando usuario en storage (login):', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@user_data');
      await AsyncStorage.removeItem('@auth_token');
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error removiendo usuario del storage (logout):', error);
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      await AsyncStorage.setItem('@user_data', JSON.stringify(updatedUserData));
      setUser(updatedUserData);
    } catch (error) {
      console.error('Error actualizando usuario en storage:', error);
    }
  };

  const value = {
    user,
    setUser,
    token,
    setToken,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personalizado para consumir el contexto
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe usarse dentro de un UserProvider');
  }
  return context;
};

export default UserContext;
