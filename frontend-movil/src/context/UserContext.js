import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Crear el contexto
export const UserContext = createContext();

// Proveedor del contexto
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(mockUser); // Usar usuario mock por defecto
  const [isLoading, setIsLoading] = useState(false); // No cargar desde storage por ahora
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Authenticated por defecto

  // Cargar usuario desde AsyncStorage al iniciar
  useEffect(() => {
    // Para desarrollo, usar directamente el usuario mock
    // loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user_data');
      const token = await AsyncStorage.getItem('@auth_token');
      
      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData, token) => {
    try {
      await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
      await AsyncStorage.setItem('@auth_token', token);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@user_data');
      await AsyncStorage.removeItem('@auth_token');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error removing user from storage:', error);
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      await AsyncStorage.setItem('@user_data', JSON.stringify(updatedUserData));
      setUser(updatedUserData);
    } catch (error) {
      console.error('Error updating user in storage:', error);
    }
  };

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    loadUserFromStorage
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Usuario de ejemplo para desarrollo
export const mockUser = {
  id_usuario: 1,
  nombre: 'Juan',
  apellidos: 'Pérez González',
  email: 'juan.perez@example.com',
  telefono: '5551234567',
  tipo_usuario: 'beneficiario',
  rfc: null,
  fecha_registro: new Date().toISOString()
};

export default UserContext;
