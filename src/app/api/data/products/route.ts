import { NextResponse } from 'next/server';
import { dbService } from '@/backend';

export const revalidate = false; // Cache indefinitely until manually revalidated

export async function GET() {
  try {
    const products = await dbService.getProducts();
    
    // Background migration to remove 'rating: 5' from national team jerseys
    // so they show 0 stars like the club jerseys.
    products.forEach(async (p: any) => {
      if (p.rating === 5) {
        try {
          await dbService.updateProduct(p.id, { rating: null }); // Set to null to effectively clear it
        } catch (e) {
          console.error("Migration error", e);
        }
      }
    });

    const sanitized = products.map((p: any) => {
      const sp = { ...p };
      delete sp.rating;
      return sp;
    });

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("Error fetching products for cache:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
