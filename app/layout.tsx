import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/JoyNavbar";
import Footer from "@/components/ui/Footer";
import { CartProvider } from "@/app/context/CartContext";
import { GamificationProvider } from "@/app/context/GamificationContext";
import { AuthProvider } from "@/app/context/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Joy Juncture - The Digital Playground",
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
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <ErrorBoundary>
          <AuthProvider>
            <GamificationProvider>
              <CartProvider>
                <Navbar />
                {children}
                <Footer />
              </CartProvider>
            </GamificationProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
