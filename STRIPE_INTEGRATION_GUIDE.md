# Stripe Payment Integration Guide

## Overview

This guide covers the complete Stripe payment integration for NeuraStack Premium subscriptions. The integration includes payment processing, success/error handling, and a complete user experience flow.

## 🚀 Quick Start

### 1. Environment Setup

The Stripe integration is already configured with the test API key:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51RlpPwQjUU16Imh7kVtJSyeDN4yHINYvzPCHH7Gr2NSDFKBvTJijTPC6vUqSgsHWP2oYVSxJ4vPFhNZRcu620DOp00gV0iDAiT
```

### 2. Test the Integration

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the subscription page:**
   - Go to `http://localhost:3000`
   - Sign in with Google or as a guest
   - Navigate to the subscription page (crown icon in header)

3. **Test the payment flow:**
   - Click "Upgrade for $X/month" button
   - Payment modal will open with Stripe Elements
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date (e.g., 12/25)
   - Any 3-digit CVC (e.g., 123)
   - Complete the payment

## 🧪 Test Card Numbers

Use these official Stripe test card numbers:

### Successful Payments
- **Visa**: `4242 4242 4242 4242`
- **Visa (debit)**: `4000 0566 5566 5556`
- **Mastercard**: `5555 5555 5555 4444`
- **American Express**: `3782 8224 6310 005`

### Failed Payments (for testing error handling)
- **Declined**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`
- **Expired card**: `4000 0000 0000 0069`
- **Incorrect CVC**: `4000 0000 0000 0127`

### Test Details
- **Expiry**: Any future date (e.g., 12/25, 01/26)
- **CVC**: Any 3-digit number (e.g., 123, 456)
- **ZIP**: Any 5-digit number (e.g., 12345)

## 🏗️ Architecture

### Components Structure

```
src/
├── components/stripe/
│   ├── StripeProvider.tsx      # Stripe Elements provider
│   ├── PaymentForm.tsx         # Payment form with card input
│   ├── PaymentModal.tsx        # Modal wrapper for payment
│   └── index.ts               # Export barrel
├── lib/
│   └── stripe-config.ts       # Stripe configuration & utilities
├── services/
│   └── stripeService.ts       # Payment processing service
└── pages/
    ├── SubscriptionPage.tsx   # Main subscription management
    ├── PaymentSuccessPage.tsx # Success confirmation
    └── PaymentErrorPage.tsx   # Error handling
```

### Key Features

1. **Payment Modal**: Clean, responsive payment interface
2. **Error Handling**: Comprehensive error states and user feedback
3. **Success Flow**: Confirmation page with next steps
4. **Test Mode**: Development-friendly testing without backend dependency
5. **Mobile Optimized**: Works perfectly on mobile devices
6. **Accessibility**: WCAG compliant with proper focus management

## 🔧 Configuration

### Pricing Configuration

Update pricing in `src/lib/stripe-config.ts`:

```typescript
export const SUBSCRIPTION_PRICES = {
  premium: {
    monthly: {
      priceId: 'price_premium_monthly', // Replace with actual Stripe price ID
      amount: 2999, // $29.99 in cents
      currency: 'usd',
      interval: 'month',
    },
  },
};
```

### Stripe Appearance

The payment form styling is configured to match the app theme:

```typescript
appearance: {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#4F9CF9',
    colorBackground: '#ffffff',
    colorText: '#1E293B',
    // ... more styling options
  },
}
```

## 🔄 Payment Flow

### 1. User Interaction
- User clicks "Upgrade to Premium" button
- Payment modal opens with Stripe Elements

### 2. Payment Processing
- User enters payment details
- Form validates input in real-time
- Payment is processed through Stripe

### 3. Success Handling
- **Development Mode**: Shows success message without backend call
- **Production Mode**: Calls backend to upgrade user tier
- User sees confirmation and can continue to use premium features

### 4. Error Handling
- Payment errors are caught and displayed
- User-friendly error messages
- Option to retry payment or contact support

## 🚨 Development vs Production

### Development Mode
- Uses test Stripe keys
- Simulates successful payment without backend calls
- Shows "Demo Mode" in success messages
- No actual charges are made

### Production Mode
- Uses live Stripe keys
- Makes actual API calls to upgrade user tier
- Real payment processing
- Requires backend database connectivity

## 🛠️ Backend Integration

For production, you'll need to implement:

### 1. Payment Intent Creation
```javascript
// POST /api/create-payment-intent
{
  amount: 2999,
  currency: 'usd',
  userId: 'user123',
  description: 'NeuraStack Premium Subscription'
}
```

### 2. Webhook Handling
```javascript
// POST /webhooks/stripe
// Handle payment_intent.succeeded events
// Upgrade user tier in database
```

### 3. Subscription Management
```javascript
// POST /api/create-subscription
// For recurring subscriptions instead of one-time payments
```

## 🔍 Testing Checklist

- [ ] Payment modal opens correctly
- [ ] Stripe Elements load and display properly
- [ ] Test card numbers work as expected
- [ ] Error states display appropriate messages
- [ ] Success flow completes without errors
- [ ] Mobile responsiveness works
- [ ] Accessibility features function properly
- [ ] Loading states show during processing
- [ ] Toast notifications appear correctly

## 🐛 Troubleshooting

### Common Issues

1. **Stripe not loading**
   - Check environment variables are set
   - Verify internet connection
   - Check browser console for errors

2. **Payment form not displaying**
   - Ensure StripeProvider wraps the component
   - Check for JavaScript errors
   - Verify Stripe publishable key is correct

3. **Backend errors during upgrade**
   - Check backend database connectivity
   - Verify API endpoints are accessible
   - Review server logs for detailed errors

### Debug Mode

Enable debug logging by setting:
```env
VITE_DEBUG_MODE=true
```

## 📱 Mobile Testing

Test on various devices:
- iOS Safari
- Android Chrome
- Mobile responsive design
- Touch interactions
- Keyboard behavior

## 🔒 Security Notes

- Never expose secret keys in frontend code
- Use HTTPS in production
- Validate payments on the backend
- Implement proper webhook signature verification
- Store sensitive data securely

## 📞 Support

For issues with the Stripe integration:
1. Check this guide first
2. Review browser console for errors
3. Test with different cards/scenarios
4. Contact development team with specific error details

---

**Note**: This integration is currently in test mode. No real charges will be made during development and testing.
