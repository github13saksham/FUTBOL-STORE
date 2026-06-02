import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const awb = searchParams.get("awb");

  if (!awb) {
    return NextResponse.json({ error: "AWB number is required" }, { status: 400 });
  }

  const apiKey = process.env.DELHIVERY_API_KEY;
  if (!apiKey) {
    console.error("DELHIVERY_API_KEY is not configured.");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  try {
    const response = await fetch(`https://track.delhivery.com/api/v1/packages/json/?waybill=${awb}`, {
      method: "GET",
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      // Important to skip caching for real-time tracking
      cache: "no-store", 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Delhivery Tracking API Error:", errorText);
      return NextResponse.json({ error: "Failed to fetch tracking details from Delhivery" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error calling Delhivery Tracking API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
