import { NextResponse } from 'next/server';
import { dbService } from '@/backend';

export const revalidate = false; // Cache indefinitely until manually revalidated

export async function GET() {
  try {
    const products = await dbService.getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products for cache:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
