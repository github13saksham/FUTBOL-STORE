import { NextResponse } from 'next/server';
import { FirebaseDatabaseService } from '@/backend/firebase/db.service';

export async function GET() {
  try {
    const db = new FirebaseDatabaseService();
    const products = await db.getProducts();
    const publicProducts = products.map((product) => {
      const publicProduct = { ...product };
      delete publicProduct.costPrice;
      return publicProduct;
    });
    return NextResponse.json({ count: publicProducts.length, products: publicProducts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
