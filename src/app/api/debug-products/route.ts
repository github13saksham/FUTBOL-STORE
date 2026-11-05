import { NextResponse } from "next/server";
import { FirebaseDatabaseService } from "@/backend/firebase/db.service";

export async function GET() {
  const db = new FirebaseDatabaseService();
  const products = await db.getProducts();
  return NextResponse.json(products.map((product) => {
    const publicProduct = { ...product };
    delete publicProduct.costPrice;
    return publicProduct;
  }));
}
