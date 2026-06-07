const nodemailer = require('nodemailer');

/**
 * Sends a detailed order confirmation email to the user.
 * @param {string} userEmail Recipient email address
 * @param {string} userName Recipient name
 * @param {object} order The Mongoose order object containing details
 */
const sendOrderConfirmation = async (userEmail, userName, order) => {
  try {
    let transporter;
    const isProdSMTP = process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;

    if (isProdSMTP) {
      // Connect using production SMTP settings
      console.log('Connecting to production SMTP server...');
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Fallback: Create dynamic Ethereal test account (mock SMTP)
      console.log('No SMTP config found in .env. Bootstrapping dynamic developer test email account...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    // Format Prices to Indian Rupees format for email template
    const formatEmailPrice = (num) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(num);
    };

    // Compile Items HTML rows
    const itemRowsHTML = order.products.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: center; color: #64748b;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: right; color: #1e293b; font-family: monospace;">${formatEmailPrice(item.price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: right; color: #1e293b; font-family: monospace; font-weight: bold;">${formatEmailPrice(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    const subtotal = order.products.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 5000 ? 0 : 150;
    const tax = subtotal * 0.18;
    const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailSubject = `Order Confirmed! Receipt for Order #${order._id.toString().substring(order._id.toString().length - 8).toUpperCase()}`;

    // Elegant Invoice HTML Template
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>CodeAlpha Store Invoice</title>
        <style>
          body {
            font-family: 'Inter', Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 20px;
          }
          .invoice-card {
            background-color: #ffffff;
            max-width: 600px;
            margin: 0 auto;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            color: #ffffff;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 0.5px;
          }
          .header p {
            margin: 5px 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .body-content {
            padding: 30px;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 20px;
          }
          .meta-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px dashed #f1f5f9;
          }
          .meta-box h4 {
            margin: 0 0 5px 0;
            font-size: 12px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .meta-box p {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          .items-table th {
            padding: 10px;
            background-color: #f8fafc;
            border-bottom: 2px solid #e2e8f0;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            text-align: left;
          }
          .summary-table {
            width: 100%;
            margin-bottom: 30px;
          }
          .summary-table td {
            padding: 6px 10px;
            font-size: 14px;
          }
          .summary-total {
            border-top: 1px solid #e2e8f0;
            font-size: 18px;
            font-weight: 800;
            color: #6366f1;
            padding-top: 12px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <div class="header">
            <h1>CodeAlpha Store</h1>
            <p>Order Confirmed & Invoice Sent</p>
          </div>
          
          <div class="body-content">
            <p class="greeting">Hi <strong>${userName}</strong>,</p>
            <p style="margin-top: 0; font-size: 14px; color: #64748b;">Thank you for your purchase! Your payment has been authorized and your order is now being processed. Here is your receipt:</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="color: #64748b; padding-bottom: 5px;">Order ID:</td>
                  <td style="text-align: right; font-weight: bold; padding-bottom: 5px;">#${order._id.toString().toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding-bottom: 5px;">Order Date:</td>
                  <td style="text-align: right; padding-bottom: 5px;">${dateStr}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding-bottom: 5px;">Payment Method:</td>
                  <td style="text-align: right; font-weight: bold; color: #10b981; padding-bottom: 5px;">${order.paymentMethod}</td>
                </tr>
                <tr>
                  <td style="color: #64748b;">Payment Status:</td>
                  <td style="text-align: right; font-weight: bold; color: #10b981;">${order.paymentStatus}</td>
                </tr>
              </table>
            </div>

            <!-- Shipping Info -->
            <div style="margin-bottom: 25px;">
              <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Delivery Address</h4>
              <p style="margin: 0; font-size: 14px; line-height: 1.5; font-weight: 500;">
                <strong>${order.shippingAddress.fullName}</strong><br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city} - ${order.shippingAddress.postalCode}<br>
                ${order.shippingAddress.country}
              </p>
            </div>

            <!-- Items table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 50%;">Product Details</th>
                  <th style="width: 10%; text-align: center;">Qty</th>
                  <th style="width: 20%; text-align: right;">Unit Price</th>
                  <th style="width: 20%; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemRowsHTML}
              </tbody>
            </table>

            <!-- Calculation summary -->
            <table class="summary-table" style="float: right; width: 250px; text-align: right;">
              <tr>
                <td style="color: #64748b; width: 60%;">Subtotal:</td>
                <td style="font-family: monospace; font-weight: 500;">${formatEmailPrice(subtotal)}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Delivery Fee:</td>
                <td style="font-family: monospace; font-weight: 500;">${shipping === 0 ? 'FREE' : formatEmailPrice(shipping)}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">GST (18%):</td>
                <td style="font-family: monospace; font-weight: 500;">${formatEmailPrice(tax)}</td>
              </tr>
              <tr class="summary-total">
                <td style="color: #4f46e5; font-weight: bold; padding-top: 12px;">Total Paid:</td>
                <td style="color: #4f46e5; font-weight: bold; font-family: monospace; padding-top: 12px; font-size: 18px;">${formatEmailPrice(order.totalAmount)}</td>
              </tr>
            </table>
            <div style="clear: both;"></div>

          </div>
          
          <div class="footer">
            <p>&copy; 2026 CodeAlpha Store. All rights reserved.</p>
            <p style="margin-top: 5px; font-size: 11px;">This is an automated order confirmation message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Mail configurations
    const mailOptions = {
      from: '"CodeAlpha Store" <noreply@codealphastore.com>',
      to: userEmail,
      subject: emailSubject,
      html: emailHTML,
    };

    // Send Mail
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email dispatched successfully to ${userEmail}. Message ID: ${info.messageId}`);

    // If Ethereal dynamically generated sandbox, output the URL to click
    if (!isProdSMTP) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('------------------------------------------------------------');
      console.log(`📬 [MOCK EMAIL INBOX]: View your sent HTML invoice at:`);
      console.log(`🔗 ${previewUrl}`);
      console.log('------------------------------------------------------------');
    }

    return true;
  } catch (error) {
    console.error('Nodemailer failed to dispatch order confirmation:', error.message);
    return false;
  }
};

module.exports = { sendOrderConfirmation };
