# 💳 Razorpay Payment Integration Setup Guide

## 🎯 Quick Start

Your app is **already configured** with Razorpay! Just follow these steps to use real payment processing.

---

## 📝 Step 1: Create Razorpay Account

1. Go to **https://dashboard.razorpay.com/signup**
2. Sign up with your email
3. Verify your email
4. Complete business details (you can use test mode without full verification)

---

## 🔑 Step 2: Get API Keys

### For Testing (Recommended First):

1. Log in to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Key**
4. You'll see:
   - **Key ID**: Starts with `rzp_test_`
   - **Key Secret**: Click "Show" to reveal

### For Production (Later):

1. Complete KYC verification
2. Activate your account
3. Generate **Live Keys** (starts with `rzp_live_`)

---

## ⚙️ Step 3: Update Environment Variables

Open your `.env` file and update these lines:

```env
# Replace these with your actual Razorpay keys
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
```

**Example:**
```env
RAZORPAY_KEY_ID=rzp_test_1234567890abcd
RAZORPAY_KEY_SECRET=abcdefghijklmnopqrstuvwxyz123456
VITE_RAZORPAY_KEY_ID=rzp_test_1234567890abcd
```

---

## 🔄 Step 4: Restart Server

After updating `.env`:

```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

---

## 🧪 Step 5: Test Payment

### Test Card Details (Razorpay Test Mode):

**Success Scenarios:**

| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|--------|
| 4111 1111 1111 1111 | Any 3 digits | Any future date | Success |
| 5555 5555 5555 4444 | Any 3 digits | Any future date | Success |

**Failure Scenarios:**

| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|--------|
| 4000 0000 0000 0002 | Any 3 digits | Any future date | Card declined |
| 4000 0000 0000 0069 | Any 3 digits | Any future date | Expired card |

**UPI Test:**
- UPI ID: `success@razorpay`
- Result: Success

**Net Banking Test:**
- Select any bank
- Use credentials: `test` / `test`

---

## 🎯 Step 6: Test the Flow

1. **Add Products to Cart**
   - Browse shop
   - Click "Add to Cart"

2. **Go to Checkout**
   - Click cart icon
   - Click "Proceed to Checkout"

3. **Select Payment Method**
   - Choose "Razorpay"

4. **Complete Payment**
   - Click "Pay" button
   - Razorpay popup opens
   - Enter test card details
   - Click "Pay"

5. **Verify Order**
   - Redirected to profile
   - Order appears in "My Orders"
   - Status: Pending → Processing

---

## 📊 Step 7: View Payments in Dashboard

1. Go to **Razorpay Dashboard**
2. Click **Transactions** → **Payments**
3. See all test payments
4. Click any payment to see details

---

## 🚀 Going Live (Production)

### Prerequisites:
1. ✅ Complete KYC verification
2. ✅ Add bank account details
3. ✅ Activate account
4. ✅ Generate Live API keys

### Steps:

1. **Update .env with Live Keys:**
   ```env
   RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
   RAZORPAY_KEY_SECRET=YOUR_LIVE_KEY_SECRET
   VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
   ```

2. **Test with Real Card:**
   - Use your actual card
   - Make a small test payment (₹1)
   - Verify it appears in dashboard

3. **Enable Webhooks (Optional but Recommended):**
   - Go to Settings → Webhooks
   - Add webhook URL: `https://yourdomain.com/api/payment/webhook`
   - Select events: `payment.captured`, `payment.failed`

4. **Set Up Auto-Settlements:**
   - Go to Settings → Settlements
   - Configure settlement schedule
   - Add bank account

---

## 💡 Features Included

✅ **Multiple Payment Methods:**
- Credit/Debit Cards (Visa, Mastercard, Amex, RuPay)
- UPI (Google Pay, PhonePe, Paytm, etc.)
- Net Banking (All major banks)
- Wallets (Paytm, Mobikwik, etc.)

✅ **Security:**
- PCI DSS compliant
- 3D Secure authentication
- Encrypted transactions
- Signature verification

✅ **Features:**
- Instant payment confirmation
- Automatic refunds
- Payment tracking
- Transaction history
- Settlement reports

---

## 🔧 Troubleshooting

### Payment Popup Not Opening?

**Check:**
1. Razorpay script loaded? (Check browser console)
2. Key ID correct in `.env`?
3. Server restarted after `.env` update?

**Fix:**
```bash
# Clear browser cache
# Restart server
npm run dev
```

### Payment Verification Failed?

**Check:**
1. Key Secret matches Key ID?
2. Both keys from same mode (test/live)?
3. Server logs for errors?

**Fix:**
- Regenerate API keys
- Update `.env`
- Restart server

### Order Not Created After Payment?

**Check:**
1. Browser console for errors
2. Network tab for failed requests
3. Server logs

**Fix:**
- Check user is signed in
- Verify cart has items
- Check database connection

---

## 📞 Support

**Razorpay Support:**
- Email: support@razorpay.com
- Docs: https://razorpay.com/docs/
- Dashboard: https://dashboard.razorpay.com/

**Test Environment:**
- Dashboard: https://dashboard.razorpay.com/test/dashboard
- Docs: https://razorpay.com/docs/payments/payments/test-card-details/

---

## 🎉 You're All Set!

Your payment integration is **production-ready**! Just add your real Razorpay keys and you can start accepting payments! 💰

**Current Status:**
- ✅ Razorpay SDK installed
- ✅ Payment routes created
- ✅ Frontend integration complete
- ✅ Payment verification working
- ✅ Order creation automated
- ✅ Test mode configured

**Next:** Get your Razorpay keys and start testing! 🚀

