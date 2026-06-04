import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { orderId, customerName, email, items, totalAmount, shippingAddress } = await request.json();

    if (!orderId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL || "futbolstoreindia@gmail.com";
    
    // If you don't have a verified domain on Resend, you MUST use onboarding@resend.dev as the 'from' address
    // and you can only send TO the email address you registered your Resend account with.
    const senderAddress = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br/>
          Size: ${item.selectedSize}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ₹${item.price}
        </td>
      </tr>
    `).join('');

    // Set an estimated delivery range (e.g., 5-7 days from today)
    const today = new Date();
    const deliveryStart = new Date(today);
    deliveryStart.setDate(today.getDate() + 5);
    const deliveryEnd = new Date(today);
    deliveryEnd.setDate(today.getDate() + 7);
    const deliveryOptions = { month: 'short' as const, day: 'numeric' as const };
    const estimatedDelivery = `${deliveryStart.toLocaleDateString('en-US', deliveryOptions)} - ${deliveryEnd.toLocaleDateString('en-US', deliveryOptions)}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <!-- Make sure to replace this URL with your actual logo URL hosted online -->
          <img src="https://thefutbolstore.in/futbol%20store%20logo%20.JPEG" alt="Futbol Store Logo" style="max-width: 200px; height: auto;" />
        </div>
        <h1 style="color: #1a1a1a; text-align: center; margin-top: 0;">Order Confirmed!</h1>
        <p>Hi ${customerName},</p>
        <p>Thank you for your purchase from THE FÚTBOL STORE. We've received your order and are getting it ready for shipment.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; font-size: 18px;">Order Details (#${orderId})</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 10px; border-bottom: 2px solid #ddd;">Item</th>
                <th style="text-align: center; padding: 10px; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="text-align: right; padding: 10px; border-bottom: 2px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="text-align: right; padding: 10px; font-weight: bold;">Total:</td>
                <td style="text-align: right; padding: 10px; font-weight: bold;">₹${totalAmount}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="margin: 20px 0; background-color: #eef8f1; padding: 15px; border-radius: 8px; border-left: 4px solid #2e7d32;">
          <h3 style="margin-top: 0; margin-bottom: 5px; color: #2e7d32;">Estimated Delivery</h3>
          <p style="margin: 0; font-weight: bold; font-size: 16px;">
            ${estimatedDelivery}
          </p>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="margin-bottom: 5px;">Shipping Address:</h3>
          <p style="margin: 0; line-height: 1.5; color: #555;">
            <strong>${shippingAddress.firstName} ${shippingAddress.lastName}</strong><br/>
            ${shippingAddress.address}<br/>
            ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}<br/>
            Phone: ${shippingAddress.phone}
          </p>
        </div>
        
        <p style="text-align: center; margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px;">
          Futbol Store &copy; ${new Date().getFullYear()}<br/>
          Thank you for shopping with us!
        </p>
      </div>
    `;

    // Send email to Customer
    const customerEmailResponse = await resend.emails.send({
      from: `THE FÚTBOL STORE <${senderAddress}>`,
      to: [email],
      subject: `Order Confirmation - ${orderId}`,
      html: emailHtml,
    });

    // Send email to Admin
    const adminEmailResponse = await resend.emails.send({
      from: `THE FÚTBOL STORE Alerts <${senderAddress}>`,
      to: [adminEmail],
      subject: `NEW ORDER RECEIVED - ${orderId}`,
      html: emailHtml,
    });

    return NextResponse.json({ 
      success: true, 
      customerEmail: customerEmailResponse, 
      adminEmail: adminEmailResponse 
    });

  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
