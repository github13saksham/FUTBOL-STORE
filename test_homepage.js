function parseFirestoreValue(value) {
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

function parseFirestoreDocument(doc) {
  if (!doc || !doc.fields) return null;
  const result = {};
  for (const [key, val] of Object.entries(doc.fields)) {
    result[key] = parseFirestoreValue(val);
  }
  return result;
}

async function test() {
  const res = await fetch("https://firestore.googleapis.com/v1/projects/thefutbol-store/databases/(default)/documents/settings/homepage");
  const data = await res.json();
  const parsed = parseFirestoreDocument(data);
  console.log(JSON.stringify(parsed.bestSellersItems, null, 2));
}
test();
