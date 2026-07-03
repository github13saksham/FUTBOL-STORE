import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount, phone } = await request.json();

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID as string;
    const secretKey = process.env.CASHFREE_SECRET_KEY as string;

    const orderId = `order_${Date.now()}`;
    const amountInRupees = Math.round(amount * 100) / 100; // 2 decimal places

    const body = {
      order_id: orderId,
      order_amount: amountInRupees,
      order_currency: 'INR',
      customer_details: {
        customer_id: `cust_${Date.now()}`,
        customer_phone: phone || '9999999999', // Uses provided phone or falls back to a placeholder
      },
      order_meta: {
        // Cashfree requires HTTPS for notify_url — always use the production domain
        // (Cashfree cannot reach localhost, so this is correct for both dev & prod)
        notify_url: 'https://thefutbolstore.in/api/webhook/cashfree',
      },
    };

    const response = await fetch('https://api.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree order creation error:', data);
      return NextResponse.json(
        { error: data?.message || 'Failed to create Cashfree order' },
        { status: response.status }
      );
    }

    // Return the Cashfree order data including payment_session_id for SDK use
    return NextResponse.json({
      id: data.order_id,
      payment_session_id: data.payment_session_id,
      cf_order_id: data.cf_order_id,
      amount: data.order_amount,
      currency: data.order_currency,
      status: data.order_status,
    });
  } catch (error: any) {
    console.error('Error creating Cashfree order:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
