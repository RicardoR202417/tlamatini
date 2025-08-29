// src/services/mercadopagoService.js
import mercadopago from 'mercadopago';
import { mercadopagoConfig } from '../config/payments.js';
import axios from 'axios';

class MercadoPagoService {
    constructor() {
        this.initializeClient();
    }

    initializeClient() {
        try {
            // Configure MercadoPago
            mercadopago.configure({
                access_token: mercadopagoConfig.accessToken,
                integrator_id: 'dev_2e4207c8e5b847a09950fde54ac2d1bf' // Optional: your integrator ID
            });

            this.client = mercadopago;
            this.apiUrl = mercadopagoConfig.apiUrl;
            this.accessToken = mercadopagoConfig.accessToken;

            console.log('✅ MercadoPago client initialized');
        } catch (error) {
            console.error('❌ MercadoPago initialization failed:', error.message);
            throw error;
        }
    }

    /**
     * Create a payment preference
     * @param {Object} paymentData - Payment information
     * @param {number} paymentData.amount - Payment amount
     * @param {string} paymentData.description - Payment description
     * @param {string} paymentData.userEmail - User email
     * @param {string} paymentData.userName - User name
     * @param {Object} paymentData.urls - Success, failure, pending URLs
     */
    async createPreference(paymentData) {
        try {
            const { 
                amount, 
                description, 
                userEmail, 
                userName, 
                urls = {} 
            } = paymentData;

            const preference = {
                items: [{
                    id: `donation_${Date.now()}`,
                    title: description || 'Donación - Tlamatini UTEQ',
                    currency_id: 'MXN',
                    picture_url: 'https://tu-dominio.com/logo.png', // Optional
                    description: description || 'Donación para proyectos estudiantiles',
                    category_id: 'donations',
                    quantity: 1,
                    unit_price: parseFloat(amount)
                }],
                payer: {
                    name: userName || 'Usuario',
                    surname: 'Donante',
                    email: userEmail,
                    phone: {
                        area_code: '55',
                        number: '12345678'
                    },
                    identification: {
                        type: 'RFC',
                        number: 'XXXX000000XXX'
                    },
                    address: {
                        street_name: 'Calle Falsa',
                        street_number: 123,
                        zip_code: '12345'
                    }
                },
                back_urls: {
                    success: urls.success || 'https://tu-dominio.com/payment/success',
                    failure: urls.failure || 'https://tu-dominio.com/payment/failure',
                    pending: urls.pending || 'https://tu-dominio.com/payment/pending'
                },
                auto_return: 'approved',
                payment_methods: {
                    excluded_payment_methods: [
                        // { id: 'visa' }  // Exclude specific methods if needed
                    ],
                    excluded_payment_types: [
                        // { id: 'atm' }   // Exclude ATM payments
                    ],
                    installments: 12  // Maximum installments
                },
                notification_url: 'https://tu-dominio.com/api/webhooks/mercadopago',
                statement_descriptor: 'TLAMATINI-UTEQ',
                external_reference: `donation_${Date.now()}`,
                expires: true,
                expiration_date_from: new Date().toISOString(),
                expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
            };

            const response = await this.client.preferences.create(preference);
            
            console.log('✅ MercadoPago preference created:', response.body.id);
            
            return {
                success: true,
                preferenceId: response.body.id,
                initPoint: response.body.init_point,
                sandboxInitPoint: response.body.sandbox_init_point,
                qrCode: response.body.qr_code,
                qrCodeBase64: response.body.qr_code_base64,
                details: response.body
            };

        } catch (error) {
            console.error('❌ MercadoPago preference creation failed:', error);
            return {
                success: false,
                error: error.message,
                details: error.cause || null
            };
        }
    }

    /**
     * Get payment information
     * @param {string} paymentId - MercadoPago payment ID
     */
    async getPayment(paymentId) {
        try {
            const response = await this.client.payment.findById(parseInt(paymentId));
            
            return {
                success: true,
                payment: response.body
            };

        } catch (error) {
            console.error('❌ MercadoPago get payment failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Process webhook notification
     * @param {Object} notification - Webhook data
     */
    async processWebhook(notification) {
        try {
            const { type, data } = notification;
            
            if (type === 'payment') {
                const paymentResult = await this.getPayment(data.id);
                
                if (paymentResult.success) {
                    const payment = paymentResult.payment;
                    
                    console.log(`📨 MercadoPago webhook - Payment ${data.id}: ${payment.status}`);
                    
                    return {
                        success: true,
                        paymentId: data.id,
                        status: payment.status,
                        amount: payment.transaction_amount,
                        currency: payment.currency_id,
                        externalReference: payment.external_reference,
                        payment: payment
                    };
                }
            }
            
            return { success: false, error: 'Invalid notification type' };

        } catch (error) {
            console.error('❌ MercadoPago webhook processing failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Simulate payment for development/testing
     * @param {Object} paymentData - Payment information
     */
    async simulatePayment(paymentData) {
        console.log('🔸 MercadoPago SIMULATION MODE - No real payment processed');
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate random success/failure (85% success rate)
        const isSuccess = Math.random() > 0.15;
        
        if (isSuccess) {
            return {
                success: true,
                preferenceId: `SIMULATED_PREF_${Date.now()}`,
                paymentId: `SIMULATED_PAY_${Date.now()}`,
                status: 'approved',
                amount: parseFloat(paymentData.amount),
                currency: 'MXN',
                initPoint: `https://sandbox.mercadopago.com.mx/checkout/v1/redirect?pref_id=SIMULATED_${Date.now()}`,
                details: {
                    id: `SIMULATED_${Date.now()}`,
                    status: 'approved',
                    date_created: new Date().toISOString(),
                    payer: {
                        first_name: 'Usuario',
                        last_name: 'Simulado',
                        email: paymentData.userEmail || 'usuario.simulado@mercadopago.com'
                    }
                }
            };
        } else {
            return {
                success: false,
                error: 'Simulated payment failure - Please try again',
                details: null
            };
        }
    }

    /**
     * Create a simple payment (direct charge)
     * @param {Object} paymentData - Payment information
     */
    async createPayment(paymentData) {
        try {
            const {
                amount,
                description,
                userEmail,
                paymentMethodId,
                token,
                installments = 1
            } = paymentData;

            const payment = {
                transaction_amount: parseFloat(amount),
                token: token,
                description: description || 'Donación - Tlamatini UTEQ',
                installments: installments,
                payment_method_id: paymentMethodId,
                issuer_id: null,
                payer: {
                    email: userEmail
                },
                external_reference: `donation_${Date.now()}`,
                notification_url: 'https://tu-dominio.com/api/webhooks/mercadopago'
            };

            const response = await this.client.payment.save(payment);
            
            console.log('✅ MercadoPago payment created:', response.body.id);
            
            return {
                success: true,
                paymentId: response.body.id,
                status: response.body.status,
                statusDetail: response.body.status_detail,
                details: response.body
            };

        } catch (error) {
            console.error('❌ MercadoPago payment creation failed:', error);
            return {
                success: false,
                error: error.message,
                details: error.cause || null
            };
        }
    }
}

export default new MercadoPagoService();
