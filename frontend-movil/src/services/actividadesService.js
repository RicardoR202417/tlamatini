import { API_BASE_URL } from '../api/ApiService';
import { MOCK_ACTIVIDADES } from './mockActividades';

// Obtener todas las actividades
export const obtenerActividades = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/actividades`);
    const data = await response.json();

    if (!response.ok) {
      // Si el servidor regresa error, usar mock como fallback
      console.warn(
        'API returned error for /api/actividades, using mock data',
        data.message
      );
      return {
        success: true,
        data: MOCK_ACTIVIDADES,
        message: 'Datos mock (fallback)',
        isMock: true,
      };
    }

    return { ...data, isMock: false };
  } catch (error) {
    console.error('Error en obtenerActividades:', error);
    // Fallback a datos mock cuando falla el fetch (network / server caído)
    return {
      success: true,
      data: MOCK_ACTIVIDADES,
      message: 'Datos mock (fallback)',
      isMock: true,
    };
  }
};

// Obtener una actividad por ID
export const obtenerActividadPorId = async (idActividad) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/actividades/${idActividad}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener actividad');
    }

    return data;
  } catch (error) {
    console.error('Error en obtenerActividadPorId:', error);
    throw error;
  }
};

// Inscribirse en una actividad
export const inscribirseEnActividad = async (idActividad, token, formData = {}) => {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/actividades/${idActividad}/inscripciones`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Manejo específico de token inválido/expirado
      if (response.status === 401) {
        throw new Error(data.message || 'Token inválido o expirado');
      }
      throw new Error(data.message || 'Error al inscribirse');
    }

    return data;
  } catch (error) {
    console.error('Error en inscribirseEnActividad:', error);
    throw error;
  }
};

// Cancelar inscripción
export const cancelarInscripcion = async (idInscripcion, token) => {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/actividades/inscripciones/${idInscripcion}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(data.message || 'Token inválido o expirado');
      }
      throw new Error(data.message || 'Error al cancelar inscripción');
    }

    return data;
  } catch (error) {
    console.error('Error en cancelarInscripcion:', error);
    throw error;
  }
};

// Obtener inscripciones del usuario
export const obtenerInscripcionesUsuario = async (idUsuario, token) => {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/actividades/usuario/${idUsuario}/inscripciones`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(data.message || 'Token inválido o expirado');
      }
      throw new Error(data.message || 'Error al obtener inscripciones');
    }

    return data;
  } catch (error) {
    console.error('Error en obtenerInscripcionesUsuario:', error);
    throw error;
  }
};

