# 🚀 GUÍA COMPLETA: IMPLEMENTACIÓN DE PAGOS SIMULADOS
## PayPal y MercadoPago - Tlamatini UTEQ

### 📋 **ÍNDICE**
1. [Registro en Plataformas](#registro)
2. [Configuración de Credenciales](#credenciales)
3. [Migración de Base de Datos](#migracion)
4. [Pruebas de Funcionalidad](#pruebas)
5. [Configuración para Producción](#produccion)

---

## 🔐 **1. REGISTRO EN PLATAFORMAS** {#registro}

### **🔵 PAYPAL**

#### **Paso 1: Crear Cuenta Developer**
1. Ve a: https://developer.paypal.com/
2. Haz clic en "Get API Credentials"
3. Inicia sesión con tu cuenta PayPal personal
4. Acepta los términos de desarrollador

#### **Paso 2: Crear Aplicación**
1. En el Dashboard → "Create App"
2. Configuración:
   ```
   App Name: Tlamatini Donaciones UTEQ
   Merchant: [Tu cuenta de negocio]
   Platform: Web
   Intent: Capture
   Features: ✅ Accept payments
   ```

#### **Paso 3: Obtener Credenciales**
```bash
# SANDBOX (Desarrollo)
Client ID: AZkcE8QnVdCQaZnV9FtrpGhCBFa7cQZkxkKNTXLsyBfKVSVqSJgJLbF7X8Qb4kKp
Client Secret: EH4J8gJ9bGf2cJ5bF8fG3hI9cL4sB6gK5J2qF9nP7wR2tY8xE1vC3zF6sD4rG

# LIVE (Producción) - El cliente los agregará después
Client ID: [CLIENTE_AGREGARÁ_AQUÍ]
Client Secret: [CLIENTE_AGREGARÁ_AQUÍ]
```

---

### **🟡 MERCADOPAGO**

#### **Paso 1: Crear Cuenta Developer**
1. Ve a: https://www.mercadopago.com.mx/developers
2. Inicia sesión o regístrate
3. Ve a "Tus integraciones"

#### **Paso 2: Crear Aplicación**
1. "Crear aplicación"
2. Configuración:
   ```
   Nombre: Tlamatini Donaciones UTEQ
   Descripción: Sistema de donaciones para Universidad
   Categoría: Donations/Non-profit
   Modelo de integración: Checkout Pro
   ```

#### **Paso 3: Obtener Credenciales**
```bash
# SANDBOX (Desarrollo)
Public Key: TEST-c3f9b2a8e1d5f7a9c2b4e6f8a1c5d9e2-191729452
Access Token: TEST-2847694967324672-082915-b4a2d2c3c8f9e1a7b5d8f2e4c1a6b9d5-191729452

# PRODUCCIÓN - El cliente los agregará después
Public Key: [CLIENTE_AGREGARÁ_AQUÍ]
Access Token: [CLIENTE_AGREGARÁ_AQUÍ]
```

---

## ⚙️ **2. CONFIGURACIÓN DE CREDENCIALES** {#credenciales}

### **Backend (.env)**
```bash
# ===========================================
# PAYPAL CONFIGURATION
# ===========================================
PAYPAL_CLIENT_ID=AZkcE8QnVdCQaZnV9FtrpGhCBFa7cQZkxkKNTXLsyBfKVSVqSJgJLbF7X8Qb4kKp
PAYPAL_CLIENT_SECRET=EH4J8gJ9bGf2cJ5bF8fG3hI9cL4sB6gK5J2qF9nP7wR2tY8xE1vC3zF6sD4rG
PAYPAL_API_URL=https://api-m.sandbox.paypal.com

# Production (Client will replace)
PAYPAL_CLIENT_ID_PROD=YOUR_PRODUCTION_CLIENT_ID_HERE
PAYPAL_CLIENT_SECRET_PROD=YOUR_PRODUCTION_CLIENT_SECRET_HERE
PAYPAL_API_URL_PROD=https://api-m.paypal.com

# ===========================================
# MERCADOPAGO CONFIGURATION  
# ===========================================
MERCADO_PAGO_ACCESS_TOKEN=TEST-2847694967324672-082915-b4a2d2c3c8f9e1a7b5d8f2e4c1a6b9d5-191729452
MERCADO_PAGO_PUBLIC_KEY=TEST-c3f9b2a8e1d5f7a9c2b4e6f8a1c5d9e2-191729452

# Production (Client will replace)
MERCADO_PAGO_ACCESS_TOKEN_PROD=YOUR_PRODUCTION_ACCESS_TOKEN_HERE
MERCADO_PAGO_PUBLIC_KEY_PROD=YOUR_PRODUCTION_PUBLIC_KEY_HERE
```

### **Frontend (.env)**
```bash
# ===========================================
# PAYMENT CONFIGURATION
# ===========================================
VITE_PAYPAL_CLIENT_ID=AZkcE8QnVdCQaZnV9FtrpGhCBFa7cQZkxkKNTXLsyBfKVSVqSJgJLbF7X8Qb4kKp
VITE_PAYPAL_ENVIRONMENT=sandbox
VITE_MERCADO_PAGO_PUBLIC_KEY=TEST-c3f9b2a8e1d5f7a9c2b4e6f8a1c5d9e2-191729452

# Production (Client will replace)
VITE_PAYPAL_CLIENT_ID_PROD=YOUR_PRODUCTION_PAYPAL_CLIENT_ID
VITE_MERCADO_PAGO_PUBLIC_KEY_PROD=YOUR_PRODUCTION_MP_PUBLIC_KEY
```

---

## 🗄️ **3. MIGRACIÓN DE BASE DE DATOS** {#migracion}

### **Ejecutar Script SQL**
```sql
-- Ejecuta este archivo: database_migration_pagos.sql
source C:\servicio-social-uteq\tlamatini\database_migration_pagos.sql
```

### **Verificar Migración**
```sql
-- Verificar que los campos se agregaron
DESCRIBE donaciones;

-- Verificar índices
SHOW INDEX FROM donaciones;
```

---

## 🧪 **4. PRUEBAS DE FUNCIONALIDAD** {#pruebas}

### **Backend**
```bash
# 1. Instalar dependencias
cd backend
npm install @paypal/paypal-server-sdk mercadopago axios

# 2. Iniciar servidor
npm start

# 3. Probar endpoints
curl -X GET http://localhost:3000/api/pagos/methods
```

### **Frontend**
```bash
# 1. Instalar dependencias
cd frontend-movil
npm install react-native-webview

# 2. Iniciar app
npx expo start

# 3. Probar en dispositivo/emulador
```

### **Flujo de Pruebas**
1. **Crear donación** → Cualquier tipo
2. **Seleccionar PayPal** → Debería abrir WebView simulado
3. **Completar pago** → Debería mostrar success
4. **Verificar estado** → En "Mis Donaciones"
5. **Repetir con MercadoPago**

---

## 🚀 **5. CONFIGURACIÓN PARA PRODUCCIÓN** {#produccion}

### **Instrucciones para el Cliente**

#### **PayPal Producción**
```bash
# 1. Ir a https://developer.paypal.com/
# 2. Cambiar a modo LIVE
# 3. Crear nueva app o activar existente para LIVE
# 4. Reemplazar en .env:

PAYPAL_CLIENT_ID_PROD=TU_CLIENT_ID_REAL
PAYPAL_CLIENT_SECRET_PROD=TU_CLIENT_SECRET_REAL
```

#### **MercadoPago Producción**
```bash
# 1. Ir a https://www.mercadopago.com.mx/developers
# 2. En tu aplicación → Credenciales
# 3. Activar aplicación para PRODUCCIÓN
# 4. Reemplazar en .env:

MERCADO_PAGO_ACCESS_TOKEN_PROD=APP_USR-TU_ACCESS_TOKEN_REAL
MERCADO_PAGO_PUBLIC_KEY_PROD=APP_USR-TU_PUBLIC_KEY_REAL
```

#### **Variables de Entorno**
```bash
# Cambiar a producción
NODE_ENV=production

# URLs de producción
BASE_URL=https://tu-dominio.com
```

---

## 📊 **ENDPOINTS DISPONIBLES**

### **PayPal**
```bash
POST /api/pagos/paypal/create-order
POST /api/pagos/paypal/capture/:orderId
GET  /api/pagos/paypal/success
GET  /api/pagos/paypal/cancel
```

### **MercadoPago**
```bash
POST /api/pagos/mercadopago/create-preference
POST /api/pagos/mercadopago/webhook
GET  /api/pagos/mercadopago/success
GET  /api/pagos/mercadopago/failure
```

### **General**
```bash
GET /api/pagos/methods
GET /api/pagos/status/:donacionId
```

---

## 🔒 **SEGURIDAD**

### **Configuraciones Importantes**
1. **Variables de entorno** → Nunca subir al repositorio
2. **Webhooks** → Validar origen y firma
3. **HTTPS** → Obligatorio en producción
4. **Validaciones** → Siempre validar en backend

### **Logs y Monitoreo**
```javascript
// El sistema automáticamente logea:
console.log('✅ PayPal order created:', orderId);
console.log('📨 MercadoPago webhook received:', notification);
console.log('💰 Payment completed:', paymentData);
```

---

## 🎯 **RESUMEN**

### **✅ Implementado**
- ✅ Configuración de servicios PayPal y MercadoPago
- ✅ Controladores de pago con simulación
- ✅ WebView para procesamiento de pagos
- ✅ Validaciones y manejo de errores
- ✅ Base de datos actualizada con campos de pago
- ✅ Endpoints RESTful completos

### **🔄 Modo Simulación**
- 🔸 En `NODE_ENV=development` usa simulación
- 🔸 90% éxito PayPal, 85% éxito MercadoPago
- 🔸 Delays realistas (1-2 segundos)
- 🔸 Logs detallados para debugging

### **🚀 Listo para Producción**
- 📝 Cliente solo necesita reemplazar credenciales
- 🔐 Sistema detecta automáticamente entorno
- 📊 Logs y monitoreo incluidos
- 🛡️ Validaciones de seguridad implementadas

---

## 📞 **SOPORTE**

Si hay problemas:
1. **Verificar logs** del servidor y app
2. **Revisar credenciales** en archivos .env
3. **Confirmar migración** de BD exitosa
4. **Probar endpoints** individualmente

**¡Sistema de pagos listo para usar! 🎉**
