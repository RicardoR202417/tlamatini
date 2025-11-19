import { API_BASE_URL } from '../api/ApiService';

// Enviar mensaje de contacto
export const enviarMensajeContacto = async (formData) => {
  try {
    const { nombre, correo, asunto, mensaje, website } = formData;

    // Validación básica en cliente
    if (!nombre || !correo || !mensaje) {
      throw new Error('Nombre, correo y mensaje son obligatorios');
    }

    const body = {
      nombre,
      correo,
      asunto: asunto || 'Sin asunto',
      mensaje,
      website: website || '' // honeypot
    };

    const response = await fetch(`${API_BASE_URL}/api/contacto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al enviar mensaje de contacto');
    }

    return data;
  } catch (error) {
    console.error('Error en enviarMensajeContacto:', error);
    throw error;
  }
};
