import fetch from 'node-fetch';

async function testApi() {
  try {
    const res = await fetch("http://localhost:3000/api/emails/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: "API-TEST-123",
        customerName: "API Tester",
        email: "smakhija140@gmail.com",
        items: [
          { name: "Test Jersey", selectedSize: "M", quantity: 1, price: 999 }
        ],
        totalAmount: 999,
        shippingAddress: {
          firstName: "Test",
          lastName: "User",
          address: "123 Test St",
          city: "Test",
          state: "Test",
          pincode: "110001",
          phone: "9999999999"
        }
      })
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response Text:", text);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

testApi();
