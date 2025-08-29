# 🧪 GUÍA DE PRUEBAS CON CREDENCIALES REALES
## PayPal y MercadoPago - Sandbox Testing

### 📋 **PREPARACIÓN PREVIA**

#### **1. ✅ Verifica que tengas las credenciales reales**
```bash
# Backend .env
PAYPAL_CLIENT_ID=TU_CLIENT_ID_REAL_DE_PAYPAL
PAYPAL_CLIENT_SECRET=TU_CLIENT_SECRET_REAL_DE_PAYPAL
MERCADO_PAGO_ACCESS_TOKEN=TU_ACCESS_TOKEN_REAL
MERCADO_PAGO_PUBLIC_KEY=TU_PUBLIC_KEY_REAL

# Frontend .env
VITE_PAYPAL_CLIENT_ID=TU_CLIENT_ID_REAL_DE_PAYPAL
VITE_MERCADO_PAGO_PUBLIC_KEY=TU_PUBLIC_KEY_REAL

# Modo de pruebas
USE_PAYMENT_SIMULATION=false
```

#### **2. ✅ Reinicia los servicios**
```bash
# Backend
cd backend
npm start

# Frontend  
cd frontend-movil
npx expo start
```

### 🧪 **PRUEBAS CON PAYPAL SANDBOX**

#### **Cuentas de Prueba PayPal**
PayPal automáticamente proporciona estas cuentas de prueba:

```bash
# Comprador de Prueba
Email: buyer@personal.example.com
Password: 11111111

# Vendedor de Prueba
Email: seller@business.example.com
Password: 11111111
```

#### **Flujo de Prueba PayPal**
1. **Crear donación monetaria** en la app
2. **Seleccionar PayPal** como método de pago
3. **Verificar que abre** el WebView real de PayPal (no simulación)
4. **Iniciar sesión** con cuenta de prueba
5. **Completar pago** - deberías ver confirmación real
6. **Verificar en app** que la donación aparece como completada

#### **Tarjetas de Prueba PayPal**
```bash
# Visa
Número: 4032035954308077
Exp: 12/2025
CVV: 123

# Mastercard
Número: 5415406225395525
Exp: 12/2025
CVV: 123
```

### 🧪 **PRUEBAS CON MERCADOPAGO SANDBOX**

#### **Usuarios de Prueba MercadoPago**
Crea usuarios de prueba en: https://www.mercadopago.com.mx/developers/panel/testing/users

```bash
# Usuario Vendedor (para recibir pagos)
Email: test_seller_123@testuser.com

# Usuario Comprador (para hacer pagos)
Email: test_buyer_123@testuser.com
```

#### **Tarjetas de Prueba MercadoPago**
```bash
# Visa (Aprobada)
Número: 4509953566233704
CVV: 123
Exp: 11/25
Nombre: APRO

# Mastercard (Rechazada)
Número: 5031433215406351
CVV: 123
Exp: 11/25
Nombre: OTHE
```

#### **Flujo de Prueba MercadoPago**
1. **Crear donación monetaria** en la app
2. **Seleccionar MercadoPago** como método de pago
3. **Verificar que abre** el WebView real de MercadoPago
4. **Usar tarjeta de prueba** con nombre "APRO"
5. **Completar pago** - deberías ver confirmación real
6. **Verificar webhook** en logs del backend

### 🔍 **VALIDACIÓN DE PRUEBAS**

#### **En Backend (Logs)**
```bash
# Deberías ver logs como:
✅ PayPal order created: 7X123456789012345
📨 MercadoPago webhook received: {...}
💰 Payment completed: {orderId: "...", status: "approved"}
```

#### **En Base de Datos**
```sql
-- Verificar donaciones con pagos reales
SELECT 
    id_donacion,
    tipo,
    monto,
    metodo_pago,
    estado_pago,
    paypal_order_id,
    mercadopago_payment_id,
    fecha_pago
FROM donaciones 
WHERE estado_pago = 'completado'
ORDER BY fecha_pago DESC;
```

#### **En Frontend**
- ✅ WebView muestra páginas reales de PayPal/MercadoPago
- ✅ "Mis Donaciones" muestra estado "Completado"
- ✅ Se pueden descargar recibos/facturas
- ✅ No aparecen mensajes de "SIMULATION"

### 🐛 **TROUBLESHOOTING**

#### **Si PayPal no funciona:**
```bash
# 1. Verificar credenciales
curl -X POST https://api-m.sandbox.paypal.com/v1/oauth2/token \
  -H "Accept: application/json" \
  -H "Accept-Language: en_US" \
  -u "TU_CLIENT_ID:TU_CLIENT_SECRET" \
  -d "grant_type=client_credentials"

# 2. Verificar logs del backend
# 3. Verificar que USE_PAYMENT_SIMULATION=false
```

#### **Si MercadoPago no funciona:**
```bash
# 1. Verificar access token
curl -X GET "https://api.mercadopago.com/users/me" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"

# 2. Verificar que usas cuentas de TEST
# 3. Verificar que las tarjetas son de prueba
```

### 📊 **CHECKLIST DE VALIDACIÓN**

#### **PayPal Real API:**
- [ ] WebView abre páginas reales de PayPal
- [ ] Login con cuentas de prueba funciona
- [ ] Pagos se procesan en sandbox real
- [ ] Backend recibe confirmaciones reales
- [ ] Base de datos se actualiza correctamente

#### **MercadoPago Real API:**
- [ ] WebView abre páginas reales de MercadoPago
- [ ] Tarjetas de prueba funcionan
- [ ] Webhooks se reciben correctamente
- [ ] Estados de pago se actualizan
- [ ] Facturas se generan para donaciones deducibles

### 🚀 **SIGUIENTE PASO: PRODUCCIÓN**

Una vez que las pruebas sandbox funcionen:

1. **Activar aplicaciones** en modo LIVE
2. **Obtener credenciales** de producción
3. **Cambiar variables** de entorno
4. **Configurar webhooks** de producción
5. **Probar con montos pequeños** reales

**¡Listo para pruebas reales con APIs sandbox! 🎉**
