import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, orderData, pickupLocation } = body;

    if (!orderId || !orderData) {
      return NextResponse.json({ error: "Missing orderId or orderData" }, { status: 400 });
    }

    const apiKey = process.env.DELHIVERY_API_KEY;

    if (!apiKey) {
      console.error("Delhivery API Key is missing");
      return NextResponse.json({ error: "Delhivery API configuration is missing" }, { status: 500 });
    }

    // Prepare Delhivery Payload
    const shipmentData = {
      format: "json",
      data: JSON.stringify({
        shipments: [
          {
            name: orderData.customerName || orderData.shippingAddress?.firstName + " " + orderData.shippingAddress?.lastName,
            add: orderData.shippingAddress?.address || "",
            pin: orderData.shippingAddress?.pincode || "",
            city: orderData.shippingAddress?.city || "",
            state: orderData.shippingAddress?.state || "",
            country: "India",
            phone: orderData.shippingAddress?.phone || "",
            order: orderId,
            payment_mode: "Prepaid",
            products_desc: orderData.product || "Sporting Goods",
            cod_amount: "0",
            order_date: new Date().toISOString(),
            total_amount: orderData.totalAmount?.toString() || "0",
            seller_add: "Futbol Store HQ",
            seller_name: "Futbol Store",
            quantity: "1",
            width: "25",
            height: "5",
            weight: "500", // 500g
            length: "25",
            return_awb: false
          }
        ],
        pickup_location: {
          name: pickupLocation || "TFS",
        }
      })
    };

    const searchParams = new URLSearchParams(shipmentData);

    const response = await fetch("https://track.delhivery.com/api/cmu/create.json", {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: searchParams.toString(),
    });

    let result;
    const responseText = await response.text();
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error("Delhivery returned non-JSON response:", responseText);
      return NextResponse.json({ error: "Delhivery server returned an invalid response." }, { status: 502 });
    }

    if (!response.ok || !result.success) {
      console.error("Delhivery Error Response:", result);
      
      let specificError = result.error || result.rmk || "Failed to create shipment";
      
      // Delhivery often hides the REAL error inside packages[0].remarks
      if (result.packages && result.packages.length > 0 && result.packages[0].remarks && result.packages[0].remarks.length > 0) {
        specificError = result.packages[0].remarks[0];
      }

      return NextResponse.json({ error: specificError }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Delhivery Create Order Error Details:", error.message || error);
    return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
  }
}
