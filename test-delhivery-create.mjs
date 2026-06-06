import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const apiKey = process.env.DELHIVERY_API_KEY;

async function testDelhivery() {
  const payload = {
    shipments: [
      {
        client: "Futbol Store",
        name: "Rahul Sharma",
        address: "Flat 202, Sunshine Apartments, Sector 14",
        pin: "122001",
        city: "Gurugram",
        state: "Haryana",
        country: "India",
        phone: "9876543210",
        order: "TEST-ORD-V1-" + Date.now(),
        payment_mode: "Prepaid",
        products_desc: "Sporting Goods",
        cod_amount: 0,
        total_amount: 500,
        seller_add: "Futbol Store HQ",
        seller_name: "Futbol Store",
        quantity: 1,
        weight: 500, 
        length: 25,
        breadth: 25,
        height: 5,
      }
    ],
    pickup_location: {
      name: "TFS",
    }
  };

  const response = await fetch("https://track.delhivery.com/api/v1/packages/json/", {
    method: "POST",
    headers: {
      "Authorization": `Token ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", text);
}

testDelhivery();
