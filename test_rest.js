const projectId = "thefutbol-store";

async function testREST() {
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/settings/homepage`);
    const data = await res.json();
    console.log("Homepage Settings:", Object.keys(data.fields || {}));

    const productsRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products?pageSize=100`);
    const productsData = await productsRes.json();
    console.log("Products count:", productsData.documents ? productsData.documents.length : 0);

  } catch (e) {
    console.error("Error:", e);
  }
}

testREST();
