# Módulo de Donaciones - Tlamatini

## Descripción General

El módulo de donaciones permite a los usuarios realizar tres tipos de donaciones:
- **Donaciones Monetarias**: Contribuciones económicas simples
- **Donaciones Deducibles**: Contribuciones que generan comprobante fiscal
- **Donaciones en Especie**: Artículos físicos con evidencia fotográfica

## Funcionalidades Implementadas

### Backend (API REST)

#### Modelos de Base de Datos
- **Donacion.js**: Modelo principal para todas las donaciones
- **Factura.js**: Modelo para comprobantes fiscales (donaciones deducibles)
- **Pago.js**: Modelo para gestión de pagos (PayPal, Mercado Pago)

#### Controladores
- **donaciones.controller.js**: CRUD completo de donaciones
- **facturas.controller.js**: Generación y gestión de facturas
- **pagos.controller.js**: Procesamiento de pagos

#### Rutas API
```
GET    /api/donaciones                    - Listar todas las donaciones
POST   /api/donaciones                    - Crear nueva donación
GET    /api/donaciones/:id               - Obtener donación específica
PUT    /api/donaciones/:id               - Actualizar donación
DELETE /api/donaciones/:id               - Eliminar donación
GET    /api/donaciones/usuario/:id       - Donaciones de un usuario

GET    /api/facturas                      - Listar facturas
POST   /api/facturas                      - Crear factura
GET    /api/facturas/:id                 - Obtener factura específica
GET    /api/facturas/donacion/:id        - Factura de una donación
GET    /api/facturas/donacion/:id/descargar - Descargar factura (PDF/XML)

POST   /api/pagos/paypal                 - Procesar pago PayPal
POST   /api/pagos/mercado-pago           - Procesar pago Mercado Pago
GET    /api/pagos/:id                    - Obtener información de pago
```

### Frontend Mobile (React Native)

#### Pantallas Implementadas

1. **DonacionesScreen.jsx**
   - Pantalla principal del módulo
   - Navegación a tipos de donación
   - Acceso a historial de donaciones

2. **SelectorTipoDonacionScreen.jsx**
   - Selección del tipo de donación
   - Cards informativos para cada tipo
   - Navegación hacia formularios específicos

3. **DonacionMonetariaScreen.jsx**
   - Formulario para donaciones monetarias
   - Selección de monto (predefinido o personalizado)
   - Integración con PayPal y Mercado Pago
   - Validaciones de formulario

4. **DonacionDeducibleScreen.jsx**
   - Formulario para donaciones deducibles
   - Datos fiscales requeridos (RFC, razón social)
   - Generación automática de factura
   - Descarga de comprobante fiscal

5. **DonacionEspecieScreen.jsx**
   - Formulario para donaciones en especie
   - Categorización de artículos
   - Captura fotográfica de evidencia
   - Información de entrega/recolección

6. **MisDonacionesScreen.jsx**
   - Historial completo de donaciones
   - Filtros por estado (pendiente, validada, entregada)
   - Descarga de recibos (PDF/XML)
   - Detalles de cada donación

#### Componentes Reutilizables
- **SuccessModal**: Modal de éxito para confirmaciones
- **ErrorModal**: Modal de error para manejo de errores
- **Estilos consistentes**: Paleta de colores #3EAB37 (verde principal)

## Flujo de Usuario

### 1. Acceso al Módulo
Usuario → Menú Principal → "Hacer una Donación"

### 2. Selección de Tipo
- Donación Monetaria
- Donación Deducible  
- Donación en Especie

### 3. Proceso por Tipo

#### Donación Monetaria
1. Seleccionar monto ($50, $100, $250, $500, personalizado)
2. Agregar mensaje opcional
3. Seleccionar método de pago (PayPal/Mercado Pago)
4. Procesar pago
5. Confirmación y recibo

#### Donación Deducible
1. Seleccionar monto
2. Ingresar datos fiscales (RFC, razón social, dirección)
3. Procesar pago
4. Generación automática de factura
5. Descarga de comprobante fiscal (PDF/XML)

#### Donación en Especie
1. Seleccionar categoría de artículos
2. Describir artículos detalladamente
3. Tomar/seleccionar fotografía de evidencia
4. Registrar donación
5. Coordinación de entrega/recolección

### 4. Seguimiento
- Visualización en "Mis Donaciones"
- Estados: Pendiente → Validada → Entregada
- Descarga de recibos para donaciones validadas

## Integraciones

### Pagos
- **PayPal**: Pagos seguros internacionales
- **Mercado Pago**: Pagos locales (México)
- **Simulación**: Implementación mock para desarrollo

### Facturación
- **Generación PDF**: Comprobantes fiscales estándar
- **Generación XML**: Formato SAT (México)
- **Validación RFC**: Verificación de datos fiscales

### Almacenamiento
- **Evidencias**: Subida de imágenes (simulada)
- **Documentos**: Generación y almacenamiento de PDFs/XMLs

## Estados de Donación

1. **Pendiente**: Donación registrada, esperando validación
2. **Validada**: Donación verificada y aprobada
3. **Rechazada**: Donación no aprobada (casos especiales)
4. **Entregada**: Donación completada exitosamente

## Validaciones Implementadas

### Frontend
- Campos obligatorios
- Formatos de datos (RFC, email, teléfono)
- Montos mínimos y máximos
- Validación de archivos (imágenes)

### Backend
- Validación de esquemas con Sequelize
- Sanitización de datos
- Validación de business rules
- Manejo de errores robusto

## Consideraciones de Seguridad

- Validación de datos en frontend y backend
- Sanitización de inputs
- Manejo seguro de datos fiscales
- Logs de transacciones
- Encriptación de datos sensibles

## Tecnologías Utilizadas

### Backend
- Node.js + Express
- Sequelize ORM
- MySQL
- Multer (subida de archivos)
- JWT (autenticación)

### Frontend
- React Native + Expo
- React Navigation
- Styled Components
- Expo ImagePicker
- AsyncStorage

## Configuración y Despliegue

### Variables de Entorno
```env
# Backend
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
MERCADO_PAGO_ACCESS_TOKEN=your_mp_token

# Frontend
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
VITE_MERCADO_PAGO_PUBLIC_KEY=your_mp_public_key
```

### Instalación
```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend-movil
npm install
npm start
```

## Testing

### Casos de Prueba Recomendados
1. Flujo completo de donación monetaria
2. Generación de factura deducible
3. Subida de evidencia en donación en especie
4. Descarga de recibos
5. Filtros en historial de donaciones
6. Manejo de errores de conectividad
7. Validación de formularios

## Próximas Mejoras

1. **Notificaciones Push**: Alertas de estado de donaciones
2. **Reportes Avanzados**: Dashboard de donaciones
3. **Pagos Recurrentes**: Donaciones automáticas mensuales
4. **Geolocalización**: Mapa de centros de acopio
5. **Gamificación**: Sistema de puntos y logros
6. **Integración Real**: Conectar con APIs reales de pago
7. **Optimización**: Compresión de imágenes, cache
8. **Accessibility**: Mejoras de accesibilidad

## Contacto y Soporte

Para dudas sobre la implementación:
- **Backend**: Revisar logs en consola del servidor
- **Frontend**: Usar React Native Debugger
- **Base de Datos**: Verificar conexión y modelos en MySQL

---
*Documentación generada el 27 de agosto de 2025*
