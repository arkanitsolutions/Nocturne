import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_EMAIL = process.env.SMTP_FROM || 'NocturneLux <noreply@nocturnelux.com>';

// Email templates
const getOrderConfirmationEmail = (order: any, items: any[]) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #333;">
        <img src="${item.productImage || ''}" alt="${item.productName}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #333; color: #fff;">
        ${item.productName}<br>
        <span style="color: #888; font-size: 12px;">Size: ${item.size || 'N/A'}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #333; color: #fff; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #333; color: #fff; text-align: right;">$${item.price}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmation - NocturneLux</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #fff; font-size: 28px; letter-spacing: 8px; margin: 0;">NOCTURNELUX</h1>
      <p style="color: #888; font-size: 12px; letter-spacing: 2px; margin-top: 8px;">LUXURY GOTHIC FASHION</p>
    </div>

    <!-- Order Status -->
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 1px solid #333; padding: 30px; margin-bottom: 30px;">
      <h2 style="color: #fff; margin: 0 0 10px 0; font-size: 20px;">Order Confirmed ✓</h2>
      <p style="color: #888; margin: 0; font-size: 14px;">Thank you for your order, ${order.userName || 'Valued Customer'}!</p>
      <p style="color: #666; margin: 15px 0 0 0; font-size: 12px;">Order ID: <span style="color: #fff;">#${order.id.slice(0, 8).toUpperCase()}</span></p>
    </div>

    <!-- Order Items -->
    <div style="background: #111; border: 1px solid #333; padding: 20px; margin-bottom: 30px;">
      <h3 style="color: #fff; margin: 0 0 20px 0; font-size: 16px; letter-spacing: 2px;">ORDER DETAILS</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid #333;">
            <th style="padding: 12px; text-align: left; color: #888; font-size: 12px;">ITEM</th>
            <th style="padding: 12px; text-align: left; color: #888; font-size: 12px;">PRODUCT</th>
            <th style="padding: 12px; text-align: center; color: #888; font-size: 12px;">QTY</th>
            <th style="padding: 12px; text-align: right; color: #888; font-size: 12px;">PRICE</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <!-- Totals -->
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
        ${order.subtotal ? `<div style="display: flex; justify-content: space-between; color: #888; font-size: 14px; margin-bottom: 8px;">
          <span>Subtotal</span><span>$${order.subtotal}</span>
        </div>` : ''}
        ${order.discount && parseFloat(order.discount) > 0 ? `<div style="display: flex; justify-content: space-between; color: #4ade80; font-size: 14px; margin-bottom: 8px;">
          <span>Discount ${order.couponCode ? `(${order.couponCode})` : ''}</span><span>-$${order.discount}</span>
        </div>` : ''}
        <div style="display: flex; justify-content: space-between; color: #fff; font-size: 18px; font-weight: bold; margin-top: 12px;">
          <span>Total</span><span>$${order.total}</span>
        </div>
      </div>
    </div>

    <!-- Shipping Info -->
    ${order.shippingAddress ? `
    <div style="background: #111; border: 1px solid #333; padding: 20px; margin-bottom: 30px;">
      <h3 style="color: #fff; margin: 0 0 15px 0; font-size: 16px; letter-spacing: 2px;">SHIPPING TO</h3>
      <p style="color: #ccc; margin: 0; line-height: 1.6;">
        ${order.shippingName || ''}<br>
        ${order.shippingAddress}<br>
        ${order.shippingCity}, ${order.shippingState} ${order.shippingPincode}<br>
        ${order.shippingPhone ? `Phone: ${order.shippingPhone}` : ''}
      </p>
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="text-align: center; padding-top: 30px; border-top: 1px solid #222;">
      <p style="color: #666; font-size: 12px; margin: 0;">We'll send you another email when your order ships.</p>
      <p style="color: #444; font-size: 11px; margin: 20px 0 0 0;">© 2024 NocturneLux. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

const getShippingUpdateEmail = (order: any, trackingNumber: string) => {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Your Order Has Shipped - NocturneLux</title></head>
<body style="margin: 0; padding: 0; background-color: #000; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #fff; font-size: 28px; letter-spacing: 8px; margin: 0;">NOCTURNELUX</h1>
    </div>
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 1px solid #333; padding: 30px;">
      <h2 style="color: #fff; margin: 0 0 10px 0;">🚚 Your Order Has Shipped!</h2>
      <p style="color: #888; margin: 0 0 20px 0;">Order #${order.id.slice(0, 8).toUpperCase()}</p>
      <div style="background: #000; padding: 20px; border: 1px solid #444;">
        <p style="color: #888; margin: 0 0 8px 0; font-size: 12px;">TRACKING NUMBER</p>
        <p style="color: #fff; margin: 0; font-size: 18px; letter-spacing: 2px;">${trackingNumber}</p>
      </div>
    </div>
    <div style="text-align: center; padding-top: 30px;">
      <p style="color: #444; font-size: 11px;">© 2024 NocturneLux. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Export email functions
export const emailService = {
  async sendOrderConfirmation(order: any, items: any[]) {
    if (!process.env.SMTP_USER) {
      console.log('📧 Email service not configured. Skipping order confirmation email.');
      return false;
    }
    try {
      await transporter.sendMail({
        from: FROM_EMAIL,
        to: order.userEmail,
        subject: `Order Confirmed #${order.id.slice(0, 8).toUpperCase()} - NocturneLux`,
        html: getOrderConfirmationEmail(order, items),
      });
      console.log(`✅ Order confirmation email sent to ${order.userEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error);
      return false;
    }
  },

  async sendShippingUpdate(order: any, trackingNumber: string) {
    if (!process.env.SMTP_USER || !order.userEmail) return false;
    try {
      await transporter.sendMail({
        from: FROM_EMAIL,
        to: order.userEmail,
        subject: `Your Order Has Shipped! #${order.id.slice(0, 8).toUpperCase()} - NocturneLux`,
        html: getShippingUpdateEmail(order, trackingNumber),
      });
      console.log(`✅ Shipping update email sent to ${order.userEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send shipping update email:', error);
      return false;
    }
  },
};

