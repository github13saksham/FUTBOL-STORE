import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function getRecentOrders() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  const ordersRef = db.collection('orders');
  // Since we might not have an index on createdAt, and it's a small store, we can just fetch all and filter
  // or try to query if index exists. Let's just fetch all and filter to be safe against missing indexes.
  const snapshot = await ordersRef.get();
  
  const recentOrders = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.createdAt && data.createdAt >= oneHourAgo) {
      recentOrders.push(data);
    }
  });

  recentOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (recentOrders.length > 0) {
    console.log(`Found ${recentOrders.length} orders in the last 1 hour:\n`);
    recentOrders.forEach(order => {
      console.log(`Order ID: ${order.id}`);
      console.log(`Customer: ${order.customerName} (${order.shippingAddress?.phone || 'No phone'})`);
      console.log(`Amount: ₹${order.amount || order.totalAmount}`);
      console.log(`Status: ${order.status}`);
      console.log(`Date: ${new Date(order.createdAt).toLocaleString()}`);
      console.log(`Razorpay ID: ${order.paymentId || 'N/A'}`);
      console.log(`Items: ${order.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}`);
      console.log('-'.repeat(40));
    });
  } else {
    console.log('No orders found in the last 1 hour.');
  }
}

getRecentOrders().catch(console.error);
