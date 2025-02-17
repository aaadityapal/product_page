require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Render product page
app.get('/', (req, res) => {
    res.render('product');
});

// Create order endpoint
app.post('/create-order', async (req, res) => {
    try {
        const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        // For production, we'll use a hardcoded HTTPS URL
        // You should replace this with your actual domain in production
        const baseUrl = process.env.CASHFREE_ENV === 'PROD'
            ? 'https://bcdcom.netlify.app/'  // Replace with your actual HTTPS domain
            : `${req.protocol}://${req.get('host')}`;

        const payload = {
            order_id: orderId,
            order_amount: req.body.amount,
            order_currency: "INR",
            customer_details: {
                customer_id: `cust_${Date.now()}`,
                customer_email: "customer@example.com",
                customer_phone: "9999999999"
            },
            order_meta: {
                return_url: `${baseUrl}/payment-success?order_id={order_id}`,
                notify_url: `${baseUrl}/webhook`
            }
        };

        console.log('Request payload:', payload);

        const apiUrl = process.env.CASHFREE_ENV === 'PROD' 
            ? 'https://api.cashfree.com/pg/orders' 
            : 'https://sandbox.cashfree.com/pg/orders';

        const headers = {
            'x-client-id': process.env.APP_ID,
            'x-client-secret': process.env.SECRET_KEY,
            'x-api-version': '2022-09-01',
            'Content-Type': 'application/json'
        };

        const response = await axios({
            method: 'post',
            url: apiUrl,
            data: payload,
            headers: headers,
            validateStatus: false
        });

        console.log('Cashfree response status:', response.status);
        console.log('Cashfree response data:', response.data);

        if (response.status !== 200) {
            throw new Error(`Cashfree API error: ${JSON.stringify(response.data)}`);
        }

        res.json({
            payment_session_id: response.data.payment_session_id,
            order_id: orderId,
            cfResponse: response.data
        });

    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            stack: error.stack
        });
        
        res.status(500).json({ 
            error: 'Failed to create order',
            details: error.response?.data || error.message,
            errorCode: error.response?.status
        });
    }
});

// Payment success endpoint
app.get('/payment-success', (req, res) => {
    res.render('success', { orderId: req.query.order_id });
});

// Webhook endpoint for payment notifications
app.post('/webhook', (req, res) => {
    console.log('Webhook received:', req.body);
    res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.CASHFREE_ENV);
}); 