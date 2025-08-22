export const API_URL = 'http://10.0.2.2:4000/api'; // Android emu
// iOS sim: http://localhost:4000/api  |  Dispositivo físico: http://TU_IP_LOCAL:4000/api

export async function post(path, body, token) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error de red');
  return data;
}

export async function get(path, token) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error de red');
  return data;
}
