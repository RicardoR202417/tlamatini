import Factura from '../models/Factura.js';
import Donacion from '../models/Donacion.js';
import { Usuario } from '../models/Usuario.js';
import crypto from 'crypto';

// Generar factura para donación deducible
export const generarFactura = async (req, res) => {
    try {
        const { id_donacion, rfc, razon_social, uso_cfdi, metodo_pago, forma_pago } = req.body;

        // Validaciones básicas
        if (!id_donacion || !rfc || !uso_cfdi) {
            return res.status(400).json({ 
                message: 'Faltan datos obligatorios: id_donacion, rfc, uso_cfdi', 
                error: true 
            });
        }

        // Verificar que la donación existe y es de tipo deducible
        const donacion = await Donacion.findByPk(id_donacion, {
            include: [{
                model: Usuario,
                as: 'usuario',
                attributes: ['id_usuario', 'nombres', 'apellidos', 'correo']
            }]
        });

        if (!donacion) {
            return res.status(404).json({ message: 'Donación no encontrada', error: true });
        }

        if (donacion.tipo !== 'deducible') {
            return res.status(400).json({ 
                message: 'Solo se pueden facturar donaciones de tipo deducible', 
                error: true 
            });
        }

        if (!donacion.validado) {
            return res.status(400).json({ 
                message: 'La donación debe estar validada antes de facturar', 
                error: true 
            });
        }

        // Verificar que no existe ya una factura para esta donación
        const facturaExistente = await Factura.findOne({ where: { id_donacion } });
        if (facturaExistente) {
            return res.status(400).json({ 
                message: 'Ya existe una factura para esta donación', 
                error: true 
            });
        }

        // Validar RFC (formato básico)
        const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
        if (!rfcRegex.test(rfc)) {
            return res.status(400).json({ 
                message: 'RFC inválido', 
                error: true 
            });
        }

        // Generar UUID simulado (en producción sería del SAT)
        const uuid = crypto.randomUUID();

        // Crear la factura
        const nuevaFactura = await Factura.create({
            id_donacion,
            rfc: rfc.toUpperCase(),
            razon_social,
            uso_cfdi,
            metodo_pago,
            forma_pago,
            total: donacion.monto,
            uuid,
            xml_url: null, // Se generará después
            pdf_url: null  // Se generará después
        });

        // Simular generación de archivos (en producción sería con el PAC)
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const xmlUrl = `${baseUrl}/facturas/${nuevaFactura.id_factura}/xml`;
        const pdfUrl = `${baseUrl}/facturas/${nuevaFactura.id_factura}/pdf`;

        // Actualizar URLs
        await nuevaFactura.update({
            xml_url: xmlUrl,
            pdf_url: pdfUrl
        });

        res.status(201).json({ 
            message: 'Factura generada exitosamente', 
            data: {
                ...nuevaFactura.toJSON(),
                donacion: {
                    id_donacion: donacion.id_donacion,
                    tipo: donacion.tipo,
                    monto: donacion.monto,
                    descripcion: donacion.descripcion,
                    fecha: donacion.fecha
                }
            }, 
            error: false 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al generar la factura', error: true });
    }
};

// Obtener factura por ID
export const obtenerFacturaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const factura = await Factura.findByPk(id, {
            include: [{
                model: Donacion,
                as: 'donacion',
                include: [{
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['id_usuario', 'nombres', 'apellidos', 'correo']
                }]
            }]
        });

        if (!factura) {
            return res.status(404).json({ message: 'Factura no encontrada', error: true });
        }

        res.status(200).json({ message: 'Factura encontrada', data: factura, error: false });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener la factura', error: true });
    }
};

// Obtener facturas por donación
export const obtenerFacturaPorDonacion = async (req, res) => {
    try {
        const { id_donacion } = req.params;

        const factura = await Factura.findOne({ 
            where: { id_donacion },
            include: [{
                model: Donacion,
                as: 'donacion',
                include: [{
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['id_usuario', 'nombres', 'apellidos', 'correo']
                }]
            }]
        });

        if (!factura) {
            return res.status(404).json({ message: 'Factura no encontrada para esta donación', error: true });
        }

        res.status(200).json({ message: 'Factura encontrada', data: factura, error: false });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener la factura', error: true });
    }
};

