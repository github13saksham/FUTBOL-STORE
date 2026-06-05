import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { path, tag } = await request.json().catch(() => ({}));

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, now: Date.now(), path });
    }
    
    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ revalidated: true, now: Date.now(), tag });
    }

    // Default: revalidate the data endpoints and cache tags
    revalidatePath('/api/data/products');
    revalidatePath('/api/data/clubs');
    revalidateTag('products');
    revalidateTag('clubs');
    revalidateTag('homepage');

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
