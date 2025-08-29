import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';

// Configurar almacenamiento
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadPath = 'uploads/evidencias';
        try {
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `evidencia-${uniqueSuffix}${extension}`);
    }
});

// Filtro para tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'));
    }
};

// Configurar multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
        files: 5 // Máximo 5 archivos
    },
    fileFilter: fileFilter
});

// Middleware para subida de evidencias
export const subirEvidencia = upload.array('evidencias', 5);

// Middleware para manejar errores de multer
export const manejarErroresSubida = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    message: 'El archivo es demasiado grande. Máximo 5MB por archivo.',
                    error: true
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    message: 'Demasiados archivos. Máximo 5 archivos.',
                    error: true
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    message: 'Campo de archivo inesperado.',
                    error: true
                });
            default:
                return res.status(400).json({
                    message: 'Error al subir archivo.',
                    error: true
                });
        }
    } else if (error) {
        return res.status(400).json({
            message: error.message,
            error: true
        });
    }
    next();
};

// Función para procesar archivos subidos
export const procesarArchivosSubidos = (req, res, next) => {
    if (req.files && req.files.length > 0) {
        const evidenciasUrls = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            url: `/uploads/evidencias/${file.filename}`
        }));
        
        req.evidencias = evidenciasUrls;
        
        // Agregar URL de evidencia principal al body
        if (evidenciasUrls.length > 0) {
            req.body.evidencia_url = evidenciasUrls[0].url;
        }
    }
    next();
};

// Función para limpiar archivos antiguos (ejecutar periódicamente)
export const limpiarArchivosAntiguos = async () => {
    try {
        const uploadPath = 'uploads/evidencias';
        const files = await fs.readdir(uploadPath);
        const now = Date.now();
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días

        for (const file of files) {
            const filePath = path.join(uploadPath, file);
            const stats = await fs.stat(filePath);
            
            if (now - stats.mtime.getTime() > maxAge) {
                await fs.unlink(filePath);
                console.log(`Archivo eliminado: ${file}`);
            }
        }
    } catch (error) {
        console.error('Error al limpiar archivos antiguos:', error);
    }
};

export default {
    subirEvidencia,
    manejarErroresSubida,
    procesarArchivosSubidos,
    limpiarArchivosAntiguos
};
