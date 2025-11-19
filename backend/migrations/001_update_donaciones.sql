-- migration_donaciones.sql
-- Migración para asegurar que la tabla donaciones tenga todos los campos necesarios

-- Verificar estructura actual
DESCRIBE donaciones;

-- Agregar campos faltantes si no existen (usar ALTER TABLE IF NOT EXISTS no disponible en MySQL, usar condicionales)

-- Función auxiliar para verificar si existe una columna
DELIMITER //
CREATE PROCEDURE AddColumnIfNotExists(
    IN table_name VARCHAR(100),
    IN column_name VARCHAR(100),
    IN column_definition TEXT
)
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = table_name
    AND COLUMN_NAME = column_name;
    
    IF column_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', table_name, ' ADD COLUMN ', column_name, ' ', column_definition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

-- Agregar campos necesarios para la API de donaciones
CALL AddColumnIfNotExists('donaciones', 'validado', 'BOOLEAN DEFAULT FALSE');
CALL AddColumnIfNotExists('donaciones', 'evidencia_url', 'VARCHAR(500)');
CALL AddColumnIfNotExists('donaciones', 'estado_pago', 'ENUM("pendiente", "completado", "rechazado", "cancelado") DEFAULT "pendiente"');
CALL AddColumnIfNotExists('donaciones', 'metodo_pago', 'ENUM("paypal", "mercadopago", "transferencia", "efectivo")');
CALL AddColumnIfNotExists('donaciones', 'moneda', 'VARCHAR(3) DEFAULT "MXN"');
CALL AddColumnIfNotExists('donaciones', 'rfc', 'VARCHAR(13)');
CALL AddColumnIfNotExists('donaciones', 'razon_social', 'VARCHAR(150)');
CALL AddColumnIfNotExists('donaciones', 'uso_cfdi', 'VARCHAR(10)');

-- Limpiar procedimiento temporal
DROP PROCEDURE AddColumnIfNotExists;

-- Verificar estructura final
DESCRIBE donaciones;