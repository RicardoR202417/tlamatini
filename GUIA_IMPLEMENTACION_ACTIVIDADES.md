# Guía de Implementación - Módulo Actividades

## ✅ Tareas Completadas

### 1. Backend - Modelos de Base de Datos
**Archivos creados:**
- `backend/src/models/Actividad.js` - Modelo Sequelize para tabla actividades
- `backend/src/models/Inscripcion.js` - Modelo Sequelize para tabla inscripciones

**Funcionalidades:**
- Modelo Actividad con campos: id, titulo, descripcion, tipo, modalidad, fecha, horario_inicio, horario_fin, ubicacion, cupo
- Modelo Inscripcion con relación many-to-many entre usuarios y actividades
- Validaciones de foreign keys y unicidad (un usuario no puede inscribirse dos veces a la misma actividad)

### 2. Backend - Controlador de Actividades
**Archivo creado:** `backend/src/controllers/actividades.controller.js`

**Funciones implementadas:**
- `obtenerActividades()` - GET /api/actividades - Obtiene todas las actividades con sus inscripciones
- `obtenerActividadPorId(id)` - GET /api/actividades/:id - Obtiene detalles completos de una actividad
- `crearActividad()` - POST /api/actividades - Crea nueva actividad (admin)
- `actualizarActividad(id)` - PUT /api/actividades/:id - Actualiza una actividad (admin)
- `eliminarActividad(id)` - DELETE /api/actividades/:id - Elimina una actividad (admin)
- `inscribirseEnActividad(idActividad)` - POST /api/actividades/:idActividad/inscripciones - Inscribe usuario
- `cancelarInscripcion(idInscripcion)` - DELETE /api/actividades/inscripciones/:idInscripcion - Cancela inscripción
- `obtenerInscripcionesUsuario(idUsuario)` - GET /api/actividades/usuario/:idUsuario/inscripciones - Obtiene inscripciones del usuario

### 3. Backend - Rutas
**Archivo creado:** `backend/src/routes/actividades.routes.js`

**Rutas registradas:**
```
GET    /actividades              - Obtener todas
GET    /actividades/:id          - Obtener por ID
POST   /actividades              - Crear (admin)
PUT    /actividades/:id          - Actualizar (admin)
DELETE /actividades/:id          - Eliminar (admin)
POST   /actividades/:idActividad/inscripciones              - Inscribirse (auth)
DELETE /actividades/inscripciones/:idInscripcion           - Cancelar (auth)
GET    /actividades/usuario/:idUsuario/inscripciones       - Mis inscripciones (auth)
```

**Archivo actualizado:** `backend/src/routes/index.js` - Agregada la importación y montaje de rutas de actividades

### 4. Modelos Actualizados
**Archivo actualizado:** `backend/src/models/index.js`
- Agregadas importaciones de Actividad e Inscripcion
- Configuradas asociaciones:
  - Inscripcion.belongsTo(Usuario)
  - Inscripcion.belongsTo(Actividad)
  - Usuario.hasMany(Inscripcion)
  - Actividad.hasMany(Inscripcion)

### 5. Frontend Móvil - Servicio de API
**Archivo creado:** `frontend-movil/src/services/actividadesService.js`

**Funciones:**
- `obtenerActividades()` - Fetch GET a /api/actividades
- `obtenerActividadPorId(idActividad)` - Fetch GET a /api/actividades/:id
- `inscribirseEnActividad(idActividad, token)` - Fetch POST con autenticación
- `cancelarInscripcion(idInscripcion, token)` - Fetch DELETE con autenticación
- `obtenerInscripcionesUsuario(idUsuario, token)` - Fetch GET con autenticación

### 6. Frontend Móvil - Pantalla de Listado
**Archivo actualizado:** `frontend-movil/src/screens/ActividadesSocialesScreen.jsx`

**Características implementadas:**
- Carga de actividades desde API en useEffect
- Indicador de carga (ActivityIndicator)
- Manejo de errores con botón de reintento
- Mapeo dinámico de iconos según tipo de actividad
- Formateo de fechas en español
- Navegación a pantalla de detalles al hacer tap en actividad
- Estado de inscripción visual
- Botón de actualizar para refrescar lista