// Obtener facturas de un usuario
export const obtenerFacturasPorUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;

        const { count, rows: facturas } = await Factura.findAndCountAll({
            include: [{
                model: Donacion,
                as: 'donacion',
                where: { id_usuario },
                include: [{
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['id_usuario', 'nombres', 'apellidos', 'correo']
                }]
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha_emision', 'DESC']]
        });

        res.status(200).json({ 
            message: 'Facturas obtenidas exitosamente', 
            data: {
                facturas,
                totalFacturas: count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit)
            }, 
            error: false 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las facturas', error: true });
    }
};

// Generar PDF de factura (simulado)
export const descargarFacturaPDF = async (req, res) => {
    try {
        const { id } = req.params;

        const factura = await Factura.findByPk(id, {
            include: [{
                model: Donacion,
                as: 'donacion',
                include: [{
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['nombres', 'apellidos', 'correo']
                }]
            }]
        });

        if (!factura) {
            return res.status(404).json({ message: 'Factura no encontrada', error: true });
        }

        // Usar la nueva función de generación de PDF
        const pdfResult = await generarPDFFactura(factura, factura.donacion);
        
        if (!pdfResult.success) {
            return res.status(500).json({ 
                message: 'Error al generar PDF', 
                error: pdfResult.error 
            });
        }

        res.setHeader('Content-Type', pdfResult.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);
        res.send(pdfResult.buffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al generar el PDF', error: true });
    }
};

// Generar XML de factura (simulado)
export const descargarFacturaXML = async (req, res) => {
    try {
        const { id } = req.params;

        const factura = await Factura.findByPk(id, {
            include: [{
                model: Donacion,
                as: 'donacion'
            }]
        });

        if (!factura) {
            return res.status(404).json({ message: 'Factura no encontrada', error: true });
        }

        // En producción aquí generarías el XML real con timbrado del SAT
        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante 
    xmlns:cfdi="http://www.sat.gob.mx/cfd/4" 
    Version="4.0" 
    Folio="${factura.id_factura}"
    Serie="A"
    Fecha="${factura.fecha_emision}"
    Sello="simulated_seal"
    NoCertificado="simulated_cert"
    Certificado="simulated_cert_content"
    SubTotal="${factura.total}"
    Total="${factura.total}"
    TipoDeComprobante="I"
    MetodoPago="${factura.metodo_pago || 'PUE'}"
    LugarExpedicion="00000">

    <cfdi:Emisor Rfc="TLA123456789" Nombre="TLAMATINI A.C." RegimenFiscal="601"/>
    
    <cfdi:Receptor 
        Rfc="${factura.rfc}" 
        Nombre="${factura.razon_social || ''}" 
        UsoCFDI="${factura.uso_cfdi}"
        DomicilioFiscalReceptor="${factura.rfc.substring(0, 5)}"/>

    <cfdi:Conceptos>
        <cfdi:Concepto 
            ClaveProdServ="84101600" 
            Cantidad="1" 
            ClaveUnidad="E48" 
            Unidad="Unidad de servicio" 
            Descripcion="Donación deducible" 
            ValorUnitario="${factura.total}" 
            Importe="${factura.total}"/>
    </cfdi:Conceptos>

    <cfdi:Complemento>
        <tfd:TimbreFiscalDigital 
            xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" 
            Version="1.1" 
            UUID="${factura.uuid}" 
            FechaTimbrado="${factura.fecha_emision}" 
            SelloCFD="simulated_seal_cfd" 
            NoCertificadoSAT="simulated_sat_cert"/>
    </cfdi:Complemento>
</cfdi:Comprobante>`;

        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', `attachment; filename="factura-${factura.id_factura}.xml"`);
        res.send(xmlContent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al generar el XML', error: true });
    }
};

// Función para generar PDF mejorado
export const generarPDFFactura = async (factura, donacion) => {
    try {
        // Simulación de generación de PDF más detallada
        const fechaActual = new Date().toLocaleDateString('es-MX');
        const vigenciaFactura = new Date();
        vigenciaFactura.setFullYear(vigenciaFactura.getFullYear() + 1);
        
        const pdfContent = {
            metadata: {
                title: `Factura ${factura.folio}`,
                subject: 'Comprobante Fiscal Digital por Internet',
                author: 'Tlamatini',
                creator: 'Sistema de Facturación Tlamatini'
            },
            header: {
                organizacion: 'ASOCIACIÓN TLAMATINI A.C.',
                rfc: 'ATL123456789',
                direccion: 'Av. Constitución 123, Col. Centro, Querétaro, Qro.',
                telefono: '(442) 123-4567',
                email: 'facturacion@tlamatini.org'
            },
            factura: {
                folio: factura.folio,
                uuid: factura.uuid,
                fecha_emision: factura.fecha_emision,
                vigencia: vigenciaFactura.toLocaleDateString('es-MX'),
                serie: 'DON',
                lugar_expedicion: '76000' // Código postal
            },
            receptor: {
                rfc: factura.rfc_receptor,
                razon_social: factura.razon_social_receptor,
                direccion: factura.direccion_receptor,
                uso_cfdi: 'D10 - Pagos por servicios educativos (colegiaturas)'
            },
            conceptos: [{
                cantidad: 1,
                unidad: 'ACT',
                descripcion: `Donación para actividades de asistencia social - ${donacion.descripcion}`,
                valor_unitario: factura.subtotal,
                importe: factura.subtotal
            }],
            totales: {
                subtotal: factura.subtotal,
                iva: factura.iva,
                total: factura.total
            },
            timbrado: {
                fecha: factura.fecha_emision,
                certificado_sat: 'SIMULADO123456',
                sello_cfd: 'sello_simulado_cfd_123456789',
                sello_sat: 'sello_simulado_sat_987654321'
            }
        };

        // En un entorno real, aquí se usaría una librería como PDFKit o similar
        const simulatedPDFBuffer = Buffer.from(JSON.stringify(pdfContent, null, 2));
        
        return {
            success: true,
            buffer: simulatedPDFBuffer,
            filename: `factura-${factura.folio}.pdf`,
            contentType: 'application/pdf'
        };
    } catch (error) {
        console.error('Error generando PDF:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Función para validar RFC mexicano
export const validarRFC = (rfc) => {
    const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    return rfcPattern.test(rfc.toUpperCase());
};

// Función para validar datos fiscales completos
export const validarDatosFiscales = (datos) => {
    const errores = [];

    if (!datos.rfc || !validarRFC(datos.rfc)) {
        errores.push('RFC inválido');
    }

    if (!datos.razon_social || datos.razon_social.trim().length < 3) {
        errores.push('Razón social debe tener al menos 3 caracteres');
    }

    if (!datos.direccion || datos.direccion.trim().length < 10) {
        errores.push('La dirección debe ser más específica');
    }

    return {
        valido: errores.length === 0,
        errores
    };
};
