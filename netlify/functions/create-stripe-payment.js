// netlify/functions/create-stripe-payment.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // This function only responds to POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // For a real application, you would pass product details from your
    // chatbot to this function via the request body.
    // For this example, we'll use a hardcoded product.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Example Digital Product',
              description: 'A sample product to demonstrate Stripe checkout.',
            },
            unit_amount: 1000, // Price in cents ($10.00)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // These URLs are where Stripe will redirect the user after payment.
      // process.env.URL is a variable provided by Netlify with your site's URL.
      success_url: `${process.env.URL}/?payment=success`,
      cancel_url: `${process.env.URL}/?payment=cancel`,
    });

    // Return the session URL to the chatbot
    return {
      statusCode: 200,
      body: JSON.stringify({
        url: session.url,
      }),
    };
  } catch (error) {
    // Handle any errors from Stripe
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal error occurred.' }),
    };
  }
};
