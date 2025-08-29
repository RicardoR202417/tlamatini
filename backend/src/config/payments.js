// src/config/payments.js
import dotenv from 'dotenv';
dotenv.config();

// ====================================
// PAYMENT MODE CONFIGURATION
// ====================================
// Cambiar a 'false' para usar credenciales reales (modo prueba)
// Cambiar a 'true' para usar simulación completa
export const useSimulation = process.env.USE_PAYMENT_SIMULATION === 'true' || false;

// ====================================
// PAYPAL CONFIGURATION
// ====================================
export const paypalConfig = {
    clientId: process.env.NODE_ENV === 'production' 
        ? process.env.PAYPAL_CLIENT_ID_PROD 
        : process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.NODE_ENV === 'production'
        ? process.env.PAYPAL_CLIENT_SECRET_PROD 
        : process.env.PAYPAL_CLIENT_SECRET,
    environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
    apiUrl: process.env.NODE_ENV === 'production'
        ? process.env.PAYPAL_API_URL_PROD
        : process.env.PAYPAL_API_URL,
};

// ====================================
// MERCADOPAGO CONFIGURATION
// ====================================
export const mercadopagoConfig = {
    accessToken: process.env.NODE_ENV === 'production'
        ? process.env.MERCADO_PAGO_ACCESS_TOKEN_PROD
        : process.env.MERCADO_PAGO_ACCESS_TOKEN,
    publicKey: process.env.NODE_ENV === 'production'
        ? process.env.MERCADO_PAGO_PUBLIC_KEY_PROD
        : process.env.MERCADO_PAGO_PUBLIC_KEY,
    apiUrl: process.env.MERCADO_PAGO_API_URL || 'https://api.mercadopago.com',
};

// ====================================
// VALIDATION HELPERS
// ====================================
export const validatePaymentConfig = () => {
    const missingConfigs = [];

    // Validate PayPal
    if (!paypalConfig.clientId) {
        missingConfigs.push('PAYPAL_CLIENT_ID');
    }
    if (!paypalConfig.clientSecret) {
        missingConfigs.push('PAYPAL_CLIENT_SECRET');
    }

    // Validate MercadoPago
    if (!mercadopagoConfig.accessToken) {
        missingConfigs.push('MERCADO_PAGO_ACCESS_TOKEN');
    }
    if (!mercadopagoConfig.publicKey) {
        missingConfigs.push('MERCADO_PAGO_PUBLIC_KEY');
    }

    if (missingConfigs.length > 0) {
        console.warn('⚠️  Missing payment configurations:', missingConfigs.join(', '));
        console.warn('⚠️  Payment services may not work properly');
        return false;
    }

    console.log('✅ Payment configurations loaded successfully');
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💳 PayPal: ${paypalConfig.environment} mode`);
    return true;
};

export default {
    paypal: paypalConfig,
    mercadopago: mercadopagoConfig,
    validate: validatePaymentConfig,
};
