import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { post, get } from '../services/api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children, onReady }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { // restaurar sesión
    (async () => {
      const t = await AsyncStorage.getItem('token');
      const u = await AsyncStorage.getItem('user');
      if (t && u) { setToken(t); setUser(JSON.parse(u)); }
      setLoading(false);
      onReady?.(); // opcional
    })();
  }, []);

  const login = async ({ correo, password }) => {
    const data = await post('/login', { correo, password });
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await post('/register', payload);
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const me = async () => get('/me', token);

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setToken(null); setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, token, loading, login, register, me, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
