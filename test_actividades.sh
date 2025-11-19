#!/bin/bash

# Archivo de prueba de endpoints de actividades
# Asegúrate de tener el servidor corriendo en http://localhost:3000

BASE_URL="http://localhost:3000/api"

echo "=== PRUEBAS DE API - MÓDULO ACTIVIDADES ==="
echo ""

# 1. Obtener todas las actividades
echo "1. Obtener todas las actividades"
echo "GET $BASE_URL/actividades"
curl -X GET "$BASE_URL/actividades" \
  -H "Content-Type: application/json" \
  -s | jq '.'
echo ""
echo "---"
echo ""

# 2. Crear una actividad (requiere token)
echo "2. Crear una actividad (requiere autenticación admin)"
echo "POST $BASE_URL/actividades"
echo "Nota: Reemplaza TOKEN_AQUI con un token válido"
echo ""
# curl -X POST "$BASE_URL/actividades" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer TOKEN_AQUI" \
#   -d '{
#     "titulo": "Actividad Test",
#     "descripcion": "Descripción de test",
#     "tipo": "banco_alimentos",
#     "modalidad": "presencial",
#     "fecha": "2025-11-20T09:00:00Z",
#     "horario_inicio": "09:00",
#     "horario_fin": "11:00",
#     "ubicacion": "Centro Comunitario",
#     "cupo": 20
#   }' \
#   -s | jq '.'
echo ""
echo "---"
echo ""

# 3. Obtener actividad por ID (después de crear una, reemplaza 1)
echo "3. Obtener actividad por ID"
echo "GET $BASE_URL/actividades/1"
curl -X GET "$BASE_URL/actividades/1" \
  -H "Content-Type: application/json" \
  -s | jq '.'
echo ""
echo "---"
echo ""

echo "✅ Pruebas completadas"
echo ""
echo "Para probar endpoints de inscripción necesitas:"
echo "- Un token JWT válido"
echo "- Reemplazar TOKEN_AQUI por tu token real"
echo "- Un ID de actividad válido"
