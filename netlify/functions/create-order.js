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

    // Validate environment variables
    if (!process.env.APP_ID || !process.env.SECRET_KEY) {
      console.error('Missing environment variables:', {
        APP_ID: !!process.env.APP_ID,
        SECRET_KEY: !!process.env.SECRET_KEY
      });
      throw new Error('Missing required environment variables');
    }

    // Log environment check
    console.log('Environment check:', {
      hasAppId: !!process.env.APP_ID,
      hasSecretKey: !!process.env.SECRET_KEY,
      appIdLength: process.env.APP_ID?.length,
      secretKeyLength: process.env.SECRET_KEY?.length
    });

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

    // Log the request we're about to make
    console.log('Making request to Cashfree');

    const response = await axios({
      method: 'post',
      url: 'https://api.cashfree.com/pg/orders',
      headers: {
        'x-client-id': process.env.APP_ID,
        'x-client-secret': process.env.SECRET_KEY,
        'x-api-version': '2022-09-01',
        'Content-Type': 'application/json'
      },
      data: payload
    });

    console.log('Cashfree response received');

    const responseBody = {
      success: true,
      payment_session_id: response.data.payment_session_id,
      order_id: orderId
    };

    // Log what we're sending back
    console.log('Sending response:', responseBody);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseBody)
    };

  } catch (error) {
    // Log error details
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    const errorResponse = {
      success: false,
      error: 'Failed to create order',
      message: error.response?.data?.message || error.message
    };

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(errorResponse)
    };
  }
}; 