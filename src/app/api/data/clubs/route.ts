import { NextResponse } from 'next/server';
import { dbService } from '@/backend';

export const revalidate = false; // Cache indefinitely until manually revalidated

export async function GET() {
  try {
    const clubs = await dbService.getClubs();
    return NextResponse.json(clubs);
  } catch (error) {
    console.error("Error fetching clubs for cache:", error);
    return NextResponse.json({ error: "Failed to fetch clubs" }, { status: 500 });
  }
}
