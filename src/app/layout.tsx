import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import StoreProvider from "@/context/StoreContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { fetchProductsRest, fetchClubsRest } from "@/backend/firebase/rest";

export const metadata: Metadata = {
  title: "THE FÚTBOL STORE | Premium Football Fashion & Luxury Jerseys",
  description: "Experience premium football fashion with a fusion of luxury design and authentic football culture. Authentic clubs, retro, and national team jerseys.",
  openGraph: {
    title: "THE FÚTBOL STORE | Premium Football Fashion",
    description: "Luxury minimalist designs meeting football matchday heritage. Shop premium player editions, retro jerseys, and national teams.",
    images: ["/futbol store logo .JPEG"],
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialProducts: any[] = [];
  let initialClubs: any[] = [];
  try {
    const [products, clubs] = await Promise.all([
      fetchProductsRest(),
      fetchClubsRest()
    ]);
    initialProducts = products;
    initialClubs = clubs;
  } catch (error) {
    console.error("Failed to load initial data in layout", error);
  }

  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <StoreProvider initialProducts={initialProducts} initialClubs={initialClubs}>
            <AuthGuard>
              <div className="grain-overlay" />
              <SmoothScroll>
                <Navbar />
                {children}
                <Footer />
              </SmoothScroll>
            </AuthGuard>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
