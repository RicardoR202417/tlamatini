// src/services/paypalService.js
import axios from 'axios';
import { paypalConfig } from '../config/payments.js';

class PayPalService {
    constructor() {
        this.baseURL = paypalConfig.environment === 'live' 
            ? 'https://api.paypal.com' 
            : 'https://api.sandbox.paypal.com';
        this.accessToken = null;
        console.log(`✅ PayPal service initialized (${paypalConfig.environment} mode)`);
    }

    async getAccessToken() {
        try {
            if (this.accessToken) {
                return this.accessToken;
            }

            const auth = Buffer.from(`${paypalConfig.clientId}:${paypalConfig.clientSecret}`).toString('base64');
            
            const response = await axios({
                url: `${this.baseURL}/v1/oauth2/token`,
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Accept': 'application/json',
                    'Accept-Language': 'en_US',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: 'grant_type=client_credentials'
            });

            this.accessToken = response.data.access_token;
            
            // Reset token after expiry
            setTimeout(() => {
                this.accessToken = null;
            }, (response.data.expires_in - 60) * 1000);

            return this.accessToken;
        } catch (error) {
            console.error('❌ PayPal authentication failed:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Create a payment order
     * @param {Object} orderData - Order information
     * @param {number} orderData.amount - Payment amount
     * @param {string} orderData.currency - Currency code (default: MXN)
     * @param {string} orderData.description - Payment description
     * @param {string} orderData.returnUrl - Success redirect URL
     * @param {string} orderData.cancelUrl - Cancel redirect URL
     */
    async createOrder(orderData) {
        try {
            const { amount, currency = 'MXN', description, returnUrl, cancelUrl } = orderData;
            const accessToken = await this.getAccessToken();

            const orderPayload = {
                intent: 'CAPTURE',
                purchase_units: [{
                    reference_id: `donation_${Date.now()}`,
                    amount: {
                        currency_code: currency,
                        value: amount.toString()
                    },
                    description: description || 'Donación - Tlamatini UTEQ'
                }],
                application_context: {
                    brand_name: 'Tlamatini UTEQ',
                    landing_page: 'BILLING',
                    user_action: 'PAY_NOW',
                    return_url: returnUrl,
                    cancel_url: cancelUrl
                }
            };

            const response = await axios({
                url: `${this.baseURL}/v2/checkout/orders`,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Prefer': 'return=representation'
                },
                data: orderPayload
            });

            const order = response.data;
            const approvalUrl = order.links.find(link => link.rel === 'approve')?.href;

            console.log('✅ PayPal order created:', order.id);

            return {
                success: true,
                orderId: order.id,
                status: order.status,
                approvalUrl: approvalUrl,
                details: order
            };

        } catch (error) {
            console.error('❌ PayPal createOrder error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                details: error.response?.data
            };
        }
    }

    /**
     * Capture payment for an approved order
     * @param {string} orderId - PayPal order ID
     */
    async captureOrder(orderId) {
        try {
            const accessToken = await this.getAccessToken();

            const response = await axios({
                url: `${this.baseURL}/v2/checkout/orders/${orderId}/capture`,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Prefer': 'return=representation'
                },
                data: {}
            });

            const order = response.data;
            const capture = order.purchase_units[0]?.payments?.captures[0];
            
            console.log('✅ PayPal payment captured:', orderId);
            
            return {
                success: true,
                orderId: order.id,
                status: order.status,
                captureId: capture?.id,
                amount: capture?.amount,
                details: order
            };

        } catch (error) {
            console.error('❌ PayPal captureOrder error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                details: error.response?.data
            };
        }
    }

    /**
     * Get order details
     * @param {string} orderId - PayPal order ID
     */
    async getOrderDetails(orderId) {
        try {
            const accessToken = await this.getAccessToken();

            const response = await axios({
                url: `${this.baseURL}/v2/checkout/orders/${orderId}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json'
                }
            });

            console.log('✅ PayPal order details retrieved:', orderId);
            
            return {
                success: true,
                order: response.data
            };

        } catch (error) {
            console.error('❌ PayPal getOrderDetails error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                details: error.response?.data
            };
        }
    }

    /**
     * Simulate payment (for testing purposes)
     * @param {Object} orderData - Order information
     */
    async simulatePayment(orderData) {
        console.log('🔸 PayPal SIMULATION mode - Creating mock order');
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockOrderId = `PAYPAL_MOCK_${Date.now()}`;
                
                resolve({
                    success: true,
                    orderId: mockOrderId,
                    status: 'CREATED',
                    approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${mockOrderId}`,
                    details: {
                        id: mockOrderId,
                        intent: 'CAPTURE',
                        status: 'CREATED',
                        purchase_units: [{
                            amount: {
                                currency_code: orderData.currency || 'MXN',
                                value: orderData.amount.toString()
                            }
                        }],
                        links: [
                            {
                                href: `https://www.sandbox.paypal.com/checkoutnow?token=${mockOrderId}`,
                                rel: 'approve',
                                method: 'GET'
                            }
                        ]
                    }
                });
            }, 1000); // Simulate network delay
        });
    }
}

export default new PayPalService();
