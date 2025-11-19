import { VITE_API_URL } from '@env';

export const API_BASE_URL = VITE_API_URL || 'http://localhost:3000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('API Base URL configurada:', this.baseURL);
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'Error en la petición',
          errors: data.errors || [],
        };
      }

      return data;
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw {
        status: 0,
        message: 'Error de conexión con el servidor',
        errors: [],
      };
    }
  }

  // Registro de usuario
  async register(userData) {
    return this.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        correo: userData.correo,
        password: userData.contraseña,
        tipo_usuario: userData.tipo_usuario,
      }),
    });
  }

  // Login de usuario
  async login(credentials) {
    return this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        correo: credentials.correo,
        password: credentials.contraseña,
      }),
    });
  }

  // Login con Google
  async googleSignIn(idToken, tipoUsuario = 'beneficiario') {
    return this.makeRequest('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        id_token: idToken,
        tipo_usuario: tipoUsuario,
      }),
    });
  }

  // Obtener información del usuario autenticado
  async getMe(token) {
    return this.makeRequest('/api/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Refresh token
  async refreshToken(refreshToken) {
    return this.makeRequest('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });
  }

  // Logout
  async logout(refreshToken) {
    return this.makeRequest('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });
  }

  // Actualizar perfil de usuario
  async updateProfile(profileData, token) {
    return this.makeRequest('/api/usuarios/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
  }

  // Obtener perfil completo del usuario
  async getProfile(token) {
    return this.makeRequest('/api/usuarios/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Método genérico para requests
  async request(method, endpoint, data = null, headers = {}) {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    return this.makeRequest(endpoint, config);
  }

  // Método para requests con archivos (FormData)
  async requestWithFile(method, endpoint, formData, headers = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method,
      headers: {
        // No incluir Content-Type para FormData, lo establecerá automáticamente
        ...headers,
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'Error en la petición',
          errors: data.errors || [],
        };
      }

      return data;
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw {
        status: 0,
        message: 'Error de conexión con el servidor',
        errors: [],
      };
    }
  }
}

export default new ApiService();
