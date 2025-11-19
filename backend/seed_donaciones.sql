-- seed_donaciones.sql
-- Script para insertar datos de prueba para la API de donaciones

-- Primero asegurémonos de que existe un usuario de prueba
INSERT IGNORE INTO usuarios (
    id_usuario, nombres, apellidos, correo, password, tipo_usuario, validado, fecha_registro
) VALUES (
    999, 'Usuario', 'Prueba', 'test@tlamatini.org', 
    '$2b$10$7h8/kGrLJ4/3bJ1QrX9HgOqXVK5Jp5vF2Jp.w3F8jX9FgOqXVK5J', 
    'beneficiario', true, NOW()
);

-- Insertar donaciones de ejemplo para pruebas
INSERT INTO donaciones (
    id_usuario, tipo, monto, descripcion, evidencia_url, fecha, validado, estado_pago, moneda
) VALUES 
-- Donaciones monetarias
(999, 'monetaria', 500.00, 'Donación para apoyo a programas educativos', NULL, NOW(), false, 'pendiente', 'MXN'),
(999, 'monetaria', 1500.00, 'Apoyo mensual', NULL, DATE_SUB(NOW(), INTERVAL 1 MONTH), true, 'completado', 'MXN'),

-- Donaciones deducibles
(999, 'deducible', 2000.00, 'Donación deducible anual', NULL, NOW(), false, 'pendiente', 'MXN', 'XAXX010101000', 'Usuario Prueba S.A. de C.V.', 'G03'),

-- Donaciones en especie
(999, 'especie', NULL, 'Donación de 20 libros de texto para nivel primaria, en buen estado', 'https://example.com/evidencia1.jpg', NOW(), false, 'pendiente', NULL),
(999, 'especie', NULL, 'Ropa infantil en buen estado (tallas 6-8 años)', 'https://example.com/evidencia2.jpg', DATE_SUB(NOW(), INTERVAL 7 DAY), true, 'completado', NULL);

-- Mostrar los datos insertados
SELECT 
    d.id_donacion,
    d.tipo,
    d.monto,
    d.descripcion,
    d.validado,
    d.estado_pago,
    u.nombres,
    u.apellidos,
    u.correo
FROM donaciones d 
JOIN usuarios u ON d.id_usuario = u.id_usuario 
WHERE u.id_usuario = 999
ORDER BY d.fecha DESC;