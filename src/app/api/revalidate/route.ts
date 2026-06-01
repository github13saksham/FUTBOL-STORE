import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, now: Date.now(), path });
    }

    // Default: revalidate the data endpoints
    revalidatePath('/api/data/products');
    revalidatePath('/api/data/clubs');

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
