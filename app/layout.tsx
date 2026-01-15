import { Suspense } from 'react';
import type { Metadata } from "next";
import { Outfit, Fredoka, Instrument_Serif } from "next/font/google"; // Import fonts
import "./globals.css";
import { CartProvider } from "@/app/context/CartContext";
import { GamificationProvider } from "@/app/context/GamificationContext";
import { AuthProvider } from "@/app/context/AuthContext";
import { PopupProvider } from "@/app/context/PopupContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ClientLayout from "@/components/ClientLayout";
import UserActivityTracker from "@/components/analytics/UserActivityTracker";
import { defaultMetadata } from "@/lib/metadata";
import { Toaster } from "@/components/ui/toaster";

// Configure fonts
const outfit = Outfit({
  subsets: ["latin"],
  weight: ['300', '400', '600', '700', '800', '900'],
  variable: "--font-outfit",
  display: 'swap',
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: "--font-fredoka",
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ['400'],
  variable: "--font-instrument",
  display: 'swap',
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://joy-juncture.vercel.app';

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
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />

        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="origin-when-cross-origin" />

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Joy Juncture',
              url: baseUrl,
              logo: `${baseUrl}/icon.png`,
              description: 'Experience board games, events, and community engagement like never before.',
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                email: 'support@joyjuncture.com',
              },
            }),
          }}
        />

        {/* Structured Data - Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Joy Juncture',
              url: baseUrl,
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${baseUrl}/shop?search={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />


      </head>
      <body className={`${outfit.variable} ${fredoka.variable} ${instrumentSerif.variable} antialiased bg-[#FFFDF5] text-[#2D3436] font-sans`}>
        <ErrorBoundary>

          <AuthProvider>
            <Suspense fallback={null}>
              <UserActivityTracker />
            </Suspense>
            <GamificationProvider>
              <CartProvider>
                <PopupProvider>
                  <ClientLayout>
                    {children}
                  </ClientLayout>
                  <Toaster />
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
