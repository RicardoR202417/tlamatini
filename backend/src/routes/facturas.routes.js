import express from 'express';
import { 
    generarFactura,
    obtenerFacturaPorId,
    obtenerFacturaPorDonacion,
    obtenerFacturasPorUsuario,
    descargarFacturaPDF,
    descargarFacturaXML
} from '../controllers/facturas.controller.js';

const router = express.Router();

// Endpoint para generar una factura
router.post('/facturas', generarFactura);

// Endpoint para obtener una factura por ID
router.get('/facturas/:id', obtenerFacturaPorId);

// Endpoint para obtener factura por donación
router.get('/donaciones/:id_donacion/factura', obtenerFacturaPorDonacion);

// Endpoint para obtener facturas de un usuario
router.get('/usuarios/:id_usuario/facturas', obtenerFacturasPorUsuario);

// Endpoints para descargar archivos
router.get('/facturas/:id/pdf', descargarFacturaPDF);
router.get('/facturas/:id/xml', descargarFacturaXML);

// Endpoint unificado para descarga por donación (como en el frontend)
router.get('/facturas/donacion/:id_donacion/descargar', async (req, res) => {
    try {
        const { id_donacion } = req.params;
        const { formato = 'pdf' } = req.query;

        const Factura = (await import('../models/Factura.js')).default;
        
        const factura = await Factura.findOne({ 
            where: { id_donacion },
            include: [{
                model: (await import('../models/Donacion.js')).default,
                as: 'donacion'
            }]
        });

        if (!factura) {
            return res.status(404).json({ 
                message: 'No se encontró factura para esta donación', 
                error: true 
            });
        }

        // Redireccionar al endpoint específico
        if (formato.toLowerCase() === 'xml') {
            return res.redirect(`/api/facturas/${factura.id_factura}/xml`);
        } else {
            return res.redirect(`/api/facturas/${factura.id_factura}/pdf`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al procesar descarga', error: true });
    }
});

export default router;
