// Test endpoint
import fetch from 'node-fetch';

async function testEndpoint() {
    try {
        const response = await fetch('http://localhost:3000/api/pagos/donar/paypal/crear-orden', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                donacionId: 1,
                returnUrl: 'http://localhost:3000/success',
                cancelUrl: 'http://localhost:3000/cancel'
            })
        });
        
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testEndpoint();
