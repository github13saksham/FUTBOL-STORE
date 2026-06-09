// Test script to verify the payload that will be sent to Delhivery
const orderData = {
  id: "TEST-ORDER-123",
  customerName: "Rahul Sharma",
  shippingAddress: {
    address: "Flat 202, Sunshine Apartments, Sector 14",
    pincode: "122001",
    city: "Gurugram",
    state: "Haryana",
    phone: "9876543210"
  },
  product: "Real Madrid Home Kit x1, Arsenal Away Kit x1",
  amount: 3000,
  items: [
    { name: "Real Madrid Home Kit", quantity: 1, price: 1500 },
    { name: "Arsenal Away Kit", quantity: 1, price: 1500 }
  ]
};

// Simulated inputs from admin page
const weight = (orderData.items.reduce((sum, item) => sum + (item.quantity || 1), 0) * 500).toString(); // 1000
const length = "25";
const breadth = "25";
const height = "5";
const pickupLocation = "TFS";

const totalQuantity = orderData.items.reduce((sum, item) => sum + (item.quantity || 1), 0);

const shipmentData = {
  format: "json",
  data: JSON.stringify({
    shipments: [
      {
        name: orderData.customerName,
        add: orderData.shippingAddress.address,
        pin: orderData.shippingAddress.pincode,
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state,
        country: "India",
        phone: orderData.shippingAddress.phone,
        order: orderData.id,
        payment_mode: "Prepaid",
        products_desc: orderData.product,
        cod_amount: "0",
        order_date: new Date().toISOString(),
        total_amount: (orderData.amount || orderData.totalAmount || "0").toString(),
        seller_add: "Futbol Store HQ",
        seller_name: "Futbol Store",
        quantity: totalQuantity, // <--- FIXED DYNAMIC QUANTITY
        shipment_width: Number(breadth) || 25,
        shipment_height: Number(height) || 5,
        shipment_length: Number(length) || 25,
        weight: weight || "500", // <--- FIXED DYNAMIC WEIGHT
        breadth: breadth || "25",
        height: height || "5",
        length: length || "25",
        is_manifest: false
      }
    ],
    pickup_location: {
      name: pickupLocation,
    }
  }, null, 2)
};

console.log("=== SIMULATED DELHIIVERY PAYLOAD ===");
console.log(shipmentData.data);
console.log("====================================");
console.log("Notice that quantity is:", totalQuantity);
console.log("Notice that weight is:", weight, "grams");
console.log("Notice that total_amount is:", orderData.amount);
