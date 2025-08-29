// src/routes/pagos.routes.js
import express from 'express';
import pagosController from '../controllers/pagos.controller.working.js';

const router = express.Router();

console.log('🔧 Registering pagos routes...');

// Middleware para logging de todas las requests de pagos
router.use((req, res, next) => {
    console.log(`🔍 PAGOS REQUEST: ${req.method} ${req.path} - Body:`, req.body);
    next();
});

// ====================================
// PAYPAL ROUTES
// ====================================

// Create PayPal order
router.post('/paypal/create-order', pagosController.createPayPalOrder);
console.log('✅ Registered: POST /paypal/create-order');

// Capture PayPal payment
router.post('/paypal/capture/:orderId', pagosController.capturePayPalPayment);
console.log('✅ Registered: POST /paypal/capture/:orderId');

// Legacy PayPal endpoints (for backward compatibility)
router.post('/donar/paypal/crear-orden', pagosController.createPayPalOrder);
console.log('✅ Registered: POST /donar/paypal/crear-orden');

router.post('/donar/paypal', pagosController.procesarDonacionPayPal);
console.log('✅ Registered: POST /donar/paypal');

router.post('/paypal', pagosController.procesarDonacionPayPal);
console.log('✅ Registered: POST /paypal');

// ====================================
// MERCADOPAGO ROUTES  
// ====================================

// Create MercadoPago preference
router.post('/mercadopago/create-preference', pagosController.createMercadoPagoPreference);

// MercadoPago webhook
router.post('/mercadopago/webhook', pagosController.processMercadoPagoWebhook);

// Legacy MercadoPago endpoints (for backward compatibility)
router.post('/donar/mercadopago/crear-preferencia', pagosController.createMercadoPagoPreference);
router.post('/donar/mercadopago', pagosController.procesarDonacionMercadoPago);
router.post('/mercadopago', pagosController.procesarDonacionMercadoPago);

// ====================================
// GENERAL ROUTES
// ====================================

// Get payment status
router.get('/status/:donacionId', pagosController.getPaymentStatus);

// Get available payment methods
router.get('/methods', pagosController.getPaymentMethods);

// ====================================
// SUCCESS/CANCEL PAGES (Frontend redirects)
// ====================================

// PayPal success/cancel pages
router.get('/paypal/success', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Pago exitoso con PayPal',
        orderId: req.query.token || req.query.order_id 
    });
});

router.get('/paypal/cancel', (req, res) => {
    res.json({ 
        success: false, 
        message: 'Pago cancelado por el usuario' 
    });
});

// MercadoPago success/failure/pending pages
router.get('/mercadopago/success', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Pago exitoso con MercadoPago',
        paymentId: req.query.payment_id,
        status: req.query.status,
        merchantOrderId: req.query.merchant_order_id
    });
});

router.get('/mercadopago/failure', (req, res) => {
    res.json({ 
        success: false, 
        message: 'Error en el pago con MercadoPago' 
    });
});

router.get('/mercadopago/pending', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Pago pendiente con MercadoPago',
        status: 'pending'
    });
});

export default router;
