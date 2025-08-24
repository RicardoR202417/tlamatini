import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  // Claves para almacenamiento
  static ACCESS_TOKEN_KEY = '@tlamatini_access_token';
  static REFRESH_TOKEN_KEY = '@tlamatini_refresh_token';
  static USER_DATA_KEY = '@tlamatini_user_data';

  // Guardar tokens
  async saveTokens(accessToken, refreshToken) {
    try {
      await AsyncStorage.multiSet([
        [StorageService.ACCESS_TOKEN_KEY, accessToken],
        [StorageService.REFRESH_TOKEN_KEY, refreshToken],
      ]);
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  }

  // Obtener access token
  async getAccessToken() {
    try {
      return await AsyncStorage.getItem(StorageService.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Obtener refresh token
  async getRefreshToken() {
    try {
      return await AsyncStorage.getItem(StorageService.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // Guardar datos del usuario
  async saveUserData(userData) {
    try {
      await AsyncStorage.setItem(
        StorageService.USER_DATA_KEY,
        JSON.stringify(userData)
      );
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  // Obtener datos del usuario
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(StorageService.USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Limpiar todos los datos de autenticación
  async clearAuthData() {
    try {
      await AsyncStorage.multiRemove([
        StorageService.ACCESS_TOKEN_KEY,
        StorageService.REFRESH_TOKEN_KEY,
        StorageService.USER_DATA_KEY,
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  }

  // Verificar si el usuario está autenticado
  async isAuthenticated() {
    try {
      const accessToken = await this.getAccessToken();
      const userData = await this.getUserData();
      return !!(accessToken && userData);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }
}

export default new StorageService();
