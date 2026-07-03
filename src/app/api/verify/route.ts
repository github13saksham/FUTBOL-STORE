import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { order_id, cf_payment_id } = await request.json();

    if (!order_id) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID as string;
    const secretKey = process.env.CASHFREE_SECRET_KEY as string;

    // Fetch the order from Cashfree to verify payment status
    const response = await fetch(`https://api.cashfree.com/pg/orders/${order_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch order from Cashfree' }, { status: 500 });
    }

    if (data.order_status === 'PAID') {
      return NextResponse.json({ message: 'Payment verified successfully', paymentId: cf_payment_id || order_id }, { status: 200 });
    } else {
      return NextResponse.json({ error: `Payment not completed. Status: ${data.order_status}` }, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying Cashfree payment:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
