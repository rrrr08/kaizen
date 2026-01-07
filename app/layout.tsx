import type { Metadata } from "next";
import { Outfit, Fredoka } from "next/font/google"; // Import fonts
import "./globals.css";
import { CartProvider } from "@/app/context/CartContext";
import { GamificationProvider } from "@/app/context/GamificationContext";
import { AuthProvider } from "@/app/context/AuthContext";
import { PopupProvider } from "@/app/context/PopupContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ClientLayout from "@/components/ClientLayout";
import { defaultMetadata } from "@/lib/metadata";

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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://joyjuncture.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: defaultMetadata.title,
    template: '%s | Joy Juncture',
  },
  description: defaultMetadata.description,
  keywords: defaultMetadata.keywords,
  authors: [{ name: 'Joy Juncture Team' }],
  creator: 'Joy Juncture',
  publisher: 'Joy Juncture',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: defaultMetadata.siteName,
    title: defaultMetadata.title,
    description: defaultMetadata.description,
    images: [
      {
        url: defaultMetadata.ogImage,
        width: 1200,
        height: 630,
        alt: 'Joy Juncture - Playful E-commerce',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultMetadata.title,
    description: defaultMetadata.description,
    images: [defaultMetadata.twitterImage],
    creator: '@joyjuncture', // Update with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Add verification codes from Google Search Console, Bing, etc.
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  //   bing: 'your-bing-verification-code',
  // },
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
          key="razorpay-checkout"
          src="https://checkout.razorpay.com/v1/checkout.js"
          async
          defer
        ></script>
      </head>
      <body className={`${outfit.variable} ${fredoka.variable} antialiased bg-[#FFFDF5] text-[#2D3436] font-sans`}>
        <ErrorBoundary>
          <AuthProvider>
            <GamificationProvider>
              <CartProvider>
                <PopupProvider>
                  <ClientLayout>
                    {children}
                  </ClientLayout>
                </PopupProvider>

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
