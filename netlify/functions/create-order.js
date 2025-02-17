const axios = require('axios');

exports.handler = async (event, context) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  try {
    // Log the incoming request
    console.log('Received event:', {
      method: event.httpMethod,
      body: event.body || 'no body'
    });

    // Validate request method
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method Not Allowed' })
      };
    }

    // Log environment variables (safely)
    console.log('Environment check:', {
      hasAppId: Boolean(process.env.APP_ID),
      hasSecretKey: Boolean(process.env.SECRET_KEY),
      appIdFirstChars: process.env.APP_ID?.substring(0, 4),
      env: process.env.CASHFREE_ENV || 'Not set'
    });

    if (!process.env.APP_ID || !process.env.SECRET_KEY) {
      throw new Error('Missing required environment variables');
    }

    // Test credentials (for sandbox testing only)
    const APP_ID = "TEST100531183c7fe9ef3c837add98c781135001";
    const SECRET_KEY = "TEST3bebdc90edabe121944ccc785912841d3dd47864";

    // Generate order details
    const orderId = `order_${Date.now()}`;
    const orderAmount = 2; // Fixed amount for testing

    // Create order payload
    const payload = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: `cust_${Date.now()}`,
        customer_email: "customer@example.com",
        customer_phone: "9999999999"
      },
      order_meta: {
        return_url: "https://bcdcom.netlify.app/payment-success",
        notify_url: "https://bcdcom.netlify.app/.netlify/functions/webhook"
      }
    };

    // Use sandbox URL for testing
    const apiUrl = 'https://sandbox.cashfree.com/pg/orders';
    
    console.log('Making request to:', apiUrl);
    console.log('Request payload:', JSON.stringify(payload));

    const response = await axios({
      method: 'post',
      url: apiUrl,
      headers: {
        'x-client-id': APP_ID,
        'x-client-secret': SECRET_KEY,
        'x-api-version': '2022-09-01',
        'Content-Type': 'application/json'
      },
      data: payload
    });

    console.log('Cashfree response:', {
      status: response.status,
      data: response.data
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        payment_session_id: response.data.payment_session_id,
        order_id: orderId,
        cfResponse: response.data
      })
    };

  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });

    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to create order',
        message: error.response?.data?.message || error.message,
        details: error.response?.data
      })
    };
  }
}; 