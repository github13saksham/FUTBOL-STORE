import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbService } from '@/backend';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (secret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");
      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else {
      console.warn("Webhook secret not configured, skipping signature validation.");
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      try {
        const orderId = await dbService.confirmOrder(razorpayOrderId, razorpayPaymentId);
        console.log(`Successfully processed webhook for order ${orderId}`);
        
        // As a fallback, if the frontend didn't send the email because the tab was closed,
        // you could implement a background job or trigger the email API here.
        // For now, the most critical part is that the order is safely in the database!
        
        return NextResponse.json({ status: "success", orderId });
      } catch (err: any) {
        if (err.message === "Pending order not found") {
          // This happens if the frontend ALREADY confirmed the order, or it was never found.
          // Returning 200 so Razorpay stops retrying.
          return NextResponse.json({ status: "ignored", message: "Order already processed or not found" });
        }
        throw err;
      }
    }

    return NextResponse.json({ status: "ignored" });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
