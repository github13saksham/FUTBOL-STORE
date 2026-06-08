import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function removeRatings() {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();
  
  const batch = db.batch();
  let count = 0;
  
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.rating !== undefined) {
      batch.update(doc.ref, { rating: FieldValue.delete() });
      count++;
    }
  });
  
  if (count > 0) {
    await batch.commit();
    console.log(`Successfully removed rating from ${count} products.`);
  } else {
    console.log('No products had a rating field.');
  }
}

removeRatings().catch(console.error);
