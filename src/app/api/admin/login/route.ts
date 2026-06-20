import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken } = body;
    
    if (!idToken) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Firebase API Key not configured' }, { status: 500 });
    }

    // Verify token using Firebase REST API
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Invalid ID token' }, { status: 401 });
    }

    const data = await response.json();
    const uid = data.users?.[0]?.localId;
    
    // Check if the authenticated user's UID matches the configured ADMIN_UID
    if (uid === process.env.ADMIN_UID) {
      const res = NextResponse.json({ success: true });
      
      // Set secure cookie valid for 7 days
      res.cookies.set({
        name: 'admin_session',
        value: 'authenticated',
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      
      return res;
    } else {
      return NextResponse.json({ error: 'Unauthorized: Not an admin user' }, { status: 403 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
