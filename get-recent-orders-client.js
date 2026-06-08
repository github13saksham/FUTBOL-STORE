import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getRecentOrders() {
  const oneHourAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const ordersRef = collection(db, 'orders');
  const snapshot = await getDocs(ordersRef);
  
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
      console.log(`Amount: Rs.${order.amount || order.totalAmount}`);
      console.log(`Status: ${order.status}`);
      console.log(`Date: ${new Date(order.createdAt).toLocaleString()}`);
      console.log(`Razorpay ID: ${order.paymentId || 'N/A'}`);
      console.log(`Items: ${order.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}`);
      console.log('-'.repeat(40));
    });
  } else {
    console.log('No orders found in the last 1 hour.');
  }
  
  process.exit(0);
}

getRecentOrders().catch(err => {
  console.error(err);
  process.exit(1);
});
