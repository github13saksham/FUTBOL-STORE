import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Validate email address format to avoid bouncing issues
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export async function POST(request: Request) {
  try {
    const { 
      orderId, 
      customerName, 
      email, 
      items, 
      totalAmount, 
      shippingAddress, 
      estimatedDelivery = "5-7 Business Days",
      paymentMethod = "Online Payment"
    } = await request.json();

    if (!orderId || !email) {
      return NextResponse.json({ error: 'Missing required fields: orderId or email' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid customer email address provided' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || "futbolstoreindia@gmail.com";
    // Important for Deliverability: From address MUST exactly match the authenticated user in Google Workspace.
    const senderAddress = process.env.SMTP_USER || "noreply@thefutbolstore.in";

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Generate unique Message-IDs for threading and spam prevention
    const generateMessageId = () => {
      const randomPart = crypto.randomBytes(16).toString('hex');
      const domain = senderAddress.split('@')[1] || 'thefutbolstore.in';
      return `<${randomPart}@${domain}>`;
    };

    const websiteUrl = "https://thefutbolstore.in";
    const supportEmail = process.env.SUPPORT_EMAIL || "support@thefutbolstore.in";

    // --- HTML & TEXT GENERATION: CUSTOMER EMAIL ---
    const customerItemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 15px 0; border-bottom: 1px solid #e5e5e5;" align="left">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
            <tr>
              <td width="80" style="vertical-align: top; padding-right: 15px;">
                <img src="${item.image}" alt="Image of ${item.name}" width="70" height="90" style="display: block; width: 70px; height: 90px; object-fit: cover; border-radius: 4px; border: 1px solid #dddddd;" />
              </td>
              <td style="vertical-align: top; font-family: Arial, sans-serif;">
                <h4 style="margin: 0 0 5px 0; font-size: 16px; color: #333333;">${item.name}</h4>
                <p style="margin: 0 0 5px 0; font-size: 14px; color: #666666;">Size: ${item.size || item.selectedSize}</p>
                <p style="margin: 0 0 5px 0; font-size: 14px; color: #666666;">Qty: ${item.quantity}</p>
                <p style="margin: 0; font-size: 16px; font-weight: bold; color: #333333;">₹${item.price}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `).join('');

    const customerItemsText = items.map((item: any) => 
      `- ${item.quantity}x ${item.name} (Size: ${item.size || item.selectedSize}) - ₹${item.price}`
    ).join('\n');

    // Deliverability improvement: Full valid HTML5 document, semantic structure
    const customerEmailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${orderId}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    p { margin: 0 0 15px 0; line-height: 1.5; color: #444444; }
    a { color: #000000; text-decoration: underline; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color: #f4f4f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table class="container" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 0; background-color: #ffffff; border-bottom: 1px solid #eaeaea;">
              <a href="${websiteUrl}" target="_blank">
                <img src="${websiteUrl}/store-logo.jpeg" alt="The Futbol Store Logo" width="600" style="display: block; border: 0; width: 100%; max-width: 100%; height: auto;" />
              </a>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 30px 20px;">
              <h1 style="margin: 0 0 20px 0; font-size: 24px; color: #111111; text-align: center;">Order Confirmed</h1>
              <p style="text-align: center; font-size: 16px;">Hi ${customerName},</p>
              <p style="text-align: center;">Thank you for your purchase from THE FÚTBOL STORE. We are preparing your order for shipment.</p>
              
              <!-- Order Details -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color: #f8f9fa; border-radius: 6px; margin: 25px 0; padding: 20px;">
                <tr>
                  <td style="padding-bottom: 10px; color: #555555; font-size: 14px;"><strong>Order Number:</strong></td>
                  <td style="padding-bottom: 10px; text-align: right; color: #111111; font-size: 14px;">${orderId}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px; color: #555555; font-size: 14px;"><strong>Payment Method:</strong></td>
                  <td style="padding-bottom: 10px; text-align: right; color: #111111; font-size: 14px;">${paymentMethod}</td>
                </tr>
                <tr>
                  <td style="color: #555555; font-size: 14px;"><strong>Estimated Delivery:</strong></td>
                  <td style="text-align: right; font-weight: bold; color: #2e7d32; font-size: 14px;">${estimatedDelivery}</td>
                </tr>
              </table>

              <!-- Items -->
              <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111111; border-bottom: 2px solid #eeeeee; padding-bottom: 10px;">Order Summary</h2>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom: 25px;">
                ${customerItemsHtml}
              </table>

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 30px;">
                <tr>
                  <td style="font-size: 16px; color: #555555;"><strong>Total Amount:</strong></td>
                  <td style="font-size: 20px; font-weight: bold; color: #111111; text-align: right;">₹${totalAmount}</td>
                </tr>
              </table>

              <!-- Shipping Address -->
              <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111111; border-bottom: 2px solid #eeeeee; padding-bottom: 10px;">Shipping Details</h2>
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #555555;">
                <strong>${shippingAddress.firstName} ${shippingAddress.lastName}</strong><br/>
                ${shippingAddress.address}<br/>
                ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}<br/>
                Phone: ${shippingAddress.phone}
              </p>
            </td>
          </tr>

          <!-- Footer with higher text ratio for deliverability -->
          <tr>
            <td align="center" style="padding: 25px 20px; background-color: #fafafa; border-top: 1px solid #eaeaea; color: #777777; font-size: 13px; line-height: 1.5;">
              <p style="margin-bottom: 10px;">If you have any questions about your order, please reply to this email or contact us at <a href="mailto:${supportEmail}" style="color: #777777;">${supportEmail}</a>.</p>
              <p style="margin-bottom: 0;">&copy; ${new Date().getFullYear()} <a href="${websiteUrl}" style="color: #777777;">THE FÚTBOL STORE</a>. All rights reserved.</p>
              <p style="margin-top: 10px; font-size: 11px; color: #999999;">This is a transactional email related to your recent purchase.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Plain text fallback ensures delivery to spam filters checking for text/html parity
    const customerEmailText = `Order Confirmed!

Hi ${customerName},

Thank you for your purchase from THE FÚTBOL STORE. We are preparing your order for shipment.

ORDER DETAILS
------------------------------
Order Number: ${orderId}
Payment Method: ${paymentMethod}
Estimated Delivery: ${estimatedDelivery}

ORDER SUMMARY
------------------------------
${customerItemsText}

Total Amount: ₹${totalAmount}

SHIPPING DETAILS
------------------------------
${shippingAddress.firstName} ${shippingAddress.lastName}
${shippingAddress.address}
${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}
Phone: ${shippingAddress.phone}

NEED HELP?
------------------------------
If you have any questions, please reply to this email or contact us at ${supportEmail}.
Visit us at: ${websiteUrl}

© ${new Date().getFullYear()} THE FÚTBOL STORE. All rights reserved.`;

    // --- HTML & TEXT GENERATION: ADMIN EMAIL ---
    const adminItemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee;">
          <strong style="color: #111111;">${item.name}</strong><br/>
          <span style="color: #666666; font-size: 12px;">Size: ${item.size || item.selectedSize} | ${item.customName ? `Print: ${item.customName} #${item.customNumber}` : 'No Print'}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: center; color: #333333;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right; color: #333333;">₹${item.price}</td>
      </tr>
    `).join('');

    const adminItemsText = items.map((item: any) => 
      `- ${item.quantity}x ${item.name} (Size: ${item.size || item.selectedSize}) ${item.customName ? `[Print: ${item.customName} #${item.customNumber}]` : ''} - ₹${item.price}`
    ).join('\n');

    const adminEmailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Order - ${orderId}</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; max-width: 600px;">
    <tr>
      <td style="background-color: #e53935; padding: 20px; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px;">🚨 NEW ORDER: #${orderId}</h2>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; background-color: #fafafa; border-bottom: 1px solid #e0e0e0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td><h3 style="margin: 0; color: #333333;">Order Total</h3></td>
            <td align="right"><span style="font-size: 24px; font-weight: bold; color: #2e7d32;">₹${totalAmount}</span></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #555555; text-transform: uppercase; font-size: 13px; border-bottom: 2px solid #eeeeee; padding-bottom: 5px;">Customer Details</h3>
        <p style="margin: 0 0 5px 0; color: #333333;"><strong>Name:</strong> ${customerName}</p>
        <p style="margin: 0 0 5px 0; color: #333333;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #0056b3;">${email}</a></p>
        <p style="margin: 0 0 5px 0; color: #333333;"><strong>Phone:</strong> ${shippingAddress.phone}</p>
        
        <h3 style="margin: 25px 0 15px 0; color: #555555; text-transform: uppercase; font-size: 13px; border-bottom: 2px solid #eeeeee; padding-bottom: 5px;">Shipping Address</h3>
        <p style="margin: 0; line-height: 1.5; color: #333333;">
          ${shippingAddress.firstName} ${shippingAddress.lastName}<br/>
          ${shippingAddress.address}<br/>
          ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; background-color: #fafafa;">
        <h3 style="margin: 0 0 15px 0; color: #555555; text-transform: uppercase; font-size: 13px; border-bottom: 2px solid #eeeeee; padding-bottom: 5px;">Items to Fulfill</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
          <thead>
            <tr>
              <th align="left" style="padding: 10px; background-color: #f0f0f0; color: #333333;">Item</th>
              <th align="center" style="padding: 10px; background-color: #f0f0f0; color: #333333;">Qty</th>
              <th align="right" style="padding: 10px; background-color: #f0f0f0; color: #333333;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${adminItemsHtml}
          </tbody>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const adminEmailText = `NEW ORDER: #${orderId}

Order Total: ₹${totalAmount}

CUSTOMER DETAILS
----------------
Name: ${customerName}
Email: ${email}
Phone: ${shippingAddress.phone}

SHIPPING ADDRESS
----------------
${shippingAddress.firstName} ${shippingAddress.lastName}
${shippingAddress.address}
${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}

ITEMS TO FULFILL
----------------
${adminItemsText}
`;

    // Send email to Customer with proper headers
    const customerEmailResponse = await transporter.sendMail({
      from: `"THE FÚTBOL STORE" <${senderAddress}>`,
      to: email,
      subject: `Order Confirmation - Order #${orderId}`,
      text: customerEmailText,
      html: customerEmailHtml,
      replyTo: supportEmail,
      messageId: generateMessageId(),
      headers: {
        'X-Entity-Ref-ID': orderId,
        'Precedence': 'auto_reply' // Marks as transactional
      }
    });

    // Send email to Admin
    const adminEmailResponse = await transporter.sendMail({
      from: `"THE FÚTBOL STORE Alerts" <${senderAddress}>`,
      to: adminEmail,
      subject: `🚨 NEW ORDER RECEIVED - Order #${orderId}`,
      text: adminEmailText,
      html: adminEmailHtml,
      replyTo: email, // Makes it easy for admin to reply directly to the customer
      messageId: generateMessageId(),
      headers: {
        'X-Entity-Ref-ID': `ADMIN-${orderId}`,
      }
    });

    return NextResponse.json({ 
      success: true, 
      customerEmail: customerEmailResponse.messageId, 
      adminEmail: adminEmailResponse.messageId 
    });

  } catch (error: any) {
    console.error('[Email Delivery Error]:', error);
    return NextResponse.json({ 
      error: 'Failed to process email delivery', 
      details: error.message 
    }, { status: 500 });
  }
}
