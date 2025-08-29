# 🚀 GUÍA DE PRUEBAS - FLUJO COMPLETO DE DONACIONES Y PAGOS

## ✅ STATUS ACTUAL
- ✅ Backend funcionando en `http://localhost:3000`
- ✅ Controlador de pagos operativo (modo simulación)
- ✅ Base de datos conectada y sincronizada
- ✅ Credenciales reales integradas para PayPal y MercadoPago
- ✅ Variable USE_PAYMENT_SIMULATION=false (usa APIs reales en sandbox)

## 🎯 OBJETIVOS DE PRUEBA
1. Probar creación de donaciones
2. Probar flujo de pago con PayPal (sandbox)
3. Probar flujo de pago con MercadoPago (sandbox)
4. Verificar creación automática de facturas
5. Verificar estados de donación en base de datos

## 📱 PREPARACIÓN DEL FRONTEND MÓVIL

### 1. Verificar variables de entorno del frontend
```bash
# En c:\servicio-social-uteq\tlamatini\frontend-movil\.env
PAYPAL_CLIENT_ID=AXm2nCPNhFUuGQP64S8xWI9dCWQ9KqfH7FMF5U-vMvYFxKMZYCPyYWQhFNmqg3XG2nNksVNKb15wnWzK
MERCADO_PAGO_PUBLIC_KEY=APP_USR-d1e64b32-e9bb-4f5b-8128-2e1b4be73f94
API_BASE_URL=http://localhost:3000/api
```

### 2. Arrancar el frontend móvil
```bash
cd c:\servicio-social-uteq\tlamatini\frontend-movil
npm start
# o
expo start
```

## 🧪 PRUEBAS PASO A PASO

### PRUEBA 1: Verificar conexión Backend-Frontend

#### 1.1 Probar endpoint de métodos de pago
```bash
curl http://localhost:3000/api/pagos/methods
```
**Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": "paypal",
      "name": "PayPal",
      "enabled": true,
      "currencies": ["MXN", "USD"]
    },
    {
      "id": "mercadopago", 
      "name": "Mercado Pago",
      "enabled": true,
      "currencies": ["MXN"]
    }
  ]
}
```

### PRUEBA 2: Crear donación desde la app móvil

#### 2.1 En la app móvil:
1. Navegar a la pantalla de donaciones
2. Seleccionar tipo de donación (monetaria/deducible)
3. Ingresar monto (ej: $100 MXN)
4. Agregar descripción
5. Crear la donación

#### 2.2 Verificar en base de datos:
```sql
SELECT * FROM donaciones ORDER BY fecha_creacion DESC LIMIT 5;
```

### PRUEBA 3: Flujo de pago con PayPal

#### 3.1 Desde la app:
1. Seleccionar donación creada
2. Elegir "PayPal" como método de pago
3. La app debe llamar a: `POST /api/pagos/paypal/create-order`

#### 3.2 Verificar respuesta del backend:
```json
{
  "success": true,
  "message": "Orden de PayPal creada exitosamente",
  "data": {
    "orderId": "PAYPAL_ORDER_1735445234567",
    "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=...",
    "status": "CREATED"
  }
}
```

#### 3.3 Proceso de pago:
1. La app abre el `approvalUrl` en WebView
2. Usuario completa el pago en PayPal sandbox
3. PayPal redirige de vuelta a la app
4. La app llama a: `POST /api/pagos/paypal/capture/{orderId}`

#### 3.4 Verificar captura exitosa:
```json
{
  "success": true,
  "message": "Pago capturado exitosamente",
  "data": {
    "orderId": "PAYPAL_ORDER_1735445234567",
    "captureId": "CAPTURE_1735445234567",
    "status": "COMPLETED"
  }
}
```

### PRUEBA 4: Flujo de pago con MercadoPago

#### 4.1 Desde la app:
1. Seleccionar donación creada
2. Elegir "Mercado Pago" como método de pago
3. La app debe llamar a: `POST /api/pagos/mercadopago/create-preference`

#### 4.2 Verificar respuesta del backend:
```json
{
  "success": true,
  "message": "Preferencia de MercadoPago creada exitosamente",
  "data": {
    "preferenceId": "MP_PREF_1735445234567",
    "initPoint": "https://sandbox.mercadopago.com.mx/checkout/...",
    "sandboxInitPoint": "https://sandbox.mercadopago.com.mx/checkout/..."
  }
}
```

#### 4.3 Proceso de pago:
1. La app abre el `sandboxInitPoint` en WebView
2. Usuario completa el pago en MercadoPago sandbox
3. MercadoPago envía webhook a: `POST /api/pagos/mercadopago/webhook`

### PRUEBA 5: Verificar estados en base de datos

#### 5.1 Consultar donaciones actualizadas:
```sql
SELECT 
    id_donacion,
    tipo,
    monto,
    metodo_pago,
    estado_pago,
    fecha_pago,
    paypal_order_id,
    mercadopago_preference_id
