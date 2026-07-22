import HomepageClient from "./HomepageClient";
import { fetchHomepageSettingsRest } from "@/backend/firebase/rest";

// Disable static generation, always fetch the latest on request. 
// The client will also subscribe via onSnapshot for instant updates when admin changes it.

export const dynamic = 'force-dynamic';

export default async function Homepage({ searchParams }: { searchParams: { preview?: string } }) {
  let initialSettings = null;
  
  try {
    initialSettings = await fetchHomepageSettingsRest();
  } catch (error) {
    console.error("Error fetching homepage settings on server:", error);
  }

  const isPreview = searchParams?.preview === 'true';

  return <HomepageClient initialSettings={initialSettings} isPreview={isPreview} />;
}
