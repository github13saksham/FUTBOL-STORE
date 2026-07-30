import HomepageClient from "./HomepageClient";
import { fetchHomepageSettingsRest } from "@/backend/firebase/rest";

// Disable static generation, always fetch the latest on request. 
// The client will also subscribe via onSnapshot for instant updates when admin changes it.

export const revalidate = 60; // Cache the page for 60 seconds (Incremental Static Regeneration)

export default async function Homepage() {
  let initialSettings = null;
  
  try {
    initialSettings = await fetchHomepageSettingsRest();
  } catch (error) {
    console.error("Error fetching homepage settings on server:", error);
  }

  return <HomepageClient initialSettings={initialSettings} />;
}
