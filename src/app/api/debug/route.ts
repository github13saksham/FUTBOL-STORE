import { NextResponse } from 'next/server';
import { FirebaseDatabaseService } from '@/backend/firebase/db.service';

export async function GET() {
  try {
    const db = new FirebaseDatabaseService();
    const products = await db.getProducts();
    return NextResponse.json({ count: products.length, products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
