import { VITE_API_URL } from '@env';

export const API_BASE_URL = VITE_API_URL || 'http://localhost:3000';
// 🔎 OJO: si tu backend corre en 4000, algo como:
// export const API_BASE_URL = VITE_API_URL || 'http://192.168.1.80:4000';

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
    return this.makeRequest('/api/usuarios/register', {
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
    return this.makeRequest('/api/usuarios/login', {
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

  // Login con Google (alias para compatibilidad)
  async loginWithGoogle(idToken, tipoUsuario = 'beneficiario') {
    return this.googleSignIn(idToken, tipoUsuario);
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

  // Cambiar contraseña
  async changePassword(passwordData, token) {
    return this.makeRequest('/api/usuarios/contrasena', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        contrasena_actual: passwordData.contrasena_actual,
        nueva_contrasena: passwordData.nueva_contrasena
      }),
    });
  }

  // Eliminar cuenta (soft delete)
  async deleteAccount(token) {
    return this.makeRequest('/api/usuarios/delete-account', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        confirmacion: 'ELIMINAR'
      }),
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

  /* ============================
   *      MÓDULO DE CITAS
   * ============================ */

  /**
   * Obtiene las citas de un beneficiario
   * GET /api/citas?beneficiario={id}
   */
  async getCitasBeneficiario(id_beneficiario, filtros = {}) {
    const params = new URLSearchParams({
      beneficiario: String(id_beneficiario),
      ...Object.fromEntries(
        Object.entries(filtros).filter(([, v]) => v !== undefined && v !== null && v !== '')
      )
    }).toString();

    const endpoint = `/api/citas?${params}`;
    return this.request('GET', endpoint);
  }

  /**
   * Crea una nueva cita
   * POST /api/citas
   * body: { id_beneficiario, id_profesional, fecha_solicitada, motivo? }
   */
  async crearCita(data) {
    return this.request('POST', '/api/citas', data);
  }

  /**
   * (Opcional) Obtiene citas de un profesional, con filtros
   * GET /api/citas?profesional={id}&estado=pendiente
   */
  async getCitasProfesional(id_profesional, filtros = {}) {
    const params = new URLSearchParams({
      profesional: String(id_profesional),
      ...Object.fromEntries(
        Object.entries(filtros).filter(([, v]) => v !== undefined && v !== null && v !== '')
      )
    }).toString();

    const endpoint = `/api/citas?${params}`;
    return this.request('GET', endpoint);
  }

  /**
   * (Opcional) Confirmar cita
   * POST /api/citas/:id/confirmar
   * body: { fecha_confirmada }
   */

    /**
   * Lista de profesionales disponibles
   * GET /api/profesionales
   */


  async confirmarCita(id_cita, data) {
    return this.request('POST', `/api/citas/${id_cita}/confirmar`, data);
  }
// Listar citas de un profesional
async getCitasProfesional(id_profesional) {
  return this.request('GET', `/api/citas?profesional=${id_profesional}&estado=pendiente`);
}

// Confirmar cita
async confirmarCita(id, data) {
  return this.request('POST', `/api/citas/${id}/confirmar`, data);
}

// Cancelar cita
async cancelarCita(id, data) {
  return this.request('POST', `/api/citas/${id}/cancelar`, data);
}

// Marcar como atendida
async atenderCita(id, data) {
  return this.request('POST', `/api/citas/${id}/atender`, data);
}

  /**
   * (Opcional) Cancelar cita
   * POST /api/citas/:id/cancelar
   * body: { motivo_cancelacion }
   */
  async cancelarCita(id_cita, data) {
    return this.request('POST', `/api/citas/${id_cita}/cancelar`, data);
  }

  /**
   * (Opcional) Marcar cita como atendida
   * POST /api/citas/:id/atender
   * body: { notas }
   */
  async atenderCita(id_cita, data) {
    return this.request('POST', `/api/citas/${id_cita}/atender`, data);
  }

  /**
   * Lista de profesionales disponibles
   */
  async getProfesionales() {
    const res = await this.request('GET', '/api/profesionales');

    // Puede venir como array directo o como objeto con .data
    if (Array.isArray(res)) {
      return res;
    }

    if (res && Array.isArray(res.data)) {
      return res.data;
    }

    return [];
  }
}




export default new ApiService();