FROM donaciones 
WHERE metodo_pago IS NOT NULL
ORDER BY fecha_creacion DESC;
```

#### 5.2 Verificar facturas automáticas (para donaciones deducibles):
```sql
SELECT 
    f.id_factura,
    f.id_donacion,
    f.rfc,
    f.total,
    f.estado,
    d.tipo,
    d.monto
FROM facturas f
JOIN donaciones d ON f.id_donacion = d.id_donacion
ORDER BY f.fecha_creacion DESC;
```

## 🔧 ENDPOINTS DE PRUEBA MANUAL

### Crear orden PayPal manualmente:
```bash
curl -X POST http://localhost:3000/api/pagos/paypal/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "donacionId": 1,
    "returnUrl": "http://localhost:3000/api/pagos/paypal/success",
    "cancelUrl": "http://localhost:3000/api/pagos/paypal/cancel"
  }'
```

### Crear preferencia MercadoPago manualmente:
```bash
curl -X POST http://localhost:3000/api/pagos/mercadopago/create-preference \
  -H "Content-Type: application/json" \
  -d '{
    "donacionId": 1,
    "userEmail": "test@example.com",
    "userName": "Usuario Prueba"
  }'
```

### Verificar estado de donación:
```bash
curl http://localhost:3000/api/pagos/status/1
```

## 📊 MONITOREO EN TIEMPO REAL

### En el terminal del backend, observar:
- ✅ Logs de creación de órdenes
- ✅ Logs de captura de pagos
- ✅ Logs de creación de facturas automáticas
- ✅ Conexiones a APIs reales de PayPal/MercadoPago

### Logs esperados:
```
✅ PayPal order created: PAYPAL_ORDER_1735445234567
✅ PayPal payment captured: PAYPAL_ORDER_1735445234567
✅ Automatic invoice created for donation: 1
📨 MercadoPago webhook received: {...}
```

## 🏆 CRITERIOS DE ÉXITO

### ✅ Prueba exitosa si:
1. Backend responde correctamente a todos los endpoints
2. Donaciones se crean con estado inicial correcto
3. Órdenes de pago se generan sin errores
4. Estados de donación se actualizan correctamente
5. Facturas automáticas se crean para donaciones deducibles
6. Logs muestran comunicación con APIs reales
7. Frontend móvil puede completar flujo completo

## 🚨 TROUBLESHOOTING

### Si el backend no arranca:
```bash
cd c:\servicio-social-uteq\tlamatini\backend
npm install
node server.js
```

### Si hay errores de credenciales:
- Verificar que las variables estén en .env
- Verificar que USE_PAYMENT_SIMULATION=false

### Si la app móvil no conecta:
- Verificar que API_BASE_URL apunte a http://localhost:3000/api
- Verificar que el dispositivo/emulador esté en la misma red

## 📝 SIGUIENTE PASO
**¡Arrancar el frontend móvil y comenzar las pruebas!**

```bash
cd c:\servicio-social-uteq\tlamatini\frontend-movil
expo start
```
