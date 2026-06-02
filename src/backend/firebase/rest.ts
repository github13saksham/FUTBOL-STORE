// Utility to fetch Firestore data via REST API for Next.js Server Components.
// This completely avoids the "client is offline" hang and timeout issues 
// caused by using the Firebase Client SDK on the Node.js server.

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "thefutbol-store";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Helper to parse Firestore's verbose REST format into clean JSON
function parseFirestoreValue(value: any): any {
  if (!value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return parseInt(value.integerValue, 10);
  if ('doubleValue' in value) return parseFloat(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(parseFirestoreValue);
  if ('mapValue' in value) return parseFirestoreDocument({ fields: value.mapValue.fields });
  if ('referenceValue' in value) return value.referenceValue;
  if ('geoPointValue' in value) return value.geoPointValue;
  return value;
}

function parseFirestoreDocument(doc: any) {
  if (!doc || !doc.fields) return null;
  const result: any = {};
  for (const [key, val] of Object.entries(doc.fields)) {
    result[key] = parseFirestoreValue(val);
  }
  return result;
}

export async function fetchProductsRest() {
  try {
    const res = await fetch(`${BASE_URL}/products?pageSize=100`, { 
      next: { tags: ['products'] },
      cache: 'force-cache'
    });
    if (!res.ok) throw new Error("REST API failed");
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents.map((doc: any) => parseFirestoreDocument(doc));
  } catch (e) {
    console.error("Error in fetchProductsRest:", e);
    return [];
  }
}

export async function fetchClubsRest() {
  try {
    const res = await fetch(`${BASE_URL}/clubs?pageSize=100`, { 
      next: { tags: ['clubs'] },
      cache: 'force-cache'
    });
    if (!res.ok) throw new Error("REST API failed");
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents.map((doc: any) => parseFirestoreDocument(doc));
  } catch (e) {
    console.error("Error in fetchClubsRest:", e);
    return [];
  }
}

export async function fetchHomepageSettingsRest() {
  try {
    const res = await fetch(`${BASE_URL}/settings/homepage`, { 
      next: { tags: ['homepage'] },
      cache: 'force-cache'
    });
    if (!res.ok) throw new Error("REST API failed");
    const data = await res.json();
    return parseFirestoreDocument(data);
  } catch (e) {
    console.error("Error in fetchHomepageSettingsRest:", e);
    return null;
  }
}
