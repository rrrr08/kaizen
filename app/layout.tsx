import type { Metadata } from "next";
import { Outfit, Fredoka, Bungee } from "next/font/google"; // Import fonts
import "./globals.css";
// import Navbar from "@/components/ui/JoyNavbar";
import ArcadeNavbar from "@/components/ui/ArcadeNavbar";
import Footer from "@/components/ui/Footer";
import { CartProvider } from "@/app/context/CartContext";
import { GamificationProvider } from "@/app/context/GamificationContext";
import { AuthProvider } from "@/app/context/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import CustomCursor from "@/components/ui/CustomCursor";
import SidebarMonitor from "@/components/ui/SidebarMonitor";

// Configure fonts
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: 'swap',
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: 'swap',
});

const bungee = Bungee({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bungee",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Joy Juncture | Playful E-commerce",
  description: "Experience board games, events, and community engagement like never before",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://checkout.razorpay.com/v1/checkout.js"
          async
          defer
        ></script>
      </head>
      <body className={`${outfit.variable} ${fredoka.variable} ${bungee.variable} antialiased bg-[#000000] text-white font-sans`}>
        <ErrorBoundary>
          <AuthProvider>
            <GamificationProvider>
              <CartProvider>
                <ArcadeNavbar />
                <CustomCursor />
                <SidebarMonitor />
                <div className="lg:pl-[60px]">
                  {children}
                </div>
                <Footer />

                {/* SVG Definition for Blob Mask */}
                <svg width="0" height="0" className="absolute">
                  <defs>
                    <clipPath id="blob" clipPathUnits="objectBoundingBox">
                      <path d="M0.85,0.25 C0.95,0.45 0.9,0.7 0.7,0.85 C0.5,1 0.25,0.95 0.1,0.75 C-0.05,0.55 0,0.3 0.2,0.1 C0.4,-0.1 0.7,0.05 0.85,0.25"></path>
                    </clipPath>
                  </defs>
                </svg>
              </CartProvider>
            </GamificationProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
