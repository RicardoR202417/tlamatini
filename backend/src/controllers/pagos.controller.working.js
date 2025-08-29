// src/controllers/pagos.controller.js
import Donacion from '../models/Donacion.js';
import Factura from '../models/Factura.js';

class PagosController {
    
    // ====================================
    // PAYPAL ENDPOINTS
    // ====================================

    /**
     * Create PayPal payment order
     */
    async createPayPalOrder(req, res) {
        try {
            console.log('🔍 PayPal createOrder called with body:', req.body);
            const { donacionId, returnUrl, cancelUrl } = req.body;

            console.log('🔍 Extracted donacionId:', donacionId);

            if (!donacionId) {
                console.log('❌ Missing donacionId in request');
                return res.status(400).json({
                    success: false,
                    message: 'donacionId es requerido'
                });
            }

            // Get donation details
            console.log('🔍 Looking for donation with ID:', donacionId);
            const donacion = await Donacion.findByPk(donacionId);
            
            if (!donacion) {
                console.log('❌ Donation not found with ID:', donacionId);
                return res.status(404).json({
                    success: false,
                    message: 'Donación no encontrada'
                });
            }

            console.log('✅ Found donation:', donacion.toJSON());

            // Simulate PayPal order creation for now
            const mockOrderId = `PAYPAL_ORDER_${Date.now()}`;
            const mockApprovalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${mockOrderId}`;

            // Update donation with PayPal order ID
            await donacion.update({
                metodo_pago: 'paypal',
                estado_pago: 'pendiente',
                paypal_order_id: mockOrderId
            });

            console.log('✅ PayPal order created (simulated):', mockOrderId);

            return res.json({
                success: true,
                message: 'Orden de PayPal creada exitosamente',
                data: {
                    orderId: mockOrderId,
                    approvalUrl: mockApprovalUrl,
                    status: 'CREATED'
                }
            });

        } catch (error) {
            console.error('❌ Error creating PayPal order:', error);
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

            // Find and update donation
            const donacion = await Donacion.findOne({ 
                where: { paypal_order_id: orderId } 
            });

            if (donacion) {
                await donacion.update({
                    estado_pago: 'completado',
                    paypal_capture_id: `CAPTURE_${Date.now()}`,
                    fecha_pago: new Date()
                });

                // Create automatic invoice for deductible donations
                if (donacion.tipo === 'deducible') {
                    await this.createAutomaticInvoice(donacion);
                }
            }

            console.log('✅ PayPal payment captured (simulated):', orderId);

            return res.json({
                success: true,
                message: 'Pago capturado exitosamente',
                data: {
                    orderId: orderId,
                    captureId: `CAPTURE_${Date.now()}`,
                    status: 'COMPLETED',
                    amount: { currency_code: 'MXN', value: '100.00' }
                }
            });

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

            // Simulate MercadoPago preference creation
            const mockPreferenceId = `MP_PREF_${Date.now()}`;
            const mockInitPoint = `https://sandbox.mercadopago.com.mx/checkout/v1/redirect?pref_id=${mockPreferenceId}`;

            // Update donation with MercadoPago preference ID
            await donacion.update({
                metodo_pago: 'mercadopago',
                estado_pago: 'pendiente',
                mercadopago_preference_id: mockPreferenceId
            });

            console.log('✅ MercadoPago preference created (simulated):', mockPreferenceId);

            return res.json({
                success: true,
                message: 'Preferencia de MercadoPago creada exitosamente',
                data: {
                    preferenceId: mockPreferenceId,
                    initPoint: mockInitPoint,
                    sandboxInitPoint: mockInitPoint,
                    qrCode: `https://www.mercadopago.com.mx/qr/${mockPreferenceId}`
                }
            });

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
            
            console.log('📨 MercadoPago webhook received (simulated):', notification);

            // Simulate webhook processing
            const result = {
                success: true,
                paymentId: notification.data?.id || 'SIMULATED_ID',
                status: 'approved',
                amount: 100.00,
                currency: 'MXN'
            };

            // Find and update donation if needed
            if (result.externalReference) {
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
            }

            return res.status(200).json({ received: true });

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
