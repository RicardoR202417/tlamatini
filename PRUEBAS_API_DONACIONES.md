# API Donaciones - Pruebas con Postman

## Configuración inicial

### Variables de entorno necesarias:
- `BASE_URL`: http://localhost:3000/api (o tu URL del servidor)
- `TOKEN`: Bearer token obtenido del login

## Endpoints implementados

### 1. POST /api/donaciones - Registrar donación

#### Donación Monetaria
```json
POST {{BASE_URL}}/donaciones
Headers:
  Authorization: Bearer {{TOKEN}}
  Content-Type: application/json

Body:
{
  "tipo": "monetaria",
  "monto": 500.00,
  "descripcion": "Donación para apoyo a programas educativos"
}
```

#### Donación Deducible
```json
POST {{BASE_URL}}/donaciones
Headers:
  Authorization: Bearer {{TOKEN}}
  Content-Type: application/json

Body:
{
  "tipo": "deducible",
  "monto": 1000.00,
  "descripcion": "Donación deducible de impuestos",
  "datos_fiscales": {
    "rfc": "XAXX010101000",
    "razon_social": "Juan Pérez García",
    "uso_cfdi": "G03"
  }
}
```

#### Donación en Especie
```json
POST {{BASE_URL}}/donaciones
Headers:
  Authorization: Bearer {{TOKEN}}
  Content-Type: application/json

Body:
{
  "tipo": "especie",
  "descripcion": "Donación de 20 libros de texto para nivel primaria, en buen estado",
  "evidencia_url": "https://example.com/imagen-evidencia.jpg"
}
```

### 2. GET /api/donaciones/:id - Obtener donación por ID

```json
GET {{BASE_URL}}/donaciones/1
Headers:
  Authorization: Bearer {{TOKEN}}
```

### 3. GET /api/usuarios/:id_usuario/donaciones - Obtener donaciones de un usuario

```json
GET {{BASE_URL}}/usuarios/1/donaciones?page=1&limit=10&tipo=monetaria
Headers:
  Authorization: Bearer {{TOKEN}}
```

### 4. GET /api/usuarios/:id_usuario/donaciones/estadisticas - Estadísticas

```json
GET {{BASE_URL}}/usuarios/1/donaciones/estadisticas
Headers:
  Authorization: Bearer {{TOKEN}}
```

## Respuestas esperadas

### Éxito (201/200):
```json
{
  "message": "Donación registrada exitosamente",
  "data": {
    "id_donacion": 1,
    "id_usuario": 1,
    "tipo": "monetaria",
    "monto": "500.00",
    "descripcion": "Donación para apoyo a programas educativos",
    "evidencia_url": null,
    "fecha": "2025-09-15T10:30:00.000Z",
    "validado": false,
    "estado_pago": "pendiente",
    "usuario": {
      "id_usuario": 1,
      "nombres": "Juan",
      "apellidos": "Pérez",
      "correo": "juan@example.com"
    }
  },
  "error": false
}
```

### Error de validación (400):
```json
{
  "message": "Datos de donación inválidos",
  "errors": [
    "El monto debe ser mayor a 0 para donaciones monetarias"
  ],
  "error": true
}
```

### Error de autenticación (401):
```json
{
  "message": "No autenticado",
  "error": true
}
```

### Error no encontrado (404):
```json
{
  "message": "Donación no encontrada",
  "error": true
}
```

## Validaciones por tipo de donación

### Monetaria:
- `monto` > 0
- `monto` <= 100,000 MXN

### Deducible:
- `monto` > 0
- `datos_fiscales.rfc` válido (12-13 caracteres)
- `datos_fiscales.razon_social` requerida

### Especie:
- `descripcion` mínimo 10 caracteres
- `evidencia_url` requerida

## Casos de prueba recomendados

1. ✅ Registrar donación monetaria válida
2. ✅ Registrar donación deducible con datos fiscales
3. ✅ Registrar donación en especie con evidencia
4. ❌ Intentar registrar sin autenticación
5. ❌ Registrar donación con monto inválido
6. ❌ Registrar donación deducible sin RFC
7. ❌ Registrar donación en especie sin evidencia
8. ✅ Obtener donación por ID válido
9. ❌ Obtener donación con ID inexistente
10. ✅ Listar donaciones con filtros

## Notas técnicas

- Todos los endpoints requieren autenticación JWT
- Los usuarios solo pueden acceder a sus propias donaciones
- Los administradores pueden acceder a todas las donaciones
- Las imágenes de evidencia deben subirse por separado (endpoint de upload)
- Las donaciones deducibles generan facturas automáticamente