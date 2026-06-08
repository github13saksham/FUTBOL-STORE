import { dbService } from './src/backend';
import { deleteField } from 'firebase/firestore';

async function main() {
  console.log("Fetching products...");
  const products = await dbService.getProducts();
  console.log(`Found ${products.length} products.`);
  
  let count = 0;
  for (const p of products) {
    if (p.rating === 5 || p.rating) {
      console.log(`Clearing rating for ${p.id}`);
      await dbService.updateProduct(p.id, { rating: deleteField() as any });
      count++;
    }
  }
  console.log(`Finished clearing ratings for ${count} products.`);
}

main().catch(console.error);
