// src/controllers/pagos.controller.js
import paypalService from '../services/paypalService.js';
import mercadopagoService from '../services/mercadopagoService.js';
import Donacion from '../models/Donacion.js';
import Factura from '../models/Factura.js';
import { useSimulation } from '../config/payments.js';

class PagosController {
    
    // ====================================
    // PAYPAL ENDPOINTS
    // ====================================

    /**
     * Create PayPal payment order
     */
    async createPayPalOrder(req, res) {
        try {
            const { donacionId, returnUrl, cancelUrl } = req.body;

            // Get donation details
            const donacion = await Donacion.findByPk(donacionId);
            if (!donacion) {
                return res.status(404).json({
                    success: false,
                    message: 'Donación no encontrada'
                });
            }

            // Create PayPal order
            const orderData = {
                amount: donacion.monto,
                currency: 'MXN',
                description: `Donación ${donacion.tipo} - ${donacion.descripcion}`,
                returnUrl: returnUrl || `${process.env.BASE_URL}/api/pagos/paypal/success`,
                cancelUrl: cancelUrl || `${process.env.BASE_URL}/api/pagos/paypal/cancel`
            };

            let result;
            
            // Use simulation only if explicitly enabled
            if (useSimulation) {
                console.log('🔸 Using PayPal SIMULATION mode');
                result = await paypalService.simulatePayment(orderData);
            } else {
                console.log('🔥 Using PayPal REAL API with sandbox credentials');
                result = await paypalService.createOrder(orderData);
            }

            if (result.success) {
                // Update donation with PayPal order ID
                await donacion.update({
                    metodo_pago: 'paypal',
                    estado_pago: 'pendiente',
                    paypal_order_id: result.orderId
                });

                return res.json({
                    success: true,
                    message: 'Orden de PayPal creada exitosamente',
                    data: {
                        orderId: result.orderId,
                        approvalUrl: result.approvalUrl,
                        status: result.status
                    }
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Error al crear orden de PayPal',
                    error: result.error
                });
            }

        } catch (error) {
            console.error('Error creating PayPal order:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Capture PayPal payment
     */
    async capturePayPalPayment(req, res) {
        try {
            const { orderId } = req.params;

            let result;
            
            // Use simulation only if explicitly enabled
            if (useSimulation) {
                result = {
                    success: true,
                    orderId: orderId,
                    status: 'COMPLETED',
                    captureId: `CAPTURE_${Date.now()}`,
                    amount: { currency_code: 'MXN', value: '100.00' }
                };
            } else {
                result = await paypalService.captureOrder(orderId);
            }

            if (result.success) {
                // Find and update donation
                const donacion = await Donacion.findOne({ 
                    where: { paypal_order_id: orderId } 
                });

                if (donacion) {
                    await donacion.update({
                        estado_pago: 'completado',
                        paypal_capture_id: result.captureId,
                        fecha_pago: new Date()
                    });

                    // Create automatic invoice for deductible donations
                    if (donacion.tipo === 'deducible') {
                        await this.createAutomaticInvoice(donacion);
                    }
                }

                return res.json({
                    success: true,
                    message: 'Pago capturado exitosamente',
                    data: {
                        orderId: result.orderId,
                        captureId: result.captureId,
                        status: result.status,
                        amount: result.amount
                    }
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Error al capturar pago de PayPal',
                    error: result.error
                });
            }

        } catch (error) {
            console.error('Error capturing PayPal payment:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // ====================================
    // MERCADOPAGO ENDPOINTS
    // ====================================

    /**
     * Create MercadoPago preference
     */
    async createMercadoPagoPreference(req, res) {
        try {
            const { donacionId, userEmail, userName } = req.body;

            // Get donation details
            const donacion = await Donacion.findByPk(donacionId);
            if (!donacion) {
                return res.status(404).json({
                    success: false,
                    message: 'Donación no encontrada'
                });
            }

            // Create MercadoPago preference
            const paymentData = {
                amount: donacion.monto,
                description: `Donación ${donacion.tipo} - ${donacion.descripcion}`,
                userEmail: userEmail,
                userName: userName,
                urls: {
                    success: `${process.env.BASE_URL}/api/pagos/mercadopago/success`,
                    failure: `${process.env.BASE_URL}/api/pagos/mercadopago/failure`,
                    pending: `${process.env.BASE_URL}/api/pagos/mercadopago/pending`
                }
            };

            let result;
            
            // Use simulation only if explicitly enabled
            if (useSimulation) {
                result = await mercadopagoService.simulatePayment(paymentData);
            } else {
                result = await mercadopagoService.createPreference(paymentData);
            }

            if (result.success) {
                // Update donation with MercadoPago preference ID
                await donacion.update({
                    metodo_pago: 'mercadopago',
                    estado_pago: 'pendiente',
                    mercadopago_preference_id: result.preferenceId
                });

                return res.json({
                    success: true,
                    message: 'Preferencia de MercadoPago creada exitosamente',
                    data: {
                        preferenceId: result.preferenceId,
                        initPoint: result.initPoint,
                        sandboxInitPoint: result.sandboxInitPoint,
                        qrCode: result.qrCode
                    }
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Error al crear preferencia de MercadoPago',
                    error: result.error
                });
            }

        } catch (error) {
            console.error('Error creating MercadoPago preference:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Process MercadoPago webhook
     */
    async processMercadoPagoWebhook(req, res) {
        try {
            const notification = req.body;
            
            console.log('📨 MercadoPago webhook received:', notification);

            let result;
            
            // Use simulation only if explicitly enabled
            if (useSimulation) {
                result = {
                    success: true,
                    paymentId: notification.data?.id || 'SIMULATED_ID',
                    status: 'approved',
                    amount: 100.00,
                    currency: 'MXN'
                };
            } else {
                result = await mercadopagoService.processWebhook(notification);
            }

            if (result.success) {
                // Find and update donation
                const donacion = await Donacion.findOne({
                    where: { mercadopago_preference_id: result.externalReference }
                });

                if (donacion) {
                    const estadoPago = result.status === 'approved' ? 'completado' : 
                                     result.status === 'rejected' ? 'rechazado' : 'pendiente';

                    await donacion.update({
                        estado_pago: estadoPago,
                        mercadopago_payment_id: result.paymentId,
                        fecha_pago: result.status === 'approved' ? new Date() : null
                    });

                    // Create automatic invoice for deductible donations
                    if (donacion.tipo === 'deducible' && result.status === 'approved') {
                        await this.createAutomaticInvoice(donacion);
                    }
                }

                return res.status(200).json({ received: true });
            } else {
                return res.status(400).json({ error: result.error });
            }

        } catch (error) {
            console.error('Error processing MercadoPago webhook:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // ====================================
    // UTILITY METHODS
    // ====================================

    /**
     * Create automatic invoice for deductible donations
     */
    async createAutomaticInvoice(donacion) {
        try {
            // Check if invoice already exists
            const existingInvoice = await Factura.findOne({
                where: { id_donacion: donacion.id_donacion }
            });

            if (!existingInvoice) {
                await Factura.create({
                    id_donacion: donacion.id_donacion,
                    rfc: donacion.rfc || 'XAXX010101000',
                    razon_social: donacion.razon_social || 'Donante Anónimo',
                    uso_cfdi: donacion.uso_cfdi || 'G01',
                    metodo_pago: '28', // Tarjeta de crédito
                    forma_pago: '04', // Tarjeta de crédito
                    total: donacion.monto,
                    uuid: `UUID-${Date.now()}`,
                    estado: 'emitida'
                });

                console.log('✅ Automatic invoice created for donation:', donacion.id_donacion);
            }
        } catch (error) {
            console.error('Error creating automatic invoice:', error);
        }
    }

    /**
     * Get payment status
     */
    async getPaymentStatus(req, res) {
        try {
            const { donacionId } = req.params;

            const donacion = await Donacion.findByPk(donacionId, {
                include: [{
                    model: Factura,
                    as: 'factura'
                }]
            });

            if (!donacion) {
                return res.status(404).json({
                    success: false,
                    message: 'Donación no encontrada'
                });
            }

            return res.json({
                success: true,
                data: {
                    donacionId: donacion.id_donacion,
                    metodoPago: donacion.metodo_pago,
                    estadoPago: donacion.estado_pago,
                    fechaPago: donacion.fecha_pago,
                    monto: donacion.monto,
                    factura: donacion.factura
                }
            });

        } catch (error) {
            console.error('Error getting payment status:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Get available payment methods
     */
    async getPaymentMethods(req, res) {
        try {
            const methods = [
                {
                    id: 'paypal',
                    name: 'PayPal',
                    description: 'Pago seguro con PayPal',
                    enabled: !!process.env.PAYPAL_CLIENT_ID,
                    currencies: ['MXN', 'USD'],
                    fees: '3.4% + $4.00 MXN'
                },
                {
                    id: 'mercadopago',
                    name: 'Mercado Pago',
                    description: 'Pago con tarjeta, OXXO, bancos',
                    enabled: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
                    currencies: ['MXN'],
                    fees: '4.99% + IVA'
                }
            ];

            return res.json({
                success: true,
                data: methods
            });

        } catch (error) {
            console.error('Error getting payment methods:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // ====================================
    // LEGACY METHODS (Compatibility)
    // ====================================

    /**
     * Legacy PayPal processing (for backward compatibility)
     */
    async procesarDonacionPayPal(req, res) {
        return this.createPayPalOrder(req, res);
    }

    /**
     * Legacy MercadoPago processing (for backward compatibility)
     */
    async procesarDonacionMercadoPago(req, res) {
        return this.createMercadoPagoPreference(req, res);
    }
}

export default new PagosController();
