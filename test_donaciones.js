// Script de validación para el módulo de donaciones
// Ejecutar con: node test_donaciones.js

const API_BASE = 'http://localhost:3000/api';

// Función para hacer peticiones HTTP
async function makeRequest(method, endpoint, data = null) {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    console.log(`${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(result, null, 2));
    console.log('---');
    
    return { status: response.status, data: result };
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.message);
    return { error: error.message };
  }
}

async function testDonacionesModule() {
  console.log('🚀 Iniciando pruebas del módulo de donaciones...\n');

  // 1. Test de salud de la API
  console.log('1. Test de conexión a la API');
  await makeRequest('GET', '/health');

  // 2. Test de donación monetaria
  console.log('2. Test de donación monetaria');
  const donacionMonetaria = {
    id_usuario: 1,
    tipo: 'monetaria',
    monto: 250.00,
    descripcion: 'Donación monetaria de prueba para apoyo comunitario'
  };
  const donacionResult = await makeRequest('POST', '/donaciones', donacionMonetaria);

  // 3. Test de donación deducible con factura
  console.log('3. Test de donación deducible');
  const donacionDeducible = {
    id_usuario: 1,
    tipo: 'deducible',
    monto: 500.00,
    descripcion: 'Donación deducible de prueba',
    datos_fiscales: {
      rfc: 'XAXX010101000',
      razon_social: 'Empresa de Prueba SA de CV',
      direccion: 'Calle Principal 123, Col. Centro, CP 12345, Ciudad, Estado'
    }
  };
  const deducibleResult = await makeRequest('POST', '/donaciones', donacionDeducible);

  // 4. Test de donación en especie
  console.log('4. Test de donación en especie');
  const donacionEspecie = {
    id_usuario: 1,
    tipo: 'especie',
    monto: null,
    descripcion: 'Ropa y Calzado: 5 camisas talla M en buen estado, 3 pantalones talla L',
    evidencia_url: 'photo_test_123.jpg'
  };
  await makeRequest('POST', '/donaciones', donacionEspecie);

  // 5. Test de listado de donaciones
  console.log('5. Test de listado de donaciones');
  await makeRequest('GET', '/donaciones');

  // 6. Test de donaciones por usuario
  console.log('6. Test de donaciones por usuario');
  await makeRequest('GET', '/donaciones/usuario/1');

  // 7. Test de generación de factura (si hay donación deducible)
  if (deducibleResult && deducibleResult.data && deducibleResult.data.id_donacion) {
    console.log('7. Test de generación de factura');
    const facturaData = {
      id_donacion: deducibleResult.data.id_donacion,
      rfc_receptor: 'XAXX010101000',
      razon_social_receptor: 'Empresa de Prueba SA de CV',
      direccion_receptor: 'Calle Principal 123',
      subtotal: 500.00,
      iva: 80.00,
      total: 580.00
    };
    const facturaResult = await makeRequest('POST', '/facturas', facturaData);

    // 8. Test de descarga de factura
    if (facturaResult && facturaResult.data && facturaResult.data.id_donacion) {
      console.log('8. Test de descarga de factura PDF');
      await makeRequest('GET', `/facturas/donacion/${facturaResult.data.id_donacion}/descargar?formato=pdf`);
      
      console.log('9. Test de descarga de factura XML');
      await makeRequest('GET', `/facturas/donacion/${facturaResult.data.id_donacion}/descargar?formato=xml`);
    }
  }

  // 10. Test de procesamiento de pagos
  console.log('10. Test de pago PayPal');
  const pagoPayPal = {
    id_donacion: donacionResult.data?.id_donacion || 1,
    metodo_pago: 'paypal',
    monto: 250.00,
    moneda: 'MXN',
    detalles_pago: {
      paypal_order_id: 'TEST_ORDER_123',
      payer_email: 'test@example.com'
    }
  };
  await makeRequest('POST', '/pagos/paypal', pagoPayPal);

  console.log('11. Test de pago Mercado Pago');
  const pagoMP = {
    id_donacion: donacionResult.data?.id_donacion || 1,
    metodo_pago: 'mercado_pago',
    monto: 250.00,
    moneda: 'MXN',
    detalles_pago: {
      mp_payment_id: 'TEST_PAYMENT_456',
      card_last_digits: '1234'
    }
  };
  await makeRequest('POST', '/pagos/mercado-pago', pagoMP);

  console.log('✅ Pruebas del módulo de donaciones completadas!');
}

// Ejecutar las pruebas
testDonacionesModule().catch(console.error);
