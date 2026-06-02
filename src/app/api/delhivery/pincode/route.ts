import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get("pincode");
  const weight = searchParams.get("weight") || "500";

  if (!pincode) {
    return NextResponse.json({ error: "Pincode is required" }, { status: 400 });
  }

  const apiKey = process.env.DELHIVERY_API_KEY;

  if (!apiKey) {
    console.error("Delhivery API Key is missing");
    return NextResponse.json({ error: "Delhivery API configuration is missing" }, { status: 500 });
  }

  try {
    const url = `https://track.delhivery.com/c/api/pin-codes/json/?token=${apiKey}&filter_codes=${pincode}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Delhivery API returned status ${response.status}`);
    }

    const data = await response.json();
    
    // If serviceable, calculate shipping cost
    let shippingCost = 0;
    if (data.delivery_codes && data.delivery_codes.length > 0) {
      const originPincode = process.env.DELHIVERY_ORIGIN_PINCODE || "110001";
      const costUrl = `https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&d_pin=${pincode}&o_pin=${originPincode}&cgm=${weight}&glvl=1&tz=1`;
      
      try {
        const costResponse = await fetch(costUrl, {
          method: "GET",
          headers: {
            "Authorization": `Token ${apiKey}`,
            "Content-Type": "application/json",
          },
        });
        
        if (costResponse.ok) {
          const costData = await costResponse.json();
          if (Array.isArray(costData) && costData.length > 0 && costData[0].total_amount) {
            shippingCost = costData[0].total_amount;
          }
        }
      } catch (costErr) {
        console.error("Failed to fetch shipping cost, defaulting to 0", costErr);
      }
    }

    return NextResponse.json({ ...data, shipping_cost: shippingCost });
  } catch (error: any) {
    console.error("Delhivery Pincode API Error:", error);
    return NextResponse.json({ error: "Failed to fetch pincode data" }, { status: 500 });
  }
}
