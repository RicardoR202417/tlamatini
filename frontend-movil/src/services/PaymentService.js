// src/services/PaymentService.js
import ApiService from '../api/ApiService';

class PaymentService {
    
    // ====================================
    // PAYPAL METHODS
    // ====================================

    /**
     * Create PayPal order
     * @param {number} donacionId - Donation ID
     * @param {string} returnUrl - Success return URL
     * @param {string} cancelUrl - Cancel return URL
     */
    static async createPayPalOrder(donacionId, returnUrl, cancelUrl) {
        try {
            const response = await ApiService.post('/pagos/paypal/create-order', {
                donacionId,
                returnUrl,
                cancelUrl
            });

            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error creating PayPal order:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al crear orden de PayPal'
            };
        }
    }

    /**
     * Capture PayPal payment
     * @param {string} orderId - PayPal order ID
     */
    static async capturePayPalPayment(orderId) {
        try {
            const response = await ApiService.post(`/pagos/paypal/capture/${orderId}`);

            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error capturing PayPal payment:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al procesar pago de PayPal'
            };
        }
    }

    // ====================================
    // MERCADOPAGO METHODS
    // ====================================

    /**
     * Create MercadoPago preference
     * @param {number} donacionId - Donation ID
     * @param {string} userEmail - User email
     * @param {string} userName - User name
     */
    static async createMercadoPagoPreference(donacionId, userEmail, userName) {
        try {
            const response = await ApiService.post('/pagos/mercadopago/create-preference', {
                donacionId,
                userEmail,
                userName
            });

            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error creating MercadoPago preference:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al crear preferencia de MercadoPago'
            };
        }
    }

    // ====================================
    // GENERAL METHODS
    // ====================================

    /**
     * Get payment status
     * @param {number} donacionId - Donation ID
     */
    static async getPaymentStatus(donacionId) {
        try {
            const response = await ApiService.get(`/pagos/status/${donacionId}`);

            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error getting payment status:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener estado del pago'
            };
        }
    }

    /**
     * Get available payment methods
     */
    static async getPaymentMethods() {
        try {
            const response = await ApiService.get('/pagos/methods');

            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('Error getting payment methods:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener métodos de pago'
            };
        }
    }

    // ====================================
    // PAYMENT FLOW HELPERS
    // ====================================

    /**
     * Process payment with selected method
     * @param {string} method - Payment method ('paypal' | 'mercadopago')
     * @param {number} donacionId - Donation ID
     * @param {Object} userInfo - User information
     * @param {string} userInfo.email - User email
     * @param {string} userInfo.name - User name
     */
    static async processPayment(method, donacionId, userInfo) {
        switch (method) {
            case 'paypal':
                return await this.createPayPalOrder(
                    donacionId,
                    'tlamatini://payment/success',
                    'tlamatini://payment/cancel'
                );
            
            case 'mercadopago':
                return await this.createMercadoPagoPreference(
                    donacionId,
                    userInfo.email,
                    userInfo.name
                );
            
            default:
                return {
                    success: false,
                    error: 'Método de pago no soportado'
                };
        }
    }

    /**
     * Open payment in WebView
     * @param {string} paymentUrl - Payment URL to open
     * @param {function} onSuccess - Success callback
     * @param {function} onCancel - Cancel callback
     * @param {function} onError - Error callback
     */
    static openPaymentWebView(paymentUrl, onSuccess, onCancel, onError) {
        // This will be handled by the PaymentWebView component
        return {
            url: paymentUrl,
            onSuccess,
            onCancel,
            onError
        };
    }

    // ====================================
    // VALIDATION HELPERS
    // ====================================

    /**
     * Validate payment amount
     * @param {number} amount - Amount to validate
     * @param {string} currency - Currency code
     */
    static validateAmount(amount, currency = 'MXN') {
        const minAmount = currency === 'MXN' ? 10 : 1;
        const maxAmount = currency === 'MXN' ? 50000 : 2500;

        if (!amount || isNaN(amount)) {
            return {
                valid: false,
                error: 'El monto debe ser un número válido'
            };
        }

        if (amount < minAmount) {
            return {
                valid: false,
                error: `El monto mínimo es ${minAmount} ${currency}`
            };
        }

        if (amount > maxAmount) {
            return {
                valid: false,
                error: `El monto máximo es ${maxAmount} ${currency}`
            };
        }

        return { valid: true };
    }

    /**
     * Format currency for display
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code
     */
    static formatCurrency(amount, currency = 'MXN') {
        const formatters = {
            MXN: new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
            }),
            USD: new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            })
        };

        return formatters[currency]?.format(amount) || `${amount} ${currency}`;
    }

    /**
     * Calculate payment fees
     * @param {number} amount - Payment amount
     * @param {string} method - Payment method
     */
    static calculateFees(amount, method) {
        const feeConfigs = {
            paypal: {
                percentage: 0.034, // 3.4%
                fixed: 4.00 // $4.00 MXN
            },
            mercadopago: {
                percentage: 0.0499, // 4.99%
                fixed: 0,
                iva: 0.16 // 16% IVA
            }
        };

        const config = feeConfigs[method];
        if (!config) return { fee: 0, total: amount };

        let fee = (amount * config.percentage) + config.fixed;
        
        if (config.iva) {
            fee = fee * (1 + config.iva);
        }

        return {
            fee: Math.round(fee * 100) / 100,
            total: Math.round((amount + fee) * 100) / 100,
            breakdown: {
                subtotal: amount,
                paymentFee: Math.round((amount * config.percentage + config.fixed) * 100) / 100,
                iva: config.iva ? Math.round((amount * config.percentage + config.fixed) * config.iva * 100) / 100 : 0
            }
        };
    }
}

export default PaymentService;
