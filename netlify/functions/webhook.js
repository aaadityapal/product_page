exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const webhookData = JSON.parse(event.body);
    console.log('Webhook received:', webhookData);

    // Add your webhook handling logic here

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'OK' })
    };
  } catch (error) {
    console.error('Webhook Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook processing failed' })
    };
  }
}; 