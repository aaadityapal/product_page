async function initiatePayment() {
    const button = document.querySelector('button');
    button.disabled = true;
    button.textContent = 'Processing...';

    try {
        console.log('Starting payment process...');
        
        // Create order
        const response = await fetch('/.netlify/functions/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({}) // Empty object for now
        });

        console.log('Order response status:', response.status);
        
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        // Safely parse JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            throw new Error('Invalid response from server');
        }

        console.log('Parsed response:', data);

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to create order');
        }

        if (!data.payment_session_id) {
            throw new Error('No payment session ID received');
        }

        // Initialize Cashfree
        const cashfree = new Cashfree({
            mode: "sandbox"
        });

        // Configure checkout
        const checkoutOptions = {
            paymentSessionId: data.payment_session_id,
            returnUrl: window.location.origin + '/payment-success'
        };

        console.log('Starting checkout with options:', checkoutOptions);

        // Start checkout
        await cashfree.checkout(checkoutOptions);

    } catch (error) {
        console.error('Payment error:', error);
        alert('Payment failed: ' + error.message);
    } finally {
        button.disabled = false;
        button.textContent = 'Buy Now';
    }
}

// Verify SDK loading
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Cashfree === 'undefined') {
        console.error('Cashfree SDK not loaded');
        alert('Payment system is not ready. Please refresh the page.');
    } else {
        console.log('Cashfree SDK loaded successfully');
    }
}); 