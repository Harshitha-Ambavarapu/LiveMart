// frontend/src/pages/Checkout.jsx
import React, { useState } from 'react';
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Assuming correct relative path
import { orderAPI } from '../services/api'; // Assuming correct relative path
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

// Use the env var (create frontend/.env with REACT_APP_STRIPE_PUBLISHABLE_KEY)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_replace_with_yours');

// ====================================================================
// Stripe Payment Form Component (Handles the actual card submission)
// ====================================================================
const StripePaymentForm = ({ orderId, orderTotal, orderData, onPaymentSuccess, setCardError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  const handleStripeSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setCardError('Stripe is still loading. Please wait a moment and try again.');
      return;
    }
    if (!orderId) {
      setCardError('Order not available — please recreate the order and try again.');
      return;
    }
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setCardError('Card element not available. Refresh the page.');
      return;
    }
    if (!cardComplete) {
      setCardError('Please complete the card details.');
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    try {
      const response = await orderAPI.createPaymentIntent(orderId);
      const clientSecret = response?.data?.clientSecret;
      if (!clientSecret) {
        const backendMsg = response?.data?.message || 'No client secret returned from server.';
        setCardError(backendMsg);
        setIsProcessing(false);
        return;
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: orderData?.shippingAddress?.fullName || 'Customer',
            phone: orderData?.shippingAddress?.phone || undefined,
            address: {
              line1: orderData?.shippingAddress?.address || '',
              city: orderData?.shippingAddress?.city || '',
              postal_code: orderData?.shippingAddress?.postalCode || '',
              country: 'IN',
            },
          },
        },
      });

      if (result.error) {
        setCardError(result.error.message || 'Payment failed. Please check card details.');
      } else if (result.paymentIntent) {
        if (result.paymentIntent.status === 'succeeded') {
          onPaymentSuccess(orderId);
        } else if (result.paymentIntent.status === 'requires_action' || result.paymentIntent.status === 'requires_source_action') {
          setCardError('Additional authentication required. Follow the on-screen instructions.');
        } else {
          setCardError(`Payment status: ${result.paymentIntent.status}.`);
        }
      } else {
        setCardError('Unexpected response from Stripe.');
      }
    } catch (error) {
      console.error('Stripe Payment Error:', error);
      setCardError(
        error?.response?.data?.message ||
        error?.message ||
        'Payment failed. Please try again or check your card details.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleStripeSubmit} className="space-y-4">
      <h3 className="text-lg font-medium mb-3">Card Details</h3>

      <div className="p-3 border rounded-lg bg-gray-50">
        <CardElement
          options={cardElementOptions}
          onChange={(event) => {
            if (event.error) setCardError(event.error.message);
            else setCardError(null);
            setCardComplete(event.complete);
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-semibold transition duration-150"
      >
        {isProcessing ? 'Processing Payment...' : `Pay ₹${Number(orderTotal).toFixed(2)}`}
      </button>
    </form>
  );
};

// ====================================================================
// Main Checkout Component (Handles order creation and routing)
// ====================================================================
const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [cardError, setCardError] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
    phone: '',
    paymentMethod: 'card',
  });

  const createOrder = async (orderData) => {
    return orderAPI.createOrder(orderData);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMessage(null);
    setCardError(null);
  };

  const handlePaymentSuccess = async (orderId) => {
    try {
      await clearCart();
      navigate(`/order-confirmation/${orderId}`);
    } catch (err) {
      console.error('Post-payment navigation error:', err);
      navigate(`/order-confirmation/${orderId}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setCardError(null);
    setCurrentOrderId(null);

    try {
      const subtotal = getCartTotal();
      const shipping = subtotal > 500 ? 0 : 50;
      const tax = parseFloat((subtotal * 0.18).toFixed(2));
      const totalAmount = parseFloat((subtotal + shipping + tax).toFixed(2));

      const orderData = {
        items: cart.map(item => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: formData,
        paymentMethod: formData.paymentMethod,
        subtotal,
        shippingCost: shipping,
        tax,
        totalAmount,
      };

      const response = await createOrder(orderData);
      const newOrderId = response?.data?._id || response?.data?.id;
      if (!newOrderId) throw new Error(response?.data?.message || 'Failed to create order on server.');

      setCurrentOrderId(newOrderId);

      if (formData.paymentMethod === 'cod') {
        await clearCart();
        navigate(`/order-confirmation/${newOrderId}`);
      }
      // card/upi will show payment step
    } catch (error) {
      console.error('Order creation error:', error);
      setErrorMessage(error?.response?.data?.message || error?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  // Optional: redirect to Stripe Checkout (hosted) if you want
  const handleStripeCheckoutRedirect = async () => {
    if (!currentOrderId) {
      setErrorMessage('Order not created yet. Please submit shipping details first.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      // this endpoint was added server-side: POST /api/orders/:orderId/create-checkout-session
      const res = await orderAPI.createCheckoutSession(currentOrderId);
      const url = res?.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        setErrorMessage(res?.data?.message || 'Failed to initialize Stripe Checkout.');
      }
    } catch (err) {
      console.error('Checkout redirect error:', err);
      setErrorMessage(err?.response?.data?.message || err.message || 'Could not start Stripe checkout.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <button onClick={() => navigate('/')} className="bg-purple-600 text-white px-6 py-3 rounded-lg">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = parseFloat((subtotal * 0.18).toFixed(2));
  const total = parseFloat((subtotal + shipping + tax).toFixed(2));

  const requiresPaymentStep = (formData.paymentMethod === 'card' || formData.paymentMethod === 'upi') && currentOrderId;
  const isInitialSubmission = !currentOrderId;

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Shipping & Payment Form */}
          <div className="lg:col-span-2">
            {(errorMessage || cardError) && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg" role="alert">
                <p className="font-bold">Error</p>
                <p>{errorMessage || cardError}</p>
              </div>
            )}

            {isInitialSubmission && (
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold mb-6">Shipping Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">City</label>
                      <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Postal Code</label>
                      <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold mt-8 mb-4">Payment Method</h2>
                    <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none">
                      <option value="card">Credit/Debit Card (Stripe)</option>
                      <option value="upi">UPI (Stripe)</option>
                      <option value="cod">Cash on Delivery</option>
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-semibold transition duration-150">
                  {loading ? 'Submitting Order...' : (formData.paymentMethod === 'cod' ? 'Place Order (COD)' : 'Proceed to Payment')}
                </button>
              </form>
            )}

            {requiresPaymentStep && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-6 text-purple-600">Secure Payment</h2>
                <p className="mb-4 text-gray-600">Order ID: <span className='font-mono'>{currentOrderId}</span></p>

                <Elements stripe={stripePromise}>
                  <StripePaymentForm
                    orderId={currentOrderId}
                    orderTotal={total}
                    orderData={{ shippingAddress: formData }}
                    onPaymentSuccess={handlePaymentSuccess}
                    setCardError={setCardError}
                  />
                </Elements>

                {/* Optional hosted Stripe Checkout redirect */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">Or use hosted Stripe Checkout</p>
                  <button
                    onClick={handleStripeCheckoutRedirect}
                    disabled={loading}
                    className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 disabled:bg-gray-400 font-medium transition"
                  >
                    {loading ? 'Redirecting…' : `Pay ₹${total.toFixed(2)} (Stripe Checkout)`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.product._id} className="flex justify-between text-sm">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
