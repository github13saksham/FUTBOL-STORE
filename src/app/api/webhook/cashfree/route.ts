import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbService } from '@/backend';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    // Cashfree webhook signature verification
    const timestamp = request.headers.get('x-webhook-timestamp');
    const signature = request.headers.get('x-webhook-signature');
    const secret = process.env.CASHFREE_WEBHOOK_SECRET;

    if (secret && timestamp && signature) {
      const signedPayload = `${timestamp}${rawBody}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('base64');

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      console.warn('Cashfree webhook secret not configured or missing headers, skipping signature validation.');
    }

    const event = JSON.parse(rawBody);

    // Cashfree sends 'PAYMENT_SUCCESS_WEBHOOK' or similar event types
    const eventType = event?.type;
    const paymentData = event?.data;

    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || paymentData?.payment?.payment_status === 'SUCCESS') {
      const cashfreeOrderId = paymentData?.order?.order_id;
      const cashfreePaymentId = paymentData?.payment?.cf_payment_id?.toString();

      if (!cashfreeOrderId) {
        return NextResponse.json({ error: 'Missing order_id in webhook payload' }, { status: 400 });
      }

      try {
        const orderId = await dbService.confirmOrder(cashfreeOrderId, cashfreePaymentId || 'UNKNOWN');
        console.log(`Successfully processed Cashfree webhook for order ${orderId}`);
        return NextResponse.json({ status: 'success', orderId });
      } catch (err: any) {
        if (err.message === 'Pending order not found') {
          // Frontend already confirmed — return 200 so Cashfree stops retrying
          return NextResponse.json({ status: 'ignored', message: 'Order already processed or not found' });
        }
        throw err;
      }
    }

    return NextResponse.json({ status: 'ignored' });
  } catch (error) {
    console.error('Cashfree Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