### 7. Frontend Móvil - Pantalla de Detalles
**Archivo creado:** `frontend-movil/src/screens/DetalleActividadScreen.jsx`

**Características implementadas:**
- Visualización completa de detalles de actividad
- Información: fecha, hora, ubicación, modalidad, total de participantes
- Lógica de inscripción/cancelación
- Verificación de si el usuario ya está inscrito
- Botones dinámicos:
  - "Inscribirse Ahora" - Si no está inscrito
  - "✓ Inscrito" - Si ya está inscrito
  - "Cancelar Inscripción" - Botón secundario si está inscrito
- Confirmación antes de cancelar inscripción
- Alertas de éxito/error
- Indicador de carga durante operaciones
- Lista de participantes confirmados
- Estilos consistentes con el diseño de la app

### 8. Frontend Móvil - Navegación
**Archivo actualizado:** `frontend-movil/App.js`

**Cambios realizados:**
- Importación de `DetalleActividadScreen`
- Registro de ruta "DetalleActividad" en Stack.Navigator
- Configuración headerShown: false para mantener consistencia

---

## 🗄️ Estructura de Base de Datos Utilizada

```sql
-- Tablas existentes en tlamatini.sql
CREATE TABLE actividades (
    id_actividad INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo ENUM('banco_alimentos','senderismo_terapeutico','terapia_psicologica'),
    modalidad ENUM('presencial','distancia','mixta') DEFAULT 'presencial',
    fecha DATETIME NOT NULL,
    cupo INT DEFAULT 0,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inscripciones (
    id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_actividad INT NOT NULL,
    fecha_inscripcion DATETIME DEFAULT CURRENT_TIMESTAMP,
    confirmada BOOLEAN DEFAULT FALSE,
    UNIQUE KEY uk_usuario_actividad (id_usuario, id_actividad),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_actividad) REFERENCES actividades(id_actividad)
);
```

---

## 📝 Próximos Pasos (Opcional)

1. **Agregar campos a Actividad:**
   - Ubicación específica (dirección, coordenadas)
   - Horarios de inicio y fin

2. **Panel de administración:**
   - Crear actividades
   - Editar actividades existentes
   - Ver lista de inscritos
   - Exportar reportes

3. **Notificaciones:**
   - Notificar a inscritos cuando una actividad está próxima
   - Recordatorios de actividades

4. **Filtros y búsqueda:**
   - Filtrar por tipo de actividad
   - Filtrar por fecha
   - Buscar por título

5. **Historial:**
   - Ver actividades pasadas en las que participó
   - Descargar certificados de asistencia

---

## 🧪 Pruebas de API (curl)

### Obtener todas las actividades
```bash
curl -X GET http://localhost:5000/api/actividades
```

### Obtener actividad por ID
```bash
curl -X GET http://localhost:5000/api/actividades/1
```

### Inscribirse en actividad (requiere autenticación)
```bash
curl -X POST http://localhost:5000/api/actividades/1/inscripciones \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json"
```

### Obtener mis inscripciones
```bash
curl -X GET http://localhost:5000/api/actividades/usuario/1/inscripciones \
  -H "Authorization: Bearer TU_TOKEN"
```

---

## ✨ Resumen

Se ha completado exitosamente la implementación del módulo de Actividades en la aplicación TLAMATINI con:

✅ **Backend completamente funcional** con controladores, rutas y modelos
✅ **Base de datos** con tablas de actividades e inscripciones
✅ **Frontend móvil** con dos pantallas (listado y detalles)
✅ **Autenticación** integrada en endpoints de inscripción
✅ **Gestión de errores** y estados de carga
✅ **Experiencia de usuario** mejorada con feedback visual

El módulo está listo para:
- Crear actividades desde admin
- Listar actividades para beneficiarios
- Inscribirse/cancelar inscripción
- Ver detalles de cada actividad
- Visualizar participantes confirmados

